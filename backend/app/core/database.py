"""
Database configuration — SQLAlchemy with PostgreSQL.
Falls back to SQLite if DATABASE_URL contains 'sqlite' (for local dev without PG).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import get_settings

settings = get_settings()

# Render provides 'postgres://' but SQLAlchemy 2.x requires 'postgresql://'
_db_url = settings.DATABASE_URL
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql://", 1)

# Build engine args based on dialect
_connect_args = {}
_pool_kwargs = {}
if "sqlite" in _db_url:
    _connect_args = {"check_same_thread": False}
else:
    # Production PostgreSQL connection pool settings
    _pool_kwargs = {"pool_size": 5, "max_overflow": 10}

engine = create_engine(
    _db_url,
    connect_args=_connect_args,
    echo=False,
    pool_pre_ping=True,  # Reconnect on stale connections (important for PG)
    **_pool_kwargs,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables from model metadata. Handles connection errors gracefully."""
    try:
        # Test connection
        with engine.connect() as conn:
            pass
        Base.metadata.create_all(bind=engine)
        print("Database initialized successfully.")
    except Exception as e:
        print("Database initialization failed. Server will remain online for health checks. Error details:")
        print(e)
