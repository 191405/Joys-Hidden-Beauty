"""
Beauty Profile Recommendation Engine.
Updated for separated SkinProfile and Inventory tables.
"""
from sqlalchemy.orm import Session, joinedload
from app.models.product import Product
from app.models.user import User


def get_recommendations(db: Session, user_id: int, limit: int = 6) -> list[dict]:
    """
    Recommend products based on user's skin profile.

    Algorithm:
    1. Exclude products containing any user allergy ingredients.
    2. Score products by how many tags match user's concerns.
    3. Boost products matching skin type.
    4. Return top N results sorted by relevance score.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    # Parse user profile from separated SkinProfile table
    skin = user.skin_profile
    user_allergies = set()
    user_concerns = set()
    user_skin_type = ""

    if skin:
        user_allergies = {a.strip().lower() for a in (skin.allergies or "").split(",") if a.strip()}
        user_concerns = {c.strip().lower() for c in (skin.concerns or "").split(",") if c.strip()}
        user_skin_type = (skin.skin_type or "").lower().strip()

    # Only active products with stock > 0
    all_products = (
        db.query(Product)
        .options(joinedload(Product.inventory))
        .filter(Product.is_active == True)
        .all()
    )

    scored = []

    for product in all_products:
        # Skip out-of-stock products
        stock = product.inventory.stock_count if product.inventory else 0
        if stock <= 0:
            continue

        product_ingredients = {i.strip().lower() for i in (product.ingredients or "").split(",") if i.strip()}
        product_tags = {t.strip().lower() for t in (product.tags or "").split(",") if t.strip()}

        # Step 1: Exclude allergens
        if user_allergies & product_ingredients:
            continue

        # Step 2: Score by concern match
        score = len(user_concerns & product_tags) * 10

        # Step 3: Boost if product tags mention user's skin type
        if user_skin_type and user_skin_type in product_tags:
            score += 5

        # Step 4: Small boost for "all" skin type products
        if "all-skin" in product_tags or "universal" in product_tags:
            score += 2

        scored.append((score, product))

    # Sort by score descending, then by name for consistency
    scored.sort(key=lambda x: (-x[0], x[1].name))

    return [
        {
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "category": p.category,
            "price": p.price,
            "description": p.description,
            "image_url": p.image_url,
            "match_score": s,
        }
        for s, p in scored[:limit]
    ]
