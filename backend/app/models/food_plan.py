from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class FoodPlan(Base):
    __tablename__ = "food_plans"

    id = Column(Integer, primary_key=True, index=True)
    main_event_id = Column(Integer, ForeignKey("main_events.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    max_usage = Column(Integer, default=1)
    main_event = relationship("MainEvent", backref="food_plans")