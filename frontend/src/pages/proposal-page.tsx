import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { getProposal } from "@/lib/api";
import { getLatestJobId } from "@/lib/job";

export function ProposalPage() {
  const jobId = getLatestJobId();
  const { data } = useQuery({
    queryKey: ["proposal", jobId],
    queryFn: () => getProposal(jobId!),
    enabled: !!jobId,
  });
  const [edited, setEdited] = useState("");
  const content = edited || data?.content || "";

  const onCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Proposal copied");
  };
  const onDownload = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "proposal.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!jobId) return <p>No job selected.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Proposal Preview</h1>
      <Card className="whitespace-pre-wrap text-sm leading-6">{content || "Proposal not ready yet."}</Card>
      <Card>
        <p className="mb-2 text-sm text-slate-400">Edit before export (optional)</p>
        <Textarea rows={10} value={content} onChange={(e) => setEdited(e.target.value)} />
      </Card>
      <div className="flex gap-2">
        <Button onClick={onCopy}>Copy</Button>
        <Button variant="secondary" onClick={onDownload}>Download</Button>
      </div>
    </div>
  );
}

