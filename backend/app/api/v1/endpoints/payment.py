"""
Payment API — OPay Express Checkout (Cashier redirect flow).

Endpoints:
  POST /initiate       — Create OPay payment for a held appointment
  POST /callback       — OPay webhook callback (signature-verified)
  GET  /verify/{ref}   — Manual payment status check
  GET  /return         — Return URL after OPay payment (redirects to frontend)
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
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
    appointment_id: int


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
    appointment = (
        db.query(Appointment)
        .filter(Appointment.id == payload.appointment_id, Appointment.user_id == user_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status != AppointmentStatus.held:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot initiate payment for appointment with status '{appointment.status.value}'",
        )

    service = db.query(Service).filter(Service.id == appointment.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate unique payment reference
    reference = generate_reference(prefix="JHB")

    # Store reference on the appointment so we can match callbacks
    appointment.opay_reference = reference
    appointment.status = AppointmentStatus.pending
    db.commit()

    # Build URLs
    frontend_url = settings.FRONTEND_URL
    backend_base = f"{frontend_url.rstrip('/')}"  # For return URL (frontend page)
    api_base = settings.FRONTEND_URL.replace(":3000", ":8000")  # Approximate backend URL

    return_url = f"{backend_base}/booking/payment-return?reference={reference}"
    callback_url = f"{api_base}/api/v1/payment/callback"
    cancel_url = f"{backend_base}/booking?cancelled=true"

    try:
        result = create_cashier_payment(
            reference=reference,
            amount_naira=service.price,
            user_email=user.email,
            user_name=user.first_name,
            user_id=str(user.id),
            product_name=service.name,
            product_description=f"{service.name} — {service.duration_minutes} min appointment",
            return_url=return_url,
            callback_url=callback_url,
            cancel_url=cancel_url,
        )
    except Exception as e:
        # Revert status on failure
        appointment.status = AppointmentStatus.held
        appointment.opay_reference = None
        db.commit()
        logger.error(f"OPay payment initiation failed: {e}")
        raise HTTPException(status_code=502, detail="Payment service temporarily unavailable")

    cashier_url = result.get("data", {}).get("cashierUrl", "")
    order_no = result.get("data", {}).get("orderNo", "")

    if not cashier_url:
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
async def payment_callback(request: Request, db: Session = Depends(get_db)):
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

    # Find the appointment by OPay reference
    appointment = db.query(Appointment).filter(Appointment.opay_reference == reference).first()
    if not appointment:
        logger.warning(f"OPay callback for unknown reference: {reference}")
        return {"status": "ignored", "reason": "unknown reference"}

    if payment_status == "SUCCESS":
        # Confirm the appointment
        result = confirm_appointment(db, appointment.id, opay_reference=reference)

        # Send confirmation email
        user = db.query(User).filter(User.id == appointment.user_id).first()
        if user:
            send_email(
                to=user.email,
                template_name="appointment_reminder",
                service_name=result["service"],
                appointment_time=result["start_time"],
            )

        return {"status": "confirmed", "appointment_id": appointment.id}

    elif payment_status in ("FAIL", "CLOSE"):
        # Payment failed or was cancelled — release the hold
        appointment.status = AppointmentStatus.cancelled
        db.commit()
        return {"status": "cancelled", "appointment_id": appointment.id}

    # For other statuses (PENDING, etc.), just acknowledge
    return {"status": "acknowledged", "payment_status": payment_status}


@router.get("/verify/{reference}", response_model=PaymentStatusResponse)
def verify_payment(
    reference: str,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Manually check the payment status of an OPay transaction.
    Useful for the return page to confirm payment went through.
    """
    # Verify the reference belongs to this user
    appointment = (
        db.query(Appointment)
        .filter(Appointment.opay_reference == reference, Appointment.user_id == user_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Payment reference not found")

    try:
        result = query_payment_status(reference)
    except Exception as e:
        logger.error(f"OPay status query failed: {e}")
        raise HTTPException(status_code=502, detail="Could not verify payment status")

    opay_data = result.get("data", {})
    opay_status = opay_data.get("status", "UNKNOWN")
    amount_kobo = opay_data.get("amount", {}).get("total", 0)

    # If OPay says SUCCESS but our appointment isn't confirmed yet, confirm it now
    if opay_status == "SUCCESS" and appointment.status != AppointmentStatus.confirmed:
        confirm_appointment(db, appointment.id, opay_reference=reference)

        user = db.query(User).filter(User.id == user_id).first()
        service = db.query(Service).filter(Service.id == appointment.service_id).first()
        if user and service:
            send_email(
                to=user.email,
                template_name="appointment_reminder",
                service_name=service.name,
                appointment_time=appointment.start_time.isoformat(),
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
