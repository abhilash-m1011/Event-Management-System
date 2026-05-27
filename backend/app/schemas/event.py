from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EventCreate(BaseModel):
    title: str
    description: str
    location: str
    event_date: datetime


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None


class EventResponse(BaseModel):
    id: int
    title: str
    description: str
    location: str
    event_date: datetime
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True