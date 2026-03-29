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
          <Card key={step} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {done ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <CircleDashed className="h-4 w-4 text-slate-400" />}
              <span className="text-sm capitalize text-slate-100">{step.replaceAll("_", " ")}</span>
            </div>
            <StatusBadge status={done ? "completed" : active ? "processing" : "pending"} />
          </Card>
        );
      })}
    </div>
  );
}

