import { MonthlyInsightsPanel } from "../components/dashboard/MonthlyInsightsPanel";
import { UpcomingPaymentsPanel } from "../components/dashboard/UpcomingPaymentsPanel";
import { CategorySpendChart } from "../components/insights/CategorySpendChart";
import { TrendCharts } from "../components/insights/TrendCharts";
import { useStore } from "../store/useStore";
import { formatCurrency, getMonthlyInsightSummary, getMonthlySummary } from "../lib/finance";
import { PageIntro } from "../components/ui/PageIntro";
import { StatCard } from "../components/ui/StatCard";

export default function Insights() {
  const store = useStore();
  const insight = getMonthlyInsightSummary(store);
  const summary = getMonthlySummary(store);

  return (
    <section className="space-y-4 md:space-y-5">
      <PageIntro title="Insights" />
      <div className="grid gap-3 md:grid-cols-3 md:gap-4">
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
          value={String(insight.upcomingPaymentsCount)}
          hint="Payments due in the next 14 days"
          tone={insight.upcomingPaymentsCount ? "warn" : "default"}
        />
      </div>
      <MonthlyInsightsPanel />
      <UpcomingPaymentsPanel />
      <TrendCharts />
      <CategorySpendChart />
    </section>
  );
}
