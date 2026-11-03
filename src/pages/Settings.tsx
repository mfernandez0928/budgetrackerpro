import { useRef, type ReactNode } from "react";
import { ArrowDownTrayIcon, ArrowUpTrayIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { useStore } from "../store/useStore";
import { useAuth } from "../context/AuthContext";
import { useSyncStatus } from "../hooks/useCloudSync";
import { getCurrencyOptions } from "../lib/finance";
import { exportSnapshotAsJson, exportTransactionsAsCsv, parseCsvTransactions, parseJsonSnapshot } from "../lib/export";
import { Card } from "../components/ui/Card";
import { PageIntro } from "../components/ui/PageIntro";
import { Segmented } from "../components/ui/Segmented";
import { showToast } from "../components/Toast";
import type { ThemeMode } from "../types/finance";

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{label}</p>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

const actionButton =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-line bg-raised px-4 text-sm font-semibold text-ink transition hover:bg-brand/10";

const checkbox = "h-5 w-5 rounded border-line accent-[rgb(var(--brand))]";

export default function Settings() {
  const store = useStore();
  const { user } = useAuth();
  const importRef = useRef<HTMLInputElement>(null);
  const sync = useSyncStatus();
  const syncLabel =
    sync.status === "error"
      ? `Cloud sync failed: ${sync.error}`
      : sync.status === "syncing"
      ? "Syncing with your account…"
      : sync.lastSyncedAt
      ? `Synced across your devices · ${new Date(sync.lastSyncedAt).toLocaleString()}`
      : "Cloud sync starts once you are online.";

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
    <section className="space-y-4 md:space-y-5">
      <PageIntro title="Settings" />

      <Card title="Profile">
        <div className="flex items-center gap-3">
          <img
            src={user?.photoURL ?? "/icon-192.svg"}
            alt=""
            className="h-12 w-12 rounded-full border border-line"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{user?.displayName ?? "Your account"}</p>
            <p className="truncate text-sm text-muted">{user?.email ?? "Signed in with Google"}</p>
          </div>
        </div>
        <p className={`mt-4 text-sm ${sync.status === "error" ? "text-neg" : "text-muted"}`}>
          {syncLabel}
        </p>
      </Card>

      <Card title="Appearance">
        <div className="divide-y divide-line">
          <SettingRow
            label="Theme"
            description="System follows your device setting."
            control={
              <Segmented<ThemeMode>
                ariaLabel="Theme"
                size="sm"
                value={store.settings.themeMode}
                onChange={(themeMode) => store.updateSettings({ themeMode })}
                options={[
                  { value: "system", label: "System" },
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
              />
            }
          />
          <SettingRow
            label="Currency"
            control={
              <select
                value={store.settings.currencyCode}
                onChange={(event) =>
                  store.updateSettings({
                    currencyCode: event.target.value as typeof store.settings.currencyCode,
                  })
                }
                className="min-h-[44px] rounded-2xl border border-line bg-raised px-4 text-sm text-ink outline-none focus:border-brand"
              >
                {getCurrencyOptions().map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            }
          />
          <SettingRow
            label="Notifications"
            description="Store reminder preference for recurring bills and due nudges."
            control={
              <input
                type="checkbox"
                aria-label="Notifications"
                checked={store.settings.notificationsEnabled}
                onChange={(event) => store.updateSettings({ notificationsEnabled: event.target.checked })}
                className={checkbox}
              />
            }
          />
          <SettingRow
            label="Reduced motion"
            description="Tone down movement for accessibility and calmer interactions."
            control={
              <input
                type="checkbox"
                aria-label="Reduced motion"
                checked={store.settings.reducedMotion}
                onChange={(event) => store.updateSettings({ reducedMotion: event.target.checked })}
                className={checkbox}
              />
            }
          />
        </div>
      </Card>

      <Card title="Data and backup">
        <p className="-mt-2 mb-4 text-sm text-muted">
          Back up the full local dataset or move transactions in and out with CSV.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
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
            className={actionButton}
          >
            <ArrowDownTrayIcon className="h-5 w-5 text-brand" />
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
            className={actionButton}
          >
            <ArrowDownTrayIcon className="h-5 w-5 text-brand" />
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
          <button type="button" onClick={() => importRef.current?.click()} className={actionButton}>
            <ArrowUpTrayIcon className="h-5 w-5 text-brand" />
            Import JSON or CSV
          </button>
        </div>
      </Card>

      <Card title="App and install">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-brand/15 p-3 text-brand">
            <DevicePhoneMobileIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Install guidance</p>
            <p className="mt-1 text-sm text-muted">
              Use the install prompt when available. Core assets are cached, and offline entry
              continues to work because data saves on this device first and syncs when you are back online.
            </p>
          </div>
        </div>
      </Card>

      <section className="rounded-3xl border border-neg/30 bg-neg/10 p-4 md:p-5">
        <p className="text-base font-semibold text-ink">Start fresh</p>
        <p className="mt-1 text-sm text-muted">
          Clear budgets, goals, accounts, and transactions. This also clears them on your other
          devices once they sync.
        </p>
        <button
          type="button"
          onClick={() => {
            const confirmed = window.confirm(
              "Reset all app data on this device and your synced devices? This cannot be undone."
            );
            if (!confirmed) return;
            store.resetToDefaults();
            showToast("All local app data has been reset.", "success");
          }}
          className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-neg px-5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Reset local data
        </button>
      </section>
    </section>
  );
}
