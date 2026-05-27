from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
import ollama

from app.database import get_db
from app.models.event import MainEvent
from app.models.registration import Registration
from app.models.sub_event import SubEvent

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


class ChatRequest(BaseModel):
    message: str
    user_id: int | None = None


# -----------------------------
# Conversation Memory
# -----------------------------

conversation_memory = {}


def get_memory(user_id):
    if user_id not in conversation_memory:
        conversation_memory[user_id] = []
    return conversation_memory[user_id]


# -----------------------------
# Chatbot Endpoint
# -----------------------------

@router.post("/")
async def chatbot(data: ChatRequest, db: Session = Depends(get_db)):

    message = data.message.lower()
    user_id = data.user_id or "guest"

    memory = get_memory(user_id)

    events = db.query(MainEvent).all()

    event_lookup = {e.title.lower(): e for e in events}

    # -----------------------------
    # EVENTS TODAY
    # -----------------------------

    if "today" in message:

        today = date.today()

        today_events = [
            e for e in events if e.event_date.date() == today
        ]

        if not today_events:
            return {"reply": "There are no events happening today."}

        reply = "Events happening today:\n\n"

        for e in today_events:
            reply += f"• {e.title} | {e.location} | {e.event_date.strftime('%Y-%m-%d %H:%M')}\n"

        return {"reply": reply}

    # -----------------------------
    # EVENTS BY LOCATION
    # -----------------------------

    for e in events:

        if e.location.lower() in message:

            filtered = [
                ev for ev in events if ev.location.lower() == e.location.lower()
            ]

            reply = f"Events in {e.location}:\n\n"

            for ev in filtered:
                reply += f"• {ev.title} | {ev.event_date.strftime('%Y-%m-%d %H:%M')}\n"

            return {"reply": reply}

    # -----------------------------
    # UPCOMING EVENTS
    # -----------------------------

    if "upcoming" in message or "next" in message:

        today = date.today()

        upcoming = [
            e for e in events if e.event_date.date() >= today
        ]

        if not upcoming:
            return {"reply": "There are no upcoming events."}

        reply = "Upcoming events:\n\n"

        for e in sorted(upcoming, key=lambda x: x.event_date):
            reply += f"• {e.title} | {e.location} | {e.event_date.strftime('%Y-%m-%d')}\n"

        return {"reply": reply}

    # -----------------------------
    # FIND EVENT BY NAME
    # -----------------------------

    matched_event = None

    for title, event in event_lookup.items():
        if title in message:
            matched_event = event
            memory.append({"last_event": title})
            break

    # Use memory if user says "it"
    if not matched_event:

        for m in reversed(memory):

            if "last_event" in m:
                matched_event = event_lookup.get(m["last_event"])
                break

    # -----------------------------
    # EVENT LOCATION
    # -----------------------------

    if matched_event and "where" in message:

        return {
            "reply": f"{matched_event.title} will take place at {matched_event.location}."
        }

    # -----------------------------
    # EVENT DATE
    # -----------------------------

    if matched_event and ("when" in message or "date" in message):

        return {
            "reply": f"{matched_event.title} will happen on {matched_event.event_date.strftime('%Y-%m-%d %H:%M')}."
        }

    # -----------------------------
    # EVENT DETAILS
    # -----------------------------

    if matched_event:

        return {
            "reply": f"""
Event: {matched_event.title}

Location: {matched_event.location}

Date: {matched_event.event_date.strftime('%Y-%m-%d %H:%M')}

Description:
{matched_event.description}
"""
        }

    # -----------------------------
    # USER REGISTRATIONS
    # -----------------------------

    if "registered" in message or "my events" in message:

        if not data.user_id:
            return {"reply": "Please login to view your registered events."}

        regs = db.query(Registration).filter(
            Registration.user_id == data.user_id
        ).all()

        if not regs:
            return {"reply": "You have not registered for any events."}

        reply = "You are registered for:\n\n"

        for r in regs:

            event = db.query(MainEvent).filter(
                MainEvent.id == r.event_id
            ).first()

            if event:
                reply += f"• {event.title} | {event.event_date.strftime('%Y-%m-%d')}\n"

        return {"reply": reply}

    # -----------------------------
    # EVENT SCHEDULE
    # -----------------------------

    if matched_event and "schedule" in message:

        subs = db.query(SubEvent).filter(
            SubEvent.event_id == matched_event.id
        ).all()

        if not subs:
            return {"reply": "No schedule available yet."}

        reply = f"Schedule for {matched_event.title}:\n\n"

        for s in subs:
            reply += f"• {s.title} | {s.start_time}\n"

        return {"reply": reply}

    # -----------------------------
    # GENERAL EVENT LIST
    # -----------------------------

    if "events" in message or "available" in message:

        if not events:
            return {"reply": "No events are currently available."}

        reply = "Here are the available events:\n\n"

        for e in events:
            reply += f"• {e.title} | {e.location} | {e.event_date.strftime('%Y-%m-%d %H:%M')}\n"

        return {"reply": reply}

    # -----------------------------
    # OLLAMA FALLBACK WITH MEMORY
    # -----------------------------

    event_context = ""

    for e in events:
        event_context += f"""
Title: {e.title}
Location: {e.location}
Date: {e.event_date}
Description: {e.description}
"""

    system_prompt = f"""
You are an assistant for an Event Management System.

Available events:

{event_context}

Rules:
- Only talk about these events
- Help users find events by location, date, or topic
- If no event matches say: "No matching events found."
"""

    try:

        messages = [
            {"role": "system", "content": system_prompt}
        ]

        for m in memory[-4:]:
            if "user" in m:
                messages.append({"role": "user", "content": m["user"]})
            if "assistant" in m:
                messages.append({"role": "assistant", "content": m["assistant"]})

        messages.append({"role": "user", "content": data.message})

        response = ollama.chat(
            model="gemma3:4b",
            messages=messages
        )

        reply = response["message"]["content"]

        memory.append({"user": data.message})
        memory.append({"assistant": reply})

        return {"reply": reply}

    except Exception:

        return {"reply": "AI service temporarily unavailable. Please try again later."}