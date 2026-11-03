import { EyeIcon, EyeSlashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Susi } from "../components/illustrations/Susi";
import { BrandMark } from "../components/ui/BrandMark";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageIntro } from "../components/ui/PageIntro";
import { PickerSheet } from "../components/ui/PickerSheet";
import { Segmented } from "../components/ui/Segmented";
import { WalletCard } from "../components/ui/WalletCard";
import { showToast } from "../components/Toast";
import { APP_BRANDING } from "../config/app";
import { ACCOUNT_PRESETS } from "../lib/catalog";
import { formatCurrency, getCurrencyOptions, getWalletSummary } from "../lib/finance";
import { accountDetails, accountInitials } from "../lib/ui";
import { accountCurrency } from "../lib/fx";
import { useStore } from "../store/useStore";
import { useFxStore } from "../hooks/useFxRates";
import type { AccountType, CurrencyCode } from "../types/finance";

type WalletTab = "all" | "debit" | "credit";

const starterBalances: Record<string, number> = {
  gcash: 5200,
  gotyme: 24450,
  bpi: 8900,
  bdo: 10450,
  maya: 3250,
  wise: 420,
  rcbc: 6300,
  apple: 38526.2,
  bitcoin: 3330.44,
};

function getDailyBars(values: number[]) {
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

export default function Wallet() {
  const store = useStore();
  const navigate = useNavigate();
  const rates = useFxStore((state) => state.rates);
  const wallet = getWalletSummary(store, rates);
  const [tab, setTab] = useState<WalletTab>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [hidden, setHidden] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>(ACCOUNT_PRESETS[0].key);
  const [accountName, setAccountName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [newCurrency, setNewCurrency] = useState<CurrencyCode | "">("");

  const selectedPreset = ACCOUNT_PRESETS.find((preset) => preset.key === selectedPresetKey) ?? ACCOUNT_PRESETS[0];

  const visibleAccounts = useMemo(() => {
    if (tab === "all") return wallet.balances;
    return wallet.balances.filter((account) => account.classification === tab);
  }, [tab, wallet.balances]);

  const weekValues = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date.toISOString().split("T")[0];
    });

    return dates.map((date) =>
      store.transactions
        .filter((transaction) => transaction.date === date)
        .reduce(
          (sum, transaction) =>
            sum +
            (transaction.type === "income"
              ? transaction.amount
              : transaction.type === "expense"
              ? transaction.amount
              : 0),
          0
        )
    );
  }, [store.transactions]);

  const bars = getDailyBars(weekValues);
  const strongest = [...wallet.balances].sort((first, second) => second.mainBalance - first.mainBalance)[0];
  const currency = store.settings.currencyCode;
  const money = (amount: number, code: string = currency) =>
    hidden ? "••••••" : formatCurrency(amount, code);
  const assets = wallet.assets + wallet.receivables;
  const liabilities = wallet.creditUsed + wallet.debts;

  const createAccount = () => {
    const name = accountName.trim() || selectedPreset.name;
    const balance = Number(openingBalance) || starterBalances[selectedPreset.key] || 0;

    store.addAccount({
      name,
      type: selectedPreset.type as AccountType,
      classification: selectedPreset.classification,
      openingBalance: balance,
      color: selectedPreset.color,
      icon: selectedPreset.icon,
      currencyCode: newCurrency || selectedPreset.currencyCode || currency,
      institution: selectedPreset.name,
      details: selectedPreset.details,
      annualYield: "annualYield" in selectedPreset ? selectedPreset.annualYield : undefined,
      creditLimit: "creditLimit" in selectedPreset ? selectedPreset.creditLimit : undefined,
      liveRate: "liveRate" in selectedPreset ? selectedPreset.liveRate : undefined,
      liveRateUpdatedAt: "liveRateUpdatedAt" in selectedPreset ? selectedPreset.liveRateUpdatedAt : undefined,
      unitsLabel: "unitsLabel" in selectedPreset ? selectedPreset.unitsLabel : undefined,
    });

    setIsPickerOpen(false);
    setAccountName("");
    setOpeningBalance("0");
    setNewCurrency("");
    setSelectedPresetKey(ACCOUNT_PRESETS[0].key);
    showToast("Account added to your wallet.", "success");
  };

  return (
    <section className="space-y-4 md:space-y-5">
      <PageIntro
        eyebrow={APP_BRANDING.shortName}
        title="Wallet"
        action={
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-on-brand transition hover:brightness-110"
            aria-label="Add account"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        }
      />

      <section className="bg-brand-gradient flex items-center gap-4 rounded-3xl p-5 md:p-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85">Net worth</p>
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
          <p className="mt-1 truncate text-3xl font-extrabold tracking-tight md:text-4xl">
            {money(wallet.netWorth)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/15 px-4 py-3">
              <p className="text-xs text-white/85">Assets</p>
              <p className="truncate text-base font-bold">{money(assets)}</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3">
              <p className="text-xs text-white/85">Liabilities</p>
              <p className="truncate text-base font-bold">{money(liabilities)}</p>
            </div>
          </div>
        </div>
        <Susi mood="think" size={96} className="hidden sm:block" />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          ariaLabel="Account type"
          value={tab}
          onChange={setTab}
          options={[
            { value: "all", label: "All" },
            { value: "debit", label: "Debit" },
            { value: "credit", label: "Credit" },
          ]}
        />
        <Segmented
          ariaLabel="Layout"
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
          ]}
        />
      </div>

      {!wallet.balances.length ? (
        <EmptyState
          title="Add your first wallet"
          description="Track cash, bank, e-wallet, and credit accounts in one place."
          actionLabel="Add account"
          onAction={() => setIsPickerOpen(true)}
          illustration={<Susi mood="think" size={96} />}
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleAccounts.map((account) => {
            const isCredit = account.classification === "credit" && Boolean(account.creditLimit);
            const limit = account.creditLimit ?? 0;
            const code = accountCurrency(account, currency);
            return (
              <WalletCard
                key={account.id}
                name={account.name}
                initials={accountInitials(account.name, account.icon, code)}
                color={account.color}
                label={isCredit ? "Available credit" : "Balance"}
                amount={money(isCredit ? limit - account.balance : account.balance, code)}
                usage={isCredit ? account.balance / limit : undefined}
                onClick={() => navigate(`/wallet/${account.id}`)}
              />
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-line">
            {visibleAccounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => navigate(`/wallet/${account.id}`)}
                className="flex min-h-[60px] w-full items-center gap-3 py-2 text-left"
              >
                <BrandMark
                  label={accountInitials(account.name, account.icon, accountCurrency(account, currency))}
                  color={account.color}
                  textColor="#ffffff"
                  size="sm"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{account.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {accountDetails(account.details, account.classification, accountCurrency(account, currency))}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-bold text-ink">
                  {money(account.balance, accountCurrency(account, currency))}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">Insight</p>
          <p className="mt-1 text-base font-semibold text-ink">Forecast cashflow</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            {strongest
              ? `${strongest.name} is holding the line. Plenty compared to usual day-to-day chaos, so the goal now is protecting it.`
              : "Add a couple of accounts and this panel will start sounding like an actual wallet coach."}
          </p>
        </Card>

        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Daily activity</p>
          <div className="mt-4 flex h-24 items-end justify-between gap-2">
            {bars.map((bar, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-2.5 rounded-full ${bar.active ? "bg-brand" : "bg-brand/30"}`}
                  style={{ height: `${bar.height}px` }}
                />
                <span className={`text-xs font-semibold ${bar.active ? "text-ink" : "text-muted"}`}>
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <PickerSheet
        title="Choose an account"
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsPickerOpen(false)}
              className="min-h-[48px] rounded-2xl border border-line bg-raised px-4 text-sm font-bold text-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createAccount}
              className="min-h-[48px] rounded-2xl bg-brand px-4 text-sm font-bold text-on-brand"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {ACCOUNT_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => {
                  setSelectedPresetKey(preset.key);
                  setAccountName(preset.name);
                  setOpeningBalance(String(starterBalances[preset.key] ?? 0));
                  setNewCurrency("");
                }}
                className={`rounded-2xl border px-2 py-4 text-center transition ${
                  selectedPresetKey === preset.key ? "border-brand bg-brand/10" : "border-line bg-raised"
                }`}
              >
                <div className="mx-auto w-fit">
                  <BrandMark label={preset.icon} color={preset.color} textColor="#ffffff" size="md" />
                </div>
                <p className="mt-3 truncate text-sm font-semibold text-ink">{preset.name}</p>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Account name
              </span>
              <input
                value={accountName}
                onChange={(event) => setAccountName(event.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-line bg-raised px-4 text-base text-ink outline-none focus:border-brand"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Opening balance
              </span>
              <input
                value={openingBalance}
                onChange={(event) => setOpeningBalance(event.target.value)}
                inputMode="decimal"
                className="min-h-[48px] w-full rounded-2xl border border-line bg-raised px-4 text-base text-ink outline-none focus:border-brand"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Account currency
              </span>
              <select
                value={newCurrency || selectedPreset.currencyCode || currency}
                onChange={(event) => setNewCurrency(event.target.value as CurrencyCode)}
                className="min-h-[48px] w-full rounded-2xl border border-line bg-raised px-4 text-base text-ink outline-none focus:border-brand"
              >
                {getCurrencyOptions().map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </PickerSheet>
    </section>
  );
}
