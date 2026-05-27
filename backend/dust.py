from app.database import SessionLocal
from app.models.user import User, UserRole
from app.auth.security import hash_password

db = SessionLocal()

admin = User(
    name="admin",
    email="admin1@gmail.com",
    password_hash=hash_password("admin123"),
    role=UserRole.admin
)

db.add(admin)
db.commit()

print("Admin created successfully")