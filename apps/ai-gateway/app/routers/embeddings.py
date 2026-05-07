"""Embeddings batch endpoint."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter()


class EmbeddingBatchRequest(BaseModel):
    tenant_id: Optional[str] = None
    texts: list[str]
    model: str = "text-embedding-3-small"


class EmbeddingBatchResponse(BaseModel):
    job_id: str
    status: str = "completed"
    embeddings: list[list[float]] = []
    model: str = "mock-model"
    provider: str = "mock"
    dimensions: int = 0


@router.post("/embeddings/batch", response_model=EmbeddingBatchResponse)
async def create_embeddings(request: EmbeddingBatchRequest):
    # Mock: return dummy 4-dimensional embeddings
    mock_embeddings = [[0.1, 0.2, 0.3, 0.4] for _ in request.texts]
    return EmbeddingBatchResponse(
        job_id=f"emb_{uuid.uuid4().hex[:8]}",
        status="completed",
        embeddings=mock_embeddings,
        dimensions=4,
    )
