import { BoltIcon, CreditCardIcon, SparklesIcon, WalletIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import {
  formatCurrency,
  getAccountBalances,
  getGoalProgress,
  getMonthlyInsightSummary,
  getMonthlySummary,
  getRecentTransactions,
  getUpcomingBills,
} from "../lib/finance";
import { StatCard } from "../components/ui/StatCard";
import { ProgressBar } from "../components/ui/ProgressBar";
import { EmptyState } from "../components/ui/EmptyState";

export default function Dashboard() {
  const store = useStore();
  const navigate = useNavigate();
  const summary = getMonthlySummary(store);
  const insight = getMonthlyInsightSummary(store);
  const accountBalances = getAccountBalances(store);
  const recentTransactions = getRecentTransactions(store.transactions, 5);
  const upcomingBills = getUpcomingBills(store.recurringBills, 7);
  const goals = getGoalProgress(store.savingsGoals).slice(0, 3);

  if (!store.profile.hasCompletedOnboarding && store.transactions.length === 0) {
    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-teal-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_rgba(15,23,42,0.92)_55%)] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-200/80">
            Start strong
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Build the habit, not just the ledger
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            Set up the basics and your dashboard becomes immediately useful, not just decorative.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => navigate("/transactions")}
              className="rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
            >
              <CreditCardIcon className="h-8 w-8 text-teal-300" />
              <p className="mt-3 text-base font-semibold text-white">Add your first transaction</p>
            </button>
            <button
              type="button"
              onClick={() => navigate("/planning")}
              className="rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
            >
              <BoltIcon className="h-8 w-8 text-amber-300" />
              <p className="mt-3 text-base font-semibold text-white">Set category budgets</p>
            </button>
            <button
              type="button"
              onClick={() => navigate("/goals")}
              className="rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
            >
              <SparklesIcon className="h-8 w-8 text-sky-300" />
              <p className="mt-3 text-base font-semibold text-white">Create a savings goal</p>
            </button>
          </div>
          <button
            type="button"
            onClick={() => store.completeOnboarding()}
            className="mt-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Dismiss onboarding
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_rgba(15,23,42,0.96)_60%)] p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-200/80">
              This month
            </p>
            <h2 className="mt-2 text-4xl font-semibold text-white">
              {formatCurrency(summary.balance, store.settings.currencyCode)}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              {summary.budgetHealth === "healthy"
                ? "You are spending within plan and building healthy buffer."
                : summary.budgetHealth === "watch"
                ? "Budget pressure is rising. Check bills and flexible categories."
                : summary.budgetHealth === "over"
                ? "You are past your planned budget. Cut a category or rebalance this week."
                : "Set category budgets to turn this from tracking into active planning."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Income"
              value={formatCurrency(summary.income, store.settings.currencyCode)}
              hint="Money coming in this month"
              tone="good"
            />
            <StatCard
              label="Expenses"
              value={formatCurrency(summary.expenses, store.settings.currencyCode)}
              hint="Money going out this month"
              tone={summary.expenses > summary.income ? "danger" : "warn"}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Budget status"
          value={
            summary.planned
              ? `${Math.round((summary.spentAgainstBudget / summary.planned) * 100)}% used`
              : "Not set"
          }
          hint={
            summary.planned
              ? `${formatCurrency(
                  summary.spentAgainstBudget,
                  store.settings.currencyCode
                )} spent of ${formatCurrency(summary.planned, store.settings.currencyCode)}`
              : "Set category budgets in Planning"
          }
          tone={
            summary.budgetHealth === "over"
              ? "danger"
              : summary.budgetHealth === "watch"
              ? "warn"
              : "default"
          }
        />
        <StatCard
          label="Savings rate"
          value={`${Math.round(summary.savingsRate)}%`}
          hint="Income left after expenses"
          tone={summary.savingsRate >= 20 ? "good" : "default"}
        />
        <StatCard
          label="Upcoming bills"
          value={String(upcomingBills.length)}
          hint="Due in the next 7 days"
          tone={upcomingBills.length ? "warn" : "default"}
        />
        <StatCard
          label="Top category"
          value={insight.topCategory?.name ?? "No data"}
          hint={
            insight.topCategory
              ? formatCurrency(insight.topCategory.amount, store.settings.currencyCode)
              : "Add expenses to see insights"
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-white">Recent transactions</p>
              <p className="text-sm text-slate-400">
                Your latest activity across all accounts and categories.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/transactions")}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View all
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-white">{transaction.title}</p>
                  <p className="text-sm text-slate-400">{transaction.date}</p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    transaction.type === "income"
                      ? "text-emerald-300"
                      : transaction.type === "expense"
                      ? "text-rose-300"
                      : "text-sky-300"
                  }`}
                >
                  {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}
                  {formatCurrency(transaction.amount, store.settings.currencyCode)}
                </p>
              </div>
            ))}
            {!recentTransactions.length ? (
              <EmptyState
                title="No transactions yet"
                description="Add your first income or expense to activate the dashboard."
                actionLabel="Add transaction"
                onAction={() => navigate("/transactions")}
              />
            ) : null}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2">
              <WalletIcon className="h-5 w-5 text-teal-300" />
              <p className="text-lg font-semibold text-white">Wallet balances</p>
            </div>
            <div className="mt-4 space-y-3">
              {accountBalances.map((account) => (
                <div
                  key={account.id}
                  className="rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{account.name}</p>
                      <p className="text-sm capitalize text-slate-400">{account.type}</p>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(account.balance, store.settings.currencyCode)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
            <p className="text-lg font-semibold text-white">Savings momentum</p>
            <div className="mt-4 space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{goal.name}</p>
                      <p className="text-sm text-slate-400">
                        {formatCurrency(goal.currentAmount, store.settings.currencyCode)} saved
                      </p>
                    </div>
                    <p className="text-sm text-slate-300">
                      {Math.round(goal.progress * 100)}%
                    </p>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={goal.progress} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
