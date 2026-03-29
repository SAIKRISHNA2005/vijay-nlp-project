import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[var(--border)] bg-[color:var(--card)]/95 p-5 shadow-[0_12px_30px_-18px_rgba(17,24,39,0.45)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

