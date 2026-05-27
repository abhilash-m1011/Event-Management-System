from jose import jwt
from datetime import datetime, timedelta
from app.config import settings


# =========================================
# 🎟 EVENT QR (Covers main + sub events)
# =========================================

def generate_event_qr(registration):
    payload = {
        "type": "event",
        "registration_id": registration.id,
        "exp": datetime.utcnow() + timedelta(days=1)
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token


# =========================================
# 🍽 FOOD QR (Covers all food plans)
# =========================================

def generate_food_qr(registration):
    payload = {
        "type": "food",
        "registration_id": registration.id,
        "exp": datetime.utcnow() + timedelta(days=1)
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token