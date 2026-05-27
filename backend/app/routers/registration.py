from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.registration import Registration, RegistrationSubEvent
from app.models.sub_event import SubEvent
from app.models.event import MainEvent
from app.models.user import User
from app.schemas.registration import RegistrationCreate, RegistrationResponse
from app.auth.security import get_current_user
from app.models.registration import RegistrationFood
from app.models.food_plan import FoodPlan

router = APIRouter(prefix="/registrations", tags=["Registrations"])


@router.post("/", response_model=RegistrationResponse)
def create_registration(
    registration: RegistrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1️⃣ Check main event exists
    main_event = db.query(MainEvent).filter(
        MainEvent.id == registration.main_event_id
    ).first()

    if not main_event:
        raise HTTPException(status_code=404, detail="Main Event not found")

    # 2️⃣ Prevent duplicate registration
    existing_registration = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.main_event_id == registration.main_event_id
    ).first()

    if existing_registration:
        raise HTTPException(
            status_code=400,
            detail="User already registered for this event"
        )

    # 3️⃣ Validate sub-events
    sub_events = db.query(SubEvent).filter(
        SubEvent.id.in_(registration.sub_event_ids)
    ).all()

    if len(sub_events) != len(registration.sub_event_ids):
        raise HTTPException(status_code=400, detail="Invalid sub-event selected")

    for sub in sub_events:
        if sub.main_event_id != registration.main_event_id:
            raise HTTPException(
                status_code=400,
                detail="Sub-event does not belong to selected main event"
            )

    # 4️⃣ Validate food plans (Optional)
    food_plans = []
    if registration.food_plan_ids and len(registration.food_plan_ids) > 0:
        food_plans = db.query(FoodPlan).filter(
            FoodPlan.id.in_(registration.food_plan_ids)
        ).all()

        if len(food_plans) != len(registration.food_plan_ids):
            raise HTTPException(status_code=400, detail="Invalid food plan selected")

        for food in food_plans:
            if food.main_event_id != registration.main_event_id:
                raise HTTPException(
                    status_code=400,
                    detail="Food plan does not belong to selected main event"
                )

    # 5️⃣ Capacity Check for sub-events
    for sub in sub_events:
        registered_count = db.query(RegistrationSubEvent).filter(
            RegistrationSubEvent.sub_event_id == sub.id
        ).count()

        if registered_count >= sub.capacity:
            raise HTTPException(
                status_code=400,
                detail=f"Sub-event '{sub.title}' is full"
            )

    # 6️⃣ Calculate total amount (Sub Events + Food)
    total_amount = sum(sub.price for sub in sub_events)
    total_amount += sum(food.price for food in food_plans)

    # 7️⃣ Create registration
    new_registration = Registration(
        user_id=current_user.id,
        main_event_id=registration.main_event_id,
        total_amount=total_amount,
        payment_status="pending"
    )

    db.add(new_registration)
    db.commit()
    db.refresh(new_registration)

    # 8️⃣ Add selected sub-events
    for sub in sub_events:
        reg_sub = RegistrationSubEvent(
            registration_id=new_registration.id,
            sub_event_id=sub.id
        )
        db.add(reg_sub)

    # 9️⃣ Add selected food plans
    for food in food_plans:
        reg_food = RegistrationFood(
            registration_id=new_registration.id,
            food_plan_id=food.id
        )
        db.add(reg_food)

    db.commit()

    return new_registration