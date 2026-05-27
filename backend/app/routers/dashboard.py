from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.database import get_db
from app.auth.security import get_current_user
from app.models.user import User, UserRole
from app.models.registration import (
    Registration,
    RegistrationSubEvent,
    RegistrationFood
)
from app.models.sub_event import SubEvent

import csv
from fastapi.responses import StreamingResponse
from io import StringIO

router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard"])


# ✅ Admin Guard
def admin_only(user: User):
    if user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")


# ✅ Scanner Guard
def scanner_only(user: User):
    if user.role not in [UserRole.admin, UserRole.scanner]:
        raise HTTPException(status_code=403, detail="Scanner access required")



@router.get("/main-event/{event_id}")
def main_event_dashboard(event_id: int, db: Session = Depends(get_db)):

    # Get all registrations for this event
    registrations = db.query(Registration).filter(
        Registration.main_event_id == event_id
    ).all()

    # Stats
    total = len(registrations)

    checked_in = len([
        r for r in registrations
        if getattr(r, "checked_in", False)
    ])

    pending = total - checked_in

    revenue = sum([
        r.total_amount
        for r in registrations
        if r.payment_status == "paid"
    ])

    # Get last 10 safely
    recent = registrations[-10:] if registrations else []

    return {
        "total_registrations": total,
        "checked_in": checked_in,
        "pending_check_in": pending,
        "food_collections": 0,
        "total_revenue": revenue,
        "recent_registrations": [
            {
                "id": r.id,
                "user": r.user_id,  # safe version
                "payment_status": r.payment_status
            }
            for r in recent
        ]
    }

@router.get("/sub-event-stats/{event_id}")
def sub_event_stats(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    admin_only(current_user)

    stats = db.query(
        SubEvent.id,
        SubEvent.title,
        func.count(RegistrationSubEvent.id).label("total_registered"),
        func.sum(
            case(
                (RegistrationSubEvent.attendance_status == True, 1),
                else_=0
            )
        ).label("checked_in")
    ).join(
        RegistrationSubEvent,
        RegistrationSubEvent.sub_event_id == SubEvent.id
    ).join(
        Registration,
        Registration.id == RegistrationSubEvent.registration_id
    ).filter(
        Registration.main_event_id == event_id
    ).group_by(
        SubEvent.id,
        SubEvent.title
    ).all()

    return [
        {
            "sub_event_id": row.id,
            "title": row.title,
            "total_registered": row.total_registered,
            "checked_in": row.checked_in or 0
        }
        for row in stats
    ]


@router.get("/export/{event_id}")
def export_event_data(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    admin_only(current_user)

    registrations = db.query(Registration).filter(
        Registration.main_event_id == event_id
    ).all()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Registration ID", "Total Amount", "Payment Status"])

    for reg in registrations:
        writer.writerow([reg.id, reg.total_amount, reg.payment_status])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=event_export.csv"}
    )


@router.get("/status/{registration_id}")
def scan_status(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scanner_only(current_user)

    sub_events = db.query(RegistrationSubEvent).filter(
        RegistrationSubEvent.registration_id == registration_id
    ).all()

    food_items = db.query(RegistrationFood).filter(
        RegistrationFood.registration_id == registration_id
    ).all()

    return {
        "attendance": [
            {
                "sub_event_id": s.sub_event_id,
                "checked_in": s.attendance_status
            }
            for s in sub_events
        ],
        "food": [
            {
                "food_plan_id": f.food_plan_id,
                "used_count": f.used_count
            }
            for f in food_items
        ]
    }