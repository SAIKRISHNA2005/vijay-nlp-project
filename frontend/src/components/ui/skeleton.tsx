export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[#efe4d2] ${className ?? ""}`} />;
}

