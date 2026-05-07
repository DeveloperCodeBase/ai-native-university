"""Tests for AI Gateway endpoints in mock mode."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestHealth:
    def test_health_endpoint(self):
        response = client.get("/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "ai-gateway"
        assert data["ai_mode"] == "mock"


class TestRAG:
    def test_rag_query_mock(self):
        response = client.post("/v1/rag/query", json={
            "query": "هوش مصنوعی چیست؟",
            "language": "fa",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert len(data["answer"]) > 0
        assert data["confidence"] > 0
        assert data["model"] == "mock-model"
        assert data["provider"] == "mock"
        assert "job_id" in data

    def test_rag_query_with_course_context(self):
        response = client.post("/v1/rag/query", json={
            "query": "Overfitting چیست؟",
            "course_id": "course_123",
            "lesson_id": "lesson_456",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"


class TestClassAnalysis:
    def test_summarize_session(self):
        response = client.post("/v1/class-sessions/session_001/summarize", json={
            "language": "fa",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["summary"] is not None
        assert len(data["summary"]) > 0
        assert data["human_review_required"] is True

    def test_extract_concepts(self):
        response = client.post("/v1/class-sessions/session_001/extract-concepts", json={
            "language": "fa",
        })
        assert response.status_code == 200
        data = response.json()
        assert len(data["concepts"]) > 0
        assert data["human_review_required"] is True

    def test_generate_quiz(self):
        response = client.post("/v1/class-sessions/session_001/generate-quiz", json={
            "language": "fa",
        })
        assert response.status_code == 200
        data = response.json()
        assert len(data["quiz"]) > 0
        for q in data["quiz"]:
            assert "question" in q
            assert len(q["options"]) > 0

    def test_analyze_session(self):
        response = client.post("/v1/class-sessions/session_001/analyze", json={
            "language": "fa",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["summary"] is not None
        assert data["human_review_required"] is True


class TestAssessment:
    def test_grade_draft(self):
        response = client.post("/v1/assessment/grade-draft", json={
            "submission_id": "sub_001",
            "question_text": "Overfitting را تعریف کنید",
            "student_answer": "وقتی مدل بیش از حد روی داده آموزشی یاد می‌گیرد",
            "max_points": 100,
        })
        assert response.status_code == 200
        data = response.json()
        assert 0 <= data["suggested_score"] <= 100
        assert len(data["feedback"]) > 0
        assert data["human_review_required"] is True

    def test_plagiarism_check(self):
        response = client.post("/v1/assessment/plagiarism-similarity", json={
            "submission_id": "sub_001",
            "content": "این یک متن آزمایشی است",
        })
        assert response.status_code == 200
        data = response.json()
        assert 0 <= data["similarity_score"] <= 1


class TestLearner:
    def test_risk_prediction(self):
        response = client.post("/v1/learning-risk/predict", json={
            "user_id": "user_001",
            "course_id": "course_001",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] in ["low", "medium", "high"]
        assert 0 <= data["risk_score"] <= 1
        assert data["human_review_required"] is True

    def test_learner_profile_update(self):
        response = client.post("/v1/learner-profile/update", json={
            "user_id": "user_001",
            "events": [{"type": "lesson_viewed", "lesson_id": "les_001"}],
        })
        assert response.status_code == 200

    def test_recommendations(self):
        response = client.post("/v1/recommendations/next-actions", json={
            "user_id": "user_001",
        })
        assert response.status_code == 200
        data = response.json()
        assert len(data["actions"]) > 0


class TestCorrelationId:
    def test_correlation_id_generated(self):
        response = client.get("/v1/health")
        assert "x-correlation-id" in response.headers

    def test_correlation_id_preserved(self):
        response = client.get("/v1/health", headers={
            "X-Correlation-ID": "test-corr-123",
        })
        assert response.headers["x-correlation-id"] == "test-corr-123"

    def test_process_time_header(self):
        response = client.get("/v1/health")
        assert "x-process-time-ms" in response.headers
