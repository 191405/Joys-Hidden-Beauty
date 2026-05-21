from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class ChurnCampaignLog(Base):
    __tablename__ = "churn_campaign_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    emailed_at = Column(DateTime(timezone=True), server_default=func.now())
    recovered = Column(Boolean, default=False)
