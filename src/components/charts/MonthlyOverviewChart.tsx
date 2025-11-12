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
    const monthYear = `${date.toLocaleString("default", { month: "short" })}`;

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
          <Tooltip />
          <Legend />
          <Bar dataKey="expenses" fill="#f87171" radius={[8, 8, 0, 0]} />
          <Bar dataKey="income" fill="#4ade80" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
