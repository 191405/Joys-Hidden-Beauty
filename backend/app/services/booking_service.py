"""
Smart Booking Service — computes availability from Staff schedules,
prevents double-booking, handles buffer times and concurrency holds.
"""
import json
from datetime import datetime, timedelta, timezone, time as dt_time
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from app.models.booking import Service, Appointment, AppointmentStatus
from app.models.staff import Staff


def get_staff_working_hours(staff: Staff, target_date: datetime) -> tuple[dt_time, dt_time] | None:
    """
    Get the working hours for a staff member on a specific date.
    Returns (start_time, end_time) or None if the staff is off that day.
    """
    day_name = target_date.strftime("%A").lower()  # e.g. "monday"
    try:
        schedule = json.loads(staff.working_hours_json)
    except (json.JSONDecodeError, TypeError):
        return None

    day_schedule = schedule.get(day_name)
    if not day_schedule:
        return None  # Day off

    start = dt_time.fromisoformat(day_schedule["start"])
    end = dt_time.fromisoformat(day_schedule["end"])
    return (start, end)


def get_available_slots(
    db: Session,
    service_id: int,
    date_str: str,
    staff_id: int | None = None,
) -> list[dict]:
    """
    Compute available time slots by subtracting booked appointments
    from staff working hours.

    Algorithm:
    1. Fetch operating hours for each staff member on that day.
    2. Fetch existing appointments (confirmed + held) for that staff member.
    3. Calculate free slots: Operating Hours MINUS Existing Appointments MINUS Buffer Time.
    4. Filter: slot must fit service_duration; don't show slots past closing time.
    """
    service = db.query(Service).filter(Service.id == service_id, Service.is_active == True).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    total_needed = service.duration_minutes + service.buffer_minutes

    # Get staff members
    staff_query = db.query(Staff).filter(Staff.is_active == True)
    if staff_id:
        staff_query = staff_query.filter(Staff.id == staff_id)
    staff_members = staff_query.all()

    all_slots = []

    for staff_member in staff_members:
        hours = get_staff_working_hours(staff_member, target_date)
        if not hours:
            continue  # Staff is off this day

        work_start, work_end = hours
        day_start = datetime.combine(target_date, work_start)
        day_end = datetime.combine(target_date, work_end)

        # Fetch existing appointments for this staff member on this day
        # Include both confirmed and held (not expired) appointments
        now = datetime.now(timezone.utc)
        existing = (
            db.query(Appointment)
            .filter(
                Appointment.staff_id == staff_member.id,
                Appointment.start_time >= day_start,
                Appointment.end_time <= day_end,
                Appointment.status.in_([
                    AppointmentStatus.confirmed,
                    AppointmentStatus.pending,
                    AppointmentStatus.held,
                ]),
            )
            .order_by(Appointment.start_time)
            .all()
        )

        # Filter out expired holds
        booked_ranges = []
        for apt in existing:
            if apt.status == AppointmentStatus.held and apt.held_until and apt.held_until < now:
                continue  # Expired hold — treat as free
            # Add buffer after each appointment
            booked_service = db.query(Service).filter(Service.id == apt.service_id).first()
            buffer = booked_service.buffer_minutes if booked_service else 15
            booked_ranges.append((apt.start_time, apt.end_time + timedelta(minutes=buffer)))

        # Compute free intervals
        free_intervals = _subtract_ranges(day_start, day_end, booked_ranges)

        # Generate slots from free intervals
        for interval_start, interval_end in free_intervals:
            slot_start = interval_start
            while slot_start + timedelta(minutes=total_needed) <= interval_end:
                slot_end = slot_start + timedelta(minutes=service.duration_minutes)
                # Don't show slots past closing time
                if slot_end > day_end:
                    break
                all_slots.append({
                    "staff_id": staff_member.id,
                    "staff_name": staff_member.name,
                    "start_time": slot_start.isoformat(),
                    "end_time": slot_end.isoformat(),
                })
                slot_start += timedelta(minutes=30)  # 30-min increments

    # Sort by time, then by staff name
    all_slots.sort(key=lambda s: (s["start_time"], s["staff_name"]))
    return all_slots


def _subtract_ranges(
    day_start: datetime,
    day_end: datetime,
    booked: list[tuple[datetime, datetime]],
) -> list[tuple[datetime, datetime]]:
    """Subtract booked ranges from the full working day to get free intervals."""
    if not booked:
        return [(day_start, day_end)]

    booked_sorted = sorted(booked, key=lambda r: r[0])
    free = []
    cursor = day_start

    for bk_start, bk_end in booked_sorted:
        if cursor < bk_start:
            free.append((cursor, bk_start))
        cursor = max(cursor, bk_end)

    if cursor < day_end:
        free.append((cursor, day_end))

    return free


def hold_slot(
    db: Session,
    user_id: int,
    service_id: int,
    staff_id: int,
    start_time_str: str,
) -> dict:
    """
    Hold a slot for 10 minutes while the user completes payment.
    Creates an Appointment with status='held' and held_until = now + 10 min.
    """
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")

    start_time = datetime.fromisoformat(start_time_str)
    end_time = start_time + timedelta(minutes=service.duration_minutes)
    now = datetime.now(timezone.utc)
    held_until = now + timedelta(minutes=10)

    # Check for conflicts (excluding expired holds)
    conflict = (
        db.query(Appointment)
        .filter(
            Appointment.staff_id == staff_id,
            Appointment.start_time < end_time + timedelta(minutes=service.buffer_minutes),
            Appointment.end_time > start_time,
            Appointment.status.in_([
                AppointmentStatus.confirmed,
                AppointmentStatus.pending,
                AppointmentStatus.held,
            ]),
        )
        .all()
    )

    # Filter out expired holds from conflicts
    real_conflicts = [
        c for c in conflict
        if not (c.status == AppointmentStatus.held and c.held_until and c.held_until < now)
    ]

    if real_conflicts:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This time slot is no longer available. Please choose another.",
        )

    appointment = Appointment(
        user_id=user_id,
        service_id=service_id,
        staff_id=staff_id,
        start_time=start_time,
        end_time=end_time,
        status=AppointmentStatus.held,
        held_until=held_until,
        booked_at=now,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return {
        "appointment_id": appointment.id,
        "service": service.name,
        "staff": staff.name,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "held_until": held_until.isoformat(),
        "status": "held",
        "message": f"Slot held for 10 minutes. Complete payment to confirm.",
    }


def confirm_appointment(db: Session, appointment_id: int, opay_reference: str = "") -> dict:
    """
    Confirm an appointment after payment succeeds.
    Called by the OPay payment callback handler.
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = AppointmentStatus.confirmed
    appointment.held_until = None
    appointment.opay_reference = opay_reference
    db.commit()
    db.refresh(appointment)

    service = db.query(Service).filter(Service.id == appointment.service_id).first()
    staff = db.query(Staff).filter(Staff.id == appointment.staff_id).first()

    return {
        "appointment_id": appointment.id,
        "service": service.name if service else "Unknown",
        "staff": staff.name if staff else "Unknown",
        "start_time": appointment.start_time.isoformat(),
        "end_time": appointment.end_time.isoformat(),
        "status": "confirmed",
        "message": f"Your {service.name if service else 'appointment'} is confirmed!",
    }


def release_expired_holds(db: Session) -> int:
    """
    Release all expired holds. Called by the scheduler every 2 minutes.
    Returns the number of released holds.
    """
    now = datetime.now(timezone.utc)
    expired = (
        db.query(Appointment)
        .filter(
            Appointment.status == AppointmentStatus.held,
            Appointment.held_until < now,
        )
        .all()
    )

    count = 0
    for apt in expired:
        apt.status = AppointmentStatus.cancelled
        count += 1

    if count > 0:
        db.commit()

    return count
