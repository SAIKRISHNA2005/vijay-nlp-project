import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PipelineStepper } from "@/components/pipeline-stepper";
import { Card } from "@/components/ui/card";
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

  if (!jobId) return <p className="text-[#6b7280]">No active job. Upload an RFP first.</p>;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">
      <Card className="border-[#ddcfbb] bg-gradient-to-r from-[#fff6e7] via-[#fffdf7] to-[#e8f7f4]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d99a7]">Pipeline monitor</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#1f2937]">Processing Status</h1>
        <p className="mt-1 text-sm text-[#5b6471]">Current stage: {data?.current_stage?.replaceAll("_", " ") ?? "waiting"}</p>
      </Card>

      <Card>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9ca3af]">Progress</p>
        <Progress value={data?.progress ?? 0} />
      </Card>

      <PipelineStepper currentStage={data?.current_stage ?? "document_reading"} />
      <Card className="border-[#ddcfbb] bg-[#fffaf2]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9ca3af]">Live logs</p>
        <div className="space-y-2 text-sm text-[#374151]">
          {data?.timeline.map((t, idx) => <p key={idx}>[{t.status}] {t.message}</p>)}
        </div>
      </Card>
      {data?.status === "completed" && <Link className="text-[var(--primary)] underline decoration-[#f4a259] underline-offset-4" to="/results">Go to results</Link>}
    </motion.div>
  );
}

