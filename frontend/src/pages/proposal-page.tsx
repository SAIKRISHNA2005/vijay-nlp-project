import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">
      <Card className="border-[#ddcfbb] bg-gradient-to-r from-[#fff6e8] via-[#fffdf9] to-[#e8f7f4]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d99a7]">Drafting</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#1f2937]">Proposal Preview</h1>
      </Card>
      <Card className="whitespace-pre-wrap bg-[#fffaf2] text-sm leading-7 text-[#374151]">{content || "Proposal not ready yet."}</Card>
      <Card className="bg-[#fffdf8]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9ca3af]">Edit before export (optional)</p>
        <Textarea rows={10} value={content} onChange={(e) => setEdited(e.target.value)} />
      </Card>
      <div className="flex gap-2">
        <Button onClick={onCopy}>Copy</Button>
        <Button variant="secondary" onClick={onDownload}>Download</Button>
      </div>
    </motion.div>
  );
}

