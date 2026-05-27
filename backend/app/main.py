from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from slowapi.middleware import SlowAPIMiddleware
from app.routers.verification import limiter

from app.database import engine, Base
from app.routers import auth
from app.routers import auth, event
from app.models import user, event as event_model

from app.routers import sub_event
from app.models import sub_event as sub_event_model

from app.routers import registration
from app.models import registration as registration_model

from app.routers import payment
from app.models import registration as registration_model

from app.routers import food_plan
from app.models import food_plan as food_plan_model
from app.routers import qr

from app.routers import ticket

from app.routers import verification

from app.routers import dashboard

from app.routers import ws_dashboard

from app.routers import feedback
from app.routers import admin
from app.routers import chatbot
from fastapi.staticfiles import StaticFiles
from app.routers import analytics


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Centralized Event Management System",
    version="1.0.0"
)


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

app.include_router(auth.router)
app.include_router(event.router)
app.include_router(sub_event.router)
app.include_router(registration.router)
app.include_router(payment.router)
app.include_router(food_plan.router)
app.include_router(qr.router)
app.include_router(ticket.router)
app.include_router(verification.router)
app.include_router(dashboard.router)
app.include_router(feedback.router)
app.include_router(admin.router)
app.include_router(chatbot.router)
app.include_router(analytics.router)

app.include_router(ws_dashboard.router)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def root():
    return {"message": "Centralized Event Management System API Running"}