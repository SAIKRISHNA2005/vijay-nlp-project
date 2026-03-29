import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: HTMLAttributes<HTMLSpanElement> & { status: string }) {
  const tone =
    status === "completed"
      ? "bg-emerald-100 text-emerald-700"
      : status === "failed"
        ? "bg-rose-100 text-rose-700"
        : "bg-amber-100 text-amber-700";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
        tone,
        className,
      )}
    >
      {status}
    </span>
  );
}

