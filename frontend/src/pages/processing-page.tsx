import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PipelineStepper } from "@/components/pipeline-stepper";
import { Progress } from "@/components/ui/progress";
import { getStatus } from "@/lib/api";
import { getLatestJobId } from "@/lib/job";

export function ProcessingPage() {
  const jobId = getLatestJobId();
  const { data } = useQuery({
    queryKey: ["status", jobId],
    queryFn: () => getStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: 2000,
  });

  if (!jobId) return <p className="text-slate-300">No active job. Upload an RFP first.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Processing Status</h1>
      <Progress value={data?.progress ?? 0} />
      <p className="text-sm text-slate-400">Current stage: {data?.current_stage?.replaceAll("_", " ")}</p>
      <PipelineStepper currentStage={data?.current_stage ?? "document_reading"} />
      <div className="rounded-2xl border border-slate-800 p-4">
        <p className="mb-2 text-sm text-slate-400">Live logs</p>
        <div className="space-y-2 text-sm">
          {data?.timeline.map((t, idx) => <p key={idx}>[{t.status}] {t.message}</p>)}
        </div>
      </div>
      {data?.status === "completed" && <Link className="text-cyan-300 underline" to="/results">Go to results</Link>}
    </div>
  );
}

