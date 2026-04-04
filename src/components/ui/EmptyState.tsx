interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-700/70 bg-slate-950/40 p-6 text-center">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
