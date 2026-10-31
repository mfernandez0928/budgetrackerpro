import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/useStore";
import { getOnboardingChecklist } from "../../lib/finance";
import { ProgressBar } from "../ui/ProgressBar";

export function OnboardingGuide() {
  const store = useStore();
  const navigate = useNavigate();
  const checklist = getOnboardingChecklist(store);

  if (checklist.completed === checklist.total) return null;

  return (
    <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-pos">
        Onboarding
      </p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Finish your money setup</h2>
          <p className="mt-1 text-sm text-muted">
            A few small setup steps make budgets, reminders, and insights much more useful.
          </p>
        </div>
        <span className="rounded-full border border-line bg-raised px-3 py-1 text-sm text-ink">
          {checklist.completed}/{checklist.total}
        </span>
      </div>
      <div className="mt-4">
        <ProgressBar value={checklist.completed / checklist.total} colorClass="bg-brand" />
      </div>
      <div className="mt-4 space-y-3">
        {checklist.steps.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => navigate(step.href)}
            className={`flex w-full items-center justify-between rounded-3xl border px-4 py-3 text-left transition ${
              step.done
                ? "border-pos/30 bg-pos/10"
                : "border-line bg-raised hover:bg-brand/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircleIcon
                className={`h-5 w-5 ${step.done ? "text-pos" : "text-muted"}`}
              />
              <span className={`text-sm ${step.done ? "text-pos" : "text-ink"}`}>
                {step.label}
              </span>
            </div>
            <span className="text-xs uppercase tracking-[0.14em] text-muted">
              {step.done ? "Done" : "Open"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
