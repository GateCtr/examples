# fastapi-service/main.py
# Async FastAPI service with GateCtr budget enforcement per endpoint.
#
# GateCtr sits between FastAPI and the LLM provider:
#   - Enforces token budget (hard cap per project)
#   - Compresses prompts automatically (Context Optimizer)
#   - Routes to the optimal model (Model Router)
#
# Setup:
#   pip install -r requirements.txt
#   cp .env.example .env  # add your GATECTR_API_KEY
#   uvicorn main:app --reload

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from gatectr import GateCtr
from gatectr.errors import GateCtrApiError
from pydantic import BaseModel

load_dotenv()

# ── GateCtr client ────────────────────────────────────────────────────────────

client = GateCtr(
    api_key=os.environ["GATECTR_API_KEY"],
    optimize=True,   # Context Optimizer — compresses prompts automatically
    route=False,     # Set True to enable Model Router
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    yield
    await client.aclose()


app = FastAPI(
    title="GateCtr FastAPI Example",
    description="Async completions with budget enforcement via GateCtr.",
    lifespan=lifespan,
)

# ── Request / Response models ─────────────────────────────────────────────────


class SummarizeRequest(BaseModel):
    text: str
    model: str = "gpt-4o"


class SummarizeResponse(BaseModel):
    summary: str
    tokens_used: int
    tokens_saved: int
    request_id: str


class ChatRequest(BaseModel):
    messages: list[dict[str, str]]
    model: str = "gpt-4o"


class ChatResponse(BaseModel):
    content: str
    tokens_used: int
    request_id: str


# ── Endpoints ─────────────────────────────────────────────────────────────────


@app.post("/summarize", response_model=SummarizeResponse)
async def summarize(req: SummarizeRequest) -> SummarizeResponse:
    """Summarize a text. GateCtr compresses the prompt and enforces budget."""
    try:
        response = await client.complete(
            model=req.model,
            messages=[
                {"role": "system", "content": "You are a concise summarizer. Reply with one paragraph."},
                {"role": "user", "content": f"Summarize:\n\n{req.text}"},
            ],
        )
    except GateCtrApiError as e:
        if e.status == 402:
            raise HTTPException(status_code=402, detail="Budget limit reached. Adjust in GateCtr dashboard.")
        raise HTTPException(status_code=e.status or 500, detail=e.message)

    choice = response.choices[0]
    return SummarizeResponse(
        summary=choice.text,
        tokens_used=response.usage.total_tokens,
        tokens_saved=response.gatectr.tokens_saved,
        request_id=response.gatectr.request_id,
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    """Single chat completion routed through GateCtr."""
    try:
        response = await client.chat(
            model=req.model,
            messages=req.messages,
        )
    except GateCtrApiError as e:
        if e.status == 402:
            raise HTTPException(status_code=402, detail="Budget limit reached. Adjust in GateCtr dashboard.")
        raise HTTPException(status_code=e.status or 500, detail=e.message)

    choice = response.choices[0]
    return ChatResponse(
        content=choice.message.content,
        tokens_used=response.usage.total_tokens,
        request_id=response.gatectr.request_id,
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
