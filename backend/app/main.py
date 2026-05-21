"""
JOYSHIDDENBEAUTY — FastAPI Entry Point.
Luxury beauty e-commerce & service platform API.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import init_db
from app.api.v1.endpoints import auth, catalog, booking, profile, payment, admin, waitlist, contact
from app.services.scheduler import start_scheduler, shutdown_scheduler

# Ensure all models are imported so SQLAlchemy sees them
import app.models  # noqa: F401

settings = get_settings()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("joyshiddenbeauty")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    init_db()
    start_scheduler()
    logger.info("✨ JOYSHIDDENBEAUTY API is live. Tables initialized. Scheduler running.")
    yield
    shutdown_scheduler()
    logger.info("👋 JOYSHIDDENBEAUTY API shutting down.")


app = FastAPI(
    title="JOYSHIDDENBEAUTY API",
    description="Luxury beauty e-commerce & service platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",        # Next.js dev
        "http://localhost:3001",        # Next.js production preview
        "http://127.0.0.1:3000",
        "https://joyshiddenbeauty.com",  # Production
        "https://platkelvconcept.net",   # IONOS domain
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
API_V1 = "/api/v1"
app.include_router(auth.router, prefix=API_V1)
app.include_router(catalog.router, prefix=API_V1)
app.include_router(booking.router, prefix=API_V1)
app.include_router(profile.router, prefix=API_V1)
app.include_router(payment.router, prefix=API_V1)
app.include_router(admin.router, prefix=API_V1)
app.include_router(waitlist.router, prefix=f"{API_V1}/waitlist", tags=["Waitlist"])
app.include_router(contact.router, prefix=API_V1)


@app.get("/", tags=["Health"])
def health():
    return {
        "status": "alive",
        "brand": "JOYSHIDDENBEAUTY",
        "version": "2.0.0",
        "message": "The API is ready to serve luxury.",
    }


@app.get("/api/v1", tags=["Health"])
def api_root():
    return {
        "version": "2.0.0",
        "endpoints": {
            "auth": "/api/v1/auth",
            "catalog": "/api/v1/catalog",
            "booking": "/api/v1/booking",
            "payment": "/api/v1/payment",
            "profile": "/api/v1/user",
            "admin": "/api/v1/admin",
        },
    }
