import { MonthlyOverviewChart } from "../components/charts/MonthlyOverviewChart";
import { PieCategoryChart } from "../components/charts/PieCategoryChart";
import CategoryBreakdown from "../components/CategoryBreakdown";
import QuickSummary from "../components/QuickSummary";

export default function Dashboard() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7">
        <div className="bg-white rounded-xl shadow p-6">
          <MonthlyOverviewChart />
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <PieCategoryChart />
        </div>
      </div>
      {/* Category Breakdown Table */}
      <div className="bg-white rounded-xl shadow p-6 mb-7">
        <CategoryBreakdown />
      </div>
      {/* Quick Summary Cards */}
      <QuickSummary />
    </main>
  );
}
