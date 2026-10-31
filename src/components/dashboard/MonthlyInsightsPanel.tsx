import { LightBulbIcon } from "@heroicons/react/24/outline";
import { useStore } from "../../store/useStore";
import { getMonthlyInsightSummary } from "../../lib/finance";

export function MonthlyInsightsPanel() {
  const store = useStore();
  const insight = getMonthlyInsightSummary(store);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2">
        <LightBulbIcon className="h-5 w-5 text-amber-300" />
        <p className="text-lg font-semibold text-white">Monthly insights</p>
      </div>
      <div className="mt-4 space-y-3">
        {insight.insights.map((line) => (
          <div
            key={line}
            className="rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200"
          >
            {line}
          </div>
        ))}
      </div>
    </section>
  );
}
