import { useState } from "react";
import { useStore } from "../../store/useStore";
import { formatCurrency, getBudgetRecommendations, getBudgetUsage } from "../../lib/finance";
import { getMonthKey } from "../../lib/date";
import { ProgressBar } from "../ui/ProgressBar";
import { EmptyState } from "../ui/EmptyState";
import { SectionHeader } from "../ui/SectionHeader";
import { showToast } from "../Toast";

export function BudgetPlanner() {
  const { categories, settings, upsertBudget, budgets } = useStore();
  const expenseCategories = categories.filter((category) => category.type === "expense");
  const budgetUsage = getBudgetUsage(useStore.getState(), getMonthKey());
  const recommendations = getBudgetRecommendations(useStore.getState());
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(
      budgets
        .filter((budget) => budget.month === getMonthKey())
        .map((budget) => [budget.categoryId, String(budget.limit)])
    )
  );

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
      <SectionHeader
        eyebrow="Budget planning"
        title="Category budgets"
        description="Set limits that help you notice pressure before the month runs away."
      />
      {recommendations.length ? (
        <div className="mb-4 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4">
          <p className="text-sm font-semibold text-amber-100">Budget suggestion</p>
          <p className="mt-1 text-sm text-amber-50">
            You have spending in {recommendations.map((item) => item.name).join(", ")} without
            a monthly budget. Start there for the biggest behavior lift.
          </p>
        </div>
      ) : null}
      <div className="space-y-4">
        {expenseCategories.map((category) => {
          const currentBudget = budgetUsage.find((budget) => budget.categoryId === category.id);
          return (
            <div
              key={category.id}
              className="rounded-3xl border border-white/10 bg-slate-950/60 p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-base font-semibold text-white">{category.name}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Spent{" "}
                    {formatCurrency(currentBudget?.spent ?? 0, settings.currencyCode)}
                    {currentBudget
                      ? ` of ${formatCurrency(
                          currentBudget.limit,
                          settings.currencyCode
                        )}`
                      : " this month"}
                  </p>
                  {currentBudget?.status === "over" ? (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">
                      Over budget
                    </p>
                  ) : currentBudget?.status === "watch" ? (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                      Nearing budget limit
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    inputMode="decimal"
                    value={drafts[category.id] ?? ""}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [category.id]: event.target.value,
                      }))
                    }
                    placeholder="Set monthly limit"
                    className="rounded-full border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const limit = Number(drafts[category.id]);
                      if (!limit) {
                        showToast("Enter a budget amount first.", "warning");
                        return;
                      }
                      upsertBudget({
                        month: getMonthKey(),
                        categoryId: category.id,
                        limit,
                        alertThreshold: 0.8,
                      });
                      showToast(`Budget saved for ${category.name}.`, "success");
                    }}
                    className="rounded-full bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
                  >
                    Save budget
                  </button>
                </div>
              </div>
              {currentBudget ? (
                <div className="mt-4 space-y-2">
                  <ProgressBar
                    value={currentBudget.usage}
                    colorClass={
                      currentBudget.status === "over"
                        ? "bg-rose-400"
                        : currentBudget.status === "watch"
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }
                  />
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{Math.round(currentBudget.usage * 100)}% used</span>
                    <span>
                      Remaining{" "}
                      {formatCurrency(currentBudget.remaining, settings.currencyCode)}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
        {!expenseCategories.length ? (
          <EmptyState
            title="No expense categories yet"
            description="Create or import expense categories first, then set one realistic budget to start the habit."
          />
        ) : null}
      </div>
    </section>
  );
}
