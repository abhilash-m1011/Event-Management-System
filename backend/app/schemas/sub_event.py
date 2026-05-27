from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SubEventCreate(BaseModel):
    title: str
    description: str
    capacity: int
    price: float
    start_time: datetime
    end_time: datetime


class SubEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
    price: Optional[float] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class SubEventResponse(BaseModel):
    id: int
    main_event_id: int
    title: str
    description: str
    capacity: int
    price: float
    start_time: datetime
    end_time: datetime

    class Config:
        from_attributes = True