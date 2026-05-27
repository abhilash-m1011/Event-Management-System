from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import qrcode
import io
from fastapi.responses import StreamingResponse

from app.database import get_db
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate
from app.auth.dependencies import get_current_user
router = APIRouter(prefix="/feedback", tags=["Feedback"])


# -----------------------------
# Submit Feedback
# -----------------------------

@router.post("/")
def submit_feedback(
    data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    feedback = Feedback(
        user_id=current_user["user_id"],
        event_id=data.event_id,
        rating=data.rating,
        organization=data.organization,
        content_quality=data.content_quality,
        speaker_quality=data.speaker_quality,
        recommend=data.recommend,
        comment=data.comment
    )

    db.add(feedback)
    db.commit()

    return {"message": "Feedback submitted successfully"}


@router.get("/event/{event_id}")
def get_event_feedback(event_id: int, db: Session = Depends(get_db)):

    feedbacks = db.query(Feedback).filter(
        Feedback.event_id == event_id
    ).all()

    return feedbacks


@router.get("/qr/{event_id}")
def generate_feedback_qr(event_id: int):

    url = f"http://localhost:5173/feedback/{event_id}"

    qr = qrcode.make(url)

    buffer = io.BytesIO()
    qr.save(buffer)
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="image/png")