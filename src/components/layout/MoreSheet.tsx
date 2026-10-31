import { ArrowRightOnRectangleIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";
import { useDialogFocus } from "../../hooks/useDialogFocus";
import { NavLink } from "react-router-dom";
import { useSignOut } from "../../hooks/useSignOut";
import { moreNav } from "./navigation";

interface MoreSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MoreSheet({ open, onClose }: MoreSheetProps) {
  const signOut = useSignOut();
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(open, dialogRef, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="More"
        className="absolute inset-x-3 bottom-[calc(96px+env(safe-area-inset-bottom))] rounded-3xl border border-line bg-surface p-2"
      >
        {moreNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex min-h-[52px] items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition ${
                isActive ? "bg-brand/15 text-ink" : "text-ink hover:bg-raised"
              }`
            }
          >
            <item.icon className="h-5 w-5 text-muted" />
            <span className="flex-1">{item.label}</span>
            <ChevronRightIcon className="h-4 w-4 text-muted" />
          </NavLink>
        ))}
        <div className="my-1 border-t border-line" />
        <button
          type="button"
          onClick={async () => {
            onClose();
            await signOut();
          }}
          className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-neg transition hover:bg-neg/10"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </div>
  );
}
