import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PricingSummary } from "@/components/pricing-summary";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { getResult } from "@/lib/api";
import { getLatestJobId } from "@/lib/job";

export function ResultsPage() {
  const jobId = getLatestJobId();
  const { data, isError } = useQuery({
    queryKey: ["result", jobId],
    queryFn: () => getResult(jobId!),
    enabled: !!jobId,
  });

  if (!jobId) return <p>No job selected. Upload and process an RFP first.</p>;
  if (isError) return <p>Result not available yet. Check processing page.</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">
      <Card className="border-[#ddcfbb] bg-gradient-to-r from-[#fff6e8] via-[#fffdf9] to-[#e8f7f4]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d99a7]">Outcome</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#1f2937]">Results</h1>
        <p className="mt-1 text-sm text-[#5b6471]">Review matched SKUs, extracted specifications, and pricing estimates.</p>
      </Card>

      <Card className="border-[#d5c7b4] bg-gradient-to-r from-[#fff9ee] to-[#f7fffd]">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9ca3af]">Recommended SKU</p>
        <p className="mt-1 text-xl font-semibold text-[#1f2937]">{data.sku_recommendation?.sku}</p>
        <p className="text-sm text-[#6b7280]">Match score: {data.sku_recommendation?.combined_score}%</p>
      </Card>
      <Card>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9ca3af]">Alternative SKUs</p>
        {data.sku_alternatives.map((s) => <p key={s.sku} className="text-sm text-[#374151]">{s.sku} - {s.combined_score}%</p>)}
      </Card>
      <DataTable
        headers={["Spec", "Value"]}
        rows={Object.entries(data.specs).map(([k, v]) => [k, String(v ?? "-")])}
      />
      <PricingSummary
        base={data.pricing.material_cost}
        gst={data.pricing.gst_18_percent}
        testing={data.pricing.total_test_cost}
        total={data.pricing.grand_total}
      />
    </motion.div>
  );
}

