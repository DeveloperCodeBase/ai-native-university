"""RAG query endpoint."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter()


class RagQueryRequest(BaseModel):
    query: str
    course_id: Optional[str] = None
    lesson_id: Optional[str] = None
    tenant_id: Optional[str] = None
    language: str = "fa"
    max_sources: int = 5


class RagSource(BaseModel):
    type: str
    id: str
    title: Optional[str] = None
    snippet: Optional[str] = None
    relevance_score: Optional[float] = None


class RagQueryResponse(BaseModel):
    job_id: str
    status: str = "completed"
    answer: str
    confidence: float
    model: str
    provider: str
    human_review_required: bool
    sources: list[RagSource] = []


@router.post("/rag/query", response_model=RagQueryResponse)
async def rag_query(request: RagQueryRequest):
    """RAG-based query endpoint. Returns mock data in mock mode."""
    return RagQueryResponse(
        job_id=f"rag_{uuid.uuid4().hex[:8]}",
        status="completed",
        answer=f"بر اساس منابع درس، پاسخ سوال شما این است: این یک پاسخ نمونه برای «{request.query}» است. در حالت واقعی، این پاسخ از منابع درس استخراج می‌شود.",
        confidence=0.85,
        model="mock-model",
        provider="mock",
        human_review_required=False,
        sources=[
            RagSource(
                type="lesson",
                id="les_demo_001",
                title="درس نمونه",
                snippet="این یک بخش نمونه از محتوای درس است...",
                relevance_score=0.92,
            )
        ],
    )
