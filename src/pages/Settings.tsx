import { useRef } from "react";
import { ArrowDownTrayIcon, ArrowUpTrayIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { useStore } from "../store/useStore";
import { getCurrencyOptions } from "../lib/finance";
import { exportSnapshotAsJson, exportTransactionsAsCsv, parseCsvTransactions, parseJsonSnapshot } from "../lib/export";
import { SectionHeader } from "../components/ui/SectionHeader";
import { showToast } from "../components/Toast";

export default function Settings() {
  const store = useStore();
  const importRef = useRef<HTMLInputElement>(null);

  function downloadFile(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
        <SectionHeader
          eyebrow="Preferences"
          title="App settings"
          description="Control currency, theme, install behavior, data export, and reset."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
            <span className="text-sm font-semibold text-white">Currency</span>
            <select
              value={store.settings.currencyCode}
              onChange={(event) =>
                store.updateSettings({
                  currencyCode: event.target.value as typeof store.settings.currencyCode,
                })
              }
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-teal-400"
            >
              {getCurrencyOptions().map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
            <span className="text-sm font-semibold text-white">Theme mode</span>
            <select
              value={store.settings.themeMode}
              onChange={(event) =>
                store.updateSettings({
                  themeMode: event.target.value as typeof store.settings.themeMode,
                })
              }
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-teal-400"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>

          <label className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Notifications</p>
                <p className="mt-1 text-sm text-slate-400">
                  Store reminder preference for recurring bills and due nudges.
                </p>
              </div>
              <input
                type="checkbox"
                checked={store.settings.notificationsEnabled}
                onChange={(event) =>
                  store.updateSettings({ notificationsEnabled: event.target.checked })
                }
                className="mt-1 h-5 w-5 rounded border-white/10 bg-slate-900 text-teal-400"
              />
            </div>
          </label>

          <label className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Reduced motion</p>
                <p className="mt-1 text-sm text-slate-400">
                  Tone down movement for accessibility and calmer interactions.
                </p>
              </div>
              <input
                type="checkbox"
                checked={store.settings.reducedMotion}
                onChange={(event) =>
                  store.updateSettings({ reducedMotion: event.target.checked })
                }
                className="mt-1 h-5 w-5 rounded border-white/10 bg-slate-900 text-teal-400"
              />
            </div>
          </label>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
        <SectionHeader
          eyebrow="Data"
          title="Import and export"
          description="Back up the full local dataset or move transactions in and out with CSV."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              downloadFile(
                `budget-tracker-pro-${new Date().toISOString().split("T")[0]}.json`,
                exportSnapshotAsJson(store),
                "application/json"
              );
              showToast("JSON backup exported.", "success");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Export full JSON backup
          </button>
          <button
            type="button"
            onClick={() => {
              downloadFile(
                `budget-transactions-${new Date().toISOString().split("T")[0]}.csv`,
                exportTransactionsAsCsv(store.transactions, store.categories),
                "text/csv"
              );
              showToast("CSV export ready.", "success");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Export transactions CSV
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json,.csv"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const rawText = await file.text();
              if (file.name.endsWith(".json")) {
                store.importSnapshot(parseJsonSnapshot(rawText));
                showToast("JSON import complete.", "success");
              } else {
                const importedTransactions = parseCsvTransactions(
                  rawText,
                  store.categories,
                  store.accounts[0]?.id ?? "wallet-cash"
                );
                store.importSnapshot({
                  transactions: [...store.transactions, ...importedTransactions],
                });
                showToast("CSV transactions imported.", "success");
              }
              event.currentTarget.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => importRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            Import JSON or CSV
          </button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
        <SectionHeader
          eyebrow="Install"
          title="Progressive web app"
          description="The app is installable, offline-friendly, and ready for home screen launch."
        />
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-teal-400/15 p-3 text-teal-300">
              <DevicePhoneMobileIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Install guidance</p>
              <p className="mt-1 text-sm text-slate-400">
                Use the install prompt when available. Core assets are cached, and offline entry
                continues to work because all budgeting data stays local-first.
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Install prompt and service worker behavior can be edited in
                `src/components/pwa/InstallPromptCard.tsx` and `public/sw.js`.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-5">
        <SectionHeader
          eyebrow="Reset"
          title="Start fresh"
          description="Clear local budgets, goals, accounts, and transactions from this device."
        />
        <button
          type="button"
          onClick={() => {
            const confirmed = window.confirm(
              "Reset all local app data on this device? This cannot be undone."
            );
            if (!confirmed) return;
            store.resetToDefaults();
            showToast("All local app data has been reset.", "success");
          }}
          className="rounded-full bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-rose-300"
        >
          Reset local data
        </button>
      </div>
    </section>
  );
}
