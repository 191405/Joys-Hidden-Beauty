"""
Staff model — beauty professionals with configurable schedules.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class Staff(Base):
    """A staff member who performs services."""
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    phone = Column(String(30), default="")
    bio = Column(Text, default="")
    is_active = Column(Boolean, default=True)

    # JSON string: {"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {...}, ...}
    # null day = day off
    working_hours_json = Column(Text, nullable=False, default='{"monday":{"start":"09:00","end":"18:00"},"tuesday":{"start":"09:00","end":"18:00"},"wednesday":{"start":"09:00","end":"18:00"},"thursday":{"start":"09:00","end":"18:00"},"friday":{"start":"09:00","end":"18:00"},"saturday":{"start":"10:00","end":"16:00"},"sunday":null}')

    # Relationships
    appointments = relationship("Appointment", back_populates="staff")
