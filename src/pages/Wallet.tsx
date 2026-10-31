import { EllipsisHorizontalIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Susi } from "../components/illustrations/Susi";
import { BrandMark } from "../components/ui/BrandMark";
import { PageIntro } from "../components/ui/PageIntro";
import { PickerSheet } from "../components/ui/PickerSheet";
import { showToast } from "../components/Toast";
import { ACCOUNT_PRESETS } from "../lib/catalog";
import { formatCurrency, getWalletSummary } from "../lib/finance";
import { useStore } from "../store/useStore";
import type { AccountType } from "../types/finance";

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
  return values.map((value, index) => ({
    day: ["T", "W", "T", "F", "S", "S", "M"][index] ?? "D",
    height: Math.max(18, Math.round((value / max) * 86)),
    active: index === values.length - 1,
  }));
}

export default function Wallet() {
  const store = useStore();
  const navigate = useNavigate();
  const wallet = getWalletSummary(store);
  const [tab, setTab] = useState<WalletTab>("all");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>(ACCOUNT_PRESETS[0].key);
  const [accountName, setAccountName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("0");

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
  const strongest = [...wallet.balances].sort((first, second) => second.balance - first.balance)[0];

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
      currencyCode: selectedPreset.currencyCode,
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
    setSelectedPresetKey(ACCOUNT_PRESETS[0].key);
    showToast("Account added to your wallet.", "success");
  };

  return (
    <section className="space-y-6">
      <PageIntro
        title="Accounts"
        description="Manage your wallets and balances"
        action={
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="hidden items-center gap-3 rounded-full bg-[#edf6ee] px-6 py-4 text-xl font-bold text-[#5e985d] shadow-[0_20px_50px_rgba(148,163,184,0.14)] sm:inline-flex"
          >
            <PlusIcon className="h-6 w-6" />
            Add Account
          </button>
        }
      />

      <section className="overflow-hidden rounded-[2.25rem] bg-[#5d955d]">
        <div className="flex flex-col gap-4 px-4 pt-4 md:flex-row md:items-end">
          <Susi mood="think" />
          <div className="flex-1 space-y-4 pb-4">
            <div className="rounded-[2rem] bg-white/95 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Net worth
                  </p>
                  <p className="mt-2 text-[3rem] font-black tracking-[-0.06em] text-slate-900">
                    {formatCurrency(wallet.netWorth, store.settings.currencyCode)}
                  </p>
                  <p className="mt-1 text-lg text-slate-400">Debit balances and investments</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 px-4 py-3 text-right">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Change
                  </p>
                  <p className="mt-1 text-xl font-black text-slate-400">0.0%</p>
                </div>
              </div>
            </div>

            <div className="inline-flex rounded-[1.6rem] bg-transparent p-0.5">
              {(["all", "debit", "credit"] as WalletTab[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`min-w-[110px] rounded-[1.3rem] border px-6 py-3 text-lg font-bold capitalize transition ${
                    tab === item
                      ? "border-[#d7ead6] bg-[#5e985d] text-white"
                      : "border-[#d7ead6] bg-white text-slate-500"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5e985d]">Insight</p>
            <p className="text-xl font-bold text-slate-400">Forecast cashflow</p>
          </div>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-9 text-slate-500">
            {strongest
              ? `${strongest.name} is holding the line. Plenty compared to usual day-to-day chaos, so the goal now is protecting it.`
              : "Add a couple of accounts and this panel will start sounding like an actual wallet coach."}
          </p>
        </section>

        <section className="rounded-[2rem] bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.14)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Daily balance
          </p>
          <div className="mt-8 flex h-32 items-end justify-between gap-3">
            {bars.map((bar) => (
              <div key={`${bar.day}-${bar.height}`} className="flex flex-1 flex-col items-center gap-3">
                <div
                  className={`w-3 rounded-full ${bar.active ? "bg-[#5e985d]" : "bg-[#c9dec8]"}`}
                  style={{ height: `${bar.height}px` }}
                />
                <span className={`text-sm font-semibold ${bar.active ? "text-slate-900" : "text-slate-400"}`}>
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="text-lg text-slate-400">Press and hold an account card to rearrange it.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleAccounts.map((account) => (
          <button
            key={account.id}
            type="button"
            onClick={() => navigate(`/wallet/${account.id}`)}
            className="relative overflow-hidden rounded-[2rem] p-5 text-left text-white shadow-[0_28px_60px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5"
            style={{ background: `linear-gradient(145deg, ${account.color}, ${account.color}dd)` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <BrandMark
                  label={account.icon ?? account.name.slice(0, 2).toUpperCase()}
                  color="rgba(255,255,255,0.18)"
                  textColor="#ffffff"
                  size="md"
                />
                <div>
                  <p className="text-[1.1rem] font-bold">{account.name}</p>
                  <p className="mt-2 text-lg text-white/75">{account.details ?? `${account.classification} • ${account.currencyCode ?? store.settings.currencyCode}`}</p>
                </div>
              </div>
              <EllipsisHorizontalIcon className="h-6 w-6 text-white/75" />
            </div>

            {account.classification === "credit" && account.creditLimit ? (
              <div className="mt-10">
                <div className="h-3 rounded-full bg-white/35">
                  <div
                    className="h-3 rounded-full bg-[#5d955d]"
                    style={{ width: `${Math.min(100, Math.round((account.balance / account.creditLimit) * 100))}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-lg text-white/80">
                  <span>{Math.round((account.balance / account.creditLimit) * 100)}% used</span>
                  <span>{formatCurrency(account.creditLimit - account.balance, account.currencyCode ?? store.settings.currencyCode)} left</span>
                </div>
              </div>
            ) : null}

            <div className="mt-12">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">Balance</p>
              <p className="mt-2 text-[2.3rem] font-black tracking-[-0.05em]">
                {formatCurrency(account.balance, account.currencyCode ?? store.settings.currencyCode)}
              </p>
              {account.unitsLabel ? <p className="mt-2 text-lg text-white/75">{account.unitsLabel}</p> : null}
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsPickerOpen(true)}
        className="inline-flex items-center gap-3 rounded-full bg-[#edf6ee] px-6 py-4 text-lg font-bold text-[#5e985d] shadow-[0_20px_50px_rgba(148,163,184,0.14)] sm:hidden"
      >
        <PlusIcon className="h-6 w-6" />
        Add Account
      </button>

      <PickerSheet
        title="Choose an account"
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        footer={
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setIsPickerOpen(false)}
              className="rounded-[1.6rem] border border-slate-200 bg-white px-4 py-4 text-lg font-bold text-slate-400"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createAccount}
              className="rounded-[1.6rem] bg-[#5e985d] px-4 py-4 text-lg font-bold text-white"
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
                }}
                className={`rounded-[1.7rem] border px-3 py-5 text-center transition ${
                  selectedPresetKey === preset.key
                    ? "border-[#5e985d] bg-[#f3faf3]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="mx-auto w-fit">
                  <BrandMark label={preset.icon} color={preset.color} textColor="#ffffff" size="md" />
                </div>
                <p className="mt-4 text-xl font-bold text-slate-900">{preset.name}</p>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Account name
              </span>
              <input
                value={accountName}
                onChange={(event) => setAccountName(event.target.value)}
                className="w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-lg text-slate-900 outline-none focus:border-[#5e985d]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Opening balance
              </span>
              <input
                value={openingBalance}
                onChange={(event) => setOpeningBalance(event.target.value)}
                inputMode="decimal"
                className="w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-lg text-slate-900 outline-none focus:border-[#5e985d]"
              />
            </label>
          </div>
        </div>
      </PickerSheet>
    </section>
  );
}
