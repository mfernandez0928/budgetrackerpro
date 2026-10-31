import { useMemo, useState } from "react";
import { BellAlertIcon, CheckCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useStore } from "../../store/useStore";
import { formatCurrency, getUpcomingBills } from "../../lib/finance";
import { getTodayISO } from "../../lib/date";
import { EmptyState } from "../ui/EmptyState";
import { SectionHeader } from "../ui/SectionHeader";
import { showToast } from "../Toast";

export function RecurringBillsPanel() {
  const {
    recurringBills,
    categories,
    accounts,
    settings,
    addRecurringBill,
    markRecurringBillPaid,
    deleteRecurringBill,
  } = useStore();
  const expenseCategories = categories.filter((category) => category.type === "expense");
  const upcomingBills = useMemo(() => getUpcomingBills(recurringBills), [recurringBills]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    categoryId: expenseCategories[0]?.id ?? categories[0]?.id ?? "",
    accountId: accounts[0]?.id ?? "",
    nextDueDate: getTodayISO(),
  });

  return (
    <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
      <SectionHeader
        eyebrow="Recurring"
        title="Bills and reminders"
        description="Keep monthly obligations visible and mark them paid when you settle them."
      />
      <form
        className="grid gap-3 rounded-3xl border border-line bg-raised p-4 md:grid-cols-2 xl:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          const amount = Number(form.amount);
          if (!form.title.trim() || !amount) {
            showToast("Add a bill name and amount first.", "warning");
            return;
          }
          addRecurringBill({
            title: form.title.trim(),
            amount,
            type: "expense",
            categoryId: form.categoryId,
            accountId: form.accountId,
            paymentMethod: "bank",
            cadence: "monthly",
            interval: 1,
            nextDueDate: form.nextDueDate,
            remindDaysBefore: 3,
            isActive: true,
            autoAdd: false,
          });
          showToast("Recurring bill added.", "success");
          setForm((current) => ({
            ...current,
            title: "",
            amount: "",
            nextDueDate: getTodayISO(),
          }));
        }}
      >
        <input
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          placeholder="Rent, internet, gym"
          className="rounded-2xl border border-line bg-raised px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-teal-400"
        />
        <input
          inputMode="decimal"
          value={form.amount}
          onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
          placeholder="Amount"
          className="rounded-2xl border border-line bg-raised px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-teal-400"
        />
        <select
          value={form.categoryId}
          onChange={(event) =>
            setForm((current) => ({ ...current, categoryId: event.target.value }))
          }
          className="rounded-2xl border border-line bg-raised px-4 py-3 text-sm text-ink outline-none focus:border-teal-400"
        >
          {expenseCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={form.accountId}
          onChange={(event) =>
            setForm((current) => ({ ...current, accountId: event.target.value }))
          }
          className="rounded-2xl border border-line bg-raised px-4 py-3 text-sm text-ink outline-none focus:border-teal-400"
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={form.nextDueDate}
          onChange={(event) =>
            setForm((current) => ({ ...current, nextDueDate: event.target.value }))
          }
          className="rounded-2xl border border-line bg-raised px-4 py-3 text-sm text-ink outline-none focus:border-teal-400"
        />
      </form>

      <div className="mt-5 space-y-3">
        {upcomingBills.map((bill) => (
          <article
            key={bill.id}
            className="rounded-3xl border border-line bg-raised p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BellAlertIcon className="h-5 w-5 text-warn" />
                  <p className="font-semibold text-ink">{bill.title}</p>
                </div>
                <p className="mt-1 text-sm text-muted">
                  Due {bill.nextDueDate} ·{" "}
                  {bill.dueInDays <= 0 ? "Due now" : `${bill.dueInDays} days left`}
                </p>
              </div>
              <p className="text-lg font-semibold text-neg">
                {formatCurrency(bill.amount, settings.currencyCode)}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  markRecurringBillPaid(bill.id);
                  showToast("Bill marked as paid.", "success");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-pos/30 bg-pos/10 px-3 py-2 text-xs font-semibold text-pos transition hover:bg-pos/10"
              >
                <CheckCircleIcon className="h-4 w-4" />
                Mark paid
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteRecurringBill(bill.id);
                  showToast("Recurring bill deleted.", "success");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-neg/30 bg-neg/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-neg/20"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </article>
        ))}
        {!upcomingBills.length ? (
          <EmptyState
            title="No upcoming recurring bills"
            description="Add your rent, utilities, subscriptions, or salary cadence so the app can warn you before due dates."
          />
        ) : null}
      </div>
    </section>
  );
}
