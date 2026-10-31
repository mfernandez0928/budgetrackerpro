import { NavLink, Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { InstallPromptCard } from "../pwa/InstallPromptCard";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

const desktopLinks = [
  { to: "/dashboard", label: "Home" },
  { to: "/wallet", label: "Wallet" },
  { to: "/transactions", label: "History" },
  { to: "/plan", label: "Plan" },
  { to: "/insights", label: "Insights" },
  { to: "/settings", label: "Settings" },
];

export function AppShell() {
  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      {!isOnline ? (
        <div className="sticky top-0 z-30 border-b border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-700 backdrop-blur">
          You are offline. New entries are still saved locally on this device.
        </div>
      ) : null}

      <div className="mx-auto hidden max-w-6xl px-4 pt-6 md:block">
        <nav className="flex flex-wrap gap-2 rounded-full border border-slate-200/80 bg-white/90 p-2 shadow-[0_20px_60px_rgba(148,163,184,0.12)] backdrop-blur">
          {desktopLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#5e985d] text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-36 pt-6 md:pb-10 md:pt-8">
        <Outlet />
      </main>

      <InstallPromptCard />
      <BottomNavigation />
    </div>
  );
}
