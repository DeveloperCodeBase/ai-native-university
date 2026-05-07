"""Learner profile and risk prediction endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter()


class LearnerProfileUpdate(BaseModel):
    tenant_id: Optional[str] = None
    user_id: str
    course_id: Optional[str] = None
    events: list[dict] = []


class RiskPredictRequest(BaseModel):
    tenant_id: Optional[str] = None
    user_id: str
    course_id: Optional[str] = None


class RiskPredictResponse(BaseModel):
    job_id: str
    status: str = "completed"
    risk_score: float
    risk_level: str  # low, medium, high
    factors: list[str] = []
    recommendations: list[str] = []
    confidence: float
    human_review_required: bool = True
    model: str = "mock-model"
    provider: str = "mock"


@router.post("/learner-profile/update")
async def update_learner_profile(request: LearnerProfileUpdate):
    return {
        "job_id": f"lp_{uuid.uuid4().hex[:8]}",
        "status": "completed",
        "message": "پروفایل یادگیرنده به‌روزرسانی شد",
    }


@router.post("/learning-risk/predict", response_model=RiskPredictResponse)
async def predict_risk(request: RiskPredictRequest):
    return RiskPredictResponse(
        job_id=f"risk_{uuid.uuid4().hex[:8]}",
        status="completed",
        risk_score=0.35,
        risk_level="medium",
        factors=[
            "حضور نامنظم در کلاس‌های اخیر",
            "تأخیر در تحویل تکلیف",
        ],
        recommendations=[
            "پیشنهاد جلسه مشاوره تحصیلی",
            "ارسال یادآوری تکالیف",
        ],
        confidence=0.72,
        human_review_required=True,
    )


@router.post("/recommendations/next-actions")
async def next_actions(request: RiskPredictRequest):
    return {
        "job_id": f"rec_{uuid.uuid4().hex[:8]}",
        "status": "completed",
        "actions": [
            {"type": "review_lesson", "lesson_id": "les_001", "title": "مرور درس ۱"},
            {"type": "practice_quiz", "assessment_id": "asmt_001", "title": "تمرین آزمون"},
        ],
        "confidence": 0.68,
        "model": "mock-model",
        "provider": "mock",
        "human_review_required": False,
    }
