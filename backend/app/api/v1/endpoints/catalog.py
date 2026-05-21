"""
Catalog API — Products and Collections.
Updated: stock now comes from Inventory table, only active products shown.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.product import Product

router = APIRouter(prefix="/catalog", tags=["Catalog"])


# --- Schemas ---
class ProductResponse(BaseModel):
    id: int
    name: str
    slug: str
    category: str
    price: float
    description: str
    ingredients: list[str]
    tags: list[str]
    image_url: str
    texture_url: str
    stock: int

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    products: list[ProductResponse]
    total: int


def _product_to_response(p: Product) -> ProductResponse:
    """Build a ProductResponse from a Product ORM object."""
    stock = p.inventory.stock_count if p.inventory else 0
    return ProductResponse(
        id=p.id,
        name=p.name,
        slug=p.slug,
        category=p.category,
        price=p.price,
        description=p.description,
        ingredients=[i.strip() for i in (p.ingredients or "").split(",") if i.strip()],
        tags=[t.strip() for t in (p.tags or "").split(",") if t.strip()],
        image_url=p.image_url,
        texture_url=p.texture_url,
        stock=stock,
    )


# --- Endpoints ---
@router.get("/products", response_model=ProductListResponse)
def list_products(
    category: Optional[str] = Query(None, description="Filter by category (skincare, makeup, fragrance, tools)"),
    concern: Optional[str] = Query(None, description="Filter by concern tag (hydration, anti-aging, brightening)"),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    db: Session = Depends(get_db),
):
    """
    List active products with optional filtering.
    Stock is loaded from the Inventory table.
    """
    query = db.query(Product).options(joinedload(Product.inventory)).filter(Product.is_active == True)

    if category:
        query = query.filter(Product.category == category.lower())

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    products = query.all()

    # Filter by concern tag (needs string matching since tags are comma-separated)
    if concern:
        concern_lower = concern.lower()
        products = [
            p for p in products
            if concern_lower in (p.tags or "").lower()
        ]

    results = [_product_to_response(p) for p in products]
    return ProductListResponse(products=results, total=len(results))


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get detailed product info by ID."""
    product = (
        db.query(Product)
        .options(joinedload(Product.inventory))
        .filter(Product.id == product_id, Product.is_active == True)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return _product_to_response(product)
