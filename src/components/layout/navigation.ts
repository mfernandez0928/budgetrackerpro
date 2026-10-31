import {
  ChartBarIcon,
  ChartPieIcon,
  ClockIcon,
  Cog6ToothIcon,
  HomeIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import type { NavKey } from "../../lib/ui";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export interface NavItem {
  key: NavKey;
  to: string;
  label: string;
  icon: Icon;
}

// Shared by the desktop Sidebar and the mobile BottomNavigation so both stay in sync.
export const primaryNav: NavItem[] = [
  { key: "home", to: "/dashboard", label: "Home", icon: HomeIcon },
  { key: "wallet", to: "/wallet", label: "Wallet", icon: WalletIcon },
  { key: "plan", to: "/plan", label: "Plan", icon: ChartPieIcon },
];

export const moreNav: { to: string; label: string; icon: Icon }[] = [
  { to: "/transactions", label: "History", icon: ClockIcon },
  { to: "/insights", label: "Insights", icon: ChartBarIcon },
  { to: "/settings", label: "Settings", icon: Cog6ToothIcon },
];

export const quickActions = [
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
