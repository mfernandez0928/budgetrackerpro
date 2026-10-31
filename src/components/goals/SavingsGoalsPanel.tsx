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
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
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
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-400"
          />
          <input
            inputMode="decimal"
            value={form.targetAmount}
            onChange={(event) =>
              setForm((current) => ({ ...current, targetAmount: event.target.value }))
            }
            placeholder="Target amount"
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-400"
          />
          <input
            inputMode="decimal"
            value={form.currentAmount}
            onChange={(event) =>
              setForm((current) => ({ ...current, currentAmount: event.target.value }))
            }
            placeholder="Current saved"
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-400"
          />
          <input
            type="month"
            value={form.targetMonth}
            onChange={(event) =>
              setForm((current) => ({ ...current, targetMonth: event.target.value }))
            }
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-teal-400"
          />
          <button
            type="submit"
            className="rounded-2xl bg-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
          >
            Add goal
          </button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {goalProgress.map((goal) => (
          <article
            key={goal.id}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">{goal.name}</p>
                <p className="mt-1 text-sm text-slate-400">
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
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>
                  {formatCurrency(goal.currentAmount, settings.currencyCode)} saved
                </span>
                <span>{Math.round(goal.progress * 100)}%</span>
              </div>
              <p className="text-sm text-slate-400">
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
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
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
                className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/20"
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
