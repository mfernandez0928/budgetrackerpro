import {
  BanknotesIcon,
  ClockIcon,
  HomeIcon,
  PlusIcon,
  WalletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Home", icon: HomeIcon },
  { to: "/wallet", label: "Wallet", icon: WalletIcon },
  { to: "/plan", label: "Plan", icon: BanknotesIcon },
  { to: "/transactions", label: "History", icon: ClockIcon },
];

const quickActions = [
  {
    label: "Add transaction",
    description: "Capture income, expense, or transfer",
    action: "/transactions",
  },
  {
    label: "Add account",
    description: "Set up a new wallet or bank account",
    action: "/wallet",
  },
  {
    label: "Set a budget",
    description: "Plan a category before money leaves",
    action: "/plan",
  },
  {
    label: "Create a goal",
    description: "Turn a target into a savings habit",
    action: "/plan",
  },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {isOpen ? (
        <div className="fixed inset-x-4 bottom-36 z-50 md:hidden">
          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.15)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#5e985d]">
                  Quick add
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  Pick the next money move
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                aria-label="Close quick actions"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {quickActions.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate(item.action);
                  }}
                  className="w-full rounded-[1.6rem] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-[#c3d8c3] hover:bg-[#f4faf4]"
                >
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 md:hidden">
        <div className="mx-auto flex max-w-xl items-end gap-3">
          <nav className="flex-1 rounded-[2rem] border border-white/80 bg-white/95 px-3 py-3 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur">
            <ul className="grid grid-cols-4 gap-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center rounded-[1.5rem] px-2 py-2.5 text-[11px] font-semibold transition ${
                        isActive
                          ? "bg-[#edf6ee] text-[#5e985d]"
                          : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    <item.icon className="mb-1.5 h-5 w-5" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="flex h-[86px] w-[86px] items-center justify-center rounded-[2rem] bg-[#5e985d] text-white shadow-[0_28px_60px_rgba(94,152,93,0.35)] transition hover:bg-[#518650]"
            aria-label="Open quick actions"
          >
            <PlusIcon className="h-9 w-9" />
          </button>
        </div>
      </div>
    </>
  );
}
