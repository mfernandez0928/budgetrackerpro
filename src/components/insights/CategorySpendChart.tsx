import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useStore } from "../../store/useStore";
import { formatCurrency, getCategorySpendData } from "../../lib/finance";
import { EmptyState } from "../ui/EmptyState";

export function CategorySpendChart() {
  const store = useStore();
  const data = getCategorySpendData(store);

  if (!data.length) {
    return (
      <EmptyState
        title="No category spend yet"
        description="Your category chart will appear once expenses start coming in."
      />
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
      <div className="mb-4">
        <p className="text-lg font-semibold text-white">Spending by category</p>
        <p className="text-sm text-slate-400">A clean mobile-friendly view of where money goes.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
              >
                {data.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value, store.settings.currencyCode)}
                contentStyle={{
                  background: "#020617",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "20px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {data.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <div>
                  <p className="text-sm font-semibold text-white">{entry.name}</p>
                  <p className="text-xs text-slate-400">{entry.share}% of spending</p>
                </div>
              </div>
              <p className="text-sm text-slate-200">
                {formatCurrency(entry.amount, store.settings.currencyCode)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
