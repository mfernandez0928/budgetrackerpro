import { useState } from "react";
import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { showToast } from "../Toast";

export function InstallPromptCard() {
  const { canInstall, promptToInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed inset-x-4 bottom-[calc(100px+env(safe-area-inset-bottom))] z-40 rounded-3xl border border-brand/30 bg-surface p-4 shadow-2xl md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-raised hover:text-ink"
        aria-label="Dismiss install prompt"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-brand/15 p-3 text-brand">
          <ArrowDownTrayIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Install for faster access</p>
          <p className="mt-1 pr-8 text-sm text-muted">
            Add Budget Tracker Pro to your home screen for offline access and app-like launch.
          </p>
          <button
            type="button"
            onClick={async () => {
              const accepted = await promptToInstall();
              showToast(
                accepted ? "App install started." : "Install prompt dismissed.",
                "info"
              );
            }}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-brand px-5 text-sm font-semibold text-on-brand transition hover:brightness-110"
          >
            Install app
          </button>
        </div>
      </div>
    </div>
  );
}
