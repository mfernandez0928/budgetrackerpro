import type { ThemeMode } from "../types/finance";

export function resolveTheme(mode: ThemeMode, prefersDark: boolean): "dark" | "light" {
  if (mode === "system") return prefersDark ? "dark" : "light";
  return mode;
}

export type NavKey = "home" | "wallet" | "plan" | "more";

export const MORE_ROUTES: readonly string[] = ["/transactions", "/insights", "/settings"];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function getActiveNavKey(pathname: string): NavKey | null {
  if (matchesRoute(pathname, "/dashboard")) return "home";
  if (matchesRoute(pathname, "/wallet")) return "wallet";
  if (matchesRoute(pathname, "/plan")) return "plan";
  if (MORE_ROUTES.some((route) => matchesRoute(pathname, route))) return "more";
  return null;
}

const SIDEBAR_KEY = "btp.sidebarCollapsed";

export function readSidebarCollapsed(
  storage: Pick<Storage, "getItem"> = window.localStorage,
): boolean {
  try {
    return storage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeSidebarCollapsed(
  value: boolean,
  storage: Pick<Storage, "setItem"> = window.localStorage,
): void {
  try {
    storage.setItem(SIDEBAR_KEY, value ? "1" : "0");
  } catch {
    // Storage blocked (private mode); collapse state just won't persist.
  }
}

export type Tone = "ok" | "warn" | "over";

export function progressTone(ratio: number, alertThreshold: number): Tone {
  if (!Number.isFinite(ratio)) return "ok";
  if (ratio > 1) return "over";
  if (ratio >= alertThreshold) return "warn";
  return "ok";
}

export function clampPercent(ratio: number): number {
  if (!Number.isFinite(ratio)) return 0;
  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

function parseLocalDate(dateISO: string) {
  const [year, month, day] = dateISO.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dayLabel(dateISO: string, today: string) {
  const diffDays = Math.round(
    (parseLocalDate(today).getTime() - parseLocalDate(dateISO).getTime()) / 86_400_000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return parseLocalDate(dateISO).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function groupByDay<T extends { date: string }>(
  items: T[],
  today: string,
): { label: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = item.date.slice(0, 10);
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([key, groupItems]) => ({ label: dayLabel(key, today), items: groupItems }));
}
