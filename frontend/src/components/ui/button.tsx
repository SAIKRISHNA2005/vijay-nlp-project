import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-[var(--primary-contrast)] shadow-[0_10px_24px_-14px_rgba(8,126,139,0.9)] hover:-translate-y-0.5 hover:bg-[#06606a]",
        secondary: "bg-[#efe4d2] text-[#3c3125] hover:bg-[#e7d8c3]",
        ghost: "bg-transparent text-[#334155] hover:bg-[#efe4d2]/70",
        danger: "bg-[#c94b4b] text-white hover:bg-[#aa3a3a]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, ...props }: Props) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}

