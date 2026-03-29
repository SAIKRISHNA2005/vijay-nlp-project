export type JobStatus = "uploaded" | "queued" | "processing" | "completed" | "failed";

export type JobSummary = {
  id: string;
  filename: string;
  status: JobStatus;
  progress: number;
  current_stage: string;
  project_name?: string;
  client_name?: string;
  created_at: string;
  updated_at: string;
};

export type StageEvent = {
  stage: string;
  status: string;
  message: string;
  timestamp: string;
};

export type JobStatusPayload = {
  id: string;
  status: JobStatus;
  current_stage: string;
  progress: number;
  timeline: StageEvent[];
  error?: { message: string } | null;
};

export type ResultPayload = {
  specs: Record<string, unknown>;
  sku_recommendation: { sku: string; combined_score: number } | null;
  sku_alternatives: { sku: string; combined_score: number }[];
  pricing: {
    material_cost: number;
    gst_18_percent: number;
    total_test_cost: number;
    grand_total: number;
  };
  proposal: { content: string; metadata: Record<string, unknown> };
};

