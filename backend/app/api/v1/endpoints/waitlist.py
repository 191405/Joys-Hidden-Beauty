from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.models.booking import WaitlistEntry
from app.services.email_service import email_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class WaitlistJoinRequest(BaseModel):
    name: str
    email: EmailStr

@router.post("/join")
def join_waitlist(req: WaitlistJoinRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Join the beauty waitlist and receive a welcome email."""
    # Check if already exists to prevent spam
    existing = db.query(WaitlistEntry).filter(WaitlistEntry.email == req.email).first()
    if existing:
        return {"message": "You are already on the waitlist."}

    # Save to database
    entry = WaitlistEntry(
        name=req.name,
        email=req.email
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    # Send welcome email asynchronously
    logger.info(f"Adding welcome email task for {req.email}")
    background_tasks.add_task(
        email_service.send_waitlist_welcome_email,
        to_email=req.email,
        name=req.name
    )

    return {"message": "Successfully joined the waitlist.", "id": entry.id}
