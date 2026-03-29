import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: HTMLAttributes<HTMLSpanElement> & { status: string }) {
  const tone =
    status === "completed"
      ? "bg-emerald-500/20 text-emerald-300"
      : status === "failed"
        ? "bg-red-500/20 text-red-300"
        : "bg-amber-500/20 text-amber-300";
  return (
    <span className={cn("rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide", tone, className)}>
      {status}
    </span>
  );
}

