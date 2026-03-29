import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-[var(--border)] bg-[#fffaf0] px-3.5 py-2.5 text-sm text-[#1f2937] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none placeholder:text-[#9ca3af] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15",
        props.className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-2xl border border-[var(--border)] bg-[#fffaf0] px-3.5 py-2.5 text-sm text-[#1f2937] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none placeholder:text-[#9ca3af] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15",
        props.className,
      )}
    />
  );
}

