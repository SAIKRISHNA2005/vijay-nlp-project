import { useQuery } from "@tanstack/react-query";
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
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Results</h1>
      <Card>
        <p className="text-sm text-slate-400">Recommended SKU</p>
        <p className="text-lg font-semibold">{data.sku_recommendation?.sku}</p>
        <p className="text-sm text-slate-400">Match score: {data.sku_recommendation?.combined_score}%</p>
      </Card>
      <Card>
        <p className="mb-2 text-sm text-slate-400">Alternative SKUs</p>
        {data.sku_alternatives.map((s) => <p key={s.sku} className="text-sm">{s.sku} - {s.combined_score}%</p>)}
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
    </div>
  );
}

