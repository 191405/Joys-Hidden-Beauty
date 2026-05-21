"""
Models package — import all models here so SQLAlchemy sees them.
"""
from app.models.user import User, SkinProfile, UserRole
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.staff import Staff
from app.models.booking import Service, Appointment, AppointmentStatus
from app.models.contact import ContactInquiry
from app.models.order import Order, OrderItem, OrderStatus
from app.models.marketing import ChurnCampaignLog

__all__ = [
    "User", "SkinProfile", "UserRole",
    "Product",
    "Inventory",
    "Staff",
    "Service", "Appointment", "AppointmentStatus",
    "Order", "OrderItem",
    "OrderStatus",
    "ChurnCampaignLog"
]
