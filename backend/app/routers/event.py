from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import shutil
import os
from typing import List

from app.database import get_db
from app.models.event import MainEvent
from app.models.sub_event import SubEvent
from app.models.registration import Registration
from app.models.food_plan import FoodPlan
from app.models.user import User, UserRole

from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.auth.security import require_role, hash_password

router = APIRouter(prefix="/events", tags=["Main Events"])


# ======================================================
# ✅ CREATE EVENT (Admin Only + Auto Create Event Login)
# ======================================================
@router.post("/", response_model=EventResponse)
def create_event(
    event: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    existing_event = db.query(MainEvent).filter(
        MainEvent.title == event.title,
        MainEvent.event_date == event.event_date
    ).first()

    if existing_event:
        raise HTTPException(
            status_code=400,
            detail="Event with same title and date already exists"
        )

    # 🔹 1️⃣ Create Main Event
    new_event = MainEvent(
        title=event.title,
        description=event.description,
        location=event.location,
        event_date=event.event_date,
        created_by=current_user.id,
        is_active=True,
        is_ended=False
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    # 🔹 2️⃣ Auto Create Event Staff Login

    event_name_clean = event.title.replace(" ", "").lower()
    email = f"{event_name_clean}@gmail.com"
    password = event_name_clean

    existing_user = db.query(User).filter(User.email == email).first()

    if not existing_user:
        event_staff = User(
            name=event.title,  # REQUIRED FIELD
            email=email,
            password_hash=hash_password(password),
            role=UserRole.event_staff,
            event_id=new_event.id
        )

        db.add(event_staff)
        db.commit()

    return new_event

@router.get("/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):

    event = db.query(MainEvent).filter(MainEvent.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return event

# =========================================
# ✅ GET ALL ACTIVE EVENTS (Public)
# =========================================
@router.get("/", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    return db.query(MainEvent).filter(
        MainEvent.is_active == True
    ).all()


# =========================================
# ✅ ADMIN - GET ALL EVENTS
# =========================================
@router.get("/admin/all", response_model=List[EventResponse])
def get_all_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    return db.query(MainEvent).all()


# =========================================
# ✅ UPDATE EVENT (Admin Only)
# =========================================
@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    db_event = db.query(MainEvent).filter(MainEvent.id == event_id).first()

    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = event.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_event, key, value)

    db.commit()
    db.refresh(db_event)

    return db_event


# =========================================
# ✅ SOFT DELETE EVENT (Admin Only)
# =========================================
@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    db_event = db.query(MainEvent).filter(MainEvent.id == event_id).first()

    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    db_event.is_active = False
    db_event.is_ended = True

    db.commit()

    return {"message": "Event archived successfully"}


# =========================================
# ✅ END EVENT (Admin Only)
# =========================================
@router.put("/{event_id}/end")
def end_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    event = db.query(MainEvent).filter(MainEvent.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event.is_ended = True
    event.is_active = False

    db.commit()

    return {"message": "Event marked as ended"}


# =========================================
# ✅ DELETE SUB EVENT (Admin Only)
# =========================================
@router.delete("/sub-events/{sub_event_id}")
def delete_sub_event(
    sub_event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    sub = db.query(SubEvent).filter(SubEvent.id == sub_event_id).first()

    if not sub:
        raise HTTPException(status_code=404, detail="Sub event not found")

    db.delete(sub)
    db.commit()

    return {"message": "Sub event deleted"}


# =========================================
# ✅ UPLOAD EVENT BANNER (Admin Only)
# =========================================
@router.post("/{event_id}/upload-banner")
def upload_banner(
    event_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    event = db.query(MainEvent).filter(MainEvent.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    upload_dir = "static/banners"
    os.makedirs(upload_dir, exist_ok=True)

    file_location = f"{upload_dir}/{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    event.banner_url = file_location
    db.commit()

    return {"banner_url": file_location}