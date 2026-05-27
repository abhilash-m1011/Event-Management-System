from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import io

from app.database import get_db
from app.models.registration import Registration
from app.models.event import MainEvent
from app.models.user import User
from app.config import settings
from app.services.pdf_service import generate_ticket_pdf

router = APIRouter(prefix="/ticket", tags=["Ticket"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_user_id_from_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


@router.get("/download/{registration_id}")
def download_ticket(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_user_id_from_token)
):
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    if registration.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if registration.payment_status != "success":
        raise HTTPException(status_code=400, detail="Payment not completed")

    # FIX 1: fetch user and main_event — pdf_service requires all 3 args
    user = db.query(User).filter(User.id == registration.user_id).first()
    main_event = db.query(MainEvent).filter(MainEvent.id == registration.main_event_id).first()

    if not user or not main_event:
        raise HTTPException(status_code=404, detail="User or event data not found")

    # FIX 2: generate_ticket_pdf returns a BytesIO buffer — do NOT wrap in io.BytesIO again
    pdf_buffer = generate_ticket_pdf(user, main_event, registration)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ticket_{registration_id}.pdf"}
    )