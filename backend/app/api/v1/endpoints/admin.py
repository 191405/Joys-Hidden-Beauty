"""
Admin API — Dashboard, Appointments, Services, Staff, Users, Payments.
All endpoints require admin role via the `require_admin` dependency.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.core.rbac import require_admin
from app.models.user import User, UserRole
from app.models.booking import Service, Appointment, AppointmentStatus, WaitlistEntry, WaitlistStatus
from app.models.staff import Staff
from app.models.order import Order
from app.models.marketing import ChurnCampaignLog
from app.services.email_service import email_service
from fastapi import BackgroundTasks

router = APIRouter(prefix="/admin", tags=["Admin"])


# ═══════════════════════════════════════════
# SCHEMAS
# ═══════════════════════════════════════════

class DashboardStats(BaseModel):
    total_users: int
    total_appointments: int
    appointments_today: int
    pending_appointments: int
    confirmed_appointments: int
    total_revenue: float
    active_services: int
    active_staff: int


class AppointmentItem(BaseModel):
    id: int
    user_name: str
    user_email: str
    service_name: str
    staff_name: str
    start_time: str
    end_time: str
    status: str
    opay_reference: str | None
    booked_at: str


class UpdateStatusRequest(BaseModel):
    status: str  # confirmed, cancelled, completed, no_show


class UserItem(BaseModel):
    id: int
    email: str
    first_name: str
    phone: str
    role: str
    created_at: str
    appointment_count: int


class ServiceCreate(BaseModel):
    name: str
    description: str = ""
    duration_minutes: int
    buffer_minutes: int = 15
    price: float
    category: str = "general"
    image_url: str = ""


class ServiceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    duration_minutes: int | None = None
    buffer_minutes: int | None = None
    price: float | None = None
    category: str | None = None
    image_url: str | None = None
    is_active: bool | None = None


class ServiceItem(BaseModel):
    id: int
    name: str
    description: str
    duration_minutes: int
    buffer_minutes: int
    price: float
    category: str
    image_url: str
    is_active: bool

    class Config:
        from_attributes = True


class StaffCreate(BaseModel):
    name: str
    email: str | None = None
    phone: str = ""
    bio: str = ""
    working_hours_json: str = '{"monday":{"start":"09:00","end":"18:00"},"tuesday":{"start":"09:00","end":"18:00"},"wednesday":{"start":"09:00","end":"18:00"},"thursday":{"start":"09:00","end":"18:00"},"friday":{"start":"09:00","end":"18:00"},"saturday":{"start":"10:00","end":"16:00"},"sunday":null}'


class StaffUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    bio: str | None = None
    is_active: bool | None = None
    working_hours_json: str | None = None


class StaffItem(BaseModel):
    id: int
    name: str
    email: str | None
    phone: str
    bio: str
    is_active: bool

    class Config:
        from_attributes = True


class PaymentItem(BaseModel):
    appointment_id: int
    opay_reference: str | None
    service_name: str
    user_name: str
    amount: float
    status: str
    booked_at: str


# ═══════════════════════════════════════════
# DASHBOARD
# ═══════════════════════════════════════════

@router.get("/dashboard", response_model=DashboardStats)
def admin_dashboard(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Summary statistics for the admin dashboard."""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_appointments = db.query(func.count(Appointment.id)).scalar() or 0

    appointments_today = (
        db.query(func.count(Appointment.id))
        .filter(Appointment.start_time >= today_start, Appointment.start_time < today_end)
        .scalar() or 0
    )

    pending = (
        db.query(func.count(Appointment.id))
        .filter(Appointment.status.in_([AppointmentStatus.held, AppointmentStatus.pending]))
        .scalar() or 0
    )

    confirmed = (
        db.query(func.count(Appointment.id))
        .filter(Appointment.status == AppointmentStatus.confirmed)
        .scalar() or 0
    )

    # Revenue = sum of service prices for confirmed/completed appointments
    revenue_result = (
        db.query(func.sum(Service.price))
        .join(Appointment, Appointment.service_id == Service.id)
        .filter(Appointment.status.in_([AppointmentStatus.confirmed, AppointmentStatus.completed]))
        .scalar()
    )
    total_revenue = float(revenue_result) if revenue_result else 0.0

    active_services = db.query(func.count(Service.id)).filter(Service.is_active == True).scalar() or 0
    active_staff = db.query(func.count(Staff.id)).filter(Staff.is_active == True).scalar() or 0

    return DashboardStats(
        total_users=total_users,
        total_appointments=total_appointments,
        appointments_today=appointments_today,
        pending_appointments=pending,
        confirmed_appointments=confirmed,
        total_revenue=total_revenue,
        active_services=active_services,
        active_staff=active_staff,
    )


# ═══════════════════════════════════════════
# APPOINTMENTS
# ═══════════════════════════════════════════

@router.get("/appointments", response_model=list[AppointmentItem])
def list_appointments(
    status: str | None = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all appointments with optional status filter and pagination."""
    query = db.query(Appointment).order_by(desc(Appointment.booked_at))

    if status:
        try:
            status_enum = AppointmentStatus(status)
            query = query.filter(Appointment.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

    offset = (page - 1) * limit
    appointments = query.offset(offset).limit(limit).all()

    results = []
    for apt in appointments:
        user = db.query(User).filter(User.id == apt.user_id).first()
        service = db.query(Service).filter(Service.id == apt.service_id).first()
        staff = db.query(Staff).filter(Staff.id == apt.staff_id).first()

        results.append(AppointmentItem(
            id=apt.id,
            user_name=user.first_name if user else "Unknown",
            user_email=user.email if user else "",
            service_name=service.name if service else "Unknown",
            staff_name=staff.name if staff else "Unknown",
            start_time=apt.start_time.isoformat() if apt.start_time else "",
            end_time=apt.end_time.isoformat() if apt.end_time else "",
            status=apt.status.value,
            opay_reference=apt.opay_reference,
            booked_at=apt.booked_at.isoformat() if apt.booked_at else "",
        ))

    return results


@router.patch("/appointments/{appointment_id}/status")
def update_appointment_status(
    appointment_id: int,
    payload: UpdateStatusRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update the status of an appointment (confirm, cancel, complete, no-show)."""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    valid_statuses = {s.value for s in AppointmentStatus}
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    appointment.status = AppointmentStatus(payload.status)
    if payload.status == "confirmed":
        appointment.held_until = None
    db.commit()

    return {"message": f"Appointment {appointment_id} updated to '{payload.status}'"}


# ═══════════════════════════════════════════
# USERS
# ═══════════════════════════════════════════

@router.get("/users", response_model=list[UserItem])
def list_users(
    search: str | None = Query(None, description="Search by name or email"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all users with optional search and pagination."""
    query = db.query(User).order_by(desc(User.created_at))

    if search:
        query = query.filter(
            (User.first_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )

    offset = (page - 1) * limit
    users = query.offset(offset).limit(limit).all()

    results = []
    for u in users:
        apt_count = db.query(func.count(Appointment.id)).filter(Appointment.user_id == u.id).scalar() or 0
        results.append(UserItem(
            id=u.id,
            email=u.email,
            first_name=u.first_name,
            phone=u.phone or "",
            role=u.role.value,
            created_at=u.created_at.isoformat() if u.created_at else "",
            appointment_count=apt_count,
        ))

    return results


# ═══════════════════════════════════════════
# SERVICES (CRUD)
# ═══════════════════════════════════════════

@router.get("/services", response_model=list[ServiceItem])
def list_all_services(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all services including inactive ones (admin view)."""
    return db.query(Service).order_by(Service.id).all()


@router.post("/services", response_model=ServiceItem, status_code=201)
def create_service(
    payload: ServiceCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new beauty service."""
    service = Service(
        name=payload.name,
        description=payload.description,
        duration_minutes=payload.duration_minutes,
        buffer_minutes=payload.buffer_minutes,
        price=payload.price,
        category=payload.category,
        image_url=payload.image_url,
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/services/{service_id}", response_model=ServiceItem)
def update_service(
    service_id: int,
    payload: ServiceUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update an existing service. Only provided fields are updated."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)
    return service


@router.delete("/services/{service_id}")
def deactivate_service(
    service_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Soft-delete a service by setting is_active=False."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    service.is_active = False
    db.commit()
    return {"message": f"Service '{service.name}' deactivated"}


# ═══════════════════════════════════════════
# STAFF
# ═══════════════════════════════════════════

@router.get("/staff", response_model=list[StaffItem])
def list_staff(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all staff members."""
    return db.query(Staff).order_by(Staff.id).all()


@router.post("/staff", response_model=StaffItem, status_code=201)
def create_staff(
    payload: StaffCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new staff member."""
    staff = Staff(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        bio=payload.bio,
        working_hours_json=payload.working_hours_json,
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff


@router.put("/staff/{staff_id}", response_model=StaffItem)
def update_staff(
    staff_id: int,
    payload: StaffUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update staff details or schedule."""
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(staff, field, value)

    db.commit()
    db.refresh(staff)
    return staff


# ═══════════════════════════════════════════
# PAYMENTS
# ═══════════════════════════════════════════

@router.get("/payments", response_model=list[PaymentItem])
def list_payments(
    status: str | None = Query(None, description="Filter by appointment status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List payment transactions (appointments with OPay references)."""
    query = (
        db.query(Appointment)
        .filter(Appointment.opay_reference.isnot(None))
        .order_by(desc(Appointment.booked_at))
    )

    if status:
        try:
            status_enum = AppointmentStatus(status)
            query = query.filter(Appointment.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

    offset = (page - 1) * limit
    appointments = query.offset(offset).limit(limit).all()

    results = []
    for apt in appointments:
        user = db.query(User).filter(User.id == apt.user_id).first()
        service = db.query(Service).filter(Service.id == apt.service_id).first()

        results.append(PaymentItem(
            appointment_id=apt.id,
            opay_reference=apt.opay_reference,
            service_name=service.name if service else "Unknown",
            user_name=user.first_name if user else "Unknown",
            amount=service.price if service else 0,
            status=apt.status.value,
            booked_at=apt.booked_at.isoformat() if apt.booked_at else "",
        ))

    return results


# ═══════════════════════════════════════════
# WAITLIST
# ═══════════════════════════════════════════

class WaitlistAdminItem(BaseModel):
    id: int
    name: str
    email: str
    status: str
    joined_at: str

@router.get("/waitlist", response_model=list[WaitlistAdminItem])
def list_waitlist(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all waitlist entries."""
    entries = db.query(WaitlistEntry).order_by(desc(WaitlistEntry.joined_at)).all()
    return [
        WaitlistAdminItem(
            id=e.id,
            name=e.name,
            email=e.email,
            status=e.status.value,
            joined_at=e.joined_at.isoformat() if e.joined_at else ""
        ) for e in entries
    ]

@router.patch("/waitlist/{entry_id}/contact")
def contact_waitlist_user(
    entry_id: int,
    background_tasks: BackgroundTasks,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Mark a waitlist entry as contacted and send the contact email."""
    entry = db.query(WaitlistEntry).filter(WaitlistEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")

    if entry.status == WaitlistStatus.contacted:
        return {"message": "User has already been contacted."}

    entry.status = WaitlistStatus.contacted
    db.commit()

    # Send contact email
    background_tasks.add_task(
        email_service.send_waitlist_contact_email,
        to_email=entry.email,
        name=entry.name
    )

    return {"message": f"Waitlist entry {entry_id} marked as contacted and email sent."}
