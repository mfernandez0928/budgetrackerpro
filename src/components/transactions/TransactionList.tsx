import { useMemo, useState } from "react";
import {
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "../../store/useStore";
import { formatCurrency } from "../../lib/finance";
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
      <div className="flex flex-col gap-3 rounded-[2rem] border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <FunnelIcon className="h-4 w-4" />
          Search, filter, and clean up your activity feed.
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search title or notes"
            className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-400"
          />
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-400"
          >
            <option value="all">All types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
            <option value="transfer">Transfers</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTransactions.map((transaction) => {
          const category = categoryMap.get(transaction.categoryId);
          const account = accountMap.get(transaction.accountId);
          const tone =
            transaction.type === "income"
              ? "text-emerald-300"
              : transaction.type === "expense"
              ? "text-rose-300"
              : "text-sky-300";
          const prefix =
            transaction.type === "income"
              ? "+"
              : transaction.type === "expense"
              ? "-"
              : "";

          return (
            <article
              key={transaction.id}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-white">
                      {transaction.title}
                    </p>
                    {transaction.createdOffline ? (
                      <span className="rounded-full bg-amber-400/15 px-2 py-1 text-[11px] font-semibold text-amber-200">
                        Saved offline
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {transaction.date} · {category?.name ?? "Uncategorized"} ·{" "}
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
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-teal-400"
                    />
                  ) : transaction.notes ? (
                    <p className="mt-3 rounded-2xl bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
                      {transaction.notes}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                  <p className={`text-lg font-semibold ${tone}`}>
                    {prefix}
                    {formatCurrency(transaction.amount, settings.currencyCode)}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                    {transaction.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(transaction.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
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
                  className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/20"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
