import { PieChart, Pie, Cell } from "recharts";

const pieData = [
  { name: "Housing", value: 1200, color: "#3b82f6" },
  { name: "Food", value: 800, color: "#6ee7b7" },
  { name: "Transportation", value: 400, color: "#fde68a" },
  { name: "Utilities", value: 300, color: "#fbbf24" },
  { name: "Entertainment", value: 400, color: "#f472b6" },
  { name: "Healthcare", value: 200, color: "#06b6d4" },
  { name: "Other", value: 100, color: "#d1d5db" },
];

export function PieCategoryChart() {
  return (
    <div className="flex items-center">
      <PieChart width={220} height={220}>
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
      <div className="ml-4 flex flex-col gap-2 text-xs">
        {pieData.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2">
            <span
              style={{ background: cat.color }}
              className="inline-block w-3 h-3 mr-2 rounded"
            ></span>
            <span>{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
