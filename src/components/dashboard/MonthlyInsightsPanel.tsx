import { LightBulbIcon } from "@heroicons/react/24/outline";
import { useStore } from "../../store/useStore";
import { getMonthlyInsightSummary } from "../../lib/finance";

export function MonthlyInsightsPanel() {
  const store = useStore();
  const insight = getMonthlyInsightSummary(store);

  return (
    <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
      <div className="flex items-center gap-2">
        <LightBulbIcon className="h-5 w-5 text-warn" />
        <p className="text-base font-semibold text-ink">Monthly insights</p>
      </div>
      <div className="mt-4 space-y-3">
        {insight.insights.map((line) => (
          <div
            key={line}
            className="rounded-3xl border border-line bg-raised px-4 py-3 text-sm text-ink"
          >
            {line}
          </div>
        ))}
      </div>
    </section>
  );
}
