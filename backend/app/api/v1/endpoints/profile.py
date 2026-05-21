"""
Profile API — User Beauty Profile & Recommendations.
Updated for separated SkinProfile table.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User, SkinProfile as SkinProfileModel
from app.services.recommendation import get_recommendations

router = APIRouter(prefix="/user", tags=["User Profile"])


# --- Schemas ---
class SkinProfileSchema(BaseModel):
    type: Optional[str] = None
    tone: Optional[str] = None
    allergies: list[str] = []
    concerns: list[str] = []


class ProfileResponse(BaseModel):
    id: int
    first_name: str
    email: str
    phone: str
    role: str
    skin_profile: SkinProfileSchema


class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    phone: Optional[str] = None
    skin_type: Optional[str] = None
    skin_tone: Optional[str] = None
    allergies: Optional[str] = None   # Comma-separated
    concerns: Optional[str] = None    # Comma-separated


class RecommendationResponse(BaseModel):
    id: int
    name: str
    slug: str
    category: str
    price: float
    description: str
    image_url: str
    match_score: int


def _build_profile_response(user: User) -> ProfileResponse:
    """Helper to build ProfileResponse from a User with SkinProfile."""
    skin = user.skin_profile
    return ProfileResponse(
        id=user.id,
        first_name=user.first_name,
        email=user.email,
        phone=user.phone or "",
        role=user.role.value,
        skin_profile=SkinProfileSchema(
            type=skin.skin_type if skin else None,
            tone=skin.skin_tone if skin else None,
            allergies=[a.strip() for a in (skin.allergies or "").split(",") if a.strip()] if skin else [],
            concerns=[c.strip() for c in (skin.concerns or "").split(",") if c.strip()] if skin else [],
        ),
    )


# --- Endpoints ---
@router.get("/profile", response_model=ProfileResponse)
def get_profile(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get user profile with skin profile data."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _build_profile_response(user)


@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    payload: UpdateProfileRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Update user profile and skin profile attributes."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user fields
    if payload.first_name is not None:
        user.first_name = payload.first_name
    if payload.phone is not None:
        user.phone = payload.phone

    # Update skin profile (create if missing)
    skin = user.skin_profile
    if not skin:
        skin = SkinProfileModel(user_id=user.id)
        db.add(skin)

    if payload.skin_type is not None:
        skin.skin_type = payload.skin_type
    if payload.skin_tone is not None:
        skin.skin_tone = payload.skin_tone
    if payload.allergies is not None:
        skin.allergies = payload.allergies
    if payload.concerns is not None:
        skin.concerns = payload.concerns

    db.commit()
    db.refresh(user)

    return _build_profile_response(user)


@router.get("/recommendations", response_model=list[RecommendationResponse])
def get_product_recommendations(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get personalized product recommendations based on user's beauty profile.
    Uses the recommendation engine to score and filter products.
    """
    results = get_recommendations(db, user_id, limit=6)
    return [RecommendationResponse(**r) for r in results]
