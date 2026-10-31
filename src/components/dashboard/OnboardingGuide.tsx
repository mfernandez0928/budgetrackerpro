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
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-200/80">
        Onboarding
      </p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Finish your money setup</h2>
          <p className="mt-1 text-sm text-slate-400">
            A few small setup steps make budgets, reminders, and insights much more useful.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-sm text-slate-200">
          {checklist.completed}/{checklist.total}
        </span>
      </div>
      <div className="mt-4">
        <ProgressBar value={checklist.completed / checklist.total} />
      </div>
      <div className="mt-4 space-y-3">
        {checklist.steps.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => navigate(step.href)}
            className={`flex w-full items-center justify-between rounded-3xl border px-4 py-3 text-left transition ${
              step.done
                ? "border-emerald-400/20 bg-emerald-400/10"
                : "border-white/10 bg-slate-950/60 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircleIcon
                className={`h-5 w-5 ${step.done ? "text-emerald-300" : "text-slate-600"}`}
              />
              <span className={`text-sm ${step.done ? "text-emerald-100" : "text-white"}`}>
                {step.label}
              </span>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {step.done ? "Done" : "Open"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
