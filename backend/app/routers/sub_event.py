from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.sub_event import SubEvent
from app.models.event import MainEvent
from app.schemas.sub_event import SubEventCreate, SubEventUpdate, SubEventResponse
from app.auth.security import require_role
from app.models.user import User

router = APIRouter(prefix="/sub-events", tags=["Sub Events"])


# ✅ CREATE SUB-EVENT
@router.post("/{main_event_id}", response_model=SubEventResponse)
def create_sub_event(
    main_event_id: int,
    sub_event: SubEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    main_event = db.query(MainEvent).filter(MainEvent.id == main_event_id).first()

    if not main_event:
        raise HTTPException(status_code=404, detail="Main Event not found")

    new_sub_event = SubEvent(
        main_event_id=main_event_id,
        title=sub_event.title,
        description=sub_event.description,
        capacity=sub_event.capacity,
        price=sub_event.price,
        start_time=sub_event.start_time,
        end_time=sub_event.end_time
    )

    db.add(new_sub_event)
    db.commit()
    db.refresh(new_sub_event)

    return new_sub_event


# ✅ GET SUB-EVENTS
@router.get("/{main_event_id}", response_model=List[SubEventResponse])
def get_sub_events(main_event_id: int, db: Session = Depends(get_db)):
    return db.query(SubEvent).filter(SubEvent.main_event_id == main_event_id).all()


# ✅ UPDATE SUB-EVENT (Partial Safe)
@router.put("/{sub_event_id}", response_model=SubEventResponse)
def update_sub_event(
    sub_event_id: int,
    sub_event: SubEventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    db_sub_event = db.query(SubEvent).filter(SubEvent.id == sub_event_id).first()

    if not db_sub_event:
        raise HTTPException(status_code=404, detail="Sub Event not found")

    update_data = sub_event.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_sub_event, key, value)

    db.commit()
    db.refresh(db_sub_event)

    return db_sub_event


# ✅ DELETE SUB-EVENT
@router.delete("/{sub_event_id}")
def delete_sub_event(
    sub_event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    db_sub_event = db.query(SubEvent).filter(SubEvent.id == sub_event_id).first()

    if not db_sub_event:
        raise HTTPException(status_code=404, detail="Sub Event not found")

    db.delete(db_sub_event)
    db.commit()

    return {"message": "Sub Event deleted successfully"}