import { Card } from "@/components/ui/card";

export function PricingSummary({
  base,
  gst,
  testing,
  total,
}: {
  base: number;
  gst: number;
  testing: number;
  total: number;
}) {
  const money = (n: number) => `Rs ${n.toLocaleString()}`;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card><p className="text-xs text-slate-400">Base cost</p><p className="text-lg font-semibold">{money(base)}</p></Card>
      <Card><p className="text-xs text-slate-400">GST</p><p className="text-lg font-semibold">{money(gst)}</p></Card>
      <Card><p className="text-xs text-slate-400">Testing cost</p><p className="text-lg font-semibold">{money(testing)}</p></Card>
      <Card className="border-cyan-500/50"><p className="text-xs text-slate-400">Grand total</p><p className="text-lg font-semibold text-cyan-300">{money(total)}</p></Card>
    </div>
  );
}

