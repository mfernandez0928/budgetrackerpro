import type { ReactNode } from "react";

interface ActivityRowProps {
  icon: ReactNode;
  title: string;
  meta: string;
  amount: number;
  formatted: string;
  onClick?: () => void;
}

export function ActivityRow({ icon, title, meta, amount, formatted, onClick }: ActivityRowProps) {
  const amountColor = amount > 0 ? "text-pos" : amount < 0 ? "text-neg" : "text-ink";
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-raised text-muted">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">{title}</span>
        <span className="block truncate text-xs text-muted">{meta}</span>
      </span>
      <span className={`shrink-0 text-sm font-bold ${amountColor}`}>{formatted}</span>
    </>
  );

  const rowClass = "flex min-h-[56px] w-full items-center gap-3 py-2 text-left";

  return onClick ? (
    <button type="button" onClick={onClick} className={`${rowClass} rounded-xl transition hover:bg-raised/60`}>
      {content}
    </button>
  ) : (
    <div className={rowClass}>{content}</div>
  );
}
