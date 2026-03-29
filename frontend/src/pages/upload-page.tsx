import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { analyzeRfp, uploadRfp, uploadRfpText } from "@/lib/api";
import { setLatestJobId } from "@/lib/job";

export function UploadPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [pastedContent, setPastedContent] = useState("");
  const [project, setProject] = useState("");
  const [client, setClient] = useState("");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      let uploaded: { job_id: string; status: string };
      if (mode === "file") {
        if (!file) throw new Error("Please select a file");
        const fd = new FormData();
        fd.append("file", file);
        fd.append("project_name", project);
        fd.append("client_name", client);
        fd.append("notes", notes);
        uploaded = await uploadRfp(fd);
      } else {
        if (!pastedContent.trim()) throw new Error("Please paste RFP content");
        uploaded = await uploadRfpText({
          content: pastedContent,
          filename: "pasted_rfp.txt",
          project_name: project,
          client_name: client,
          notes,
        });
      }
      await analyzeRfp(uploaded.job_id);
      return uploaded.job_id;
    },
    onSuccess: (jobId) => {
      setLatestJobId(jobId);
      toast.success("RFP uploaded and analysis started");
      navigate("/processing");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Upload RFP</h1>
      <div className="flex gap-2">
        <Button variant={mode === "file" ? "default" : "secondary"} onClick={() => setMode("file")}>Upload PDF/TXT</Button>
        <Button variant={mode === "text" ? "default" : "secondary"} onClick={() => setMode("text")}>Paste Content</Button>
      </div>
      {mode === "file" ? (
        <FileUploader file={file} onChange={setFile} />
      ) : (
        <Card>
          <Textarea
            placeholder="Paste full RFP content here..."
            rows={12}
            value={pastedContent}
            onChange={(e) => setPastedContent(e.target.value)}
          />
        </Card>
      )}
      <Card className="grid gap-3">
        <Input placeholder="Project name (optional)" value={project} onChange={(e) => setProject(e.target.value)} />
        <Input placeholder="Client name (optional)" value={client} onChange={(e) => setClient(e.target.value)} />
        <Textarea placeholder="Notes (optional)" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Submitting..." : "Submit and Start Processing"}
        </Button>
      </Card>
    </div>
  );
}

