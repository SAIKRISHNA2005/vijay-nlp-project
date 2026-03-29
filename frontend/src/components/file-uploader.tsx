import { UploadCloud } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FileUploader({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Card className="border-dashed text-center">
      <div className="flex flex-col items-center gap-3 p-4">
        <UploadCloud className="h-8 w-8 text-cyan-300" />
        <p className="text-sm text-slate-300">{file ? file.name : "Drop PDF/TXT file here or pick manually"}</p>
        <input
          ref={ref}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        <Button variant="secondary" onClick={() => ref.current?.click()}>Choose File</Button>
      </div>
    </Card>
  );
}

