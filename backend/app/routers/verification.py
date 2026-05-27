import logging
from datetime import datetime
from typing import Optional
from fastapi import Query
import csv
from fastapi.responses import StreamingResponse
import io
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.config import settings
from app.auth.security import get_current_user
from app.models.user import User, UserRole
from app.models.registration import RegistrationSubEvent, RegistrationFood, Registration
from app.models.food_plan import FoodPlan
from app.models.sub_event import SubEvent
from app.models.scan_log import ScanLog
from app.websocket.manager import manager
from sqlalchemy.orm import joinedload
from sqlalchemy import select

limiter = Limiter(key_func=get_remote_address)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/verify",
    tags=["QR Verification"]
)

# =====================================================
# 🔐 UPDATED SCANNER ROLE CHECK
# =====================================================
def scanner_only(user: User):
    if user.role not in [UserRole.admin, UserRole.scanner, UserRole.event_staff]:
        raise HTTPException(status_code=403, detail="Scanner access required")


# =====================================================
# MAIN VERIFY ENDPOINT
# =====================================================

@router.post("/")
@limiter.limit("360/minute")
def verify_qr(
    request: Request,
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    scanner_only(current_user)

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        db.add(ScanLog(
            registration_id=None,
            scan_type="unknown",
            status="invalid",
            scanned_by=current_user.id
        ))
        db.commit()

        raise HTTPException(status_code=400, detail="Invalid or expired token")

    registration = db.query(Registration).filter(
        Registration.id == payload.get("registration_id")
    ).first()

    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    # =====================================================
    # 🔒 EVENT STAFF ISOLATION (NEW)
    # =====================================================
    if current_user.role == UserRole.event_staff:
        if registration.main_event_id != current_user.event_id:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to scan this event"
            )

    # ==============================
    # 🎟 EVENT QR
    # ==============================
    if payload["type"] == "event":

        if registration.main_event_qr_token != token:
            raise HTTPException(status_code=400, detail="Invalid Event QR")

        db.add(ScanLog(
            registration_id=registration.id,
            scan_type="event",
            status="success",
            scanned_by=current_user.id
        ))
        db.commit()

        return {
            "status": "success",
            "message": "Event Entry Allowed",
            "scanned_token": token,
            "participant": registration.user.name
        }

    # ==============================
    # 🍽 FOOD QR
    # ==============================
    if payload["type"] == "food":

        if registration.food_qr_token != token:
            raise HTTPException(status_code=400, detail="Invalid Food QR")

        registration_foods = (
            db.query(RegistrationFood)
            .filter(RegistrationFood.registration_id == registration.id)
            .with_for_update()
            .all()
        )

        if not registration_foods:
            raise HTTPException(status_code=400, detail="No food plan assigned")

        for reg_food in registration_foods:
            if reg_food.used_count < reg_food.food_plan.max_usage:

                reg_food.used_count += 1

                db.add(ScanLog(
                    registration_id=registration.id,
                    scan_type="food",
                    status="success",
                    scanned_by=current_user.id
                ))

                db.commit()

                remaining = reg_food.food_plan.max_usage - reg_food.used_count

                return {
                    "status": "success",
                    "message": "Food Access Granted",
                    "remaining_uses": remaining
                }

        db.add(ScanLog(
            registration_id=registration.id,
            scan_type="food",
            status="limit_reached",
            scanned_by=current_user.id
        ))
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Food usage limit reached"
        )


# =====================================================
# HISTORY (FILTERED FOR EVENT STAFF)
# =====================================================

@router.get("/history")
def get_scan_history(
    status: Optional[str] = Query(None),
    scan_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scanner_only(current_user)

    query = db.query(ScanLog).join(Registration)

    # 🔒 Filter scans for event_staff
    if current_user.role == UserRole.event_staff:
        query = query.filter(
            Registration.main_event_id == current_user.event_id
        )

    if status:
        query = query.filter(ScanLog.status == status)

    if scan_type:
        query = query.filter(ScanLog.scan_type == scan_type)

    logs = query.order_by(ScanLog.scanned_at.desc()).all()

    result = []

    for log in logs:
        user = db.query(User).filter(User.id == log.scanned_by).first()

        result.append({
            "id": log.id,
            "registration_id": log.registration_id,
            "scan_type": log.scan_type,
            "status": log.status,
            "scanned_by": user.name if user else "Unknown",
            "timestamp": log.scanned_at
        })

    return result


@router.get("/history/export")
def export_scan_history(
    status: Optional[str] = Query(None),
    scan_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scanner_only(current_user)

    query = db.query(ScanLog).join(Registration)

    if current_user.role == UserRole.event_staff:
        query = query.filter(
            Registration.main_event_id == current_user.event_id
        )

    if status:
        query = query.filter(ScanLog.status == status)

    if scan_type:
        query = query.filter(ScanLog.scan_type == scan_type)

    logs = query.order_by(ScanLog.scanned_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "ID",
        "Registration ID",
        "Scan Type",
        "Status",
        "Scanned By",
        "Timestamp"
    ])

    for log in logs:
        user = db.query(User).filter(User.id == log.scanned_by).first()

        writer.writerow([
            log.id,
            log.registration_id,
            log.scan_type,
            log.status,
            user.name if user else "Unknown",
            log.scanned_at
        ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=scan_history.csv"
        }
    )