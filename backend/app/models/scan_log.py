from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class ScanLog(Base):
    __tablename__ = "scan_logs"

    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(Integer, ForeignKey("registrations.id"))
    scan_type = Column(String)  # event / food
    status = Column(String)  # success / failed / expired / limit_reached
    scanned_by = Column(Integer, ForeignKey("users.id"))
    scanned_at = Column(DateTime(timezone=True), server_default=func.now())