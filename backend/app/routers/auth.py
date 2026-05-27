from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserResponse
from app.auth.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


# =========================================
# REGISTER (Participant Only)
# =========================================
@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        role=UserRole.participant,
        event_id=None
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =========================================
# LOGIN (Admin / Event Staff / Participant)
# =========================================
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(form_data.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # =========================================
    # Event Staff Security Rule
    # =========================================
    if db_user.role == UserRole.event_staff:

        expected_email = f"{db_user.name.lower().replace(' ', '')}@gmail.com"

        if db_user.email.lower() != expected_email:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid event staff email format"
            )

    # =========================================
    # Create JWT Token
    # =========================================
    access_token = create_access_token(
        data={
            "user_id": db_user.id,
            "role": db_user.role.value,
            "event_id": db_user.event_id
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role.value,
        "event_id": db_user.event_id
    }