import razorpay
import hmac
import hashlib

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.payment import Payment
from app.auth.dependencies import get_current_user
from app.models.registration import Registration

router = APIRouter(prefix="/payment", tags=["Payment"])

RAZORPAY_KEY_ID = "rzp_test_SOHcDMaDPi0Xjb"
RAZORPAY_SECRET = "CpFboZBEYL4HB6UwiW3VVA09"

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_SECRET))


@router.post("/create-order/{registration_id}")
def create_order(
    registration_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()

    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    amount_paise = int(data["amount"] * 100)

    order = razorpay_client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "payment_capture": 1
    })

    payment = Payment(
        user_id=current_user["user_id"],
        event_id=registration.main_event_id,
        registration_id=registration_id,   # ✅ FIX: store so verify can find it directly
        amount=amount_paise,
        razorpay_order_id=order["id"],
        status="created"
    )

    db.add(payment)
    db.commit()

    return order


@router.post("/verify")
def verify_payment(data: dict, db: Session = Depends(get_db)):

    razorpay_order_id = data["razorpay_order_id"]
    razorpay_payment_id = data["razorpay_payment_id"]
    razorpay_signature = data["razorpay_signature"]

    generated_signature = hmac.new(
        RAZORPAY_SECRET.encode("utf-8"),
        f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    if generated_signature != razorpay_signature:
        raise HTTPException(status_code=400, detail="Payment verification failed")

    payment = db.query(Payment).filter(
        Payment.razorpay_order_id == razorpay_order_id
    ).first()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    payment.status = "paid"
    payment.razorpay_payment_id = razorpay_payment_id

    # ✅ FIX: Look up registration directly by registration_id stored at order creation
    #         Old approach (main_event_id + user_id) was ambiguous and could fail silently
    registration = db.query(Registration).filter(
        Registration.id == payment.registration_id
    ).first()

    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found for this payment")

    registration.payment_status = "success"   # ✅ This is what /qr/generate checks
    db.commit()

    return {"message": "Payment verified", "registration_id": registration.id}