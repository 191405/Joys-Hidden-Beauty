"""
Product model — luxury beauty products.
"""
from sqlalchemy import Column, Integer, String, Text, Float, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False)       # skincare, makeup, fragrance, tools
    price = Column(Float, nullable=False)
    description = Column(Text, default="")
    ingredients = Column(Text, default="")               # Comma-separated
    tags = Column(Text, default="")                      # e.g. "hydration,anti-aging,sensitive"
    image_url = Column(String(500), default="")
    texture_url = Column(String(500), default="")        # For SmartMirror hover effect
    is_active = Column(Boolean, default=True)            # Soft-delete flag

    # Relationships
    inventory = relationship("Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan")
