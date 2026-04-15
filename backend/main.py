"""
HBF Agent — FastAPI backend
Runs on http://localhost:8000
"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from agent import KodaAgent
from weather import fetch_live_data, get_weather_state


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(_app: FastAPI):
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise RuntimeError("ANTHROPIC_API_KEY is not set. Add it to backend/.env")
    yield


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="HBF Agent", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / response models ─────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = []
    message: str


class ChatResponse(BaseModel):
    response: str


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/weather")
async def weather():
    try:
        data = await fetch_live_data()
        state = get_weather_state(data)
        return {**data, "state": state}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    import traceback
    try:
        # Convert Pydantic models to plain dicts for the agent
        history = [{"role": m.role, "content": m.content} for m in req.messages]
        agent = KodaAgent()
        reply = await agent.chat(history, req.message)
        return ChatResponse(response=reply)
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
