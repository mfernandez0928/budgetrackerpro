import { useMemo, useState } from "react";
import { ArrowPathRoundedSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useStore } from "../../store/useStore";
import { getTodayISO } from "../../lib/date";
import { SectionHeader } from "../ui/SectionHeader";
import { showToast } from "../Toast";
import type { PaymentMethod, TransactionType } from "../../types/finance";

const paymentMethods: PaymentMethod[] = ["cash", "bank", "card", "ewallet", "transfer"];

export function TransactionComposer() {
  const { addTransaction, addRecurringBill, categories, accounts } = useStore();
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense" as TransactionType,
    date: getTodayISO(),
    categoryId: "",
    accountId: accounts[0]?.id ?? "",
    toAccountId: accounts[1]?.id ?? "",
    paymentMethod: "cash" as PaymentMethod,
    notes: "",
    createRecurring: false,
    cadence: "monthly" as "weekly" | "monthly",
    remindDaysBefore: 3,
  });

  const availableCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.type === (form.type === "income" ? "income" : "expense")
      ),
    [categories, form.type]
  );

  const selectedCategoryId =
    form.categoryId || availableCategories[0]?.id || categories[0]?.id || "";

  function resetForm() {
    setForm({
      title: "",
      amount: "",
      type: "expense",
      date: getTodayISO(),
      categoryId: "",
      accountId: accounts[0]?.id ?? "",
      toAccountId: accounts[1]?.id ?? "",
      paymentMethod: "cash",
      notes: "",
      createRecurring: false,
      cadence: "monthly",
      remindDaysBefore: 3,
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim() || !amount) {
      showToast("Add a title and amount before saving.", "warning");
      return;
    }

    const isOffline = !navigator.onLine;

    addTransaction({
      title: form.title.trim(),
      amount: Math.abs(amount),
      type: form.type,
      date: form.date,
      categoryId: selectedCategoryId,
      accountId: form.accountId,
      toAccountId: form.type === "transfer" ? form.toAccountId : undefined,
      paymentMethod: form.type === "transfer" ? "transfer" : form.paymentMethod,
      notes: form.notes.trim(),
      status: "cleared",
      createdOffline: isOffline,
      isRecurringInstance: false,
    });

    if (form.createRecurring && form.type !== "transfer") {
      addRecurringBill({
        title: form.title.trim(),
        amount: Math.abs(amount),
        type: form.type,
        categoryId: selectedCategoryId,
        accountId: form.accountId,
        paymentMethod: form.paymentMethod,
        cadence: form.cadence,
        interval: 1,
        nextDueDate: form.date,
        remindDaysBefore: form.remindDaysBefore,
        notes: form.notes.trim(),
        isActive: true,
        autoAdd: false,
      });
    }

    showToast(
      isOffline
        ? "Transaction saved offline on this device."
        : "Transaction added successfully.",
      "success"
    );
    resetForm();
  }

  return (
    <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
      <SectionHeader
        eyebrow="Quick capture"
        title="Fast transaction entry"
        description="Designed for one-thumb use on mobile while keeping richer details available."
      />
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-line bg-raised p-1">
          {(["expense", "income", "transfer"] as TransactionType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  type,
                  paymentMethod: type === "transfer" ? "transfer" : current.paymentMethod,
                  categoryId: "",
                }))
              }
              className={`min-h-[44px] rounded-xl px-3 text-sm font-semibold capitalize transition ${
                form.type === type
                  ? "bg-brand text-on-brand"
                  : "text-muted hover:text-ink"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-muted">What happened?</span>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Groceries, salary, internet bill"
              className="w-full rounded-2xl border border-line bg-raised px-4 py-3 text-ink outline-none transition placeholder:text-muted focus:border-brand"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted">Amount</span>
            <input
              inputMode="decimal"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              placeholder="0.00"
              className="w-full rounded-2xl border border-line bg-raised px-4 py-3 text-2xl font-bold text-ink outline-none transition placeholder:text-muted focus:border-brand"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-2 text-sm">
            <span className="text-muted">Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              className="w-full rounded-2xl border border-line bg-raised px-4 py-3 text-ink outline-none transition focus:border-brand"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted">Category</span>
            <select
              value={selectedCategoryId}
              onChange={(event) =>
                setForm((current) => ({ ...current, categoryId: event.target.value }))
              }
              className="w-full rounded-2xl border border-line bg-raised px-4 py-3 text-ink outline-none transition focus:border-brand"
            >
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted">From account</span>
            <select
              value={form.accountId}
              onChange={(event) =>
                setForm((current) => ({ ...current, accountId: event.target.value }))
              }
              className="w-full rounded-2xl border border-line bg-raised px-4 py-3 text-ink outline-none transition focus:border-brand"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>
          {form.type === "transfer" ? (
            <label className="space-y-2 text-sm">
              <span className="text-muted">To account</span>
              <select
                value={form.toAccountId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, toAccountId: event.target.value }))
                }
                className="w-full rounded-2xl border border-line bg-raised px-4 py-3 text-ink outline-none transition focus:border-brand"
              >
                {accounts
                  .filter((account) => account.id !== form.accountId)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
              </select>
            </label>
          ) : (
            <label className="space-y-2 text-sm">
              <span className="text-muted">Payment method</span>
              <select
                value={form.paymentMethod}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    paymentMethod: event.target.value as PaymentMethod,
                  }))
                }
                className="w-full rounded-2xl border border-line bg-raised px-4 py-3 text-ink outline-none transition focus:border-brand"
              >
                {paymentMethods.filter((method) => method !== "transfer").map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <label className="space-y-2 text-sm">
          <span className="text-muted">Notes</span>
          <textarea
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            rows={3}
            placeholder="Optional notes, merchant, or reminder details"
            className="w-full rounded-2xl border border-line bg-raised px-4 py-3 text-ink outline-none transition placeholder:text-muted focus:border-brand"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-on-brand transition hover:brightness-110"
          >
            <PlusIcon className="h-5 w-5" />
            Save transaction
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-raised px-5 py-3 text-sm font-semibold text-ink transition hover:bg-raised"
          >
            <ArrowPathRoundedSquareIcon className="h-5 w-5" />
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}
