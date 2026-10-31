import { ArrowTrendingUpIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BudgetBuddy } from "../components/illustrations/BudgetBuddy";
import { BrandMark } from "../components/ui/BrandMark";
import { EmptyState } from "../components/ui/EmptyState";
import { useStore } from "../store/useStore";
import {
  formatCurrency,
  getGoalProgress,
  getMonthlyInsightSummary,
  getMonthlySummary,
  getUpcomingPayments,
} from "../lib/finance";
import { daysUntil, getTodayISO } from "../lib/date";

function formatHeaderDate() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
    .format(new Date())
    .toUpperCase();
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getCoachLine(lines: string[]) {
  return (
    lines[0] ??
    "You are still shaping the month, so a couple of planned moves now will make the dashboard sharper fast."
  );
}

function getWeekBars(values: number[]) {
  const max = Math.max(...values, 1);
  return values.map((value, index) => ({
    day: ["T", "W", "T", "F", "S", "S", "M"][index] ?? "D",
    height: Math.max(10, Math.round((value / max) * 84)),
    active: index === values.length - 1,
  }));
}

export default function Dashboard() {
  const store = useStore();
  const navigate = useNavigate();
  const monthly = getMonthlySummary(store);
  const monthlyInsights = getMonthlyInsightSummary(store);
  const goals = getGoalProgress(store.savingsGoals);
  const upcoming = getUpcomingPayments(store, 30).slice(0, 4);
  const profileName = store.profile.hasCompletedOnboarding ? "Bryl" : "there";

  const dayValues = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date.toISOString().split("T")[0];
    });

    return dates.map((date) =>
      store.transactions
        .filter((transaction) => transaction.date === date && transaction.type === "expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    );
  }, [store.transactions]);

  const todayTotal = useMemo(
    () =>
      store.transactions
        .filter((transaction) => transaction.date === getTodayISO())
        .reduce(
          (sum, transaction) =>
            sum +
            (transaction.type === "income"
              ? transaction.amount
              : transaction.type === "expense"
              ? -transaction.amount
              : 0),
          0
        ),
    [store.transactions]
  );

  const nextPayday = useMemo(() => {
    const candidates = [
      ...store.recurringBills
        .filter((bill) => bill.type === "income" && bill.isActive)
        .map((bill) => ({ title: bill.title, amount: bill.amount, date: bill.nextDueDate })),
      ...store.plannedPayments
        .filter((payment) => payment.status !== "paid")
        .map((payment) => ({ title: payment.title, amount: payment.amount, date: payment.dueDate })),
    ]
      .filter((item) => new Date(item.date).getTime() >= new Date(getTodayISO()).getTime())
      .sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime());

    return candidates[0];
  }, [store.plannedPayments, store.recurringBills]);

  const groupedUpcoming = {
    income: upcoming.filter((item) => {
      const recurring = store.recurringBills.find((bill) => bill.id === item.id);
      return recurring?.type === "income";
    }),
    expenses: upcoming.filter((item) => {
      const recurring = store.recurringBills.find((bill) => bill.id === item.id);
      return recurring?.type !== "income";
    }),
  };

  const weekBars = getWeekBars(dayValues);

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            {formatHeaderDate()}
          </p>
          <h1 className="mt-2 text-[2.75rem] font-black leading-none tracking-[-0.05em] text-slate-900">
            {getGreeting()}, {profileName}!
          </h1>
        </div>
        <div className="hidden gap-3 sm:flex">
          <button
            type="button"
            onClick={() => navigate("/transactions")}
            className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-white/80 text-[#5e985d] shadow-[0_18px_40px_rgba(148,163,184,0.15)]"
          >
            <CalendarDaysIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-white/80 text-[#5e985d] shadow-[0_18px_40px_rgba(148,163,184,0.15)]"
          >
            <ArrowTrendingUpIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2.25rem] bg-[#5d955d]">
        <div className="flex items-end gap-2 px-4 pt-4">
          <BudgetBuddy mood="wave" />
          <div className="mb-5 flex-1 rounded-[2rem] bg-white/95 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <p className="text-2xl font-black tracking-[-0.04em] text-[#4f8b4f]">Tarsi</p>
            <p className="mt-2 text-lg leading-8 text-slate-500">
              {getCoachLine(monthlyInsights.insights)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Last 7 days
          </p>
          <div className="mt-8 flex h-32 items-end justify-between gap-3">
            {weekBars.map((bar) => (
              <div key={`${bar.day}-${bar.height}`} className="flex flex-1 flex-col items-center gap-3">
                <div
                  className={`w-3 rounded-full ${bar.active ? "bg-[#5e985d]" : "bg-[#c9dec8]"}`}
                  style={{ height: `${bar.height}px` }}
                />
                <span className={`text-sm font-semibold ${bar.active ? "text-slate-900" : "text-slate-400"}`}>
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <p className="text-[2rem] font-black tracking-[-0.05em] text-slate-900">Today</p>
          <p className={`mt-10 text-[2.2rem] font-black tracking-[-0.05em] ${todayTotal >= 0 ? "text-slate-900" : "text-rose-500"}`}>
            {formatCurrency(todayTotal, store.settings.currencyCode)}
          </p>
          <div className="mt-8 inline-flex rounded-full bg-slate-50 p-1">
            {["Day", "Week", "Month"].map((item, index) => (
              <button
                key={item}
                type="button"
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  index === 0 ? "bg-[#5e985d] text-white" : "text-slate-400"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] bg-[linear-gradient(90deg,rgba(232,245,235,0.95),rgba(255,255,255,0.88))] p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#e8f3e8] text-[#5e985d]">
              <ArrowTrendingUpIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5e985d]">
                Days until payday
              </p>
              <p className="mt-1 text-[2.2rem] font-black tracking-[-0.05em] text-slate-900">
                {nextPayday ? `${Math.max(0, daysUntil(nextPayday.date))} days` : "Plan one"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[2rem] font-black tracking-[-0.04em] text-[#5e985d]">
              {nextPayday ? formatCurrency(nextPayday.amount, store.settings.currencyCode) : "--"}
            </p>
            <p className="mt-1 text-xl text-slate-400">
              {nextPayday ? new Date(nextPayday.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "No income planned"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#edf6ee] text-[#5e985d]">
            <CalendarDaysIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[2rem] font-black tracking-[-0.05em] text-slate-900">Upcoming</p>
            <p className="mt-1 text-lg text-slate-400">Planned and recurring money moves</p>
          </div>
        </div>

        {upcoming.length ? (
          <div className="mt-8 space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5e985d]">
                Income
              </p>
              <div className="mt-4 space-y-3">
                {groupedUpcoming.income.length ? (
                  groupedUpcoming.income.map((item) => (
                    <div key={`${item.source}-${item.id}`} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <BrandMark label="IN" color="#7cf24b" size="md" />
                        <div>
                          <p className="text-[1.05rem] font-bold text-slate-900">{item.title}</p>
                          <p className="text-lg text-slate-400">
                            {new Date(item.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <p className="text-[1.2rem] font-black text-[#5e985d]">
                        {formatCurrency(item.amount, store.settings.currencyCode)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-[1.5rem] bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    No income scheduled yet. Add one from History or Plan.
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-400">
                Expenses
              </p>
              <div className="mt-4 space-y-3">
                {groupedUpcoming.expenses.map((item, index) => (
                  <div
                    key={`${item.source}-${item.id}`}
                    className={`flex items-center justify-between gap-4 rounded-[1.7rem] px-3 py-3 ${
                      index === 0 ? "bg-rose-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <BrandMark
                        label={item.title.slice(0, 2).toUpperCase()}
                        color={index === 0 ? "#111111" : "#eef2f7"}
                        textColor={index === 0 ? "#ef4444" : "#475569"}
                        size="md"
                      />
                      <div>
                        <p className="text-[1.05rem] font-bold text-slate-900">{item.title}</p>
                        <p className="text-lg text-slate-400">
                          {new Date(item.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {index === 0 ? (
                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-rose-400">
                          {item.dueInDays <= 0 ? "Due now" : `${item.dueInDays} days left`}
                        </p>
                      ) : null}
                      <p className="text-[1.2rem] font-black text-slate-500">
                        {formatCurrency(item.amount, store.settings.currencyCode)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="Nothing upcoming yet"
              description="Recurring bills, debt payments, and planned payments will land here once you start planning the month."
              actionLabel="Open plan"
              onAction={() => navigate("/plan")}
            />
          </div>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-[2rem] bg-white/90 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Balance</p>
          <p className="mt-3 text-[2.1rem] font-black tracking-[-0.05em] text-slate-900">
            {formatCurrency(monthly.balance, store.settings.currencyCode)}
          </p>
        </section>
        <section className="rounded-[2rem] bg-white/90 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Budget health</p>
          <p className="mt-3 text-[2.1rem] font-black tracking-[-0.05em] text-slate-900">
            {monthly.planned ? `${Math.round((monthly.spentAgainstBudget / monthly.planned) * 100)}%` : "Set up"}
          </p>
        </section>
        <section className="rounded-[2rem] bg-white/90 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Goals in motion</p>
          <p className="mt-3 text-[2.1rem] font-black tracking-[-0.05em] text-slate-900">
            {goals.length}
          </p>
        </section>
      </div>
    </section>
  );
}
