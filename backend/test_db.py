from app.database import SessionLocal
from app.models.user import User
from app.auth.security import hash_password

db = SessionLocal()

user = db.query(User).filter(User.email == "sree@gmail.com").first()

user.password_hash = hash_password("sree")

db.commit()
db.close()

print("Password reset to sree")