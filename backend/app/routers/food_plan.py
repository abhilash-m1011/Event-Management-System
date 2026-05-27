from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.food_plan import FoodPlan
from app.models.event import MainEvent
from app.schemas.food_plan import FoodPlanCreate, FoodPlanUpdate, FoodPlanResponse
from app.auth.security import require_role
from app.models.user import User

router = APIRouter(prefix="/food-plans", tags=["Food Plans"])


# ✅ CREATE FOOD PLAN
@router.post("/{main_event_id}", response_model=FoodPlanResponse)
def create_food_plan(
    main_event_id: int,
    food: FoodPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    main_event = db.query(MainEvent).filter(MainEvent.id == main_event_id).first()

    if not main_event:
        raise HTTPException(status_code=404, detail="Main Event not found")

    if food.price < 0:
        raise HTTPException(status_code=400, detail="Price cannot be negative")

    if food.max_usage <= 0:
        raise HTTPException(status_code=400, detail="Usage limit must be greater than 0")

    new_food = FoodPlan(
        main_event_id=main_event_id,
        name=food.name,
        description=food.description,
        price=food.price,
        max_usage=food.max_usage
    )

    db.add(new_food)
    db.commit()
    db.refresh(new_food)

    return new_food


# ✅ GET FOOD PLANS
@router.get("/{main_event_id}", response_model=List[FoodPlanResponse])
def get_food_plans(main_event_id: int, db: Session = Depends(get_db)):
    return db.query(FoodPlan).filter(FoodPlan.main_event_id == main_event_id).all()


# ✅ UPDATE FOOD PLAN (Partial Safe)
@router.put("/{food_plan_id}", response_model=FoodPlanResponse)
def update_food_plan(
    food_plan_id: int,
    food: FoodPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    db_food = db.query(FoodPlan).filter(FoodPlan.id == food_plan_id).first()

    if not db_food:
        raise HTTPException(status_code=404, detail="Food Plan not found")

    update_data = food.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_food, key, value)

    db.commit()
    db.refresh(db_food)

    return db_food


# ✅ DELETE FOOD PLAN
@router.delete("/{food_plan_id}")
def delete_food_plan(
    food_plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    db_food = db.query(FoodPlan).filter(FoodPlan.id == food_plan_id).first()

    if not db_food:
        raise HTTPException(status_code=404, detail="Food Plan not found")

    db.delete(db_food)
    db.commit()

    return {"message": "Food Plan deleted successfully"}