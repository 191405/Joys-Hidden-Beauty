"""
Booking API — Services, Availability, Hold, Reserve.
Updated: slots are computed from Staff schedules, not a static table.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.booking import Service, Appointment, AppointmentStatus
from app.services.booking_service import get_available_slots, hold_slot, confirm_appointment
from app.services.email_service import send_email

router = APIRouter(prefix="/booking", tags=["Booking"])


# --- Schemas ---
class ServiceResponse(BaseModel):
    id: int
    name: str
    description: str
    duration_minutes: int
    buffer_minutes: int
    price: float
    category: str
    image_url: str

    class Config:
        from_attributes = True


class AvailabilitySlot(BaseModel):
    staff_id: int
    staff_name: str
    start_time: str
    end_time: str


class HoldRequest(BaseModel):
    service_id: int
    staff_id: int
    start_time: str  # ISO format


class HoldResponse(BaseModel):
    appointment_id: int
    service: str
    staff: str
    start_time: str
    end_time: str
    held_until: str
    status: str
    message: str


class AppointmentResponse(BaseModel):
    id: int
    service: str
    staff: str
    start_time: str
    end_time: str
    status: str
    notes: str


# --- Endpoints ---
@router.get("/services", response_model=list[ServiceResponse])
def list_services(db: Session = Depends(get_db)):
    """List all active beauty services with pricing."""
    services = db.query(Service).filter(Service.is_active == True).all()
    return [
        ServiceResponse(
            id=s.id,
            name=s.name,
            description=s.description,
            duration_minutes=s.duration_minutes,
            buffer_minutes=s.buffer_minutes,
            price=s.price,
            category=s.category,
            image_url=s.image_url,
        )
        for s in services
    ]


@router.get("/availability", response_model=list[AvailabilitySlot])
def check_availability(
    service_id: int = Query(..., description="Service to check availability for"),
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    staff_id: int | None = Query(None, description="Optional staff member filter"),
    db: Session = Depends(get_db),
):
    """
    Get available time slots for a service on a given date.
    Computes availability from staff schedules minus existing bookings and buffer times.
    """
    slots = get_available_slots(db, service_id, date, staff_id)
    return [AvailabilitySlot(**s) for s in slots]


@router.post("/hold", response_model=HoldResponse)
def hold_time_slot(
    payload: HoldRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Hold a slot for 10 minutes while the user completes payment.
    The hold is automatically released if not confirmed within the window.
    """
    result = hold_slot(
        db=db,
        user_id=user_id,
        service_id=payload.service_id,
        staff_id=payload.staff_id,
        start_time_str=payload.start_time,
    )
    return HoldResponse(**result)


@router.post("/confirm/{appointment_id}", response_model=dict)
def confirm_booking(
    appointment_id: int,
    background_tasks: BackgroundTasks,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Confirm a held appointment after payment.
    In production, this is called by the OPay callback — not the frontend.
    For dev/testing, this endpoint allows manual confirmation.
    """
    result = confirm_appointment(db, appointment_id)

    # Send confirmation email
    from app.models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        background_tasks.add_task(
            send_email,
            to=user.email,
            template_name="appointment_reminder",
            service_name=result["service"],
            appointment_time=result["start_time"],
        )

    return result


@router.get("/my-appointments", response_model=list[AppointmentResponse])
def my_appointments(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get all appointments for the current user."""
    appointments = (
        db.query(Appointment)
        .filter(Appointment.user_id == user_id)
        .order_by(Appointment.booked_at.desc())
        .all()
    )

    results = []
    for apt in appointments:
        service = db.query(Service).filter(Service.id == apt.service_id).first()
        from app.models.staff import Staff
        staff = db.query(Staff).filter(Staff.id == apt.staff_id).first()
        results.append(AppointmentResponse(
            id=apt.id,
            service=service.name if service else "Unknown",
            staff=staff.name if staff else "Unknown",
            start_time=apt.start_time.isoformat() if apt.start_time else "",
            end_time=apt.end_time.isoformat() if apt.end_time else "",
            status=apt.status.value if apt.status else "unknown",
            notes=apt.notes or "",
        ))

    return results
