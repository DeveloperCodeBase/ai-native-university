"""RAG query endpoint. Supports mock and external_api modes."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid

from app.config import settings

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


def _mock_response(request: RagQueryRequest) -> RagQueryResponse:
    """Return mock RAG response for development/testing."""
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


async def _openrouter_response(request: RagQueryRequest) -> RagQueryResponse:
    """Call OpenRouter for real AI-powered RAG response."""
    from app.openrouter_client import openrouter_client

    system_prompt = """تو یک دستیار آموزشی هوشمند دانشگاه آنلاین هستی. 
به زبان فارسی و با لحن علمی اما صمیمی پاسخ بده.
اگر از پاسخ مطمئن نیستی، صادقانه بگو.
پاسخ‌ها باید دقیق، مفید و مرتبط با سوال باشند."""

    if request.course_id:
        system_prompt += f"\nدرس فعلی: {request.course_id}"
    if request.lesson_id:
        system_prompt += f"\nدرسنامه فعلی: {request.lesson_id}"

    messages = [{"role": "user", "content": request.query}]

    try:
        result = await openrouter_client.chat_completion(
            messages=messages,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=1024,
        )

        return RagQueryResponse(
            job_id=f"rag_{uuid.uuid4().hex[:8]}",
            status="completed",
            answer=result["answer"],
            confidence=result["confidence"],
            model=result["model"],
            provider=result["provider"],
            human_review_required=False,
            sources=[],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenRouter call failed: {str(e)}")


@router.post("/rag/query", response_model=RagQueryResponse)
async def rag_query(request: RagQueryRequest):
    """RAG-based query endpoint. Uses mock or OpenRouter based on AI_MODE."""
    if settings.ai_mode == "external_api":
        return await _openrouter_response(request)
    return _mock_response(request)
