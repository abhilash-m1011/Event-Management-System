from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.registration import Registration
from app.services.qr_service import generate_event_qr, generate_food_qr

router = APIRouter(prefix="/qr", tags=["QR"])


@router.post("/generate/{registration_id}")
def generate_qr_tokens(
    registration_id: int,
    db: Session = Depends(get_db)
):
    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()

    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    # ✅ This check now works correctly because payment_router.py sets
    #    registration.payment_status = "success" before this endpoint is called
    if registration.payment_status != "success":
        raise HTTPException(
            status_code=400,
            detail=f"Payment not completed. Current status: {registration.payment_status}"
        )

    if not registration.main_event_qr_token:
        registration.main_event_qr_token = generate_event_qr(registration)

    if not registration.food_qr_token:
        registration.food_qr_token = generate_food_qr(registration)

    db.commit()

    return {
        "event_qr": registration.main_event_qr_token,
        "food_qr": registration.food_qr_token
    }