import { CheckCircle2, CircleDashed } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const steps = [
  "document_reading",
  "spec_extraction",
  "sku_matching",
  "pricing_calculation",
  "proposal_generation",
];

export function PipelineStepper({ currentStage }: { currentStage: string }) {
  const currentIndex = steps.indexOf(currentStage);
  return (
    <div className="grid gap-3">
      {steps.map((step, idx) => {
        const done = idx < currentIndex;
        const active = idx === currentIndex;
        return (
          <Card key={step} className="flex items-center justify-between border-[#eadcc7] bg-[#fffdf8] py-3">
            <div className="flex items-center gap-2">
              {done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <CircleDashed className="h-4 w-4 text-[#9ca3af]" />}
              <span className="text-sm capitalize text-[#1f2937]">{step.replaceAll("_", " ")}</span>
            </div>
            <StatusBadge status={done ? "completed" : active ? "processing" : "pending"} />
          </Card>
        );
      })}
    </div>
  );
}

