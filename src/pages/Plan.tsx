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
import { useMainCurrencyView } from "../hooks/useFxRates";

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
  { id: "budgets", title: "Category budgets", icon: ChartPieIcon, color: "rgb(var(--brand))", description: "Give each category a spending lane." },
  { id: "goals", title: "Personal goals", icon: FlagIcon, color: "rgb(var(--brand))", description: "Save toward what matters on purpose." },
  { id: "debt", title: "Debt", icon: CreditCardIcon, color: "#eab308", description: "Keep balances and minimums visible." },
  { id: "owed", title: "Money owed to you", icon: BanknotesIcon, color: "rgb(var(--brand))", description: "Track receivables and reimbursements." },
  { id: "payments", title: "Planned payments", icon: CalendarDaysIcon, color: "rgb(var(--brand))", description: "See recurring and one-time due items." },
  { id: "installments", title: "Installments", icon: CreditCardIcon, color: "rgb(var(--brand))", description: "Keep split purchases from surprising you." },
];

export default function Plan() {
  const store = useStore();
  const [view, setView] = useState<PlanView>("index");
  const [isTemplateSheetOpen, setIsTemplateSheetOpen] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(CATEGORY_TEMPLATES[0].key);
  const [categoryName, setCategoryName] = useState<string>(CATEGORY_TEMPLATES[0].name);
  const [budgetLimit, setBudgetLimit] = useState("249");

  const monthKey = getMonthKey();
  const mainView = useMainCurrencyView();
  const budgetUsage = getBudgetUsage(mainView, monthKey);
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
      <section className="space-y-4 md:space-y-5">
        <PageIntro title="Plan" description="Manage your budgets, goals, and more." />

        <div className="grid gap-3 md:grid-cols-2">
          {planCards.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className="flex min-h-[88px] w-full items-center justify-between gap-3 rounded-3xl border border-line bg-surface px-4 py-4 text-left transition hover:border-brand/40 hover:bg-raised/40"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-raised" style={{ color: item.color }}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-muted">{summaryLines[item.id]}</p>
                </div>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-muted" />
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 md:space-y-5">
      <button
        type="button"
        onClick={() => setView("index")}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-muted transition hover:bg-raised hover:text-ink"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Back to plan
      </button>

      {view === "budgets" ? (
        <section className="space-y-5">
          <div className="rounded-3xl border border-line bg-surface p-4 md:p-5">
            <button
              type="button"
              onClick={() => setIsTemplateSheetOpen(true)}
              className="flex w-full items-start gap-4 rounded-2xl bg-surface px-4 py-5 text-left"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                <PencilSquareIcon className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Create a custom category</p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Add a new category on its own screen, then fine-tune its budget and style after it is created.
                </p>
              </div>
              <ChevronRightIcon className="mt-1 h-5 w-5 text-muted" />
            </button>
          </div>

          <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
            <p className="text-xl font-bold tracking-tight text-ink">Your custom categories</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Edit or delete the extra categories you created so expense entry only shows the ones you actually want.
            </p>

            <div className="mt-6 space-y-6">
              {customCategories.length ? (
                customCategories.map((category) => {
                  const usage = budgetUsage.find((item) => item.categoryId === category.id);
                  const left = Math.max(0, (usage?.limit ?? 0) - (usage?.spent ?? 0));

                  return (
                    <div key={category.id} className="border-b border-line pb-6 last:border-b-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <BrandMark label={category.icon} color={category.color} textColor="#ffffff" size="lg" />
                          <div>
                            <p className="text-sm font-semibold text-ink">{category.name}</p>
                            <p className="mt-1 text-xl text-muted">
                              {formatCurrency(usage?.spent ?? 0, store.settings.currencyCode)} / {formatCurrency(usage?.limit ?? 0, store.settings.currencyCode)}
                            </p>
                            <p className="mt-2 text-sm text-muted">
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
                            className="text-muted transition hover:text-muted"
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
                            className="text-neg transition hover:text-neg"
                          >
                            <TrashIcon className="h-7 w-7" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-5 h-3 rounded-full bg-raised">
                        <div
                          className="h-2 rounded-full bg-raised"
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
                <p className="rounded-2xl bg-raised px-4 py-5 text-muted">
                  Start with one custom category for a recurring service or utility you want to control more tightly.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
            <p className="text-xl font-bold tracking-tight text-ink">Built-in categories</p>
            <p className="mt-2 text-sm leading-6 text-muted">
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
                  className="rounded-2xl border border-line bg-surface px-3 py-5 text-center"
                >
                  <div className="mx-auto w-fit">
                    <BrandMark label={template.icon} color={template.color} textColor="#ffffff" size="md" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-ink">{template.name}</p>
                </button>
              ))}
            </div>
          </section>
        </section>
      ) : null}

      {view === "goals" ? (
        <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
          <p className="text-xl font-bold tracking-tight text-ink">Personal goals</p>
          <div className="mt-5 space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="rounded-2xl bg-raised p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-ink">{goal.name}</p>
                    <p className="text-muted">
                      {formatCurrency(goal.currentAmount, store.settings.currencyCode)} of {formatCurrency(goal.targetAmount, store.settings.currencyCode)}
                    </p>
                  </div>
                  <p className="font-bold text-brand">{Math.round(goal.progress * 100)}%</p>
                </div>
                <div className="mt-4 h-3 rounded-full bg-surface">
                  <div className="h-3 rounded-full bg-brand" style={{ width: `${Math.min(100, Math.round(goal.progress * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {view === "debt" ? (
        <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
          <p className="text-xl font-bold tracking-tight text-ink">Debt</p>
          <div className="mt-5 space-y-4">
            {store.debts.map((item) => (
              <div key={item.id} className="rounded-2xl bg-raised p-4">
                <p className="font-bold text-ink">{item.title}</p>
                <p className="mt-1 text-muted">{item.creditor} • Due {item.dueDate}</p>
                <p className="mt-3 text-xl font-bold text-neg">
                  {formatCurrency(item.balance, store.settings.currencyCode)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {view === "owed" ? (
        <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
          <p className="text-xl font-bold tracking-tight text-ink">Money owed to you</p>
          <div className="mt-5 space-y-4">
            {store.moneyOwed.map((item) => (
              <div key={item.id} className="rounded-2xl bg-raised p-4">
                <p className="font-bold text-ink">{item.title}</p>
                <p className="mt-1 text-muted">{item.person} • Due {item.dueDate}</p>
                <p className="mt-3 text-xl font-bold text-brand">
                  {formatCurrency(item.amount, store.settings.currencyCode)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {view === "payments" ? (
        <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
          <p className="text-xl font-bold tracking-tight text-ink">Planned payments</p>
          <div className="mt-5 space-y-4">
            {upcoming.map((item) => (
              <div key={`${item.source}-${item.id}`} className="rounded-2xl bg-raised p-4">
                <p className="font-bold text-ink">{item.title}</p>
                <p className="mt-1 text-muted">{item.note} • {item.dueDate}</p>
                <p className="mt-3 text-lg font-bold text-ink">
                  {formatCurrency(item.amount, store.settings.currencyCode)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {view === "installments" ? (
        <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
          <p className="text-xl font-bold tracking-tight text-ink">Installments</p>
          <div className="mt-5 space-y-4">
            {store.installments.map((item) => (
              <div key={item.id} className="rounded-2xl bg-raised p-4">
                <p className="font-bold text-ink">{item.title}</p>
                <p className="mt-1 text-muted">{item.remainingPayments} payments left • next due {item.nextDueDate}</p>
                <p className="mt-3 text-lg font-bold text-ink">
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
            className="w-full min-h-[48px] rounded-2xl bg-brand px-4 text-sm font-bold text-on-brand"
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
                className={`rounded-2xl border px-3 py-5 text-center transition ${
                  selectedTemplateKey === template.key
                    ? "border-brand bg-brand/15"
                    : "border-line bg-surface"
                }`}
              >
                <div className="mx-auto w-fit">
                  <BrandMark label={template.icon} color={template.color} textColor="#ffffff" size="md" />
                </div>
                <p className="mt-4 text-sm font-semibold text-ink">{template.name}</p>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Category name
              </span>
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-line bg-raised px-4 text-base text-ink outline-none focus:border-brand"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Monthly budget
              </span>
              <input
                value={budgetLimit}
                onChange={(event) => setBudgetLimit(event.target.value)}
                inputMode="decimal"
                className="min-h-[48px] w-full rounded-2xl border border-line bg-raised px-4 text-base text-ink outline-none focus:border-brand"
              />
            </label>
            <div className="rounded-2xl bg-raised p-4">
              <div className="flex items-center gap-4">
                <BrandMark label={selectedTemplate.icon} color={selectedTemplate.color} textColor="#ffffff" size="md" />
                <div>
                  <p className="font-bold text-ink">{categoryName || selectedTemplate.name}</p>
                  <p className="text-muted">
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
