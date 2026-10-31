interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "good" | "warn" | "danger";
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: StatCardProps) {
  const toneMap = {
    default: "border-line bg-surface",
    good: "border-pos/30 bg-pos/10",
    warn: "border-warn/30 bg-warn/10",
    danger: "border-neg/30 bg-neg/10",
  };

  return (
    <div className={`rounded-3xl border p-4 ${toneMap[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 truncate text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}
