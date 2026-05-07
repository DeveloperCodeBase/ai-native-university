"""Assessment AI endpoints: grade-draft, plagiarism-similarity."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import uuid

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


@router.post("/assessment/grade-draft", response_model=GradeDraftResponse)
async def grade_draft(request: GradeDraftRequest):
    return GradeDraftResponse(
        job_id=f"grade_{uuid.uuid4().hex[:8]}",
        status="completed",
        suggested_score=78.5,
        feedback="پاسخ دانشجو مفاهیم اصلی را پوشش داده اما در بخش مثال‌ها نیاز به تکمیل دارد. استدلال منطقی خوبی دارد.",
        confidence=0.75,
        human_review_required=True,
    )


@router.post("/assessment/plagiarism-similarity", response_model=PlagiarismResponse)
async def plagiarism_similarity(request: PlagiarismRequest):
    return PlagiarismResponse(
        job_id=f"plag_{uuid.uuid4().hex[:8]}",
        status="completed",
        similarity_score=0.12,
        matches=[],
        confidence=0.80,
        human_review_required=True,
    )
