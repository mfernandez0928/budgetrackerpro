import { CategorySpendChart } from "../components/insights/CategorySpendChart";
import { TrendCharts } from "../components/insights/TrendCharts";
import { useStore } from "../store/useStore";
import { formatCurrency, getMonthlyInsightSummary, getMonthlySummary } from "../lib/finance";
import { StatCard } from "../components/ui/StatCard";

export default function Insights() {
  const store = useStore();
  const insight = getMonthlyInsightSummary(store);
  const summary = getMonthlySummary(store);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Savings rate"
          value={`${Math.round(summary.savingsRate)}%`}
          hint="Income left after expenses this month"
          tone={summary.savingsRate >= 20 ? "good" : "default"}
        />
        <StatCard
          label="Top category"
          value={insight.topCategory?.name ?? "No data yet"}
          hint={
            insight.topCategory
              ? formatCurrency(insight.topCategory.amount, store.settings.currencyCode)
              : "Track more expenses to unlock this"
          }
        />
        <StatCard
          label="Due soon"
          value={String(insight.upcomingBillsCount)}
          hint="Recurring bills in the next 14 days"
          tone={insight.upcomingBillsCount ? "warn" : "default"}
        />
      </div>
      <TrendCharts />
      <CategorySpendChart />
    </section>
  );
}
