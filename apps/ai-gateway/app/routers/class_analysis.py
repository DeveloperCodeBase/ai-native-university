"""Class analysis endpoints: summarize, extract-concepts, generate-quiz, analyze."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import uuid

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


@router.post("/class-sessions/{session_id}/summarize", response_model=ClassAnalysisResponse)
async def summarize_session(session_id: str, request: ClassAnalysisRequest):
    return ClassAnalysisResponse(
        job_id=f"sum_{uuid.uuid4().hex[:8]}",
        status="completed",
        summary="در این جلسه مفاهیم پایه یادگیری ماشین، overfitting و validation توضیح داده شد. استاد ابتدا تعریف یادگیری ماشین را ارائه داد و سپس به بررسی مسئله بیش‌برازش پرداخت.",
        confidence=0.86,
        human_review_required=True,
    )


@router.post("/class-sessions/{session_id}/extract-concepts", response_model=ClassAnalysisResponse)
async def extract_concepts(session_id: str, request: ClassAnalysisRequest):
    return ClassAnalysisResponse(
        job_id=f"con_{uuid.uuid4().hex[:8]}",
        status="completed",
        concepts=[
            Concept(name="Overfitting", level="intermediate", timestamps=["00:12:10", "00:18:40"]),
            Concept(name="Cross-Validation", level="intermediate", timestamps=["00:25:00"]),
            Concept(name="Bias-Variance Tradeoff", level="advanced", timestamps=["00:35:15"]),
        ],
        confidence=0.82,
        human_review_required=True,
    )


@router.post("/class-sessions/{session_id}/generate-quiz", response_model=ClassAnalysisResponse)
async def generate_quiz(session_id: str, request: ClassAnalysisRequest):
    return ClassAnalysisResponse(
        job_id=f"quiz_{uuid.uuid4().hex[:8]}",
        status="completed",
        quiz=[
            QuizItem(
                type="multiple_choice",
                question="Overfitting چه زمانی رخ می‌دهد؟",
                options=[
                    "وقتی مدل روی داده آموزشی بیش از حد یاد می‌گیرد",
                    "وقتی داده کم است",
                    "وقتی مدل ساده است",
                    "وقتی validation خوب است",
                ],
                answer="وقتی مدل روی داده آموزشی بیش از حد یاد می‌گیرد",
            ),
            QuizItem(
                type="multiple_choice",
                question="Cross-Validation برای چه استفاده می‌شود؟",
                options=[
                    "ارزیابی عملکرد مدل",
                    "آموزش مدل",
                    "جمع‌آوری داده",
                    "تنظیم پارامترها",
                ],
                answer="ارزیابی عملکرد مدل",
            ),
        ],
        confidence=0.78,
        human_review_required=True,
    )


@router.post("/class-sessions/{session_id}/analyze", response_model=ClassAnalysisResponse)
async def analyze_session(session_id: str, request: ClassAnalysisRequest):
    return ClassAnalysisResponse(
        job_id=f"ana_{uuid.uuid4().hex[:8]}",
        status="completed",
        summary="تحلیل کامل جلسه انجام شد.",
        concepts=[
            Concept(name="Machine Learning", level="beginner", timestamps=["00:05:00"]),
        ],
        quiz=[
            QuizItem(
                type="multiple_choice",
                question="یادگیری ماشین چیست؟",
                options=["زیرشاخه هوش مصنوعی", "نوعی پایگاه داده", "زبان برنامه‌نویسی", "سیستم عامل"],
                answer="زیرشاخه هوش مصنوعی",
            ),
        ],
        confidence=0.80,
        human_review_required=True,
    )
