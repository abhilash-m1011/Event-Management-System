from pydantic import BaseModel
from typing import Optional


class FoodPlanCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    max_usage: int = 1



class FoodPlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    max_usage: Optional[int] = None

class FoodPlanResponse(BaseModel):
    id: int
    main_event_id: int
    name: str
    description: Optional[str]
    price: float
    max_usage: int

    class Config:
        from_attributes = True