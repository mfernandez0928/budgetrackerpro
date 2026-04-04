import { NavLink, Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { BottomNavigation } from "./BottomNavigation";
import { InstallPromptCard } from "../pwa/InstallPromptCard";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

const desktopLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/transactions", label: "Transactions" },
  { to: "/planning", label: "Planning" },
  { to: "/goals", label: "Goals" },
  { to: "/insights", label: "Insights" },
  { to: "/settings", label: "Settings" },
];

export function AppShell() {
  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AppHeader />
      {!isOnline ? (
        <div className="border-b border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          You are offline. New entries are still saved locally on this device.
        </div>
      ) : null}
      <div className="mx-auto hidden max-w-6xl px-4 py-4 md:block">
        <nav className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-2">
          {desktopLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-teal-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-10">
        <Outlet />
      </main>
      <InstallPromptCard />
      <BottomNavigation />
    </div>
  );
}
