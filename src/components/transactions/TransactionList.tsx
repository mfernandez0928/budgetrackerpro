import { useMemo, useState } from "react";
import {
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "../../store/useStore";
import { formatCurrency } from "../../lib/finance";
import { getTodayISO } from "../../lib/date";
import { groupByDay } from "../../lib/ui";
import { EmptyState } from "../ui/EmptyState";
import { showToast } from "../Toast";

export function TransactionList() {
  const {
    transactions,
    categories,
    accounts,
    settings,
    deleteTransaction,
    updateTransaction,
  } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  );
  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts]
  );

  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .filter((transaction) => {
        const notes = transaction.notes ?? "";
        const matchesSearch =
          transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notes.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType =
          typeFilter === "all" ? true : transaction.type === typeFilter;
        return matchesSearch && matchesType;
      })
      .sort(
        (first, second) =>
          new Date(second.date).getTime() - new Date(first.date).getTime()
      );
  }, [transactions, searchTerm, typeFilter]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-line bg-raised p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted">
          <FunnelIcon className="h-4 w-4" />
          Search, filter, and clean up your activity feed.
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search title or notes"
            className="rounded-full border border-line bg-raised px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand"
          />
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-full border border-line bg-raised px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
          >
            <option value="all">All types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
            <option value="transfer">Transfers</option>
          </select>
        </div>
      </div>

      {!filteredTransactions.length ? (
        <EmptyState
          title={transactions.length ? "No matches" : "No transactions yet"}
          description={
            transactions.length
              ? "Try a different search or type filter."
              : "Add your first income or expense above and it will show up here."
          }
        />
      ) : null}

      {groupByDay(filteredTransactions, getTodayISO()).map((group) => (
      <div key={group.label} className="space-y-2">
        <p className="px-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {group.label}
        </p>
        {group.items.map((transaction) => {
          const category = categoryMap.get(transaction.categoryId);
          const account = accountMap.get(transaction.accountId);
          const tone =
            transaction.type === "income"
              ? "text-pos"
              : transaction.type === "expense"
              ? "text-neg"
              : "text-ink";
          const prefix =
            transaction.type === "income"
              ? "+"
              : transaction.type === "expense"
              ? "-"
              : "";

          return (
            <article
              key={transaction.id}
              className="rounded-2xl border border-line bg-surface p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-ink">
                      {transaction.title}
                    </p>
                    {transaction.createdOffline ? (
                      <span className="rounded-full bg-warn/15 px-2 py-1 text-[11px] font-semibold text-warn">
                        Saved offline
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {category?.name ?? "Uncategorized"} ·{" "}
                    {account?.name ?? "Unknown account"}
                  </p>
                  {editingId === transaction.id ? (
                    <textarea
                      value={transaction.notes ?? ""}
                      onChange={(event) =>
                        updateTransaction(transaction.id, { notes: event.target.value })
                      }
                      onBlur={() => {
                        setEditingId(null);
                        showToast("Transaction note updated.", "success");
                      }}
                      rows={3}
                      className="mt-3 w-full rounded-2xl border border-line bg-raised px-4 py-3 text-sm text-ink outline-none focus:border-brand"
                    />
                  ) : transaction.notes ? (
                    <p className="mt-3 rounded-2xl bg-raised px-3 py-2 text-sm text-muted">
                      {transaction.notes}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                  <p className={`text-lg font-semibold ${tone}`}>
                    {prefix}
                    {formatCurrency(transaction.amount, settings.currencyCode)}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">
                    {transaction.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(transaction.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-raised px-3 py-2 text-xs font-semibold text-ink transition hover:bg-raised"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Edit note
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteTransaction(transaction.id);
                    showToast("Transaction deleted.", "success");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-neg/30 bg-neg/10 px-3 py-2 text-xs font-semibold text-neg transition hover:bg-neg/20"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
      ))}
    </section>
  );
}
