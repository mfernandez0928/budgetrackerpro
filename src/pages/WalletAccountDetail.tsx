import {
  ArrowLeftIcon,
  ArrowPathRoundedSquareIcon,
  PencilSquareIcon,
  TrashIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { Link, useParams } from "react-router-dom";
import { BrandMark } from "../components/ui/BrandMark";
import { EmptyState } from "../components/ui/EmptyState";
import { useStore } from "../store/useStore";
import { formatCurrency, getAccountBalances, getAccountFlowSummary, getUpcomingPayments } from "../lib/finance";

export default function WalletAccountDetail() {
  const { accountId } = useParams();
  const store = useStore();
  const account = getAccountBalances(store).find((item) => item.id === accountId);

  if (!account) {
    return (
      <section className="space-y-4">
        <Link to="/wallet" className="inline-flex items-center gap-2 text-sm text-slate-500">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to wallet
        </Link>
        <EmptyState
          title="Account not found"
          description="The selected account is missing or may have been removed."
        />
      </section>
    );
  }

  const flow = getAccountFlowSummary(store, account.id);
  const spendable = account.classification === "credit"
    ? Math.max(0, (account.creditLimit ?? 0) - account.balance)
    : account.balance + flow.income;
  const upcoming = getUpcomingPayments(store, 30).filter((item) => item.source !== "debt").slice(0, 4);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/wallet"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-[0_18px_40px_rgba(148,163,184,0.14)]"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <div className="rounded-full bg-[#edf6ee] px-5 py-3 text-lg font-bold text-[#5e985d]">
          Goals {formatCurrency(store.savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0), store.settings.currencyCode)}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-400 shadow-[0_18px_40px_rgba(148,163,184,0.14)]"
          >
            <TrashIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[#5e985d] shadow-[0_18px_40px_rgba(148,163,184,0.14)]"
          >
            <PencilSquareIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <section
        className="rounded-[2.2rem] p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.14)]"
        style={{ backgroundColor: account.color }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandMark
              label={account.icon ?? account.name.slice(0, 2).toUpperCase()}
              color="rgba(255,255,255,0.18)"
              textColor="#ffffff"
              size="lg"
            />
            <p className="text-[2.2rem] font-black tracking-[-0.05em]">{account.name}</p>
          </div>
          <p className="text-[2rem] font-black tracking-[-0.04em]">{account.classification === "credit" ? "Credit" : "Debit"}</p>
        </div>

        <div className="mt-24">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">Balance</p>
          <p className="mt-2 text-[3rem] font-black tracking-[-0.06em]">
            {formatCurrency(account.balance, account.currencyCode ?? store.settings.currencyCode)}
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <div className="flex h-40 items-end justify-between gap-3">
            {flow.bars.length ? (
              flow.bars.map((bar, index) => (
                <div key={`${bar.kind}-${index}`} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className={`w-3 rounded-full ${bar.kind === "in" ? "bg-[#5e985d]" : "bg-rose-400"}`}
                    style={{ height: `${bar.height}px` }}
                  />
                  <span className="text-sm font-semibold text-slate-400">
                    {["T", "W", "T", "F", "S", "S", "M"][index] ?? "D"}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-[1.8rem] bg-slate-50 text-slate-400">
                Activity will plot here after a few account transactions.
              </div>
            )}
          </div>
        </section>

        <section className="flex items-center justify-center rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-[conic-gradient(#5e985d_0_76%,#ef4444_76%_100%)]">
            <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
              <p className="text-[1.1rem] font-black text-[#5e985d]">
                {formatCurrency(flow.net, account.currencyCode ?? store.settings.currencyCode)}
              </p>
              <p className="text-lg font-semibold uppercase tracking-[0.16em] text-slate-400">Net in</p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Net balance</p>
            <p className="mt-2 text-[3rem] font-black tracking-[-0.06em] text-slate-900">
              {formatCurrency(account.balance, account.currencyCode ?? store.settings.currencyCode)}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Spendable</p>
            <p className="mt-2 text-[3rem] font-black tracking-[-0.06em] text-slate-900">
              {formatCurrency(spendable, account.currencyCode ?? store.settings.currencyCode)}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.8rem] bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[2rem] font-black tracking-[-0.05em] text-slate-900">Next 30 days</p>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Expected cashflow</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-white p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Expected in</p>
              <p className="mt-2 text-[2rem] font-black tracking-[-0.05em] text-[#5e985d]">
                {formatCurrency(flow.income, account.currencyCode ?? store.settings.currencyCode)}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Expected out</p>
              <p className="mt-2 text-[2rem] font-black tracking-[-0.05em] text-rose-500">
                -{formatCurrency(flow.expenses, account.currencyCode ?? store.settings.currencyCode)}
              </p>
            </div>
          </div>
        </div>

        {account.annualYield ? (
          <div className="mt-5 rounded-[1.8rem] bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Interest</p>
            <p className="mt-2 text-[2rem] font-black tracking-[-0.05em] text-slate-900">
              {account.annualYield}% yearly
            </p>
          </div>
        ) : null}

        {account.liveRate ? (
          <div className="mt-5 rounded-[1.8rem] bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Live via FXRatesAPI</p>
            <p className="mt-2 text-[2rem] font-black tracking-[-0.05em] text-slate-900">
              P{account.liveRate.toLocaleString()}
            </p>
            {account.liveRateUpdatedAt ? (
              <p className="mt-2 text-lg text-slate-400">{account.liveRateUpdatedAt}</p>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-[1.7rem] bg-[#edf6ee] px-5 py-5 text-[1.9rem] font-black tracking-[-0.03em] text-[#5e985d]"
        >
          <ArrowPathRoundedSquareIcon className="h-8 w-8" />
          Transfer money
        </button>
      </section>

      <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Account type</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={`rounded-[1.8rem] border p-5 ${account.classification === "debit" ? "border-[#5e985d] bg-[#edf6ee]" : "border-slate-200 bg-white"}`}>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.3rem] bg-white text-[#5e985d]">
                <WalletIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[2rem] font-black tracking-[-0.05em] text-slate-900">Debit</p>
                <p className="text-lg text-slate-500">Cash on hand</p>
              </div>
            </div>
          </div>
          <div className={`rounded-[1.8rem] border p-5 ${account.classification === "credit" ? "border-[#5e985d] bg-[#edf6ee]" : "border-slate-200 bg-white"}`}>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.3rem] bg-slate-50 text-slate-400">
                <WalletIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[2rem] font-black tracking-[-0.05em] text-slate-900">Credit</p>
                <p className="text-lg text-slate-500">Money you owe</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {upcoming.length ? (
        <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <p className="text-[2rem] font-black tracking-[-0.05em] text-slate-900">Upcoming</p>
          <div className="mt-5 space-y-3">
            {upcoming.map((item) => (
              <div key={`${item.source}-${item.id}`} className="flex items-center justify-between rounded-[1.6rem] bg-slate-50 px-4 py-4">
                <div>
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="text-slate-400">{item.dueDate}</p>
                </div>
                <p className="font-bold text-slate-600">
                  {formatCurrency(item.amount, store.settings.currencyCode)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
