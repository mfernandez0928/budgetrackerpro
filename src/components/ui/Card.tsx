import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface CardProps {
  title?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Card({ title, action, className = "", children }: CardProps) {
  return (
    <section className={`rounded-3xl border border-line bg-surface p-4 md:p-5 ${className}`}>
      {title || action ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="text-base font-semibold text-ink">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function CardLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-[32px] items-center rounded-full border border-brand/40 px-3 text-xs font-semibold text-brand transition hover:bg-brand/10 focus-visible:bg-brand/10"
    >
      {children}
    </Link>
  );
}
