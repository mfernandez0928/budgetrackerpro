import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const barData = [
  { name: "Jan", income: 3500, expenses: 3000 },
  { name: "Feb", income: 3700, expenses: 3200 },
  { name: "Mar", income: 4100, expenses: 3400 },
  { name: "Apr", income: 3800, expenses: 3200 },
  { name: "May", income: 3900, expenses: 3600 },
  { name: "Jun", income: 4200, expenses: 3300 },
];

export function MonthlyOverviewChart() {
  return (
    <>
      <h2 className="font-bold mb-2">Monthly Overview</h2>
      <BarChart width={430} height={220} data={barData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="income" fill="#4ade80" />
        <Bar dataKey="expenses" fill="#f87171" />
      </BarChart>
    </>
  );
}

const pieData = [
  { name: "Housing", value: 1200, color: "#3b82f6" },
  { name: "Food", value: 800, color: "#fbbf24" },
  { name: "Transportation", value: 400, color: "#a78bfa" },
  { name: "Utilities", value: 300, color: "#f472b6" },
  { name: "Entertainment", value: 400, color: "#ef4444" },
  { name: "Healthcare", value: 200, color: "#06b6d4" },
  { name: "Other", value: 100, color: "#6b7280" },
];

export function PieCategoryChart() {
  return (
    <>
      <h2 className="font-bold mb-2">Spending by Category</h2>
      <PieChart width={280} height={220}>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {pieData.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
      <ul className="text-xs mt-2 grid grid-cols-2 gap-x-5">
        {pieData.map((item) => (
          <li key={item.name} className="flex items-center gap-2">
            <span
              style={{ background: item.color }}
              className="h-3 w-3 inline-block rounded-sm"
            />
            {item.name}
          </li>
        ))}
      </ul>
    </>
  );
}
