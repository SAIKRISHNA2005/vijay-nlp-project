import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getHistory } from "@/lib/api";

export function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["history"], queryFn: getHistory });
  const latest = data?.items[0];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><p className="text-xs text-slate-400">Total runs</p><p className="text-2xl font-semibold">{data?.items.length ?? "-"}</p></Card>
        <Card><p className="text-xs text-slate-400">Completed</p><p className="text-2xl font-semibold">{data?.items.filter((j) => j.status === "completed").length ?? "-"}</p></Card>
        <Card><p className="text-xs text-slate-400">Latest status</p><p className="text-2xl font-semibold capitalize">{latest?.status ?? "-"}</p></Card>
      </div>
      <Card>
        <p className="mb-3 text-sm text-slate-400">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          <Link className="rounded-xl bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950" to="/upload">Upload RFP</Link>
          <Link className="rounded-xl bg-slate-800 px-3 py-2 text-sm" to="/results">View Latest Result</Link>
          <Link className="rounded-xl bg-slate-800 px-3 py-2 text-sm" to="/history">View History</Link>
        </div>
      </Card>
      <Card>
        <p className="mb-3 text-sm text-slate-400">Recent runs</p>
        <div className="space-y-2">
          {isLoading && <Skeleton className="h-14" />}
          {data?.items.slice(0, 5).map((job) => (
            <div key={job.id} className="rounded-xl border border-slate-800 p-3 text-sm">
              <p className="font-medium">{job.filename}</p>
              <p className="text-slate-400">{job.status} - {job.progress}%</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

