import sys
import os

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.utils.security import get_password_hash

def seed_admin(email, password):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"User {email} already exists. Updating to admin...")
            user.is_admin = True
            user.hashed_password = get_password_hash(password)
        else:
            print(f"Creating admin user {email}...")
            user = User(
                email=email,
                hashed_password=get_password_hash(password),
                is_admin=True
            )
            db.add(user)
        db.commit()
        print("Admin user seeded successfully!")
    except Exception as e:
        print(f"Error seeding admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python seed_admin.py <email> <password>")
        sys.exit(1)
    seed_admin(sys.argv[1], sys.argv[2])
