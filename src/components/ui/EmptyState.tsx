import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  illustration,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-raised/40 p-6 text-center">
      {illustration ? <div className="mb-3">{illustration}</div> : null}
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-on-brand transition hover:brightness-110"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
