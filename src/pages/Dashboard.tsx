import {
  ArrowDownLeftIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpRightIcon,
  ArrowsRightLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  MinusCircleIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Susi } from "../components/illustrations/Susi";
import { ActivityRow } from "../components/ui/ActivityRow";
import { Card, CardLink } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { WalletCard } from "../components/ui/WalletCard";
import { useStore } from "../store/useStore";
import {
  formatCurrency,
  getMonthlyInsightSummary,
  getMonthlySummary,
  getRecentTransactions,
  getUpcomingPayments,
  getWalletSummary,
} from "../lib/finance";
import { daysUntil, getTodayISO } from "../lib/date";

const HIDDEN = "••••••";

function formatHeaderDate() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getCoachLine(lines: string[]) {
  return (
    lines[0] ??
    "You are still shaping the month, so a couple of planned moves now will make the dashboard sharper fast."
  );
}

function getWeekBars(values: number[]) {
  const max = Math.max(...values, 1);
  return values.map((value, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (values.length - 1 - index));
    return {
      day: date.toLocaleDateString(undefined, { weekday: "narrow" }),
      height: Math.max(6, Math.round((value / max) * 72)),
      active: index === values.length - 1,
    };
  });
}

function sparklinePath(values: number[]) {
  const max = Math.max(...values, 1);
  const step = 200 / Math.max(values.length - 1, 1);
  return values
    .map((value, index) => `${index === 0 ? "M" : "L"}${Math.round(index * step)} ${Math.round(62 - (value / max) * 54)}`)
    .join(" ");
}

function accountInitials(name: string, icon?: string) {
  return (icon ?? name.slice(0, 2)).slice(0, 3).toUpperCase();
}

export default function Dashboard() {
  const store = useStore();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const currency = store.settings.currencyCode;
  const monthly = getMonthlySummary(store);
  const monthlyInsights = getMonthlyInsightSummary(store);
  const wallet = getWalletSummary(store);
  const upcoming = getUpcomingPayments(store, 30);
  const recent = getRecentTransactions(store.transactions, 6);
  const profileName = store.profile.hasCompletedOnboarding ? "Bryl" : "there";
  const money = (amount: number, code: string = currency) =>
    hidden ? HIDDEN : formatCurrency(amount, code);

  const dayValues = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date.toISOString().split("T")[0];
    });

    return dates.map((date) =>
      store.transactions
        .filter((transaction) => transaction.date === date && transaction.type === "expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    );
  }, [store.transactions]);

  const todayTotal = useMemo(
    () =>
      store.transactions
        .filter((transaction) => transaction.date === getTodayISO())
        .reduce(
          (sum, transaction) =>
            sum +
            (transaction.type === "income"
              ? transaction.amount
              : transaction.type === "expense"
              ? -transaction.amount
              : 0),
          0
        ),
    [store.transactions]
  );

  const nextPayday = useMemo(() => {
    const candidates = [
      ...store.recurringBills
        .filter((bill) => bill.type === "income" && bill.isActive)
        .map((bill) => ({ title: bill.title, amount: bill.amount, date: bill.nextDueDate })),
      ...store.plannedPayments
        .filter((payment) => payment.status !== "paid")
        .map((payment) => ({ title: payment.title, amount: payment.amount, date: payment.dueDate })),
    ]
      .filter((item) => new Date(item.date).getTime() >= new Date(getTodayISO()).getTime())
      .sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime());

    return candidates[0];
  }, [store.plannedPayments, store.recurringBills]);

  const nextBill = upcoming.find((item) => {
    const recurring = store.recurringBills.find((bill) => bill.id === item.id);
    return recurring?.type !== "income";
  });
  const leftToSpend = monthly.planned
    ? monthly.planned - monthly.spentAgainstBudget
    : monthly.income - monthly.expenses;
  const weekBars = getWeekBars(dayValues);
  const stackAccounts = wallet.balances.slice(0, 3);
  const accountName = (id: string) =>
    store.accounts.find((account) => account.id === id)?.name ?? "Account";

  return (
    <section className="space-y-4 md:space-y-5">
      <section className="bg-hero relative flex items-center gap-4 overflow-hidden rounded-3xl p-5 md:p-6">
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full opacity-30"
          viewBox="0 0 800 70"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 50 C120 10 220 60 340 30 C460 0 560 55 680 25 C740 12 780 30 800 34 L800 70 L0 70Z"
            fill="currentColor"
          />
        </svg>
        <div className="relative min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-75">
            {formatHeaderDate()}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            {getGreeting()}, {profileName}!
          </h1>
          <p className="mt-3 max-w-xl rounded-2xl bg-white/60 px-4 py-2.5 text-sm dark:bg-black/25">
            <span className="font-bold text-brand">Susi</span>
            <span className="ml-2">{getCoachLine(monthlyInsights.insights)}</span>
          </p>
        </div>
        <Susi mood="wave" size={112} className="relative hidden sm:block" />
        <Susi mood="wave" size={72} className="relative sm:hidden" />
      </section>

      <div className="grid gap-3 md:grid-cols-[1.5fr_repeat(3,1fr)] md:gap-4">
        <section className="bg-brand-gradient relative overflow-hidden rounded-3xl p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85">
              Net balance
            </p>
            <button
              type="button"
              onClick={() => setHidden((value) => !value)}
              className="-m-2 flex h-11 w-11 items-center justify-center rounded-full text-white/85 transition hover:bg-white/15"
              aria-label={hidden ? "Show amounts" : "Hide amounts"}
              aria-pressed={hidden}
            >
              {hidden ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          <p className="relative mt-1 truncate text-3xl font-extrabold tracking-tight">
            {money(wallet.netWorth)}
          </p>
          <p className="relative mt-1 text-sm text-white/85">
            Across {store.accounts.length} {store.accounts.length === 1 ? "wallet" : "wallets"}
          </p>
          <svg
            className="pointer-events-none absolute bottom-0 right-0 h-16 w-3/5 opacity-60"
            viewBox="0 0 200 70"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d={sparklinePath(dayValues)} stroke="#fff" strokeWidth="3" fill="none" />
          </svg>
        </section>

        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:contents">
          {[
            {
              label: "Days until payday",
              value: nextPayday ? `${Math.max(0, daysUntil(nextPayday.date))} days` : "Plan one",
              hint: nextPayday ? `${nextPayday.title} · ${money(nextPayday.amount)}` : "No income planned",
            },
            {
              label: "Next bill",
              value: nextBill ? money(nextBill.amount) : "None",
              hint: nextBill
                ? `${nextBill.title} · ${new Date(nextBill.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                : "Nothing due in 30 days",
            },
            {
              label: "Left to spend",
              value: money(leftToSpend),
              hint: monthly.planned ? "Against this month's budget" : "Income minus expenses",
            },
          ].map((item) => (
            <section
              key={item.label}
              className="min-w-[160px] shrink-0 rounded-3xl border border-line bg-surface p-4 md:min-w-0"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{item.label}</p>
              <p className="mt-2 truncate text-xl font-extrabold text-ink">{item.value}</p>
              <p className="mt-0.5 truncate text-xs text-muted">{item.hint}</p>
            </section>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card
          title={`Wallets · ${store.accounts.length}`}
          action={<CardLink to="/wallet">All ({store.accounts.length}) →</CardLink>}
        >
          {stackAccounts.length ? (
            <>
              <div className="relative pb-[14px]">
                <div className="invisible aspect-[1.586] w-[72%] sm:w-[62%]" aria-hidden="true" />
                {stackAccounts
                  .map((account, index) => ({ account, index }))
                  .reverse()
                  .map(({ account, index }) => (
                    <div
                      key={account.id}
                      className="absolute w-[72%] sm:w-[62%]"
                      style={{ left: `${(stackAccounts.length - 1 - index) * 10 + (3 - stackAccounts.length) * 5}%`, top: `${index * 7}px`, zIndex: 3 - index }}
                    >
                      <WalletCard
                        name={account.name}
                        initials={accountInitials(account.name, account.icon)}
                        color={account.color}
                        label={account.classification === "credit" ? "Available credit" : "Balance"}
                        amount={money(
                          account.classification === "credit" && account.creditLimit
                            ? account.creditLimit - account.balance
                            : account.balance,
                          account.currencyCode ?? currency
                        )}
                        usage={
                          account.classification === "credit" && account.creditLimit
                            ? account.balance / account.creditLimit
                            : undefined
                        }
                        onClick={() => navigate(`/wallet/${account.id}`)}
                      />
                    </div>
                  ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "Open", icon: ArrowTopRightOnSquareIcon, to: `/wallet/${stackAccounts[0].id}` },
                  { label: "Expense", icon: MinusCircleIcon, to: "/transactions" },
                  { label: "Transfer", icon: ArrowsRightLeftIcon, to: "/transactions" },
                ].map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => navigate(action.to)}
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-line bg-raised text-sm font-semibold text-ink transition hover:bg-brand/10"
                  >
                    <action.icon className="h-4 w-4 text-brand" />
                    {action.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="Add your first wallet"
              description="Track cash, bank, e-wallet, and credit accounts in one place."
              actionLabel="Add account"
              onAction={() => navigate("/wallet")}
              illustration={<Susi mood="think" size={72} />}
            />
          )}
        </Card>

        <Card title="Recent activity" action={<CardLink to="/transactions">View all →</CardLink>}>
          {recent.length ? (
            <div className="divide-y divide-line">
              {recent.map((transaction) => {
                const signed =
                  transaction.type === "income"
                    ? transaction.amount
                    : transaction.type === "expense"
                    ? -transaction.amount
                    : 0;
                const Icon =
                  transaction.type === "income"
                    ? ArrowDownLeftIcon
                    : transaction.type === "expense"
                    ? ArrowUpRightIcon
                    : ArrowsRightLeftIcon;
                return (
                  <ActivityRow
                    key={transaction.id}
                    icon={<Icon className="h-5 w-5" />}
                    title={transaction.title}
                    meta={`${accountName(transaction.accountId)} · ${new Date(transaction.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
                    amount={signed}
                    formatted={`${signed > 0 ? "+" : signed < 0 ? "−" : ""}${money(transaction.amount)}`}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No activity yet"
              description="Your latest income, expenses, and transfers show up here."
              actionLabel="Add transaction"
              onAction={() => navigate("/transactions")}
            />
          )}
        </Card>
      </div>

      <Card title="This month">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Income", value: money(monthly.income), tone: "bg-pos/15 text-pos", icon: "↑" },
            { label: "Expenses", value: money(monthly.expenses), tone: "bg-neg/15 text-neg", icon: "↓" },
            { label: "Saved", value: money(Math.max(0, monthly.balance)), tone: "bg-warn/15 text-warn", icon: "◎" },
            { label: "Savings rate", value: `${Math.round(monthly.savingsRate)}%`, tone: "bg-brand/15 text-brand", icon: "%" },
          ].map((tile) => (
            <div key={tile.label} className="flex items-center gap-3 rounded-2xl bg-raised p-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${tile.tone}`}>
                {tile.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-muted">{tile.label}</span>
                <span className="block truncate text-sm font-bold text-ink">{tile.value}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl bg-raised p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Last 7 days spending</p>
            <div className="mt-4 flex h-24 items-end justify-between gap-2">
              {weekBars.map((bar, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={`w-2.5 rounded-full ${bar.active ? "bg-brand" : "bg-brand/30"}`}
                    style={{ height: `${bar.height}px` }}
                  />
                  <span className={`text-xs font-semibold ${bar.active ? "text-ink" : "text-muted"}`}>{bar.day}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl bg-raised p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Today</p>
            <p className={`mt-2 truncate text-2xl font-extrabold ${todayTotal < 0 ? "text-neg" : "text-ink"}`}>
              {money(todayTotal)}
            </p>
            <p className="mt-1 text-xs text-muted">Income minus expenses</p>
          </div>
        </div>
      </Card>

      <Card title="Upcoming" action={<CardLink to="/plan">Plan →</CardLink>}>
        {upcoming.length ? (
          <div className="divide-y divide-line">
            {upcoming.slice(0, 4).map((item) => {
              const isIncome =
                store.recurringBills.find((bill) => bill.id === item.id)?.type === "income";
              return (
                <ActivityRow
                  key={`${item.source}-${item.id}`}
                  icon={isIncome ? <ArrowDownLeftIcon className="h-5 w-5" /> : <ArrowUpRightIcon className="h-5 w-5" />}
                  title={item.title}
                  meta={item.dueInDays <= 0 ? "Due now" : `In ${item.dueInDays} days`}
                  amount={isIncome ? item.amount : -item.amount}
                  formatted={money(item.amount)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Nothing upcoming yet"
            description="Recurring bills, debt payments, and planned payments will land here once you start planning the month."
            actionLabel="Open plan"
            onAction={() => navigate("/plan")}
          />
        )}
      </Card>
    </section>
  );
}
