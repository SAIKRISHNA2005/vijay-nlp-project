from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


JobStatus = Literal["uploaded", "queued", "processing", "completed", "failed"]
PipelineStage = Literal[
    "document_reading",
    "spec_extraction",
    "sku_matching",
    "pricing_calculation",
    "proposal_generation",
]


class ApiError(BaseModel):
    code: str
    message: str
    details: dict[str, Any] | None = None


class ApiResponse(BaseModel):
    success: bool = True
    data: dict[str, Any] | None = None
    error: ApiError | None = None


class StageHistoryItem(BaseModel):
    stage: PipelineStage
    status: Literal["pending", "in_progress", "completed", "failed"]
    timestamp: datetime
    message: str


class JobSummary(BaseModel):
    id: str
    filename: str
    status: JobStatus
    progress: int = Field(ge=0, le=100)
    created_at: datetime
    updated_at: datetime
    project_name: str | None = None
    client_name: str | None = None

