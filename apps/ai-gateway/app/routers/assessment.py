"""Assessment AI endpoints: grade-draft, plagiarism-similarity.
Supports mock and external_api modes."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid

from app.config import settings

router = APIRouter()


class GradeDraftRequest(BaseModel):
    tenant_id: Optional[str] = None
    submission_id: str
    question_text: str
    student_answer: str
    rubric: Optional[str] = None
    max_points: float = 100


class GradeDraftResponse(BaseModel):
    job_id: str
    status: str = "completed"
    suggested_score: float
    feedback: str
    confidence: float
    human_review_required: bool = True
    model: str = "mock-model"
    provider: str = "mock"


class PlagiarismRequest(BaseModel):
    tenant_id: Optional[str] = None
    submission_id: str
    content: str


class PlagiarismResponse(BaseModel):
    job_id: str
    status: str = "completed"
    similarity_score: float
    matches: list[dict] = []
    confidence: float
    human_review_required: bool = True
    model: str = "mock-model"
    provider: str = "mock"


def _mock_grade(request: GradeDraftRequest) -> GradeDraftResponse:
    return GradeDraftResponse(
        job_id=f"grade_{uuid.uuid4().hex[:8]}",
        status="completed",
        suggested_score=78.5,
        feedback="پاسخ دانشجو مفاهیم اصلی را پوشش داده اما در بخش مثال‌ها نیاز به تکمیل دارد. استدلال منطقی خوبی دارد.",
        confidence=0.75,
        human_review_required=True,
    )


async def _openrouter_grade(request: GradeDraftRequest) -> GradeDraftResponse:
    from app.openrouter_client import openrouter_client
    try:
        rubric_text = f"\nمعیار نمره‌دهی: {request.rubric}" if request.rubric else ""
        result = await openrouter_client.chat_completion(
            messages=[{"role": "user", "content": f"سوال: {request.question_text}\n\nپاسخ دانشجو: {request.student_answer}{rubric_text}\n\nحداکثر نمره: {request.max_points}\n\nلطفاً نمره پیشنهادی (عدد) و بازخورد فارسی بده. خروجی: نمره: [عدد]\nبازخورد: [متن]"}],
            system_prompt="تو یک استاد دانشگاه هستی. پاسخ دانشجو را ارزیابی و نمره‌دهی کن. نمره باید عددی و بازخورد باید سازنده و فارسی باشد. این یک پیش‌نویس نمره است و حتماً نیاز به بازبینی انسانی دارد.",
            temperature=0.3,
        )
        # Try to parse score from response
        answer = result["answer"]
        score = request.max_points * 0.75  # default
        try:
            for line in answer.split("\n"):
                if "نمره" in line and any(c.isdigit() for c in line):
                    digits = "".join(c for c in line if c.isdigit() or c == ".")
                    if digits:
                        score = min(float(digits), request.max_points)
                        break
        except (ValueError, IndexError):
            pass

        return GradeDraftResponse(
            job_id=f"grade_{uuid.uuid4().hex[:8]}",
            suggested_score=score,
            feedback=answer,
            confidence=result["confidence"],
            human_review_required=True,
            model=result["model"],
            provider=result["provider"],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenRouter call failed: {str(e)}")


@router.post("/assessment/grade-draft", response_model=GradeDraftResponse)
async def grade_draft(request: GradeDraftRequest):
    """AI grading draft. Always requires human review."""
    if settings.ai_mode == "external_api":
        return await _openrouter_grade(request)
    return _mock_grade(request)


@router.post("/assessment/plagiarism-similarity", response_model=PlagiarismResponse)
async def plagiarism_similarity(request: PlagiarismRequest):
    """Plagiarism check — mock only (requires embedding DB for real implementation)."""
    return PlagiarismResponse(
        job_id=f"plag_{uuid.uuid4().hex[:8]}",
        status="completed",
        similarity_score=0.12,
        matches=[],
        confidence=0.80,
        human_review_required=True,
    )
