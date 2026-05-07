"""Class analysis endpoints: summarize, extract-concepts, generate-quiz, analyze.
Supports mock and external_api modes."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
import json

from app.config import settings

router = APIRouter()


class ClassAnalysisRequest(BaseModel):
    tenant_id: Optional[str] = None
    course_id: Optional[str] = None
    language: str = "fa"
    media_url: Optional[str] = None
    transcript_url: Optional[str] = None
    tasks: list[str] = ["summarize"]
    callback_url: Optional[str] = None


class Concept(BaseModel):
    name: str
    level: str = "intermediate"
    timestamps: list[str] = []


class QuizItem(BaseModel):
    type: str = "multiple_choice"
    question: str
    options: list[str] = []
    answer: str = ""


class ClassAnalysisResponse(BaseModel):
    job_id: str
    status: str = "completed"
    summary: Optional[str] = None
    concepts: list[Concept] = []
    quiz: list[QuizItem] = []
    confidence: float = 0.0
    model: str = "mock-model"
    provider: str = "mock"
    human_review_required: bool = True


# --- Mock responses ---

def _mock_summarize(session_id: str) -> ClassAnalysisResponse:
    return ClassAnalysisResponse(
        job_id=f"sum_{uuid.uuid4().hex[:8]}",
        summary="در این جلسه مفاهیم پایه یادگیری ماشین، overfitting و validation توضیح داده شد. استاد ابتدا تعریف یادگیری ماشین را ارائه داد و سپس به بررسی مسئله بیش‌برازش پرداخت.",
        confidence=0.86,
        human_review_required=True,
    )

def _mock_concepts(session_id: str) -> ClassAnalysisResponse:
    return ClassAnalysisResponse(
        job_id=f"con_{uuid.uuid4().hex[:8]}",
        concepts=[
            Concept(name="Overfitting", level="intermediate", timestamps=["00:12:10", "00:18:40"]),
            Concept(name="Cross-Validation", level="intermediate", timestamps=["00:25:00"]),
            Concept(name="Bias-Variance Tradeoff", level="advanced", timestamps=["00:35:15"]),
        ],
        confidence=0.82,
        human_review_required=True,
    )

def _mock_quiz(session_id: str) -> ClassAnalysisResponse:
    return ClassAnalysisResponse(
        job_id=f"quiz_{uuid.uuid4().hex[:8]}",
        quiz=[
            QuizItem(
                type="multiple_choice",
                question="Overfitting چه زمانی رخ می‌دهد؟",
                options=["وقتی مدل روی داده آموزشی بیش از حد یاد می‌گیرد", "وقتی داده کم است", "وقتی مدل ساده است", "وقتی validation خوب است"],
                answer="وقتی مدل روی داده آموزشی بیش از حد یاد می‌گیرد",
            ),
            QuizItem(
                type="multiple_choice",
                question="Cross-Validation برای چه استفاده می‌شود؟",
                options=["ارزیابی عملکرد مدل", "آموزش مدل", "جمع‌آوری داده", "تنظیم پارامترها"],
                answer="ارزیابی عملکرد مدل",
            ),
        ],
        confidence=0.78,
        human_review_required=True,
    )

def _mock_analyze(session_id: str) -> ClassAnalysisResponse:
    return ClassAnalysisResponse(
        job_id=f"ana_{uuid.uuid4().hex[:8]}",
        summary="تحلیل کامل جلسه انجام شد.",
        concepts=[Concept(name="Machine Learning", level="beginner", timestamps=["00:05:00"])],
        quiz=[QuizItem(type="multiple_choice", question="یادگیری ماشین چیست؟", options=["زیرشاخه هوش مصنوعی", "نوعی پایگاه داده", "زبان برنامه‌نویسی", "سیستم عامل"], answer="زیرشاخه هوش مصنوعی")],
        confidence=0.80,
        human_review_required=True,
    )


# --- OpenRouter responses ---

async def _openrouter_summarize(session_id: str, request: ClassAnalysisRequest) -> ClassAnalysisResponse:
    from app.openrouter_client import openrouter_client
    try:
        result = await openrouter_client.chat_completion(
            messages=[{"role": "user", "content": f"جلسه کلاس آنلاین با شناسه {session_id} را خلاصه کن. خلاصه باید شامل نکات کلیدی، مفاهیم مهم و جمع‌بندی باشد."}],
            system_prompt="تو یک دستیار آموزشی هستی. خلاصه جلسات کلاس را به فارسی و به صورت ساختاریافته ارائه بده.",
            temperature=0.5,
            max_tokens=1024,
        )
        return ClassAnalysisResponse(
            job_id=f"sum_{uuid.uuid4().hex[:8]}",
            summary=result["answer"],
            confidence=result["confidence"],
            model=result["model"],
            provider=result["provider"],
            human_review_required=True,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenRouter call failed: {str(e)}")


async def _openrouter_concepts(session_id: str, request: ClassAnalysisRequest) -> ClassAnalysisResponse:
    from app.openrouter_client import openrouter_client
    try:
        result = await openrouter_client.chat_completion(
            messages=[{"role": "user", "content": f"مفاهیم کلیدی جلسه کلاس {session_id} را استخراج کن. خروجی باید JSON باشد با ساختار: [{{\"name\": \"...\", \"level\": \"beginner|intermediate|advanced\"}}]"}],
            system_prompt="تو یک متخصص تحلیل محتوای آموزشی هستی. مفاهیم را به صورت JSON خروجی بده.",
            temperature=0.3,
        )
        concepts = []
        try:
            parsed = json.loads(result["answer"])
            if isinstance(parsed, list):
                concepts = [Concept(name=c.get("name", ""), level=c.get("level", "intermediate")) for c in parsed]
        except (json.JSONDecodeError, TypeError):
            concepts = [Concept(name=result["answer"][:50], level="intermediate")]

        return ClassAnalysisResponse(
            job_id=f"con_{uuid.uuid4().hex[:8]}",
            concepts=concepts,
            confidence=result["confidence"],
            model=result["model"],
            provider=result["provider"],
            human_review_required=True,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenRouter call failed: {str(e)}")


async def _openrouter_quiz(session_id: str, request: ClassAnalysisRequest) -> ClassAnalysisResponse:
    from app.openrouter_client import openrouter_client
    try:
        result = await openrouter_client.chat_completion(
            messages=[{"role": "user", "content": f"از مطالب جلسه {session_id} ۳ سوال چهارگزینه‌ای بساز. خروجی JSON باشد: [{{\"question\": \"...\", \"options\": [\"...\"], \"answer\": \"...\"}}]"}],
            system_prompt="تو یک طراح آزمون دانشگاهی هستی. سوالات چهارگزینه‌ای به فارسی طراحی کن. خروجی JSON باشد.",
            temperature=0.5,
        )
        quiz = []
        try:
            parsed = json.loads(result["answer"])
            if isinstance(parsed, list):
                quiz = [QuizItem(question=q.get("question", ""), options=q.get("options", []), answer=q.get("answer", "")) for q in parsed]
        except (json.JSONDecodeError, TypeError):
            quiz = []

        return ClassAnalysisResponse(
            job_id=f"quiz_{uuid.uuid4().hex[:8]}",
            quiz=quiz,
            confidence=result["confidence"],
            model=result["model"],
            provider=result["provider"],
            human_review_required=True,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenRouter call failed: {str(e)}")


# --- Routes ---

@router.post("/class-sessions/{session_id}/summarize", response_model=ClassAnalysisResponse)
async def summarize_session(session_id: str, request: ClassAnalysisRequest):
    if settings.ai_mode == "external_api":
        return await _openrouter_summarize(session_id, request)
    return _mock_summarize(session_id)


@router.post("/class-sessions/{session_id}/extract-concepts", response_model=ClassAnalysisResponse)
async def extract_concepts(session_id: str, request: ClassAnalysisRequest):
    if settings.ai_mode == "external_api":
        return await _openrouter_concepts(session_id, request)
    return _mock_concepts(session_id)


@router.post("/class-sessions/{session_id}/generate-quiz", response_model=ClassAnalysisResponse)
async def generate_quiz(session_id: str, request: ClassAnalysisRequest):
    if settings.ai_mode == "external_api":
        return await _openrouter_quiz(session_id, request)
    return _mock_quiz(session_id)


@router.post("/class-sessions/{session_id}/analyze", response_model=ClassAnalysisResponse)
async def analyze_session(session_id: str, request: ClassAnalysisRequest):
    if settings.ai_mode == "external_api":
        # Full analysis: run summarize + concepts + quiz
        summary_resp = await _openrouter_summarize(session_id, request)
        concepts_resp = await _openrouter_concepts(session_id, request)
        quiz_resp = await _openrouter_quiz(session_id, request)
        return ClassAnalysisResponse(
            job_id=f"ana_{uuid.uuid4().hex[:8]}",
            summary=summary_resp.summary,
            concepts=concepts_resp.concepts,
            quiz=quiz_resp.quiz,
            confidence=min(summary_resp.confidence, concepts_resp.confidence, quiz_resp.confidence),
            model=summary_resp.model,
            provider=summary_resp.provider,
            human_review_required=True,
        )
    return _mock_analyze(session_id)
