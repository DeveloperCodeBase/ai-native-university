"""ASR (Automatic Speech Recognition) job endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter()

# In-memory job store for mock
_mock_jobs: dict = {}


class AsrJobRequest(BaseModel):
    tenant_id: Optional[str] = None
    media_url: str
    language: str = "fa"
    callback_url: Optional[str] = None


class AsrJobResponse(BaseModel):
    job_id: str
    status: str  # queued, processing, completed, failed
    transcript: Optional[str] = None
    confidence: Optional[float] = None
    model: str = "mock-model"
    provider: str = "mock"


@router.post("/asr/jobs", response_model=AsrJobResponse)
async def create_asr_job(request: AsrJobRequest):
    job_id = f"asr_{uuid.uuid4().hex[:8]}"
    _mock_jobs[job_id] = {
        "status": "completed",
        "transcript": "این یک نمونه متن رونویسی شده از کلاس است. استاد در این بخش درباره مفاهیم پایه هوش مصنوعی صحبت می‌کند.",
        "confidence": 0.88,
    }
    return AsrJobResponse(
        job_id=job_id,
        status="completed",
        transcript=_mock_jobs[job_id]["transcript"],
        confidence=_mock_jobs[job_id]["confidence"],
    )


@router.get("/asr/jobs/{job_id}", response_model=AsrJobResponse)
async def get_asr_job(job_id: str):
    if job_id in _mock_jobs:
        job = _mock_jobs[job_id]
        return AsrJobResponse(
            job_id=job_id,
            status=job["status"],
            transcript=job.get("transcript"),
            confidence=job.get("confidence"),
        )
    return AsrJobResponse(
        job_id=job_id,
        status="not_found",
    )
