"""
Payment API — OPay Express Checkout (Cashier redirect flow).

Endpoints:
  POST /initiate       — Create OPay payment for a held appointment
  POST /callback       — OPay webhook callback (signature-verified)
  GET  /verify/{ref}   — Manual payment status check
  GET  /return         — Return URL after OPay payment (redirects to frontend)
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status, BackgroundTasks
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.booking import Appointment, AppointmentStatus, Service
from app.models.user import User
from app.services.booking_service import confirm_appointment
from app.services.opay_service import (
    create_cashier_payment,
    generate_reference,
    query_payment_status,
    verify_callback_signature,
)
from app.services.email_service import send_email

import logging

logger = logging.getLogger("joyshiddenbeauty.payment")
settings = get_settings()

router = APIRouter(prefix="/payment", tags=["Payment"])


# --- Schemas ---
class InitiatePaymentRequest(BaseModel):
    appointment_ids: list[int]


class InitiatePaymentResponse(BaseModel):
    cashier_url: str
    reference: str
    order_no: str


class PaymentStatusResponse(BaseModel):
    reference: str
    status: str
    amount: float | None = None
    message: str = ""


# --- Endpoints ---
@router.post("/initiate", response_model=InitiatePaymentResponse)
def initiate_payment(
    payload: InitiatePaymentRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Create an OPay cashier payment for a held appointment.
    Returns a cashier_url for the frontend to redirect the user to.
    """
    appointments = (
        db.query(Appointment)
        .filter(Appointment.id.in_(payload.appointment_ids), Appointment.user_id == user_id)
        .all()
    )
    if not appointments or len(appointments) != len(payload.appointment_ids):
        raise HTTPException(status_code=404, detail="One or more appointments not found")

    for appointment in appointments:
        if appointment.status != AppointmentStatus.held:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot initiate payment for appointment {appointment.id} with status '{appointment.status.value}'",
            )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate unique payment reference
    reference = generate_reference(prefix="JHB")

    # Store reference and change status to pending
    for appointment in appointments:
        appointment.opay_reference = reference
        appointment.status = AppointmentStatus.pending
    db.commit()

    # Sum up the deposits
    total_amount = sum(apt.deposit_amount for apt in appointments)

    # Build URLs
    frontend_url = settings.FRONTEND_URL
    backend_base = f"{frontend_url.rstrip('/')}"  # For return URL (frontend page)
    api_base = settings.FRONTEND_URL.replace(":3000", ":8000")  # Approximate backend URL

    return_url = f"{backend_base}/booking/payment-return?reference={reference}"
    callback_url = f"{api_base}/api/v1/payment/callback"
    cancel_url = f"{backend_base}/booking?cancelled=true"

    # Assemble product list description
    services_desc = []
    for apt in appointments:
        service = db.query(Service).filter(Service.id == apt.service_id).first()
        if service:
            services_desc.append(service.name)
    product_name = ", ".join(services_desc) if services_desc else "Luxury Wellness Services"
    product_description = f"{product_name} — Booking Deposit"

    try:
        result = create_cashier_payment(
            reference=reference,
            amount_naira=total_amount,
            user_email=user.email,
            user_name=user.first_name,
            user_id=str(user.id),
            product_name=product_name[:100],  # Keep within limits
            product_description=product_description[:250],
            return_url=return_url,
            callback_url=callback_url,
            cancel_url=cancel_url,
        )
    except Exception as e:
        # Revert status on failure
        for appointment in appointments:
            appointment.status = AppointmentStatus.held
            appointment.opay_reference = None
        db.commit()
        logger.error(f"OPay payment initiation failed: {e}")
        raise HTTPException(status_code=502, detail="Payment service temporarily unavailable")

    cashier_url = result.get("data", {}).get("cashierUrl", "")
    order_no = result.get("data", {}).get("orderNo", "")

    if not cashier_url:
        for appointment in appointments:
            appointment.status = AppointmentStatus.held
            appointment.opay_reference = None
        db.commit()
        raise HTTPException(status_code=502, detail="Failed to generate payment URL")

    return InitiatePaymentResponse(
        cashier_url=cashier_url,
        reference=reference,
        order_no=order_no,
    )


@router.post("/callback")
async def payment_callback(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    OPay webhook callback — called by OPay after payment status changes.
    Verifies the SHA512 signature and confirms the appointment if payment succeeded.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    payload = body.get("payload", {})
    sha512 = body.get("sha512", "")
    event_type = body.get("type", "")

    # Verify signature
    if not verify_callback_signature(payload, sha512):
        logger.warning("OPay callback signature verification failed")
        raise HTTPException(status_code=403, detail="Invalid signature")

    reference = payload.get("reference", "")
    payment_status = payload.get("status", "")
    transaction_id = payload.get("transactionId", "")

    logger.info(f"OPay Callback → ref={reference}, status={payment_status}, type={event_type}")

    # Find all appointments by OPay reference
    appointments = db.query(Appointment).filter(Appointment.opay_reference == reference).all()
    if not appointments:
        logger.warning(f"OPay callback for unknown reference: {reference}")
        return {"status": "ignored", "reason": "unknown reference"}

    if payment_status == "SUCCESS":
        confirmed_ids = []
        services_list = []
        for appointment in appointments:
            result = confirm_appointment(db, appointment.id, opay_reference=reference)
            confirmed_ids.append(appointment.id)
            services_list.append(result["service"])

        # Send confirmation email
        user = db.query(User).filter(User.id == appointments[0].user_id).first()
        if user:
            services_str = ", ".join(services_list)
            background_tasks.add_task(
                send_email,
                to=user.email,
                template_name="appointment_reminder",
                service_name=services_str,
                appointment_time=appointments[0].start_time.isoformat(),
            )

        return {"status": "confirmed", "appointment_ids": confirmed_ids}

    elif payment_status in ("FAIL", "CLOSE"):
        # Payment failed or was cancelled — release the hold
        for appointment in appointments:
            appointment.status = AppointmentStatus.cancelled
        db.commit()
        return {"status": "cancelled", "appointment_ids": [a.id for a in appointments]}

    # For other statuses (PENDING, etc.), just acknowledge
    return {"status": "acknowledged", "payment_status": payment_status}


@router.get("/verify/{reference}", response_model=PaymentStatusResponse)
def verify_payment(
    reference: str,
    background_tasks: BackgroundTasks,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Manually check the payment status of an OPay transaction.
    Useful for the return page to confirm payment went through.
    """
    # Verify the reference belongs to this user
    appointments = (
        db.query(Appointment)
        .filter(Appointment.opay_reference == reference, Appointment.user_id == user_id)
        .all()
    )
    if not appointments:
        raise HTTPException(status_code=404, detail="Payment reference not found")

    try:
        result = query_payment_status(reference)
    except Exception as e:
        logger.error(f"OPay status query failed: {e}")
        raise HTTPException(status_code=502, detail="Could not verify payment status")

    opay_data = result.get("data", {})
    opay_status = opay_data.get("status", "UNKNOWN")
    amount_kobo = opay_data.get("amount", {}).get("total", 0)

    # If OPay says SUCCESS but our appointments aren't confirmed yet, confirm all now
    if opay_status == "SUCCESS" and appointments[0].status != AppointmentStatus.confirmed:
        services_list = []
        for appointment in appointments:
            confirm_appointment(db, appointment.id, opay_reference=reference)
            service = db.query(Service).filter(Service.id == appointment.service_id).first()
            if service:
                services_list.append(service.name)

        user = db.query(User).filter(User.id == user_id).first()
        if user:
            services_str = ", ".join(services_list) if services_list else "Services"
            background_tasks.add_task(
                send_email,
                to=user.email,
                template_name="appointment_reminder",
                service_name=services_str,
                appointment_time=appointments[0].start_time.isoformat(),
            )

    status_map = {
        "SUCCESS": "Payment confirmed",
        "FAIL": "Payment failed",
        "CLOSE": "Payment cancelled",
        "PENDING": "Payment pending",
        "INITIAL": "Awaiting payment",
    }

    return PaymentStatusResponse(
        reference=reference,
        status=opay_status,
        amount=amount_kobo / 100 if amount_kobo else None,
        message=status_map.get(opay_status, "Unknown status"),
    )
