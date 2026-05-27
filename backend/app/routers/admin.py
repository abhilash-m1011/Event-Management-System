from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.registration import Registration
from app.models.event import MainEvent
from typing import List

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/registrations/{event_id}")
def get_registrations(event_id: int, db: Session = Depends(get_db)):

    event = db.query(MainEvent).filter(MainEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    registrations = (
        db.query(Registration)
        .filter(Registration.main_event_id == event_id)
        .all()
    )

    return registrations

@router.delete("/registrations/{registration_id}")
def delete_registration(registration_id: int, db: Session = Depends(get_db)):

    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()

    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    db.delete(registration)
    db.commit()

    return {"message": "Registration deleted successfully"}

@router.patch("/registrations/{registration_id}/payment")
def update_payment_status(
    registration_id: int,
    status: str,
    db: Session = Depends(get_db)
):

    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()

    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    registration.payment_status = status
    db.commit()

    return {"message": "Payment status updated"}