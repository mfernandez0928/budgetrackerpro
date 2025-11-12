import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "../../store/useStore";

export function MonthlyOverviewChart() {
  const { transactions } = useStore();

  // Group transactions by month
  const monthlyData = transactions.reduce((acc: any[], tx) => {
    const date = new Date(tx.date);
    const monthYear = `${date.toLocaleString("default", {
      month: "short",
    })} ${date.getFullYear()}`;

    let monthEntry = acc.find((m) => m.name === monthYear);
    if (!monthEntry) {
      monthEntry = { name: monthYear, income: 0, expenses: 0 };
      acc.push(monthEntry);
    }

    if (tx.amount > 0) {
      monthEntry.income += tx.amount;
    } else {
      monthEntry.expenses += Math.abs(tx.amount);
    }

    return acc;
  }, []);

  // Sort by date
  monthlyData.sort((a, b) => {
    const dateA = new Date(a.name);
    const dateB = new Date(b.name);
    return dateA.getTime() - dateB.getTime();
  });

  // If no data, show empty state
  if (monthlyData.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Monthly Overview
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-16">
          No transaction data available
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Monthly Overview
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Legend />
          <Bar dataKey="expenses" fill="#f87171" radius={[8, 8, 0, 0]} />
          <Bar dataKey="income" fill="#4ade80" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
