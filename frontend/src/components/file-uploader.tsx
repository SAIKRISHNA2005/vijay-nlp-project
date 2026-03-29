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
    <Card className="border-dashed border-[#ddcfbb] bg-[#fffcf6] text-center">
      <div className="flex flex-col items-center gap-3 p-5">
        <UploadCloud className="h-9 w-9 text-[var(--primary)]" />
        <p className="text-sm text-[#374151]">{file ? file.name : "Drop PDF/TXT file here or pick manually"}</p>
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

