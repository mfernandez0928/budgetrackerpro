import {
  MonthlyOverviewChart,
  PieCategoryChart,
} from "../components/charts/Charts";
import CategoryBreakdown from "../components/CategoryBreakdown";
import QuickSummary from "../components/QuickSummary";

const Dashboard = () => (
  <main className="p-8 max-w-6xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-7">
      <div className="bg-white p-5 rounded-xl shadow">
        <MonthlyOverviewChart />
      </div>
      <div className="bg-white p-5 rounded-xl shadow">
        <PieCategoryChart />
      </div>
    </div>
    <div className="mb-7">
      <CategoryBreakdown />
    </div>
    <QuickSummary />
  </main>
);
export default Dashboard;
