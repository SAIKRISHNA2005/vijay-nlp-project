import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Modal({
  open,
  title,
  description,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <Card className="w-full max-w-md space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-sm text-slate-300">{description}</div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {onConfirm && <Button onClick={onConfirm}>Confirm</Button>}
        </div>
      </Card>
    </div>
  );
}

