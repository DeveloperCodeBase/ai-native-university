"""
AI-Native Online University — AI Gateway
FastAPI application for AI service routing.
Supports mock mode and external API mode.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time
import uuid

from app.config import settings
from app.routers import health, rag, class_analysis, learner, assessment, asr, embeddings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    print(f"🤖 AI Gateway starting in {settings.ai_mode} mode")
    print(f"   OpenRouter base: {settings.openrouter_base_url}")
    yield
    print("🤖 AI Gateway shutting down")


app = FastAPI(
    title="AI-Native University — AI Gateway",
    description="AI service gateway supporting mock and external API modes. No local GPU required.",
    version="2.0.0",
    docs_url="/v1/docs",
    openapi_url="/v1/openapi.json",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Correlation ID middleware
@app.middleware("http")
async def add_correlation_id(request: Request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    request.state.correlation_id = correlation_id
    start_time = time.time()

    response = await call_next(request)

    process_time = (time.time() - start_time) * 1000
    response.headers["X-Correlation-ID"] = correlation_id
    response.headers["X-Process-Time-Ms"] = f"{process_time:.0f}"
    return response


# Register routers
app.include_router(health.router, prefix="/v1", tags=["health"])
app.include_router(rag.router, prefix="/v1", tags=["rag"])
app.include_router(class_analysis.router, prefix="/v1", tags=["class-analysis"])
app.include_router(learner.router, prefix="/v1", tags=["learner"])
app.include_router(assessment.router, prefix="/v1", tags=["assessment"])
app.include_router(asr.router, prefix="/v1", tags=["asr"])
app.include_router(embeddings.router, prefix="/v1", tags=["embeddings"])
