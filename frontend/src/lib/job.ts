const KEY = "rfp_latest_job_id";

export function setLatestJobId(jobId: string) {
  localStorage.setItem(KEY, jobId);
}

export function getLatestJobId() {
  return localStorage.getItem(KEY);
}

export function clearLatestJobId() {
  localStorage.removeItem(KEY);
}

