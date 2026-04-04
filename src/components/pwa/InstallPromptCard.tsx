import { useState } from "react";
import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { showToast } from "../Toast";

export function InstallPromptCard() {
  const { canInstall, promptToInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 rounded-3xl border border-teal-400/30 bg-slate-950/95 p-4 shadow-2xl shadow-teal-950/40 backdrop-blur md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        aria-label="Dismiss install prompt"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-teal-400/15 p-3 text-teal-300">
          <ArrowDownTrayIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Install for faster access</p>
          <p className="mt-1 text-sm text-slate-400">
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
            className="mt-4 inline-flex items-center rounded-full bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
          >
            Install app
          </button>
        </div>
      </div>
    </div>
  );
}
