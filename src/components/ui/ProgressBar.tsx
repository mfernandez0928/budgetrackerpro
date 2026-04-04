interface ProgressBarProps {
  value: number;
  colorClass?: string;
}

export function ProgressBar({
  value,
  colorClass = "bg-teal-400",
}: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, Math.round(value * 100)));

  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full transition-all ${colorClass}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
