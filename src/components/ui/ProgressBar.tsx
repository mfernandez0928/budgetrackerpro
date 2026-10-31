import { clampPercent, progressTone } from "../../lib/ui";

interface ProgressBarProps {
  value: number;
  alertThreshold?: number;
  colorClass?: string;
}

const toneColor = {
  ok: "bg-brand",
  warn: "bg-warn",
  over: "bg-neg",
};

export function ProgressBar({
  value,
  alertThreshold = 0.8,
  colorClass,
}: ProgressBarProps) {
  const percent = clampPercent(value);

  return (
    <div className="h-2 overflow-hidden rounded-full bg-raised">
      <div
        className={`h-full rounded-full transition-all ${colorClass ?? toneColor[progressTone(value, alertThreshold)]}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
