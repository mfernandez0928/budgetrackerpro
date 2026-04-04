interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mb-4">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300/80">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
    </div>
  );
}
