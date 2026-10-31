import {
  ArrowLeftIcon,
  ArrowPathRoundedSquareIcon,
  PencilSquareIcon,
  TrashIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { WalletCard } from "../components/ui/WalletCard";
import { EmptyState } from "../components/ui/EmptyState";
import { PickerSheet } from "../components/ui/PickerSheet";
import { showToast } from "../components/Toast";
import { useStore } from "../store/useStore";
import { getTodayISO } from "../lib/date";
import { accountInitials } from "../lib/ui";
import { formatCurrency, getAccountBalances, getAccountFlowSummary, getUpcomingPayments } from "../lib/finance";

type Sheet = "edit" | "delete" | "transfer" | null;

const fieldLabel = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted";
const fieldInput =
  "min-h-[48px] w-full rounded-2xl border border-line bg-raised px-4 text-base text-ink outline-none focus:border-brand";
const cancelButton = "min-h-[48px] rounded-2xl border border-line bg-raised px-4 text-sm font-bold text-muted";
const primaryButton = "min-h-[48px] rounded-2xl bg-brand px-4 text-sm font-bold text-on-brand";

export default function WalletAccountDetail() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const accounts = getAccountBalances(store);
  const account = accounts.find((item) => item.id === accountId);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [removed, setRemoved] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", openingBalance: "", creditLimit: "" });
  const [transferForm, setTransferForm] = useState({ toAccountId: "", amount: "", date: "", notes: "" });

  if (!account) {
    // Just deleted: render nothing while the redirect to /wallet settles.
    if (removed) return null;
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

  const currencyCode = store.settings.currencyCode;
  const flow = getAccountFlowSummary(store, account.id);
  const spendable = account.classification === "credit"
    ? Math.max(0, (account.creditLimit ?? 0) - account.balance)
    : account.balance + flow.income;
  const upcoming = getUpcomingPayments(store, 30).filter((item) => item.source !== "debt").slice(0, 4);
  const otherAccounts = accounts.filter((item) => item.id !== account.id);
  const linkedCount = store.transactions.filter(
    (item) => item.accountId === account.id || item.toAccountId === account.id
  ).length;
  const closeSheet = () => setSheet(null);

  const openEdit = () => {
    setEditForm({
      name: account.name,
      openingBalance: String(account.openingBalance),
      creditLimit: account.creditLimit !== undefined ? String(account.creditLimit) : "",
    });
    setSheet("edit");
  };

  const saveEdit = () => {
    const name = editForm.name.trim();
    const openingBalance = Number(editForm.openingBalance);
    const creditLimit = Number(editForm.creditLimit);
    if (!name || !editForm.openingBalance.trim() || !Number.isFinite(openingBalance)) {
      showToast("Add a name and a valid opening balance.", "warning");
      return;
    }
    store.updateAccount(account.id, {
      name,
      openingBalance,
      ...(account.classification === "credit" && editForm.creditLimit.trim() && Number.isFinite(creditLimit)
        ? { creditLimit }
        : {}),
    });
    closeSheet();
    showToast("Account updated.", "success");
  };

  const confirmDelete = () => {
    setRemoved(true);
    navigate("/wallet", { replace: true });
    store.deleteAccount(account.id);
    showToast(`${account.name} removed from your wallet.`, "success");
  };

  const openTransfer = () => {
    if (!otherAccounts.length) {
      showToast("Add another account first to transfer money.", "warning");
      return;
    }
    setTransferForm({ toAccountId: otherAccounts[0].id, amount: "", date: getTodayISO(), notes: "" });
    setSheet("transfer");
  };

  const saveTransfer = () => {
    const amount = Number(transferForm.amount);
    const target = otherAccounts.find((item) => item.id === transferForm.toAccountId);
    if (!target || !Number.isFinite(amount) || amount <= 0) {
      showToast("Choose an account and enter an amount above zero.", "warning");
      return;
    }
    store.addTransaction({
      title: `Transfer to ${target.name}`,
      amount,
      type: "transfer",
      date: transferForm.date || getTodayISO(),
      categoryId: store.categories.find((item) => item.type === "expense")?.id ?? store.categories[0]?.id ?? "",
      accountId: account.id,
      toAccountId: target.id,
      paymentMethod: "transfer",
      notes: transferForm.notes.trim(),
      status: "cleared",
      createdOffline: !navigator.onLine,
      isRecurringInstance: false,
    });
    closeSheet();
    showToast(`Moved ${formatCurrency(amount, currencyCode)} to ${target.name}.`, "success");
  };

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
            onClick={() => setSheet("delete")}
            aria-label="Delete account"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-neg/10 text-neg "
          >
            <TrashIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={openEdit}
            aria-label="Edit account"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-brand "
          >
            <PencilSquareIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <WalletCard
          name={account.name}
          initials={accountInitials(account.name, account.icon, currencyCode)}
          color={account.color}
          label="Balance"
          amount={formatCurrency(account.balance, currencyCode)}
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
                    className={`w-3 rounded-full ${bar.kind === "in" ? "bg-brand" : "bg-neg"}`}
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
                {formatCurrency(flow.net, currencyCode)}
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
              {formatCurrency(account.balance, currencyCode)}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Spendable</p>
            <p className="mt-2 text-2xl font-extrabold text-ink">
              {formatCurrency(spendable, currencyCode)}
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
                {formatCurrency(flow.income, currencyCode)}
              </p>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Expected out</p>
              <p className="mt-2 text-xl font-bold tracking-tight text-neg">
                -{formatCurrency(flow.expenses, currencyCode)}
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
              {formatCurrency(account.liveRate, currencyCode)}
            </p>
            {account.liveRateUpdatedAt ? (
              <p className="mt-2 text-sm text-muted">{account.liveRateUpdatedAt}</p>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={openTransfer}
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

      <PickerSheet
        title="Edit account"
        open={sheet === "edit"}
        onClose={closeSheet}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={closeSheet} className={cancelButton}>
              Cancel
            </button>
            <button type="button" onClick={saveEdit} className={primaryButton}>
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="block">
            <span className={fieldLabel}>Account name</span>
            <input
              value={editForm.name}
              onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
              className={fieldInput}
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>Opening balance</span>
            <input
              value={editForm.openingBalance}
              onChange={(event) => setEditForm((current) => ({ ...current, openingBalance: event.target.value }))}
              inputMode="decimal"
              className={fieldInput}
            />
          </label>
          {account.classification === "credit" ? (
            <label className="block">
              <span className={fieldLabel}>Credit limit</span>
              <input
                value={editForm.creditLimit}
                onChange={(event) => setEditForm((current) => ({ ...current, creditLimit: event.target.value }))}
                inputMode="decimal"
                className={fieldInput}
              />
            </label>
          ) : null}
        </div>
      </PickerSheet>

      <PickerSheet
        title="Delete account?"
        open={sheet === "delete"}
        onClose={closeSheet}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={closeSheet} className={cancelButton}>
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="min-h-[48px] rounded-2xl bg-neg px-4 text-sm font-bold text-white"
            >
              Delete
            </button>
          </div>
        }
      >
        <p className="text-sm leading-6 text-muted">
          <span className="font-semibold text-ink">{account.name}</span> will be removed from your wallet.
          {linkedCount
            ? ` Its ${linkedCount === 1 ? "1 transaction stays" : `${linkedCount} transactions stay`} in History.`
            : ""}
        </p>
      </PickerSheet>

      <PickerSheet
        title="Transfer money"
        open={sheet === "transfer"}
        onClose={closeSheet}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={closeSheet} className={cancelButton}>
              Cancel
            </button>
            <button type="button" onClick={saveTransfer} className={primaryButton}>
              Transfer
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-muted">
            From <span className="font-semibold text-ink">{account.name}</span>
          </p>
          <label className="block">
            <span className={fieldLabel}>To account</span>
            <select
              value={transferForm.toAccountId}
              onChange={(event) => setTransferForm((current) => ({ ...current, toAccountId: event.target.value }))}
              className={fieldInput}
            >
              {otherAccounts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={fieldLabel}>Amount</span>
            <input
              value={transferForm.amount}
              onChange={(event) => setTransferForm((current) => ({ ...current, amount: event.target.value }))}
              inputMode="decimal"
              placeholder="0.00"
              className={fieldInput}
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>Date</span>
            <input
              type="date"
              value={transferForm.date}
              onChange={(event) => setTransferForm((current) => ({ ...current, date: event.target.value }))}
              className={fieldInput}
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>Note</span>
            <input
              value={transferForm.notes}
              onChange={(event) => setTransferForm((current) => ({ ...current, notes: event.target.value }))}
              className={fieldInput}
            />
          </label>
        </div>
      </PickerSheet>
    </section>
  );
}
