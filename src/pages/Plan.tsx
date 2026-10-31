import {
  BanknotesIcon,
  CalendarDaysIcon,
  ChartPieIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  FlagIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { BrandMark } from "../components/ui/BrandMark";
import { PageIntro } from "../components/ui/PageIntro";
import { PickerSheet } from "../components/ui/PickerSheet";
import { showToast } from "../components/Toast";
import { CATEGORY_TEMPLATES } from "../lib/catalog";
import { formatCurrency, getBudgetUsage, getGoalProgress, getUpcomingPayments } from "../lib/finance";
import { getMonthKey } from "../lib/date";
import { useStore } from "../store/useStore";

type PlanView =
  | "index"
  | "budgets"
  | "goals"
  | "debt"
  | "owed"
  | "payments"
  | "installments";

const planCards: Array<{
  id: PlanView;
  title: string;
  icon: typeof ChartPieIcon;
  color: string;
  description: string;
}> = [
  { id: "budgets", title: "Category budgets", icon: ChartPieIcon, color: "#5e985d", description: "Give each category a spending lane." },
  { id: "goals", title: "Personal goals", icon: FlagIcon, color: "#5e985d", description: "Save toward what matters on purpose." },
  { id: "debt", title: "Debt", icon: CreditCardIcon, color: "#eab308", description: "Keep balances and minimums visible." },
  { id: "owed", title: "Money owed to you", icon: BanknotesIcon, color: "#5e985d", description: "Track receivables and reimbursements." },
  { id: "payments", title: "Planned payments", icon: CalendarDaysIcon, color: "#5e985d", description: "See recurring and one-time due items." },
  { id: "installments", title: "Installments", icon: CreditCardIcon, color: "#5e985d", description: "Keep split purchases from surprising you." },
];

export default function Plan() {
  const store = useStore();
  const [view, setView] = useState<PlanView>("index");
  const [isTemplateSheetOpen, setIsTemplateSheetOpen] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(CATEGORY_TEMPLATES[0].key);
  const [categoryName, setCategoryName] = useState<string>(CATEGORY_TEMPLATES[0].name);
  const [budgetLimit, setBudgetLimit] = useState("249");

  const monthKey = getMonthKey();
  const budgetUsage = getBudgetUsage(store, monthKey);
  const goals = getGoalProgress(store.savingsGoals);
  const upcoming = getUpcomingPayments(store, 30);
  const customCategories = store.categories.filter((category) => category.type === "expense" && category.isCustom);
  const builtinTemplates = CATEGORY_TEMPLATES.filter(
    (template) => !customCategories.some((category) => category.templateKey === template.key)
  );

  const summaryLines = useMemo(
    () => ({
      budgets: `${budgetUsage.length} active budgets`,
      goals: `${store.savingsGoals.length} goals in progress`,
      debt: `${store.debts.length} debts tracked`,
      owed: `${store.moneyOwed.length} receivables tracked`,
      payments: `${store.recurringBills.length} recurring • ${store.plannedPayments.length} one-time planned`,
      installments: store.installments.length ? `${store.installments.length} installment plans` : "Track credit card installment plans",
    }),
    [budgetUsage.length, store.debts.length, store.installments.length, store.moneyOwed.length, store.plannedPayments.length, store.recurringBills.length, store.savingsGoals.length]
  );

  const selectedTemplate = CATEGORY_TEMPLATES.find((template) => template.key === selectedTemplateKey) ?? CATEGORY_TEMPLATES[0];

  const createCategory = () => {
    const existing = store.categories.find((category) => category.templateKey === selectedTemplate.key);
    const finalName = categoryName.trim() || selectedTemplate.name;
    const limit = Number(budgetLimit) || 0;

    if (existing) {
      store.updateCategory(existing.id, {
        name: finalName,
        color: selectedTemplate.color,
        icon: selectedTemplate.icon,
        isCustom: true,
        templateKey: selectedTemplate.key,
      });
      store.upsertBudget({
        month: monthKey,
        categoryId: existing.id,
        limit,
        alertThreshold: 0.8,
      });
      showToast("Category updated.", "success");
    } else {
      store.addCategory({
        name: finalName,
        color: selectedTemplate.color,
        icon: selectedTemplate.icon,
        type: "expense",
        isCustom: true,
        templateKey: selectedTemplate.key,
      });

      const created = useStore
        .getState()
        .categories.find((category) => category.templateKey === selectedTemplate.key);
      if (created) {
        store.upsertBudget({
          month: monthKey,
          categoryId: created.id,
          limit,
          alertThreshold: 0.8,
        });
      }

      showToast("Custom category created.", "success");
    }

    setIsTemplateSheetOpen(false);
  };

  if (view === "index") {
    return (
      <section className="space-y-6">
        <PageIntro title="Plan" description="Manage your budgets, goals, and more." />

        <div className="space-y-4">
          {planCards.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className="flex w-full items-center justify-between rounded-[2rem] bg-white/92 px-5 py-6 text-left shadow-[0_22px_60px_rgba(148,163,184,0.14)] transition hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-[#edf6ee]" style={{ color: item.color }}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[1.15rem] font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-lg text-slate-400">{summaryLines[item.id]}</p>
                </div>
              </div>
              <ChevronRightIcon className="h-7 w-7 text-slate-300" />
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <button
        type="button"
        onClick={() => setView("index")}
        className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-3 text-sm font-semibold text-slate-500 shadow-[0_18px_40px_rgba(148,163,184,0.14)]"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Back to plan
      </button>

      {view === "budgets" ? (
        <section className="space-y-5">
          <div className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
            <button
              type="button"
              onClick={() => setIsTemplateSheetOpen(true)}
              className="flex w-full items-start gap-4 rounded-[1.8rem] bg-white px-4 py-5 text-left"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[#edf6ee] text-[#5e985d]">
                <PencilSquareIcon className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <p className="text-[1.15rem] font-bold text-slate-900">Create a custom category</p>
                <p className="mt-1 text-lg leading-8 text-slate-500">
                  Add a new category on its own screen, then fine-tune its budget and style after it is created.
                </p>
              </div>
              <ChevronRightIcon className="mt-1 h-7 w-7 text-slate-300" />
            </button>
          </div>

          <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
            <p className="text-[2rem] font-black tracking-[-0.05em] text-slate-900">Your custom categories</p>
            <p className="mt-2 max-w-2xl text-[1.05rem] leading-8 text-slate-500">
              Edit or delete the extra categories you created so expense entry only shows the ones you actually want.
            </p>

            <div className="mt-6 space-y-6">
              {customCategories.length ? (
                customCategories.map((category) => {
                  const usage = budgetUsage.find((item) => item.categoryId === category.id);
                  const left = Math.max(0, (usage?.limit ?? 0) - (usage?.spent ?? 0));

                  return (
                    <div key={category.id} className="border-b border-slate-100 pb-6 last:border-b-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <BrandMark label={category.icon} color={category.color} textColor="#ffffff" size="lg" />
                          <div>
                            <p className="text-[1.2rem] font-bold text-slate-900">{category.name}</p>
                            <p className="mt-1 text-xl text-slate-500">
                              {formatCurrency(usage?.spent ?? 0, store.settings.currencyCode)} / {formatCurrency(usage?.limit ?? 0, store.settings.currencyCode)}
                            </p>
                            <p className="mt-2 text-lg text-slate-400">
                              {formatCurrency(left, store.settings.currencyCode)} left this month
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTemplateKey(category.templateKey ?? CATEGORY_TEMPLATES[0].key);
                              setCategoryName(category.name);
                              setBudgetLimit(String(usage?.limit ?? 0));
                              setIsTemplateSheetOpen(true);
                            }}
                            className="text-slate-300 transition hover:text-slate-500"
                          >
                            <PencilSquareIcon className="h-7 w-7" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              store.deleteCategory(category.id);
                              if (usage) store.deleteBudget(usage.id);
                              showToast("Category removed.", "success");
                            }}
                            className="text-rose-400 transition hover:text-rose-500"
                          >
                            <TrashIcon className="h-7 w-7" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-5 h-3 rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full bg-slate-200"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(((usage?.spent ?? 0) / Math.max(usage?.limit ?? 1, 1)) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-[1.6rem] bg-slate-50 px-4 py-5 text-slate-500">
                  Start with one custom category for a recurring service or utility you want to control more tightly.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
            <p className="text-[2rem] font-black tracking-[-0.05em] text-slate-900">Built-in categories</p>
            <p className="mt-2 text-[1.05rem] leading-8 text-slate-500">
              Remove any defaults you do not want cluttering the list, or spin one into a custom budget with its own target.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {builtinTemplates.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateKey(template.key);
                    setCategoryName(template.name);
                    setBudgetLimit("500");
                    setIsTemplateSheetOpen(true);
                  }}
                  className="rounded-[1.7rem] border border-slate-200 bg-white px-3 py-5 text-center"
                >
                  <div className="mx-auto w-fit">
                    <BrandMark label={template.icon} color={template.color} textColor="#ffffff" size="md" />
                  </div>
                  <p className="mt-4 text-xl font-bold text-slate-900">{template.name}</p>
                </button>
              ))}
            </div>
          </section>
        </section>
      ) : null}

      {view === "goals" ? (
        <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <p className="text-[2rem] font-black tracking-[-0.05em] text-slate-900">Personal goals</p>
          <div className="mt-5 space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="rounded-[1.7rem] bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-900">{goal.name}</p>
                    <p className="text-slate-400">
                      {formatCurrency(goal.currentAmount, store.settings.currencyCode)} of {formatCurrency(goal.targetAmount, store.settings.currencyCode)}
                    </p>
                  </div>
                  <p className="font-bold text-[#5e985d]">{Math.round(goal.progress * 100)}%</p>
                </div>
                <div className="mt-4 h-3 rounded-full bg-white">
                  <div className="h-3 rounded-full bg-[#5e985d]" style={{ width: `${Math.min(100, Math.round(goal.progress * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {view === "debt" ? (
        <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <p className="text-[2rem] font-black tracking-[-0.05em] text-slate-900">Debt</p>
          <div className="mt-5 space-y-4">
            {store.debts.map((item) => (
              <div key={item.id} className="rounded-[1.7rem] bg-slate-50 p-4">
                <p className="font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-slate-400">{item.creditor} • Due {item.dueDate}</p>
                <p className="mt-3 text-xl font-bold text-rose-500">
                  {formatCurrency(item.balance, store.settings.currencyCode)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {view === "owed" ? (
        <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <p className="text-[2rem] font-black tracking-[-0.05em] text-slate-900">Money owed to you</p>
          <div className="mt-5 space-y-4">
            {store.moneyOwed.map((item) => (
              <div key={item.id} className="rounded-[1.7rem] bg-slate-50 p-4">
                <p className="font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-slate-400">{item.person} • Due {item.dueDate}</p>
                <p className="mt-3 text-xl font-bold text-[#5e985d]">
                  {formatCurrency(item.amount, store.settings.currencyCode)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {view === "payments" ? (
        <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <p className="text-[2rem] font-black tracking-[-0.05em] text-slate-900">Planned payments</p>
          <div className="mt-5 space-y-4">
            {upcoming.map((item) => (
              <div key={`${item.source}-${item.id}`} className="rounded-[1.7rem] bg-slate-50 p-4">
                <p className="font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-slate-400">{item.note} • {item.dueDate}</p>
                <p className="mt-3 text-xl font-bold text-slate-700">
                  {formatCurrency(item.amount, store.settings.currencyCode)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {view === "installments" ? (
        <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <p className="text-[2rem] font-black tracking-[-0.05em] text-slate-900">Installments</p>
          <div className="mt-5 space-y-4">
            {store.installments.map((item) => (
              <div key={item.id} className="rounded-[1.7rem] bg-slate-50 p-4">
                <p className="font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-slate-400">{item.remainingPayments} payments left • next due {item.nextDueDate}</p>
                <p className="mt-3 text-xl font-bold text-slate-700">
                  {formatCurrency(item.installmentAmount, store.settings.currencyCode)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <PickerSheet
        title="Choose a category"
        open={isTemplateSheetOpen}
        onClose={() => setIsTemplateSheetOpen(false)}
        footer={
          <button
            type="button"
            onClick={createCategory}
            className="w-full rounded-[1.6rem] bg-[#5e985d] px-4 py-4 text-lg font-bold text-white"
          >
            Create category
          </button>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {CATEGORY_TEMPLATES.map((template) => (
              <button
                key={template.key}
                type="button"
                onClick={() => {
                  setSelectedTemplateKey(template.key);
                  setCategoryName(template.name);
                }}
                className={`rounded-[1.7rem] border px-3 py-5 text-center transition ${
                  selectedTemplateKey === template.key
                    ? "border-[#5e985d] bg-[#f3faf3]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="mx-auto w-fit">
                  <BrandMark label={template.icon} color={template.color} textColor="#ffffff" size="md" />
                </div>
                <p className="mt-4 text-xl font-bold text-slate-900">{template.name}</p>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Category name
              </span>
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                className="w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-lg text-slate-900 outline-none focus:border-[#5e985d]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Monthly budget
              </span>
              <input
                value={budgetLimit}
                onChange={(event) => setBudgetLimit(event.target.value)}
                inputMode="decimal"
                className="w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-lg text-slate-900 outline-none focus:border-[#5e985d]"
              />
            </label>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <div className="flex items-center gap-4">
                <BrandMark label={selectedTemplate.icon} color={selectedTemplate.color} textColor="#ffffff" size="md" />
                <div>
                  <p className="font-bold text-slate-900">{categoryName || selectedTemplate.name}</p>
                  <p className="text-slate-400">
                    {formatCurrency(Number(budgetLimit) || 0, store.settings.currencyCode)} monthly budget
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PickerSheet>
    </section>
  );
}
