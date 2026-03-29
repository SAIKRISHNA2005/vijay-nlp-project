import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
          className="rounded-xl bg-[#1f766f] px-3 py-1.5 text-xs font-semibold text-[#f3fffb] transition hover:bg-[#0a5b53]"
          onClick={() => setLatestJobId(job.id)}
        >
          Open
        </button>,
      ]);
  }, [data?.items, query]);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">
      <div className="rounded-3xl border border-[#ddcfbb] bg-gradient-to-r from-[#fff6e8] via-[#fffdf9] to-[#e8f7f4] p-5 shadow-[0_14px_36px_-26px_rgba(17,24,39,0.7)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d99a7]">Archive</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#1f2937]">History</h1>
      </div>
      <Input placeholder="Filter by filename/status/date" value={query} onChange={(e) => setQuery(e.target.value)} />
      <DataTable headers={["File", "Status", "Date", "Action"]} rows={rows} />
    </motion.div>
  );
}

