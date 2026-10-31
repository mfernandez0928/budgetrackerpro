interface PageIntroProps {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageIntro({ title, eyebrow, description, action }: PageIntroProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-[26px] font-bold tracking-tight text-ink md:text-[30px]">
          {title}
        </h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
