from __future__ import annotations

import json
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class JobStore:
    def __init__(self, store_path: Path) -> None:
        self.store_path = store_path
        self.store_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        if not self.store_path.exists():
            self._write({"jobs": {}})

    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _read(self) -> dict[str, Any]:
        if not self.store_path.exists():
            return {"jobs": {}}
        with self.store_path.open("r", encoding="utf-8") as f:
            return json.load(f)

    def _write(self, payload: dict[str, Any]) -> None:
        with self.store_path.open("w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)

    def create_job(self, job: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            db = self._read()
            db["jobs"][job["id"]] = job
            self._write(db)
            return job

    def list_jobs(self) -> list[dict[str, Any]]:
        with self._lock:
            db = self._read()
            jobs = list(db["jobs"].values())
            jobs.sort(key=lambda item: item["updated_at"], reverse=True)
            return jobs

    def get_job(self, job_id: str) -> dict[str, Any] | None:
        with self._lock:
            db = self._read()
            return db["jobs"].get(job_id)

    def delete_job(self, job_id: str) -> dict[str, Any] | None:
        with self._lock:
            db = self._read()
            deleted = db["jobs"].pop(job_id, None)
            if deleted is None:
                return None
            self._write(db)
            return deleted

    def update_job(self, job_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        with self._lock:
            db = self._read()
            job = db["jobs"].get(job_id)
            if not job:
                return None
            job.update(updates)
            job["updated_at"] = self._now()
            db["jobs"][job_id] = job
            self._write(db)
            return job

    def append_timeline(
        self,
        job_id: str,
        *,
        stage: str,
        status: str,
        message: str,
    ) -> dict[str, Any] | None:
        with self._lock:
            db = self._read()
            job = db["jobs"].get(job_id)
            if not job:
                return None
            event = {
                "stage": stage,
                "status": status,
                "message": message,
                "timestamp": self._now(),
            }
            job.setdefault("timeline", []).append(event)
            job["updated_at"] = self._now()
            db["jobs"][job_id] = job
            self._write(db)
            return event

