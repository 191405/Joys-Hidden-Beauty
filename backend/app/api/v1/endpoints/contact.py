from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.contact import ContactInquiry
from app.models.user import UserRole
from app.core.rbac import get_current_user
from app.services.email_service import email_service

router = APIRouter(prefix="/contact", tags=["Contact & Concierge"])

class ContactRequest(BaseModel):
    name: str
    email: str
    inquiry_type: str
    message: str

class ContactResponse(ContactRequest):
    id: str
    status: str

    class Config:
        from_attributes = True

@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def submit_inquiry(payload: ContactRequest, db: Session = Depends(get_db)):
    """Submit a new concierge inquiry."""
    
    inquiry = ContactInquiry(
        name=payload.name,
        email=payload.email,
        inquiry_type=payload.inquiry_type,
        message=payload.message
    )
    
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    # Fire off simultaneous emails (user receipt + admin alert)
    email_service.send_inquiry_receipt_email(to_email=payload.email, name=payload.name)
    email_service.send_admin_inquiry_alert(
        inquiry_type=payload.inquiry_type,
        user_email=payload.email,
        message=payload.message
    )

    return inquiry

@router.get("/admin", response_model=List[ContactResponse])
def get_all_inquiries(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Admin only: Get all concierge inquiries."""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view inquiries"
        )
    return db.query(ContactInquiry).order_by(ContactInquiry.created_at.desc()).offset(skip).limit(limit).all()
