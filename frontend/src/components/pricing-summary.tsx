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
      <Card><p className="text-xs uppercase tracking-[0.12em] text-[#9ca3af]">Base cost</p><p className="text-lg font-semibold text-[#1f2937]">{money(base)}</p></Card>
      <Card><p className="text-xs uppercase tracking-[0.12em] text-[#9ca3af]">GST</p><p className="text-lg font-semibold text-[#1f2937]">{money(gst)}</p></Card>
      <Card><p className="text-xs uppercase tracking-[0.12em] text-[#9ca3af]">Testing cost</p><p className="text-lg font-semibold text-[#1f2937]">{money(testing)}</p></Card>
      <Card className="border-[#87b2ae] bg-[#ecf7f5]"><p className="text-xs uppercase tracking-[0.12em] text-[#6b7280]">Grand total</p><p className="text-lg font-semibold text-[var(--primary)]">{money(total)}</p></Card>
    </div>
  );
}

