from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User, UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# =========================================
# 🔐 PASSWORD UTILITIES
# =========================================
def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


# =========================================
# 🔐 CREATE ACCESS TOKEN
# =========================================
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(hours=10)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_jwt


# =========================================
# 🔐 GET CURRENT USER FROM TOKEN
# =========================================
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        user_id: int = payload.get("user_id")
        token_role: str = payload.get("role")
        token_event_id: int = payload.get("event_id")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise credentials_exception

    # 🔒 Validate role consistency
    if token_role and user.role.value != token_role:
        raise HTTPException(
            status_code=403,
            detail="Role mismatch detected"
        )

    # 🔒 Extra validation for event_staff
    if user.role == UserRole.event_staff:
        if user.event_id is None:
            raise HTTPException(
                status_code=403,
                detail="Event staff not assigned to any event"
            )

        # Ensure token event_id matches DB event_id
        if token_event_id != user.event_id:
            raise HTTPException(
                status_code=403,
                detail="Invalid event access"
            )

    return user


# =========================================
# 🔐 REQUIRE SPECIFIC ROLE
# =========================================
def require_role(required_role: str):

    def role_checker(current_user: User = Depends(get_current_user)):

        if current_user.role.value != required_role:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions"
            )

        return current_user

    return role_checker


# =========================================
# 🔐 REQUIRE ADMIN OR EVENT STAFF
# =========================================
def require_admin_or_event_staff():

    def role_checker(current_user: User = Depends(get_current_user)):

        if current_user.role.value not in ["admin", "event_staff"]:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

        return current_user

    return role_checker