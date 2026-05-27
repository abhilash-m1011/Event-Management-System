import razorpay
from app.config import settings


client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


def create_razorpay_order(amount: float, receipt: str):
    order_data = {
        "amount": int(amount * 100),  # Razorpay expects paise
        "currency": "INR",
        "receipt": receipt,
        "payment_capture": 1
    }

    order = client.order.create(data=order_data)
    return order


def verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    params_dict = {
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": razorpay_payment_id,
        "razorpay_signature": razorpay_signature
    }

    try:
        client.utility.verify_payment_signature(params_dict)
        return True
    except:
        return False