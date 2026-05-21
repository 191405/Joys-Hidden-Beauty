"""
Booking models — Services and Appointments.
TimeSlot table removed: slots are now computed dynamically from Staff schedules.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class AppointmentStatus(str, enum.Enum):
    held = "held"              # Slot held for 10 min (awaiting payment)
    pending = "pending"        # Payment initiated, awaiting webhook
    confirmed = "confirmed"    # Payment succeeded
    cancelled = "cancelled"    # User or admin cancelled
    completed = "completed"    # Service was delivered
    no_show = "no_show"        # Customer didn't show up


class Service(Base):
    """A beauty service offered (e.g. 'Signature Facial', 'Bridal Makeup')."""
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    duration_minutes = Column(Integer, nullable=False)       # Service length
    buffer_minutes = Column(Integer, default=15)             # Cleanup between appointments
    price = Column(Float, nullable=False)
    category = Column(String(100), default="general")        # facial, makeup, body, bridal
    image_url = Column(String(500), default="")
    is_active = Column(Boolean, default=True)

    # Relationships
    appointments = relationship("Appointment", back_populates="service")


class Appointment(Base):
    """
    A booked appointment linking user → service → staff.
    Time slots are computed, not stored — start_time and end_time live here.
    """
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)

    # Computed slot — no more TimeSlot table
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)

    status = Column(SAEnum(AppointmentStatus), default=AppointmentStatus.held, nullable=False)
    notes = Column(Text, default="")
    booked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Concurrency hold: if status == "held" and held_until < now, the hold is expired
    held_until = Column(DateTime, nullable=True)

    # OPay payment reference
    opay_reference = Column(String(255), nullable=True)

    # Relationships
    user = relationship("User", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")
    staff = relationship("Staff", back_populates="appointments")

class WaitlistStatus(str, enum.Enum):
    pending = "pending"
    contacted = "contacted"

class WaitlistEntry(Base):
    """Users who joined the waitlist."""
    __tablename__ = "waitlist"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    status = Column(SAEnum(WaitlistStatus), default=WaitlistStatus.pending, nullable=False)
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
