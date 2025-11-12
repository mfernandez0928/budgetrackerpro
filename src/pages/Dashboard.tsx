import { MonthlyOverviewChart } from "../components/charts/MonthlyOverviewChart";
import { PieCategoryChart } from "../components/charts/PieCategoryChart";
import CategoryBreakdown from "../components/CategoryBreakdown";
import QuickSummary from "../components/QuickSummary";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Overview of your financial status
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
            <MonthlyOverviewChart />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
            <PieCategoryChart />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 hover:shadow-lg transition-all">
          <CategoryBreakdown />
        </div>

        {/* Quick Summary */}
        <QuickSummary />
      </div>
    </main>
  );
}
