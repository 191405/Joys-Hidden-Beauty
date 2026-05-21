from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class ContactInquiry(Base):
    __tablename__ = "contact_inquiries"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    inquiry_type = Column(String, nullable=False)  # General, Order Issue, Booking Assistance, Press
    message = Column(Text, nullable=False)
    status = Column(String, default="Unread")  # Unread, Read, Responded
    created_at = Column(DateTime(timezone=True), server_default=func.now())
