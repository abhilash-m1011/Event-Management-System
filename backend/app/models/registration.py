from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, Float, Boolean
from sqlalchemy import Index, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


# =========================================
# MAIN REGISTRATION TABLE
# =========================================
class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    main_event_id = Column(Integer, ForeignKey("main_events.id", ondelete="CASCADE"))

    # 💰 Payment
    total_amount = Column(Float, nullable=False)
    payment_status = Column(String, default="pending")

    # 🔥 MAIN EVENT QR TOKEN (NEW)
    main_event_qr_token = Column(String, nullable=True)
    food_qr_token = Column(String, nullable=True)

    # 👤 Participant Details
    participant_name = Column(String, nullable=False)
    participant_email = Column(String, nullable=False)
    participant_phone = Column(String, nullable=False)
    participant_location = Column(String, nullable=True)

    # 🕒 Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 🔗 Relationships
    user = relationship("User")
    main_event = relationship("MainEvent")

    sub_events = relationship(
        "RegistrationSubEvent",
        back_populates="registration",
        cascade="all, delete"
    )

    food_items = relationship(
        "RegistrationFood",
        back_populates="registration",
        cascade="all, delete"
    )

# =========================================
# SUB EVENT REGISTRATION
# =========================================
class RegistrationSubEvent(Base):
    __tablename__ = "registration_sub_events"

    id = Column(Integer, primary_key=True, index=True)

    registration_id = Column(Integer, ForeignKey("registrations.id", ondelete="CASCADE"))
    sub_event_id = Column(Integer, ForeignKey("sub_events.id", ondelete="CASCADE"))

    # 🎟 Attendance
    attendance_status = Column(Boolean, default=False)

    # 🔐 QR Token
    qr_token = Column(String, nullable=True)

    # 🔗 Relationships
    registration = relationship("Registration", back_populates="sub_events")
    sub_event = relationship("SubEvent")

    __table_args__ = (
        UniqueConstraint("registration_id", "sub_event_id", name="uq_registration_subevent"),
        Index("idx_registration_subevent", "registration_id", "sub_event_id"),
    )


# =========================================
# FOOD REGISTRATION
# =========================================
class RegistrationFood(Base):
    __tablename__ = "registration_foods"

    id = Column(Integer, primary_key=True, index=True)

    registration_id = Column(Integer, ForeignKey("registrations.id", ondelete="CASCADE"))
    food_plan_id = Column(Integer, ForeignKey("food_plans.id", ondelete="CASCADE"))

    # 🔐 QR Token
    qr_token = Column(String, nullable=True)

    # 🍽 Multi-use tracking
    used_count = Column(Integer, default=0)

    # 🔗 Relationships
    registration = relationship("Registration", back_populates="food_items")
    food_plan = relationship("FoodPlan")

    __table_args__ = (
        UniqueConstraint("registration_id", "food_plan_id", name="uq_registration_food"),
        Index("idx_registration_food", "registration_id", "food_plan_id"),
    )