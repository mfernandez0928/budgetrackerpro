import { XMarkIcon } from "@heroicons/react/24/outline";

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/25 backdrop-blur-sm">
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-xl rounded-t-[40px] bg-white px-5 pb-5 pt-3 shadow-[0_-20px_60px_rgba(15,23,42,0.2)]">
        <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-200" />
        <div className="mt-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 max-h-[60vh] overflow-auto pb-2">{children}</div>
        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  );
}
