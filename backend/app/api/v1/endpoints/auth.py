"""
Auth API — Register, Login, Current User.
Updated for RBAC and SkinProfile separation.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user_id
from app.models.user import User, SkinProfile, UserRole
from app.services.email_service import send_email

router = APIRouter(prefix="/auth", tags=["Authentication"])


# --- Schemas ---
class RegisterRequest(BaseModel):
    email: str
    password: str
    first_name: str
    phone: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleLoginRequest(BaseModel):
    token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    role: str
    skin_profile: dict

    class Config:
        from_attributes = True


# --- Endpoints ---
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Create a new user with a blank skin profile and send a welcome email."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        first_name=payload.first_name,
        hashed_password=hash_password(payload.password),
        phone=payload.phone,
    )
    db.add(user)
    db.flush()  # Get user.id before creating SkinProfile

    # Create empty skin profile
    skin = SkinProfile(user_id=user.id)
    db.add(skin)
    db.commit()
    db.refresh(user)

    # Send welcome email
    send_email(to=user.email, template_name="welcome", first_name=user.first_name)

    token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT token."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get the current authenticated user's profile."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    skin = user.skin_profile
    return UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        role=user.role.value,
        skin_profile={
            "type": skin.skin_type if skin else None,
            "tone": skin.skin_tone if skin else None,
            "allergies": [a.strip() for a in (skin.allergies or "").split(",") if a.strip()] if skin else [],
            "concerns": [c.strip() for c in (skin.concerns or "").split(",") if c.strip()] if skin else [],
        },
    )

@router.post("/google", response_model=TokenResponse)
def google_auth(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Verify Google token and login or create user."""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        from app.core.config import get_settings
        from app.models.user import UserRole
        settings = get_settings()

        # Pass None for aud if client ID is unset/placeholder, to allow dev bypass of direct check
        client_id = settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_ID != "your_google_client_id_here" else None

        idinfo = id_token.verify_oauth2_token(
            payload.token, 
            requests.Request(), 
            client_id
        )
        
        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Create a new user with an unusable password hash 
            import secrets
            unusable_hash = hash_password(secrets.token_urlsafe(32))
            
            user = User(
                email=email,
                first_name=first_name,
                hashed_password=unusable_hash,
                role=UserRole.customer
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Create a blank skin profile for the new user
            skin_profile = SkinProfile(user_id=user.id)
            db.add(skin_profile)
            db.commit()
        
        # Generate internal JWT token
        token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
        return TokenResponse(access_token=token)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")
