import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DataTable } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { deleteHistoryJob, getHistory } from "@/lib/api";
import { clearLatestJobId, getLatestJobId, setLatestJobId } from "@/lib/job";
import type { JobSummary } from "@/lib/types";
import { toast } from "sonner";

export function HistoryPage() {
  const [query, setQuery] = useState("");
  const [selectedForDelete, setSelectedForDelete] = useState<JobSummary | null>(null);
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["history"], queryFn: getHistory });
  const deleteMutation = useMutation({
    mutationFn: deleteHistoryJob,
    onSuccess: (_data, deletedJobId) => {
      if (getLatestJobId() === deletedJobId) {
        clearLatestJobId();
      }
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["result", deletedJobId] });
      queryClient.invalidateQueries({ queryKey: ["status", deletedJobId] });
      queryClient.invalidateQueries({ queryKey: ["proposal", deletedJobId] });
      setSelectedForDelete(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete history item");
    },
  });

  const rows = useMemo(() => {
    const items = data?.items ?? [];
    return items
      .filter((i) => i.filename.toLowerCase().includes(query.toLowerCase()) || i.status.includes(query))
      .map((job) => [
        job.filename,
        <StatusBadge key={`${job.id}-status`} status={job.status} />,
        new Date(job.created_at).toLocaleString(),
        <div key={`${job.id}-actions`} className="flex items-center gap-2">
          <Button className="px-3 py-1.5 text-xs" onClick={() => setLatestJobId(job.id)}>
            Open
          </Button>
          <Button
            variant="danger"
            className="px-3 py-1.5 text-xs"
            disabled={deleteMutation.isPending}
            onClick={() => setSelectedForDelete(job)}
          >
            Delete
          </Button>
        </div>,
      ]);
  }, [data?.items, deleteMutation, query]);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">
      <div className="rounded-3xl border border-[#ddcfbb] bg-gradient-to-r from-[#fff6e8] via-[#fffdf9] to-[#e8f7f4] p-5 shadow-[0_14px_36px_-26px_rgba(17,24,39,0.7)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d99a7]">Archive</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#1f2937]">History</h1>
      </div>
      <Input placeholder="Filter by filename/status/date" value={query} onChange={(e) => setQuery(e.target.value)} />
      <DataTable headers={["File", "Status", "Date", "Actions"]} rows={rows} />
      <Modal
        open={!!selectedForDelete}
        title="Delete history item?"
        description={
          selectedForDelete ? (
            <div className="space-y-2">
              <p>This action permanently removes this item from history and updates dashboard counts.</p>
              <div className="rounded-xl border border-[#e5d8c6] bg-[#fff9ef] p-3">
                <p><span className="font-semibold text-[#374151]">File:</span> {selectedForDelete.filename}</p>
                <p><span className="font-semibold text-[#374151]">Status:</span> {selectedForDelete.status}</p>
                <p><span className="font-semibold text-[#374151]">Created:</span> {new Date(selectedForDelete.created_at).toLocaleString()}</p>
                {(selectedForDelete.project_name || selectedForDelete.client_name) && (
                  <p>
                    <span className="font-semibold text-[#374151]">Context:</span>{" "}
                    {selectedForDelete.project_name ?? "-"} / {selectedForDelete.client_name ?? "-"}
                  </p>
                )}
              </div>
            </div>
          ) : null
        }
        onClose={() => {
          if (!deleteMutation.isPending) setSelectedForDelete(null);
        }}
        onConfirm={() => {
          if (!selectedForDelete) return;
          deleteMutation.mutate(selectedForDelete.id);
        }}
      />
    </motion.div>
  );
}

