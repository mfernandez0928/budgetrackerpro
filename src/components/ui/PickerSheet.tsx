import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";
import { useDialogFocus } from "../../hooks/useDialogFocus";

interface PickerSheetProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function PickerSheet({
  title,
  open,
  onClose,
  children,
  footer,
}: PickerSheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(open, dialogRef, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="pb-safe absolute inset-x-0 bottom-0 mx-auto max-w-xl rounded-t-[32px] border border-line bg-surface px-5 pt-3"
      >
        <div className="mx-auto h-1.5 w-12 rounded-full bg-raised" />
        <div className="mt-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-raised text-muted"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 max-h-[60vh] overflow-auto pb-2">{children}</div>
        <div className="pb-5">{footer ? <div className="mt-4">{footer}</div> : null}</div>
      </div>
    </div>
  );
}
