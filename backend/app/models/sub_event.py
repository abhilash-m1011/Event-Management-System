from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base


class SubEvent(Base):
    __tablename__ = "sub_events"

    id = Column(Integer, primary_key=True, index=True)
    main_event_id = Column(Integer, ForeignKey("main_events.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    capacity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)

    main_event = relationship("MainEvent", backref="sub_events")