import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { getHistory } from "@/lib/api";
import { setLatestJobId } from "@/lib/job";

export function HistoryPage() {
  const [query, setQuery] = useState("");
  const { data } = useQuery({ queryKey: ["history"], queryFn: getHistory });

  const rows = useMemo(() => {
    const items = data?.items ?? [];
    return items
      .filter((i) => i.filename.toLowerCase().includes(query.toLowerCase()) || i.status.includes(query))
      .map((job) => [
        job.filename,
        <StatusBadge key={`${job.id}-status`} status={job.status} />,
        new Date(job.created_at).toLocaleString(),
        <button
          key={`${job.id}-open`}
          className="rounded-lg bg-slate-800 px-2 py-1 text-xs"
          onClick={() => setLatestJobId(job.id)}
        >
          Open
        </button>,
      ]);
  }, [data?.items, query]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">History</h1>
      <Input placeholder="Filter by filename/status/date" value={query} onChange={(e) => setQuery(e.target.value)} />
      <DataTable headers={["File", "Status", "Date", "Action"]} rows={rows} />
    </div>
  );
}

