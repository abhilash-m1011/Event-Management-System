from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    organizer = "organizer"
    scanner = "scanner"
    event_staff = "event_staff"
    participant = "participant"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, index=True, nullable=False)

    password_hash = Column(String, nullable=False)

    role = Column(Enum(UserRole), default=UserRole.participant)

    # 🔐 Event staff belongs to one event
    event_id = Column(Integer, ForeignKey("main_events.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ✅ EXPLICIT foreign_keys to avoid ambiguity
    event = relationship(
        "MainEvent",
        foreign_keys=[event_id],
        back_populates="staff_users"
    )