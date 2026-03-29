from __future__ import annotations

import asyncio
import shutil
import sys
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .pipeline import format_pipeline_error, run_pipeline
from .storage import JobStore


ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

BACKEND_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BACKEND_DIR / "data" / "uploads"
JOBS_DIR = BACKEND_DIR / "data" / "jobs"
JOBS_DB = JOBS_DIR / "jobs.json"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
JOBS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="RFP Automation API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

store = JobStore(JOBS_DB)
executor = ThreadPoolExecutor(max_workers=2)


def api_ok(data: dict[str, Any]) -> dict[str, Any]:
    return {"success": True, "data": data, "error": None}


def api_error(code: str, message: str, details: dict[str, Any] | None = None) -> dict[str, Any]:
    return {"success": False, "data": None, "error": {"code": code, "message": message, "details": details}}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def require_job(job_id: str) -> dict[str, Any]:
    job = store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=api_error("NOT_FOUND", f"Job '{job_id}' not found"))
    return job


def run_job(job_id: str) -> None:
    job = store.get_job(job_id)
    if not job:
        return

    store.update_job(
        job_id,
        {
            "status": "processing",
            "current_stage": "document_reading",
            "progress": 2,
            "started_at": now_iso(),
        },
    )

    def stage_logger(stage: str, status: str, message: str, progress: int) -> None:
        store.update_job(job_id, {"current_stage": stage, "progress": progress})
        store.append_timeline(job_id, stage=stage, status=status, message=message)

    try:
        result = run_pipeline(job["file_path"], stage_logger)
        store.update_job(
            job_id,
            {
                "status": "completed",
                "progress": 100,
                "result": result,
                "finished_at": now_iso(),
                "error": None,
            },
        )
    except Exception as exc:
        store.update_job(
            job_id,
            {
                "status": "failed",
                "progress": 100,
                "finished_at": now_iso(),
                "error": format_pipeline_error(exc),
            },
        )
        store.append_timeline(
            job_id,
            stage=job.get("current_stage") or "document_reading",
            status="failed",
            message=str(exc),
        )


@app.get("/health")
def health() -> dict[str, Any]:
    return api_ok({"status": "healthy"})


@app.post("/rfp/upload")
async def upload_rfp(
    file: UploadFile = File(...),
    project_name: str | None = Form(default=None),
    client_name: str | None = Form(default=None),
    notes: str | None = Form(default=None),
) -> dict[str, Any]:
    allowed = {".pdf", ".txt"}
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in allowed:
        return api_error("INVALID_FILE_TYPE", "Only PDF and TXT files are accepted", {"filename": file.filename})

    job_id = str(uuid.uuid4())
    saved_name = f"{job_id}{suffix}"
    save_path = UPLOAD_DIR / saved_name

    with save_path.open("wb") as out:
        shutil.copyfileobj(file.file, out)

    base_job = {
        "id": job_id,
        "filename": file.filename,
        "file_path": str(save_path),
        "metadata": {
            "project_name": project_name,
            "client_name": client_name,
            "notes": notes,
        },
        "status": "uploaded",
        "current_stage": "document_reading",
        "progress": 0,
        "timeline": [],
        "result": None,
        "error": None,
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    store.create_job(base_job)
    store.append_timeline(job_id, stage="document_reading", status="pending", message="File uploaded")
    return api_ok({"job_id": job_id, "status": "uploaded"})


@app.post("/rfp/upload-text")
async def upload_rfp_text(payload: dict[str, str | None]) -> dict[str, Any]:
    content = (payload.get("content") or "").strip()
    if not content:
        return api_error("VALIDATION_ERROR", "content is required")

    job_id = str(uuid.uuid4())
    save_path = UPLOAD_DIR / f"{job_id}.txt"
    save_path.write_text(content, encoding="utf-8")

    base_job = {
        "id": job_id,
        "filename": payload.get("filename") or f"pasted_{job_id[:8]}.txt",
        "file_path": str(save_path),
        "metadata": {
            "project_name": payload.get("project_name"),
            "client_name": payload.get("client_name"),
            "notes": payload.get("notes"),
            "source": "pasted_text",
        },
        "status": "uploaded",
        "current_stage": "document_reading",
        "progress": 0,
        "timeline": [],
        "result": None,
        "error": None,
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    store.create_job(base_job)
    store.append_timeline(job_id, stage="document_reading", status="pending", message="Text content uploaded")
    return api_ok({"job_id": job_id, "status": "uploaded"})


@app.post("/rfp/analyze")
def analyze_rfp(payload: dict[str, str]) -> dict[str, Any]:
    job_id = payload.get("job_id")
    if not job_id:
        return api_error("VALIDATION_ERROR", "job_id is required")

    job = require_job(job_id)
    if job["status"] in {"processing", "queued"}:
        return api_ok({"job_id": job_id, "tracking_id": job_id, "status": job["status"]})

    store.update_job(job_id, {"status": "queued", "progress": 1})
    store.append_timeline(job_id, stage="document_reading", status="pending", message="Job queued")
    executor.submit(run_job, job_id)
    return api_ok({"job_id": job_id, "tracking_id": job_id, "status": "queued"})


@app.get("/rfp/status/{job_id}")
def get_status(job_id: str) -> dict[str, Any]:
    job = require_job(job_id)
    return api_ok(
        {
            "id": job["id"],
            "status": job["status"],
            "current_stage": job["current_stage"],
            "progress": job["progress"],
            "timeline": job.get("timeline", []),
            "created_at": job["created_at"],
            "updated_at": job["updated_at"],
            "started_at": job.get("started_at"),
            "finished_at": job.get("finished_at"),
            "error": job.get("error"),
        }
    )


@app.get("/rfp/result/{job_id}")
def get_result(job_id: str) -> dict[str, Any]:
    job = require_job(job_id)
    if job["status"] != "completed":
        return api_error("RESULT_NOT_READY", "Pipeline result is not available yet", {"status": job["status"]})
    return api_ok(job["result"])


@app.get("/rfp/proposal/{job_id}")
def get_proposal(job_id: str) -> dict[str, Any]:
    job = require_job(job_id)
    if job["status"] != "completed":
        return api_error("PROPOSAL_NOT_READY", "Proposal is not available yet", {"status": job["status"]})
    return api_ok(job["result"]["proposal"])


@app.get("/rfp/history")
def get_history() -> dict[str, Any]:
    jobs = store.list_jobs()
    rows = []
    for item in jobs:
        rows.append(
            {
                "id": item["id"],
                "filename": item["filename"],
                "status": item["status"],
                "progress": item["progress"],
                "current_stage": item.get("current_stage"),
                "project_name": item.get("metadata", {}).get("project_name"),
                "client_name": item.get("metadata", {}).get("client_name"),
                "created_at": item["created_at"],
                "updated_at": item["updated_at"],
            }
        )
    return api_ok({"items": rows})


@app.delete("/rfp/history/{job_id}")
def delete_history_job(job_id: str) -> dict[str, Any]:
    job = require_job(job_id)
    if job["status"] in {"queued", "processing"}:
        return api_error("JOB_BUSY", "Cannot delete a job while it is queued or processing")

    deleted_upload = False
    file_path = Path(job.get("file_path") or "")
    if file_path.exists() and file_path.is_file():
        file_path.unlink(missing_ok=True)
        deleted_upload = True

    deleted = store.delete_job(job_id)
    if deleted is None:
        return api_error("NOT_FOUND", f"Job '{job_id}' not found")

    return api_ok({"id": job_id, "deleted": True, "deleted_upload": deleted_upload})


@app.get("/rfp/stream/{job_id}")
async def stream_status(job_id: str) -> StreamingResponse:
    _ = require_job(job_id)

    async def event_gen():
        previous_count = -1
        while True:
            job = store.get_job(job_id)
            if not job:
                break
            timeline = job.get("timeline", [])
            if len(timeline) != previous_count:
                payload = {
                    "id": job["id"],
                    "status": job["status"],
                    "progress": job["progress"],
                    "current_stage": job["current_stage"],
                    "timeline": timeline,
                    "error": job.get("error"),
                }
                yield f"data: {payload}\n\n"
                previous_count = len(timeline)
            if job["status"] in {"completed", "failed"}:
                break
            await asyncio.sleep(1.5)

    return StreamingResponse(event_gen(), media_type="text/event-stream")

