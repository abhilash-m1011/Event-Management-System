from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class MainEvent(Base):
    __tablename__ = "main_events"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    description = Column(Text, nullable=False)

    location = Column(String(255), nullable=False)

    event_date = Column(DateTime, nullable=False)

    # 🔐 Who created the event (admin)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    is_active = Column(Boolean, default=True)

    is_ended = Column(Boolean, default=False)

    banner_url = Column(String, nullable=True)

    # ✅ EXPLICIT foreign_keys to avoid ambiguity
    creator = relationship(
        "User",
        foreign_keys=[created_by]
    )

    # ✅ Reverse relation for event staff
    staff_users = relationship(
        "User",
        foreign_keys="User.event_id",
        back_populates="event"
    )