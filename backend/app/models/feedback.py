from sqlalchemy import Column, Integer, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Feedback(Base):

    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("main_events.id"))

    rating = Column(Integer)
    organization = Column(Integer)
    content_quality = Column(Integer)
    speaker_quality = Column(Integer)

    recommend = Column(Boolean)

    comment = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())