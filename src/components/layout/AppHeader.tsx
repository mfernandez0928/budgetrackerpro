import { ArrowRightOnRectangleIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { signOut } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import { APP_BRANDING } from "../../config/app";
import { useAuth } from "../../context/AuthContext";
import { formatMonthLabel, getMonthKey } from "../../lib/date";
import { showToast } from "../Toast";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Money at a glance",
    subtitle: "See balance, budgets, bills, and habits in one place.",
  },
  "/transactions": {
    title: "Transactions",
    subtitle: "Capture spending quickly and keep every account in sync.",
  },
  "/planning": {
    title: "Plan your month",
    subtitle: "Set category budgets and stay ahead of recurring bills.",
  },
  "/goals": {
    title: "Savings goals",
    subtitle: "Turn plans into milestones with visible progress.",
  },
  "/insights": {
    title: "Insights",
    subtitle: "Spot trends, top categories, and behavior changes.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Fine-tune preferences, backups, and install behavior.",
  },
};

export function AppHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const copy = pageTitles[pathname] ?? pageTitles["/dashboard"];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <img
              src="/icon-192.svg"
              alt={`${APP_BRANDING.name} icon`}
              className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 p-1"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {APP_BRANDING.shortName}
              </p>
              <p className="truncate text-xs text-slate-400">
                {formatMonthLabel(getMonthKey())}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-semibold text-white">{copy.title}</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-400">{copy.subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
            aria-label="Open settings"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={async () => {
              await signOut(auth);
              showToast("Signed out successfully.", "success");
              navigate("/auth", { replace: true });
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <img
              src={user?.photoURL ?? "/icon-192.svg"}
              alt={user?.displayName ?? "User avatar"}
              className="h-6 w-6 rounded-full"
            />
            <span className="hidden sm:inline">{user?.displayName?.split(" ")[0] ?? "Account"}</span>
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
