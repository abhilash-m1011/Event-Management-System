from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Payment(Base):

    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    event_id = Column(Integer, ForeignKey("main_events.id"))

    # ✅ FIX: Store registration_id directly so verify can look it up without ambiguity
    registration_id = Column(Integer, ForeignKey("registrations.id"), nullable=True)

    amount = Column(Integer)

    razorpay_order_id = Column(String)

    razorpay_payment_id = Column(String)

    status = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())