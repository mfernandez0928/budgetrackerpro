import { useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useStore } from "../../store/useStore";
import { formatCurrency, getGoalProgress } from "../../lib/finance";
import { EmptyState } from "../ui/EmptyState";
import { ProgressBar } from "../ui/ProgressBar";
import { SectionHeader } from "../ui/SectionHeader";
import { showToast } from "../Toast";

const palette = ["#0f766e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

export function SavingsGoalsPanel() {
  const { savingsGoals, settings, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } =
    useStore();
  const goalProgress = getGoalProgress(savingsGoals);
  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetMonth: "",
  });

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-line bg-surface p-4 md:p-5">
        <SectionHeader
          eyebrow="Savings"
          title="Goals worth tracking"
          description="A visible target makes saving feel concrete and easier to repeat."
        />
        <form
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.name.trim() || !Number(form.targetAmount)) {
              showToast("Add a goal name and target amount.", "warning");
              return;
            }
            addSavingsGoal({
              name: form.name.trim(),
              targetAmount: Number(form.targetAmount),
              currentAmount: Number(form.currentAmount || 0),
              targetMonth: form.targetMonth,
              color: palette[savingsGoals.length % palette.length],
            });
            showToast("Savings goal added.", "success");
            setForm({ name: "", targetAmount: "", currentAmount: "", targetMonth: "" });
          }}
        >
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Emergency fund, travel, laptop"
            className="rounded-2xl border border-line bg-raised px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-teal-400"
          />
          <input
            inputMode="decimal"
            value={form.targetAmount}
            onChange={(event) =>
              setForm((current) => ({ ...current, targetAmount: event.target.value }))
            }
            placeholder="Target amount"
            className="rounded-2xl border border-line bg-raised px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-teal-400"
          />
          <input
            inputMode="decimal"
            value={form.currentAmount}
            onChange={(event) =>
              setForm((current) => ({ ...current, currentAmount: event.target.value }))
            }
            placeholder="Current saved"
            className="rounded-2xl border border-line bg-raised px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-teal-400"
          />
          <input
            type="month"
            value={form.targetMonth}
            onChange={(event) =>
              setForm((current) => ({ ...current, targetMonth: event.target.value }))
            }
            className="rounded-2xl border border-line bg-raised px-4 py-3 text-sm text-ink outline-none focus:border-teal-400"
          />
          <button
            type="submit"
            className="rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-on-brand transition hover:brightness-110"
          >
            Add goal
          </button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {goalProgress.map((goal) => (
          <article
            key={goal.id}
            className="rounded-3xl border border-line bg-surface/[0.04] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-ink">{goal.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {goal.targetMonth ? `Target ${goal.targetMonth}` : "No target month yet"}
                </p>
              </div>
              <div
                className="h-10 w-10 rounded-2xl"
                style={{ backgroundColor: `${goal.color}33`, border: `1px solid ${goal.color}` }}
              />
            </div>
            <div className="mt-4 space-y-2">
              <ProgressBar value={goal.progress} />
              <div className="flex items-center justify-between text-sm text-muted">
                <span>
                  {formatCurrency(goal.currentAmount, settings.currencyCode)} saved
                </span>
                <span>{Math.round(goal.progress * 100)}%</span>
              </div>
              <p className="text-sm text-muted">
                Remaining {formatCurrency(goal.remaining, settings.currencyCode)}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const rawAmount = window.prompt("Add contribution amount");
                  const amount = Number(rawAmount);
                  if (!amount) return;
                  updateSavingsGoal(goal.id, {
                    currentAmount: goal.currentAmount + amount,
                  });
                  showToast("Goal updated.", "success");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-raised px-3 py-2 text-xs font-semibold text-ink transition hover:bg-raised"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Add progress
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSavingsGoal(goal.id);
                  showToast("Goal removed.", "success");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-neg/30 bg-neg/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-neg/20"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </article>
        ))}
        {!goalProgress.length ? (
          <EmptyState
            title="No savings goals yet"
            description="Start with one named goal like an emergency fund or annual expense so saving feels measurable."
          />
        ) : null}
      </div>
    </section>
  );
}
