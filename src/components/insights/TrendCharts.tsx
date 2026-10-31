import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartColors } from "../../hooks/useChartColors";
import { useStore } from "../../store/useStore";
import { formatCurrency, getTrendData } from "../../lib/finance";
import { EmptyState } from "../ui/EmptyState";

export function TrendCharts() {
  const store = useStore();
  const colors = useChartColors();
  const data = getTrendData(store);

  if (!data.some((item) => item.income || item.expenses)) {
    return (
      <EmptyState
        title="Not enough history yet"
        description="Track a few months of activity to unlock trend analysis."
      />
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-surface p-4 md:p-5">
      <div className="mb-4">
        <p className="text-base font-semibold text-ink">Monthly trends</p>
        <p className="text-sm text-muted">
          Compare income and expense movement over the last six months.
        </p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor={colors.pos} stopOpacity={0.4} />
                <stop offset="95%" stopColor={colors.pos} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor={colors.neg} stopOpacity={0.35} />
                <stop offset="95%" stopColor={colors.neg} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={colors.grid} vertical={false} />
            <XAxis dataKey="month" stroke={colors.axis} tickLine={false} axisLine={false} />
            <YAxis
              stroke={colors.axis}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value, store.settings.currencyCode)}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0), store.settings.currencyCode)}
              contentStyle={{
                background: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: "16px",
                color: colors.text,
              }}
              itemStyle={{ color: colors.text }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke={colors.pos}
              strokeWidth={3}
              fill="url(#incomeGradient)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke={colors.neg}
              strokeWidth={3}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
