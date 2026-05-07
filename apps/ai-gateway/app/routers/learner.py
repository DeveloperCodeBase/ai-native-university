"""Learner profile and risk prediction endpoints.
Supports mock and external_api modes."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid

from app.config import settings

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


def _mock_risk() -> RiskPredictResponse:
    return RiskPredictResponse(
        job_id=f"risk_{uuid.uuid4().hex[:8]}",
        risk_score=0.35,
        risk_level="medium",
        factors=["حضور نامنظم در کلاس‌های اخیر", "تأخیر در تحویل تکلیف"],
        recommendations=["پیشنهاد جلسه مشاوره تحصیلی", "ارسال یادآوری تکالیف"],
        confidence=0.72,
        human_review_required=True,
    )


async def _openrouter_risk(request: RiskPredictRequest) -> RiskPredictResponse:
    from app.openrouter_client import openrouter_client
    try:
        result = await openrouter_client.chat_completion(
            messages=[{"role": "user", "content": f"بر اساس داده‌های دانشجو {request.user_id} در درس {request.course_id or 'نامشخص'}، ریسک افت تحصیلی را تحلیل کن. عوامل ریسک و توصیه‌ها را فارسی بنویس."}],
            system_prompt="تو یک تحلیل‌گر آموزشی هستی. ریسک افت تحصیلی دانشجو را ارزیابی کن. خروجی شامل: سطح ریسک (low/medium/high)، عوامل ریسک و توصیه‌ها. این تحلیل حتماً نیاز به بازبینی انسانی دارد.",
            temperature=0.4,
        )
        # Parse risk level from response
        answer = result["answer"].lower()
        if "high" in answer or "بالا" in answer:
            risk_level, risk_score = "high", 0.75
        elif "low" in answer or "پایین" in answer:
            risk_level, risk_score = "low", 0.20
        else:
            risk_level, risk_score = "medium", 0.45

        return RiskPredictResponse(
            job_id=f"risk_{uuid.uuid4().hex[:8]}",
            risk_score=risk_score,
            risk_level=risk_level,
            factors=[result["answer"][:200]],
            recommendations=["بررسی توسط مشاور تحصیلی توصیه می‌شود"],
            confidence=result["confidence"],
            human_review_required=True,
            model=result["model"],
            provider=result["provider"],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenRouter call failed: {str(e)}")


@router.post("/learner-profile/update")
async def update_learner_profile(request: LearnerProfileUpdate):
    return {
        "job_id": f"lp_{uuid.uuid4().hex[:8]}",
        "status": "completed",
        "message": "پروفایل یادگیرنده به‌روزرسانی شد",
    }


@router.post("/learning-risk/predict", response_model=RiskPredictResponse)
async def predict_risk(request: RiskPredictRequest):
    """Risk prediction. Always requires human review."""
    if settings.ai_mode == "external_api":
        return await _openrouter_risk(request)
    return _mock_risk()


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
