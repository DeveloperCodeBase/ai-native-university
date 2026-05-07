"""Health check endpoint."""

from fastapi import APIRouter
from app.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-gateway",
        "version": "2.0.0",
        "ai_mode": settings.ai_mode,
        "gpu_required": False,
    }
