import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useStore } from "../../store/useStore";

export function PieCategoryChart() {
  const { getCategoryBreakdown } = useStore();
  const pieData = getCategoryBreakdown();

  if (pieData.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Spending by Category
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-16">
          No spending data available
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Spending by Category
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="amount"
            nameKey="name"
            cx="40%"
            cy="50%"
            outerRadius={80}
            label={(entry) => `${entry.percent}%`}
          >
            {pieData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Legend layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
