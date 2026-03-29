import type { JobStatusPayload, JobSummary, ResultPayload } from "./types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8002";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
};

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!json.success) {
    throw new Error(json.error?.message ?? "Request failed");
  }
  return json.data;
}

export async function uploadRfp(formData: FormData) {
  return req<{ job_id: string; status: string }>("/rfp/upload", {
    method: "POST",
    body: formData,
  });
}

export async function uploadRfpText(payload: {
  content: string;
  filename?: string;
  project_name?: string;
  client_name?: string;
  notes?: string;
}) {
  return req<{ job_id: string; status: string }>("/rfp/upload-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function analyzeRfp(job_id: string) {
  return req<{ tracking_id: string; status: string }>("/rfp/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id }),
  });
}

export async function getStatus(job_id: string) {
  return req<JobStatusPayload>(`/rfp/status/${job_id}`);
}

export async function getResult(job_id: string) {
  return req<ResultPayload>(`/rfp/result/${job_id}`);
}

export async function getProposal(job_id: string) {
  return req<{ content: string; metadata: Record<string, unknown> }>(`/rfp/proposal/${job_id}`);
}

export async function getHistory() {
  return req<{ items: JobSummary[] }>("/rfp/history");
}

