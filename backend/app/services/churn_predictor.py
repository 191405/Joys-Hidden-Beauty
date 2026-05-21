import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.order import Order
from app.models.booking import Appointment
from app.models.marketing import ChurnCampaignLog
from app.services.email_service import email_service

logger = logging.getLogger(__name__)

# Heuristic config
INACTIVE_DAYS_THRESHOLD = 60

def run_churn_prediction_job():
    """
    Executes the analytical heuristic to find churning VIPs.
    Fires the retention email and logs the action memory.
    """
    logger.info("Initializing Daily VIP Churn Prediction Algorithm...")
    db = SessionLocal()
    try:
        now_utc = datetime.now(timezone.utc)
        cutoff_date = now_utc - timedelta(days=INACTIVE_DAYS_THRESHOLD)
        
        # 1. Identify "VIP" Users (must have made an order OR a booking)
        # Using a simple inner join approach or tracking lists
        vip_users = db.query(User).filter(User.role == UserRole.customer).all()
        
        churn_count = 0
        for user in vip_users:
            # Gather maximum dates
            last_order = db.query(func.max(Order.created_at)).filter(Order.user_id == user.id).scalar()
            last_apt = db.query(func.max(Appointment.created_at)).filter(Appointment.user_id == user.id).scalar()
            
            # If no orders and no appointments exist, they are not a VIP yet.
            if not last_order and not last_apt:
                continue

            dates = [d for d in [last_order, last_apt, user.created_at] if d is not None]
            
            # Ensure dates are timezone-aware to match now_utc
            safe_dates = []
            for d in dates:
                if d.tzinfo is None:
                    safe_dates.append(d.replace(tzinfo=timezone.utc))
                else:
                    safe_dates.append(d)

            last_active = max(safe_dates)
            
            # Check the mathematical delta
            if last_active <= cutoff_date:
                # User is technically churned. Check memory log to avoid spam.
                has_been_emailed = db.query(ChurnCampaignLog).filter(ChurnCampaignLog.user_id == user.id).first()
                if not has_been_emailed:
                    logger.info(f"Targeting churning VIP: {user.email} (Last active: {last_active})")
                    try:
                        email_service.send_vip_retention_email(to_email=user.email, first_name=user.first_name)
                        log_entry = ChurnCampaignLog(user_id=user.id)
                        db.add(log_entry)
                        db.commit()
                        churn_count += 1
                    except Exception as e:
                        logger.error(f"Failed handling churn email for {user.email}: {str(e)}")
                        db.rollback()

        logger.info(f"VIP Churn Job Complete. Targeted {churn_count} resting VIPs.")
    finally:
        db.close()
