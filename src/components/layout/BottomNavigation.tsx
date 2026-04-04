import {
  BanknotesIcon,
  ChartBarIcon,
  CreditCardIcon,
  FlagIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Home", icon: HomeIcon },
  { to: "/transactions", label: "Activity", icon: CreditCardIcon },
  { to: "/planning", label: "Plan", icon: BanknotesIcon },
  { to: "/goals", label: "Goals", icon: FlagIcon },
  { to: "/insights", label: "Insights", icon: ChartBarIcon },
];

export function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/95 px-2 pb-5 pt-2 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
                  isActive
                    ? "bg-teal-400/15 text-teal-200"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon className="mb-1 h-5 w-5" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
