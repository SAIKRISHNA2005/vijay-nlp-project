export function Progress({ value }: { value: number }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-[#e8dcc8]">
      <div
        className="h-3 rounded-full bg-gradient-to-r from-[#f4a259] via-[#2fa38f] to-[var(--primary)] transition-all duration-300"
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}

