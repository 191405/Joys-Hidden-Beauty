"""
Seed Script — Populates the database with luxury production data.
Run: python -m scripts.seed_initial_data (from /backend directory)

Seeds: Products + Inventory, Services, Staff, Admin User.
TimeSlot table removed — slots are now computed from Staff schedules.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import engine, SessionLocal, Base
from app.models.user import User, SkinProfile, UserRole
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.staff import Staff
from app.models.booking import Service
from app.core.security import hash_password


def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ===========================
        # ADMIN USER
        # ===========================
        admin_email = "joy@joyshiddenbeauty.com"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            admin = User(
                email=admin_email,
                first_name="Joy",
                hashed_password=hash_password("admin123"),
                phone="+1234567890",
                role=UserRole.admin,
            )
            db.add(admin)
            db.flush()
            db.add(SkinProfile(user_id=admin.id))
            print("  -> Admin user created: %s / admin123" % admin_email)
        else:
            print("  -> Admin user already exists: %s" % admin_email)

        # ===========================
        # 10 LUXURY PRODUCTS + INVENTORY
        # ===========================
        products_data = [
            # Skin Prep
            {"name": "Makeup brushes", "slug": "makeup-brushes", "category": "skin prep", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "tools", "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800", "texture_url": "", "stock": 100},
            {"name": "Wipes", "slug": "wipes", "category": "skin prep", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "cleansing", "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800", "texture_url": "", "stock": 100},
            {"name": "Toner", "slug": "toner", "category": "skin prep", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "skincare", "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800", "texture_url": "", "stock": 100},
            {"name": "Moisturizer", "slug": "moisturizer", "category": "skin prep", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "skincare", "image_url": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800", "texture_url": "", "stock": 100},
            {"name": "Serum", "slug": "serum", "category": "skin prep", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "skincare", "image_url": "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800", "texture_url": "", "stock": 100},
            {"name": "Primer", "slug": "primer", "category": "skin prep", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "makeup", "image_url": "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800", "texture_url": "", "stock": 100},
            {"name": "Sweat block", "slug": "sweat-block", "category": "skin prep", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "prep", "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800", "texture_url": "", "stock": 100},
            {"name": "Hydrating spray", "slug": "hydrating-spray", "category": "skin prep", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "skincare", "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800", "texture_url": "", "stock": 100},

            # Skin Work
            {"name": "Foundation", "slug": "foundation", "category": "skin work", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "base", "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800", "texture_url": "", "stock": 100},
            {"name": "Concealer", "slug": "concealer", "category": "skin work", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "base", "image_url": "https://images.unsplash.com/photo-1599733589046-10c7e543fa87?w=800", "texture_url": "", "stock": 100},
            {"name": "Cream blush", "slug": "cream-blush", "category": "skin work", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "cheeks", "image_url": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800", "texture_url": "", "stock": 100},
            {"name": "Contour stick", "slug": "contour-stick", "category": "skin work", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "sculpting", "image_url": "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800", "texture_url": "", "stock": 100},
            {"name": "Beauty blender", "slug": "beauty-blender", "category": "skin work", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "tools", "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800", "texture_url": "", "stock": 100},
            {"name": "Powder pallete", "slug": "powder-pallete", "category": "skin work", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "powder", "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800", "texture_url": "", "stock": 100},
            {"name": "Powder puff", "slug": "powder-puff", "category": "skin work", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "tools", "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800", "texture_url": "", "stock": 100},
            {"name": "Compact powder", "slug": "compact-powder", "category": "skin work", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "powder", "image_url": "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800", "texture_url": "", "stock": 100},
            {"name": "Setting powder", "slug": "setting-powder", "category": "skin work", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "powder", "image_url": "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800", "texture_url": "", "stock": 100},
            {"name": "Powder blush", "slug": "powder-blush", "category": "skin work", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "cheeks", "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800", "texture_url": "", "stock": 100},

            # Brows
            {"name": "Brow tamer", "slug": "brow-tamer", "category": "brows", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "brows", "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800", "texture_url": "", "stock": 100},
            {"name": "Pencils", "slug": "pencils", "category": "brows", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "brows", "image_url": "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800", "texture_url": "", "stock": 100},
            {"name": "Brow gel", "slug": "brow-gel", "category": "brows", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "brows", "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800", "texture_url": "", "stock": 100},

            # Eyes
            {"name": "Eyeshadow primer", "slug": "eyeshadow-primer", "category": "eyes", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "eyes", "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800", "texture_url": "", "stock": 100},
            {"name": "Eyeshadow pallete", "slug": "eyeshadow-pallete", "category": "eyes", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "eyes", "image_url": "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800", "texture_url": "", "stock": 100},
            {"name": "Pigments", "slug": "pigments", "category": "eyes", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "eyes", "image_url": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800", "texture_url": "", "stock": 100},
            {"name": "Pigment gel", "slug": "pigment-gel", "category": "eyes", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "eyes", "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800", "texture_url": "", "stock": 100},
            {"name": "Lash glue", "slug": "lash-glue", "category": "eyes", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "eyes", "image_url": "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800", "texture_url": "", "stock": 100},
            {"name": "Lashes", "slug": "lashes", "category": "eyes", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "eyes", "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800", "texture_url": "", "stock": 100},
            {"name": "Eye liner", "slug": "eye-liner", "category": "eyes", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "eyes", "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800", "texture_url": "", "stock": 100},
            {"name": "Mascara", "slug": "mascara", "category": "eyes", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "eyes", "image_url": "https://images.unsplash.com/photo-1599733589046-10c7e543fa87?w=800", "texture_url": "", "stock": 100},

            # Lips
            {"name": "Lip stains", "slug": "lip-stains", "category": "lips", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "lips", "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800", "texture_url": "", "stock": 100},
            {"name": "Lipstick pallete", "slug": "lipstick-pallete", "category": "lips", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "lips", "image_url": "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800", "texture_url": "", "stock": 100},
            {"name": "Lipgloss", "slug": "lipgloss", "category": "lips", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "lips", "image_url": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800", "texture_url": "", "stock": 100},

            # Final Touches
            {"name": "Setting spray", "slug": "setting-spray", "category": "final touches", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "finish", "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800", "texture_url": "", "stock": 100},
            {"name": "Fixing spray", "slug": "fixing-spray", "category": "final touches", "price": 0.00, "description": "Coming soon.", "ingredients": "", "tags": "finish", "image_url": "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800", "texture_url": "", "stock": 100},
        ]

        for pd in products_data:
            stock = pd.pop("stock")
            existing = db.query(Product).filter(Product.slug == pd["slug"]).first()
            if not existing:
                product = Product(**pd)
                db.add(product)
                db.flush()
                db.add(Inventory(product_id=product.id, stock_count=stock, low_stock_threshold=5))

        # ===========================
        # 5 BEAUTY SERVICES
        # ===========================
        services = [
            # Bridal
            Service(name="Engagement/Introduction glams", description="Makeup and gele inclusive.", duration_minutes=90, buffer_minutes=15, price=50000.00, category="bridal", image_url="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800"),
            Service(name="Traditional wedding", description="Flawless glam tailored for traditional wedding ceremonies.", duration_minutes=90, buffer_minutes=30, price=50000.00, category="bridal", image_url="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800"),
            Service(name="White/Church wedding", description="The ultimate bridal prep for a standard church wedding.", duration_minutes=120, buffer_minutes=30, price=70000.00, category="bridal", image_url="https://images.unsplash.com/photo-1552693673-1bf958298935?w=800"),
            Service(name="Court/Registry wedding", description="Elegant and enduring makeup for registry styling.", duration_minutes=60, buffer_minutes=30, price=40000.00, category="bridal", image_url="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800"),

            # Studio
            Service(name="Casual makeup", description="In-studio everyday soft glam.", duration_minutes=45, buffer_minutes=15, price=17000.00, category="studio", image_url="https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800"),
            Service(name="Owanbe glam", description="In-studio full glam for Owambe parties.", duration_minutes=60, buffer_minutes=15, price=20000.00, category="studio", image_url="https://images.unsplash.com/photo-1599733589046-10c7e543fa87?w=800"),
            Service(name="Owanbe glam with gele", description="In-studio Owambe glam including professional gele styling.", duration_minutes=75, buffer_minutes=20, price=23000.00, category="studio", image_url="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800"),
            Service(name="Birthday glam", description="In-studio standout glam for your special day.", duration_minutes=60, buffer_minutes=15, price=25000.00, category="studio", image_url="https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800"),

            # Home
            Service(name="Casual makeup", description="Home service soft everyday glam within Ibadan.", duration_minutes=90, buffer_minutes=30, price=25000.00, category="home", image_url="https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800"),
            Service(name="Owanbe glam", description="Home service Owambe full glam within Ibadan.", duration_minutes=120, buffer_minutes=30, price=30000.00, category="home", image_url="https://images.unsplash.com/photo-1599733589046-10c7e543fa87?w=800"),
            Service(name="Owanbe glam with gele", description="Home service Owambe glam with professional gele within Ibadan.", duration_minutes=150, buffer_minutes=30, price=33000.00, category="home", image_url="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800"),
            Service(name="Naming glam", description="Home service makeup for naming ceremonies within Ibadan.", duration_minutes=120, buffer_minutes=30, price=30000.00, category="home", image_url="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800"),
            Service(name="Naming glam with gele", description="Home service naming ceremony makeup and gele within Ibadan.", duration_minutes=150, buffer_minutes=30, price=40000.00, category="home", image_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800"),
            Service(name="Birthday glam", description="Home service birthday glow within Ibadan.", duration_minutes=120, buffer_minutes=30, price=30000.00, category="home", image_url="https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800"),
        ]

        for s in services:
            existing = db.query(Service).filter(Service.name == s.name).first()
            if not existing:
                db.add(s)

        # ===========================
        # 3 STAFF MEMBERS
        # ===========================
        import json
        staff_data = [
            {
                "name": "Joy",
                "email": "joy.staff@joyshiddenbeauty.com",
                "bio": "Founder & Lead Aesthetician. 15 years of luxury skincare expertise.",
                "working_hours": {
                    "monday": {"start": "09:00", "end": "18:00"},
                    "tuesday": {"start": "09:00", "end": "18:00"},
                    "wednesday": {"start": "09:00", "end": "18:00"},
                    "thursday": {"start": "09:00", "end": "18:00"},
                    "friday": {"start": "09:00", "end": "18:00"},
                    "saturday": {"start": "10:00", "end": "16:00"},
                    "sunday": None,
                },
            },
            {
                "name": "Amara",
                "email": "amara@joyshiddenbeauty.com",
                "bio": "Senior Makeup Artist. Specializes in bridal and editorial looks.",
                "working_hours": {
                    "monday": {"start": "10:00", "end": "19:00"},
                    "tuesday": {"start": "10:00", "end": "19:00"},
                    "wednesday": None,
                    "thursday": {"start": "10:00", "end": "19:00"},
                    "friday": {"start": "10:00", "end": "19:00"},
                    "saturday": {"start": "09:00", "end": "17:00"},
                    "sunday": None,
                },
            },
            {
                "name": "Sofia",
                "email": "sofia@joyshiddenbeauty.com",
                "bio": "Body Treatment Specialist. Expert in therapeutic massage and gold body rituals.",
                "working_hours": {
                    "monday": {"start": "09:00", "end": "17:00"},
                    "tuesday": {"start": "09:00", "end": "17:00"},
                    "wednesday": {"start": "09:00", "end": "17:00"},
                    "thursday": None,
                    "friday": {"start": "09:00", "end": "17:00"},
                    "saturday": {"start": "10:00", "end": "15:00"},
                    "sunday": None,
                },
            },
        ]

        for sd in staff_data:
            existing = db.query(Staff).filter(Staff.email == sd["email"]).first()
            if not existing:
                db.add(Staff(
                    name=sd["name"],
                    email=sd["email"],
                    bio=sd["bio"],
                    working_hours_json=json.dumps(sd["working_hours"]),
                ))

        db.commit()
        print("Seed complete!")
        print("  -> %d luxury products + inventory" % len(products_data))
        print("  -> %d beauty services" % len(services))
        print("  -> %d staff members" % len(staff_data))
        print("  -> Slots are now computed dynamically from staff schedules")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
