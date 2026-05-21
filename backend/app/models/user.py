"""
User model with Role-Based Access Control and separated SkinProfile.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    customer = "customer"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(30), default="")
    role = Column(SAEnum(UserRole), default=UserRole.customer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    skin_profile = relationship("SkinProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="user")
    orders = relationship("Order", back_populates="user")


class SkinProfile(Base):
    """Extracted skin profile — normalizes the 1:1 relationship."""
    __tablename__ = "skin_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    skin_type = Column(String(50), default="")        # Oily, Dry, Combination, Normal
    skin_tone = Column(String(7), default="")          # Hex color e.g. #8d5524
    allergies = Column(Text, default="")               # Comma-separated list
    concerns = Column(Text, default="")                # e.g. "hydration,anti-aging"

    user = relationship("User", back_populates="skin_profile")
