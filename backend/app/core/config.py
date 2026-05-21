"""
Application configuration via Pydantic Settings.
Reads from environment variables and .env file.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """All application settings — reads from .env or environment variables."""

    # --- Database ---
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/joyshiddenbeauty"

    # --- Security ---
    SECRET_KEY: str = "joyshiddenbeauty-dev-secret-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    GOOGLE_CLIENT_ID: str = ""

    # --- OPay ---
    OPAY_PUBLIC_KEY: str = ""
    OPAY_SECRET_KEY: str = ""
    OPAY_MERCHANT_ID: str = ""
    OPAY_BASE_URL: str = "https://sandboxapi.opaycheckout.com"  # Production: https://api.opaycheckout.com

    # --- Email (Gmail SMTP) ---
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_EMAIL: str = "joyshiddenbeauty1@gmail.com"
    SMTP_PASSWORD: str = ""  # Gmail App Password (16 chars)
    FROM_EMAIL: str = "joyshiddenbeauty1@gmail.com"

    # --- Sentry ---
    SENTRY_DSN: str = ""

    # --- App ---
    APP_ENV: str = "development"  # development | staging | production
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton — call this everywhere instead of constructing Settings()."""
    return Settings()
