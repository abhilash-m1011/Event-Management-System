from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class RegistrationCreate(BaseModel):
    main_event_id: int
    sub_event_ids: List[int]
    food_plan_ids: Optional[List[int]] = []


class RegistrationResponse(BaseModel):
    id: int
    user_id: int
    main_event_id: int
    total_amount: float
    payment_status: str
    created_at: datetime

    class Config:
        from_attributes = True