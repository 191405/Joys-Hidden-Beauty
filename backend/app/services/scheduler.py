"""
Scheduler — APScheduler jobs for periodic tasks.
- Release expired booking holds every 2 minutes
- Send 24-hour reminders (Phase 4)
"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler

from app.core.database import SessionLocal

logger = logging.getLogger("joyshiddenbeauty.scheduler")

scheduler = BackgroundScheduler()


def release_expired_holds_job():
    """Release all expired slot holds."""
    from app.services.booking_service import release_expired_holds
    db = SessionLocal()
    try:
        count = release_expired_holds(db)
        if count > 0:
            logger.info(f"🔓 Released {count} expired hold(s)")
    except Exception as e:
        logger.error(f"Error releasing expired holds: {e}")
    finally:
        db.close()


def run_churn_job():
    """Daily check for churning VIP customers."""
    from app.services.churn_predictor import run_churn_prediction_job
    try:
        run_churn_prediction_job()
    except Exception as e:
        logger.error(f"Error executing churn prediction job: {e}")


def start_scheduler():
    """Start the background scheduler with all jobs."""
    scheduler.add_job(
        release_expired_holds_job,
        "interval",
        minutes=2,
        id="release_expired_holds",
        replace_existing=True,
    )
    scheduler.add_job(
        run_churn_job,
        "cron",
        hour=3,  # Run deeply at 3 AM
        minute=0,
        id="daily_churn_analysis",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("⏰ Scheduler started — holds: 2m | churn analysis: 3:00am")


def shutdown_scheduler():
    """Gracefully shut down the scheduler."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("⏰ Scheduler stopped")
