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
    default: "border-white/10 bg-white/5",
    good: "border-emerald-500/30 bg-emerald-500/10",
    warn: "border-amber-500/30 bg-amber-500/10",
    danger: "border-rose-500/30 bg-rose-500/10",
  };

  return (
    <div className={`rounded-3xl border p-4 ${toneMap[tone]}`}>
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
