import {
  ArrowLeftIcon,
  ArrowPathRoundedSquareIcon,
  PencilSquareIcon,
  TrashIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { Link, useParams } from "react-router-dom";
import { WalletCard } from "../components/ui/WalletCard";
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
        <Link to="/wallet" className="inline-flex items-center gap-2 text-sm text-muted">
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
    <section className="space-y-4 md:space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/wallet"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted "
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <div className="rounded-full bg-brand/15 px-5 py-3 text-lg font-bold text-brand">
          Goals {formatCurrency(store.savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0), store.settings.currencyCode)}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-neg/10 text-neg "
          >
            <TrashIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-brand "
          >
            <PencilSquareIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <WalletCard
          name={account.name}
          initials={(account.icon ?? account.name.slice(0, 2)).slice(0, 3).toUpperCase()}
          color={account.color}
          label="Balance"
          amount={formatCurrency(account.balance, account.currencyCode ?? store.settings.currencyCode)}
          usage={
            account.classification === "credit" && account.creditLimit
              ? account.balance / account.creditLimit
              : undefined
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
          <div className="flex h-40 items-end justify-between gap-3">
            {flow.bars.length ? (
              flow.bars.map((bar, index) => (
                <div key={`${bar.kind}-${index}`} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className={`w-3 rounded-full ${bar.kind === "in" ? "bg-brand" : "bg-rose-400"}`}
                    style={{ height: `${bar.height}px` }}
                  />
                  <span className="text-sm font-semibold text-muted">
                    {index + 1}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-raised text-muted">
                Activity will plot here after a few account transactions.
              </div>
            )}
          </div>
        </section>

        <section className="flex items-center justify-center rounded-3xl border border-line bg-surface p-4 md:p-5">
          <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-[conic-gradient(rgb(var(--brand))_0_76%,rgb(var(--neg))_76%_100%)]">
            <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-surface">
              <p className="text-sm font-semibold text-brand">
                {formatCurrency(flow.net, account.currencyCode ?? store.settings.currencyCode)}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Net in</p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Net balance</p>
            <p className="mt-2 text-2xl font-extrabold text-ink">
              {formatCurrency(account.balance, account.currencyCode ?? store.settings.currencyCode)}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Spendable</p>
            <p className="mt-2 text-2xl font-extrabold text-ink">
              {formatCurrency(spendable, account.currencyCode ?? store.settings.currencyCode)}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-raised p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-base font-semibold text-ink">Next 30 days</p>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Expected cashflow</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-surface p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Expected in</p>
              <p className="mt-2 text-xl font-bold tracking-tight text-brand">
                {formatCurrency(flow.income, account.currencyCode ?? store.settings.currencyCode)}
              </p>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Expected out</p>
              <p className="mt-2 text-xl font-bold tracking-tight text-neg">
                -{formatCurrency(flow.expenses, account.currencyCode ?? store.settings.currencyCode)}
              </p>
            </div>
          </div>
        </div>

        {account.annualYield ? (
          <div className="mt-5 rounded-2xl bg-raised p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Interest</p>
            <p className="mt-2 text-xl font-bold tracking-tight text-ink">
              {account.annualYield}% yearly
            </p>
          </div>
        ) : null}

        {account.liveRate ? (
          <div className="mt-5 rounded-2xl bg-raised p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Live via FXRatesAPI</p>
            <p className="mt-2 text-xl font-bold tracking-tight text-ink">
              P{account.liveRate.toLocaleString()}
            </p>
            {account.liveRateUpdatedAt ? (
              <p className="mt-2 text-sm text-muted">{account.liveRateUpdatedAt}</p>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-brand/15 px-5 py-3 text-base font-bold text-brand"
        >
          <ArrowPathRoundedSquareIcon className="h-6 w-6" />
          Transfer money
        </button>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Account type</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={`rounded-2xl border p-5 ${account.classification === "debit" ? "border-brand bg-brand/15" : "border-line bg-surface"}`}>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-brand">
                <WalletIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-semibold text-ink">Debit</p>
                <p className="text-sm text-muted">Cash on hand</p>
              </div>
            </div>
          </div>
          <div className={`rounded-2xl border p-5 ${account.classification === "credit" ? "border-brand bg-brand/15" : "border-line bg-surface"}`}>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-raised text-muted">
                <WalletIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-semibold text-ink">Credit</p>
                <p className="text-sm text-muted">Money you owe</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {upcoming.length ? (
        <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
          <p className="text-base font-semibold text-ink">Upcoming</p>
          <div className="mt-5 space-y-3">
            {upcoming.map((item) => (
              <div key={`${item.source}-${item.id}`} className="flex items-center justify-between rounded-2xl bg-raised px-4 py-4">
                <div>
                  <p className="font-bold text-ink">{item.title}</p>
                  <p className="text-muted">{item.dueDate}</p>
                </div>
                <p className="font-bold text-muted">
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
