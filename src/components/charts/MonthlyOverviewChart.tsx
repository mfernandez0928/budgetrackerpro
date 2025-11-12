import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const data = [
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
      <h2 className="font-semibold text-base mb-4">Monthly Overview</h2>
      <BarChart width={430} height={220} data={data}>
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
