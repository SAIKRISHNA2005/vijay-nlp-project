import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getHistory } from "@/lib/api";

export function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["history"], queryFn: getHistory });
  const latest = data?.items[0];
  const totalRuns = data?.items.length ?? 0;
  const completedRuns = data?.items.filter((j) => j.status === "completed").length ?? 0;
  const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">
      <Card className="relative overflow-hidden border-[#dbccb7] bg-gradient-to-br from-[#fff8ea] via-[#fffdf7] to-[#e9f8f5]">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#f4a259]/25 blur-xl" />
        <div className="shine-pill absolute right-4 top-4 rounded-full bg-[#1f766f]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1f766f]">
          Live workspace
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d99a7]">Overview</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#1f2937]">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#5b6471]">
          Track recent RFP processing activity, check pipeline health, and jump directly into your next action.
        </p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-[0.12em] text-[#9ca3af]">Total runs</p>
          <p className="mt-2 text-3xl font-semibold text-[#111827]">{totalRuns || "-"}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.12em] text-[#9ca3af]">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-[#111827]">{completedRuns || "-"}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.12em] text-[#9ca3af]">Latest status</p>
          <p className="mt-2 text-3xl font-semibold capitalize text-[#111827]">{latest?.status ?? "-"}</p>
          <p className="mt-1 text-xs text-[#6b7280]">Success rate: {successRate}%</p>
        </Card>
      </div>

      <Card>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#9ca3af]">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          <Link className="rounded-2xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-contrast)] transition hover:bg-[#06606a]" to="/upload">Upload RFP</Link>
          <Link className="rounded-2xl bg-[#efe4d2] px-4 py-2 text-sm font-semibold text-[#3f3426] transition hover:bg-[#e4d4bd]" to="/results">View Latest Result</Link>
          <Link className="rounded-2xl bg-[#efe4d2] px-4 py-2 text-sm font-semibold text-[#3f3426] transition hover:bg-[#e4d4bd]" to="/history">View History</Link>
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#9ca3af]">Recent runs</p>
        <div className="space-y-2">
          {isLoading && <Skeleton className="h-14" />}
          {data?.items.slice(0, 5).map((job) => (
            <div key={job.id} className="rounded-2xl border border-[#e8dbc8] bg-[#fffaf2] p-3 text-sm">
              <p className="font-medium text-[#1f2937]">{job.filename}</p>
              <p className="text-[#6b7280]">{job.status} - {job.progress}%</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

