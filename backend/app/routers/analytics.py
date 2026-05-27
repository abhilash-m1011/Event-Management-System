from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db


from app.models.feedback import Feedback
from app.services.event_ml import analyze_all_events,recommend_events, analyze_event_feedback,generate_event_insights

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/event/{event_id}")
def event_analytics(event_id: int, db: Session = Depends(get_db)):

    feedbacks = db.query(Feedback).filter(
        Feedback.event_id == event_id
    ).all()

    result = analyze_event_feedback(feedbacks)

    return result



@router.get("/platform-summary")
def platform_summary(db: Session = Depends(get_db)):

    feedbacks = db.query(Feedback).all()

    events_feedback = {}

    for f in feedbacks:

        if f.event_id not in events_feedback:
            events_feedback[f.event_id] = []

        events_feedback[f.event_id].append(f)

    result = analyze_all_events(events_feedback)

    return result


@router.get("/recommendations")
def recommended_events(db: Session = Depends(get_db)):

    feedbacks = db.query(Feedback).all()

    events_feedback = {}

    for f in feedbacks:

        if f.event_id not in events_feedback:
            events_feedback[f.event_id] = []

        events_feedback[f.event_id].append(f)

    result = recommend_events(events_feedback)

    return result

@router.get("/event/{event_id}/insights")
def event_insights(event_id: int, db: Session = Depends(get_db)):

    feedbacks = db.query(Feedback).filter(
        Feedback.event_id == event_id
    ).all()

    insights = generate_event_insights(feedbacks)

    return {
        "event_id": event_id,
        "insights": insights
    }