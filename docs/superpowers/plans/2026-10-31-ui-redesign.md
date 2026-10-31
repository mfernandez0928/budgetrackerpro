# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the whole app to a dark-first, token-based design with a working light theme, matching mobile/desktop navigation, and the new wolf mascot Susi — no feature or data changes.

**Architecture:** CSS custom properties (RGB triplets) in `src/index.css`, exposed as semantic Tailwind colors; every component uses those classes. One navigation config feeds a new desktop `Sidebar` and the mobile `BottomNavigation`. Small pure helpers in `src/lib/ui.ts` carry the only non-visual logic and are unit-tested; everything else is verified by `tsc`, `eslint`, `build`, and browser checks.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind 3.4, react-router 7, Recharts 3, Heroicons 2, Zustand 5, pnpm. Adds Vitest (dev only).

**Spec:** `docs/superpowers/specs/2026-10-31-ui-redesign-design.md` (visual reference: `docs/superpowers/specs/2026-10-31-ui-redesign-preview.html`)

## Global Constraints

- Pre-flight: the working tree has the user's uncommitted work on `main` in many of the files below. Do not start Task 1 until the user has decided how to handle it (commit it first, or work on a branch). Never `git add -A`; stage only the files a task lists.
- No changes to `src/store/*`, `src/types/*`, `src/lib/finance.ts` logic, `src/config/firebase.ts`, or routes in `App.tsx`.
- No new runtime dependencies. Only new dev dependency: `vitest`.
- No real bank logos or artwork. Wallet card art = gradient from `account.color`.
- No hardcoded palette in components: no `bg-white/9x`, `text-slate-900`, `#5e985d`, `bg-slate-950`, `teal-*` for brand. Use tokens: `bg-canvas`, `bg-surface`, `bg-raised`, `border-line`, `text-ink`, `text-muted`, `bg-brand`/`text-brand`, `text-on-brand`, `text-pos`, `text-neg`, `text-warn`.
- Token values (dark / light), verbatim from spec: `--bg #0b0d0c / #f4f6f2`, `--surface #141715 / #ffffff`, `--raised #1c201d / #f0f3ee`, `--line rgba(255,255,255,.08) / rgba(15,23,15,.08)`, `--text #f2f5f2 / #121712`, `--muted #8d968f / #69736b`, `--brand #6fbf6a / #4f9a4b`, `--brand-ink #0d1a0c / #ffffff`, `--pos #7ad275 / #2f8a2b`, `--neg #ff7a7a / #d63c3c`, `--warn #f5b54a / #b7791f`.
- Mascot name is exactly "Susi". No "Tarsi" or `BudgetBuddy` remains.
- Mobile nav slots, in order: Home, Wallet, +, Plan, More. More = History, Insights, Settings, Sign out. Desktop sidebar groups: "Main" (Home, Wallet, Plan), "More" (History, Insights, Settings).
- Tap targets ≥ 44×44px; safe-area insets via `env(safe-area-inset-*)` on bottom nav, sheets, shell top.
- UI copy stays English, sentence case.
- Every task ends with `npx tsc -b` and `npx eslint .` clean.

## Review Focus

- Theme set to System while the OS theme changes at runtime → app and `theme-color` follow without reload (test in Task 1: `resolveTheme`).
- Deep link to `/wallet/:id`, `/transactions`, `/insights`, `/settings` on mobile → correct bottom-nav item active ("Wallet" for detail, "More" for the rest) (test in Task 1: `getActiveNavKey`).
- `localStorage` blocked or throwing (private mode) → sidebar renders expanded, no crash (test in Task 1: `readSidebarCollapsed`).
- Budget ratio exactly at threshold, over 100%, or `NaN`/limit 0 → correct tone, bar width clamped 0–100 (test in Task 1: `progressTone`, `clampPercent`).
- Transactions near midnight / different dates → grouped under correct "Today" / "Yesterday" / date label (test in Task 1: `groupByDay`).

---

### Task 1: Vitest and pure UI helpers

**Files:**
- Modify: `package.json` (add `"test": "vitest run"` script; dev dep `vitest`)
- Create: `src/lib/ui.ts`
- Test: `src/lib/ui.test.ts`

**Interfaces:**
- Produces:
  - `resolveTheme(mode: ThemeMode, prefersDark: boolean): "dark" | "light"`
  - `type NavKey = "home" | "wallet" | "plan" | "more"`; `getActiveNavKey(pathname: string): NavKey | null`
  - `MORE_ROUTES: readonly string[]` = `["/transactions", "/insights", "/settings"]`
  - `readSidebarCollapsed(storage?: Pick<Storage, "getItem">): boolean`; `writeSidebarCollapsed(value: boolean, storage?: Pick<Storage, "setItem">): void` — key `"btp.sidebarCollapsed"`, default storage `window.localStorage`, both swallow exceptions.
  - `type Tone = "ok" | "warn" | "over"`; `progressTone(ratio: number, alertThreshold: number): Tone`; `clampPercent(ratio: number): number` (0–100 integer; `NaN` → 0)
  - `groupByDay<T extends { date: string }>(items: T[], today: string): { label: string; items: T[] }[]` — `date`/`today` are ISO `YYYY-MM-DD`; labels "Today", "Yesterday", else `"Oct 30"` format (`en-US`, `month: "short", day: "numeric"`); groups ordered newest first, item order preserved.

- [ ] **Step 1: Install Vitest** — `pnpm add -D vitest`; add `"test": "vitest run"` to scripts.
- [ ] **Step 2: Write failing tests in `src/lib/ui.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { clampPercent, getActiveNavKey, groupByDay, progressTone, readSidebarCollapsed, resolveTheme } from "./ui";

describe("resolveTheme", () => {
  it("follows explicit modes", () => {
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("light", true)).toBe("light");
  });
  it("follows OS in system mode", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});

describe("getActiveNavKey", () => {
  it.each([
    ["/dashboard", "home"], ["/wallet", "wallet"], ["/wallet/abc", "wallet"], ["/plan", "plan"],
    ["/transactions", "more"], ["/insights", "more"], ["/settings", "more"], ["/auth", null],
  ])("%s -> %s", (path, key) => expect(getActiveNavKey(path)).toBe(key));
});

describe("readSidebarCollapsed", () => {
  it("defaults to false when storage throws", () => {
    expect(readSidebarCollapsed({ getItem: () => { throw new Error("blocked"); } })).toBe(false);
  });
  it("reads stored true", () => {
    expect(readSidebarCollapsed({ getItem: () => "1" })).toBe(true);
  });
});

describe("progressTone / clampPercent", () => {
  it("tones", () => {
    expect(progressTone(0.5, 0.8)).toBe("ok");
    expect(progressTone(0.8, 0.8)).toBe("warn");
    expect(progressTone(1.01, 0.8)).toBe("over");
    expect(progressTone(Number.NaN, 0.8)).toBe("ok");
  });
  it("clamps", () => {
    expect(clampPercent(-1)).toBe(0);
    expect(clampPercent(1.7)).toBe(100);
    expect(clampPercent(0.333)).toBe(33);
    expect(clampPercent(Number.NaN)).toBe(0);
  });
});

describe("groupByDay", () => {
  it("labels and orders groups", () => {
    const items = [{ id: 1, date: "2026-10-29" }, { id: 2, date: "2026-10-31" }, { id: 3, date: "2026-10-30" }, { id: 4, date: "2026-10-31" }];
    const groups = groupByDay(items, "2026-10-31");
    expect(groups.map((g) => g.label)).toEqual(["Today", "Yesterday", "Oct 29"]);
    expect(groups[0].items.map((i) => i.id)).toEqual([2, 4]);
  });
});
```

- [ ] **Step 3: Run** `pnpm test` — Expected: FAIL, cannot resolve `./ui`.
- [ ] **Step 4: Implement `src/lib/ui.ts`** per the Interfaces block. Parse ISO dates as local dates (`new Date(y, m - 1, d)`), not `new Date("YYYY-MM-DD")` (UTC shift).
- [ ] **Step 5: Run** `pnpm test` — Expected: all PASS. Then `npx tsc -b`, `npx eslint .` clean.
- [ ] **Step 6: Commit** `git add package.json pnpm-lock.yaml src/lib/ui.ts src/lib/ui.test.ts` → `git commit -m "test: add vitest and ui helpers"`

---

### Task 2: Design tokens and theme wiring

**Files:**
- Modify: `tailwind.config.js`, `src/index.css`, `src/App.tsx:20-52`, `src/config/app.ts`, `public/manifest.webmanifest`, `index.html` (initial `theme-color`)

**Interfaces:**
- Consumes: `resolveTheme` (Task 1).
- Produces: Tailwind colors `canvas, surface, raised, line, ink, muted, brand, on-brand, pos, neg, warn` (all `rgb(var(--x) / <alpha-value>)`); CSS classes `.bg-brand-gradient`, `.bg-hero`, `.pb-nav` (mobile bottom padding = 96px + `env(safe-area-inset-bottom)`), `.pt-safe`, `.pb-safe`.

- [ ] **Step 1: `tailwind.config.js`** — extend `colors` with the tokens above; `borderColor.DEFAULT` stays Tailwind's; add `fontFamily.sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"]` (no webfont load).
- [ ] **Step 2: `src/index.css`** — `:root` (light) and `.dark` blocks with token triplets from Global Constraints (`--line` is the triplet `255 255 255` dark / `15 23 15` light; in Tailwind `line: "rgb(var(--line) / 0.08)"` — fixed alpha, no `<alpha-value>`). `body { background: rgb(var(--bg)); color: rgb(var(--text)); }`, `color-scheme: light` / `.dark { color-scheme: dark }`. Delete old radial-gradient body background and hardcoded `:root` colors. Gradients: `.bg-brand-gradient` dark `linear-gradient(140deg,#3f8d3b,#5fae58)` (same in light); `.bg-hero` dark `linear-gradient(120deg,#16301a,#1f4a26 45%,#2e6b33)`, light `linear-gradient(120deg,#dff0db,#c7e6c1 50%,#a9d7a2)`. Keep `prefers-reduced-motion` block.
- [ ] **Step 3: `src/App.tsx`** — replace the theme effect: compute with `resolveTheme(settings.themeMode, mql.matches)`, toggle `dark` class, set `meta[name="theme-color"]` to `#0b0d0c` (dark) / `#f4f6f2` (light); subscribe to `matchMedia("(prefers-color-scheme: dark)")` `change` and clean up. Wrapper `div` and Suspense fallback use `bg-canvas text-ink` / `text-muted`.
- [ ] **Step 4: `src/config/app.ts`, manifest, `index.html`** — `themeColor` and `background_color`/`theme_color` → `#0b0d0c`.
- [ ] **Step 5: Verify** `npx tsc -b`, `npx eslint .`, `pnpm build` pass. Run `pnpm dev`, toggle Settings theme: page background flips between `#0b0d0c` and `#f4f6f2`.
- [ ] **Step 6: Commit** listed files → `feat(ui): add design tokens and theme wiring`

---

### Task 3: Shared UI primitives

**Files:**
- Create: `src/components/ui/Card.tsx`, `src/components/ui/Segmented.tsx`
- Modify: `src/components/ui/PageIntro.tsx`, `StatCard.tsx`, `ProgressBar.tsx`, `EmptyState.tsx`, `SectionHeader.tsx`, `PickerSheet.tsx`, `BrandMark.tsx`, `src/components/Toast.tsx`

**Interfaces:**
- Consumes: tokens (Task 2), `progressTone`, `clampPercent` (Task 1).
- Produces:
  - `Card({ title?: string; action?: ReactNode; className?: string; children: ReactNode })` — `bg-surface border border-line rounded-3xl p-4 md:p-5`; header row when `title` or `action`.
  - `CardLink({ to: string; children: ReactNode })` — brand pill link ("View all →" style).
  - `Segmented<T extends string>({ value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; size?: "sm" | "md"; ariaLabel: string })` — `role="radiogroup"`, items `role="radio"`, arrow-key navigation.
  - `PageIntro({ title: string; eyebrow?: string; description?: string; action?: ReactNode })` — `description` becomes optional (existing callers keep working).
  - `ProgressBar({ value: number; alertThreshold?: number /* default 0.8 */; colorClass?: string })` — color from `progressTone` unless `colorClass` given; width from `clampPercent`.
  - `EmptyState` gains optional `illustration?: ReactNode`.
  - `StatCard`, `SectionHeader`, `PickerSheet`, `BrandMark`, `Toast` — same props, token styles only. `PickerSheet` adds `pb-safe`, Escape-to-close if missing.

- [ ] **Step 1: Implement** the above. Type scale: eyebrow `text-[11px] uppercase tracking-[0.16em] font-semibold text-muted`; page title `text-[26px] md:text-[30px] font-bold tracking-tight`; section title `text-base font-semibold`.
- [ ] **Step 2: Verify** `npx tsc -b`, `npx eslint .` clean; `pnpm test` still passes.
- [ ] **Step 3: Commit** listed files → `feat(ui): restyle shared primitives with tokens`

---

### Task 4: Susi mascot

**Files:**
- Create: `src/components/illustrations/Susi.tsx`
- Delete: `src/components/illustrations/BudgetBuddy.tsx`
- Modify: `src/pages/Dashboard.tsx` (import + label only), `src/pages/Wallet.tsx` (import only)

**Interfaces:**
- Produces: `Susi({ mood?: "wave" | "think"; size?: number /* 128 */; className?: string })`, renders `<svg aria-hidden="true" viewBox="0 0 120 120">`.

- [ ] **Step 1: Implement `Susi.tsx`** — port the `#susi` symbol paths from the preview HTML (ears `#6b7480`, head `#8a94a0`, muzzle `#eef1f4`, eyes/nose `#16202a`, scarf `#5fae58`/`#3f8d3b`). `wave`: add a raised paw (`#8a94a0` ellipse + `#eef1f4` pad) at lower right. `think`: rotate head group `-6deg` around center and add a small `#eef1f4` circle top-right.
- [ ] **Step 2: Swap usages** — `BudgetBuddy mood="wave"` → `Susi mood="wave"`; `mood="book"` → `Susi mood="think"`; "Tarsi" → "Susi". Delete `BudgetBuddy.tsx`.
- [ ] **Step 3: Verify** `grep -rn "BudgetBuddy\|Tarsi" src` → no output; `npx tsc -b`, `npx eslint .` clean.
- [ ] **Step 4: Commit** → `feat(ui): replace Tarsi with Susi wolf mascot`

---

### Task 5: Navigation and shell

**Files:**
- Create: `src/components/layout/navigation.ts`, `src/components/layout/Sidebar.tsx`, `src/components/layout/MoreSheet.tsx`, `src/hooks/useSignOut.ts`
- Modify: `src/components/layout/AppShell.tsx`, `src/components/layout/BottomNavigation.tsx`, `src/components/pwa/InstallPromptCard.tsx`
- Delete: `src/components/layout/AppHeader.tsx`

**Interfaces:**
- Consumes: `getActiveNavKey`, `MORE_ROUTES`, `readSidebarCollapsed`, `writeSidebarCollapsed` (Task 1); `Card` (Task 3).
- Produces:
  - `navigation.ts`: `type NavItem = { key: NavKey; to: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }`; `primaryNav: NavItem[]` (home `/dashboard` HomeIcon, wallet `/wallet` WalletIcon, plan `/plan` ChartPieIcon); `moreNav: { to; label; icon }[]` (History `/transactions` ClockIcon, Insights `/insights` ChartBarIcon, Settings `/settings` Cog6ToothIcon); `quickActions` (moved verbatim from `BottomNavigation.tsx`).
  - `useSignOut(): () => Promise<void>` — logic moved from `AppHeader.tsx:81-85` (`signOut(auth)`, toast "Signed out.", navigate `/auth` replace).
  - `MoreSheet({ open: boolean; onClose: () => void })` — bottom sheet: `moreNav` rows + Sign out (`text-neg`), backdrop click and Escape close, focus first item on open, `pb-safe`.

- [ ] **Step 1: `navigation.ts` + `useSignOut.ts`.**
- [ ] **Step 2: `Sidebar.tsx`** (`hidden md:flex`, sticky full-height): app mark + "BudgetPro" + "PERSONAL"; "+ Add" brand button toggling a popover of `quickActions` (click outside / Escape closes); group labels "Main" / "More"; `NavLink`s; active = `bg-brand/15 text-ink shadow-[inset_3px_0_0_rgb(var(--brand))]`; collapse button toggles 232px ↔ 72px (icons only, labels in `title`), persisted with `write/readSidebarCollapsed`; Sign out at bottom.
- [ ] **Step 3: `BottomNavigation.tsx`** — 5-slot grid from `primaryNav` with center "+" (raised `bg-brand text-on-brand` 54px rounded-2xl) and a "More" button opening `MoreSheet`; active via `getActiveNavKey(pathname)`; quick-add sheet restyled; container `pb-safe`.
- [ ] **Step 4: `AppShell.tsx`** — layout `md:grid md:grid-cols-[auto_1fr]`; `<Sidebar/>` + `<main className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pt-safe pb-nav md:pb-10">`; remove top pill nav; offline banner token-styled. Restyle `InstallPromptCard`. Delete `AppHeader.tsx`.
- [ ] **Step 5: Verify** `npx tsc -b`, `npx eslint .`, `pnpm test`, `pnpm build`. Browser at 375px: 5 slots, More opens sheet, `/settings` shows More active. At 1440px: sidebar, collapse persists across reload, "+ Add" popover opens/closes.
- [ ] **Step 6: Commit** listed files → `feat(ui): unified sidebar and bottom nav`

---

### Task 6: WalletCard and ActivityRow

**Files:**
- Create: `src/components/ui/WalletCard.tsx`, `src/components/ui/ActivityRow.tsx`

**Interfaces:**
- Consumes: `BrandMark`, `clampPercent`.
- Produces:
  - `WalletCard({ name: string; initials: string; color: string; label: "Balance" | "Available credit"; amount: string; usage?: number /* 0–1, credit only */; onClick?: () => void; menu?: ReactNode; className?: string })` — `aspect-[1.586]`, `rounded-[18px]`, `background: linear-gradient(140deg, ${color}, color-mix(in srgb, ${color} 70%, white))`, two translucent circles, chip, name truncates.
  - `ActivityRow({ icon: ReactNode; title: string; meta: string; amount: number; formatted: string; onClick?: () => void })` — amount `text-pos` when `amount > 0`, `text-neg` when `< 0`, `text-ink` otherwise; title truncates.

- [ ] **Step 1: Implement both.**
- [ ] **Step 2: Verify** `npx tsc -b`, `npx eslint .` clean.
- [ ] **Step 3: Commit** → `feat(ui): add WalletCard and ActivityRow`

---

### Task 7: Dashboard

**Files:**
- Modify: `src/pages/Dashboard.tsx`, `src/components/dashboard/MonthlyInsightsPanel.tsx`, `UpcomingPaymentsPanel.tsx`, `OnboardingGuide.tsx`

**Interfaces:**
- Consumes: `Susi`, `Card`, `CardLink`, `StatCard`, `WalletCard`, `ActivityRow`, existing `getRecentTransactions`, `getAccountBalances`, `getWalletSummary`, `getMonthlySummary`, `getUpcomingPayments`, `formatCurrency`.

- [ ] **Step 1: Restructure** per spec §6 Dashboard: hero (`bg-hero`, date eyebrow, greeting, "Susi" coach bubble with existing `getCoachLine`, `<Susi mood="wave" />`, hills SVG); stat row (Net balance `bg-brand-gradient` with eye toggle `useState` masking amounts as `••••••`, sparkline from existing week data; Days until payday; Next bill from `getUpcomingPayments`; Left to spend); wallets preview (3 stacked `WalletCard`s, `CardLink` "All (n) →", Open/Expense/Transfer → `/wallet/:firstId`, `/transactions`, `/transactions`); Recent activity (6 `ActivityRow`s, "View all →"); This month card (Income, Expenses, Savings, Savings rate + 7-day bars + Today total). Remove the Day/Week/Month buttons and the old calendar/trend icon buttons.
- [ ] **Step 2: Restyle** the three dashboard panels with tokens only.
- [ ] **Step 3: Verify** `npx tsc -b`, `npx eslint .`, `pnpm build`; browser 375px and 1440px, dark and light; empty store shows ₱0.00 and empty states, no blank cards.
- [ ] **Step 4: Commit** → `feat(ui): redesign dashboard`

---

### Task 8: Wallet and account detail

**Files:**
- Modify: `src/pages/Wallet.tsx`, `src/pages/WalletAccountDetail.tsx`

**Interfaces:**
- Consumes: `PageIntro`, `Segmented`, `WalletCard`, `Card`, `Susi`, `BrandMark`, `getWalletSummary`, `getAccountBalances`.

- [ ] **Step 1: Wallet** — `PageIntro eyebrow="BudgetPro" title="Wallet"` with round brand "+" opening the existing add-account flow; Net worth card (`bg-brand-gradient`, eye toggle, Assets/Liabilities tiles from wallet summary debit/credit totals, `<Susi mood="think" size={96} />` hidden below `sm`); toolbar: existing tab state as `Segmented` (All/Debit/Credit) + new `view: "grid" | "list"` `Segmented`; grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; list rows (BrandMark, name, details, balance). Remove the "Press and hold…" text. No accounts → `EmptyState` with `illustration={<Susi mood="think" size={96} />}`, title "Add your first wallet", action "Add account" (existing flow). Existing insight and daily-balance panels → `Card`.
- [ ] **Step 2: Detail** — large `WalletCard` header; panels → `Card`.
- [ ] **Step 3: Verify** `npx tsc -b`, `npx eslint .`, `pnpm build`; browser both widths/themes; long account name truncates; USD account shows `$`.
- [ ] **Step 4: Commit** → `feat(ui): redesign wallet pages`

---

### Task 9: Plan

**Files:**
- Modify: `src/pages/Plan.tsx`, `src/components/planning/BudgetPlanner.tsx`, `src/components/planning/RecurringBillsPanel.tsx`, `src/components/goals/SavingsGoalsPanel.tsx`

**Interfaces:**
- Consumes: `PageIntro`, `Card`, `ProgressBar` (with `alertThreshold` from each `Budget.alertThreshold`).

- [ ] **Step 1: Index view** → tile grid (`md:grid-cols-2`): icon well, title, one-line summary computed from existing store data, chevron. Sub-views: "Back to plan" → small ghost button in `PageIntro` action slot; content unchanged, `bg-white/92` sections → `Card`; oversized titles → section title scale.
- [ ] **Step 2: Restyle** the three panels; budget bars pass `alertThreshold`.
- [ ] **Step 3: Verify** `npx tsc -b`, `npx eslint .`, `pnpm build`; browser index + budgets sub-view, both themes; an over-budget category shows `text-neg` bar.
- [ ] **Step 4: Commit** → `feat(ui): redesign plan`

---

### Task 10: History

**Files:**
- Modify: `src/components/transactions/TransactionComposer.tsx`, `src/components/transactions/TransactionList.tsx`, `src/pages/Transactions.tsx`

**Interfaces:**
- Consumes: `Segmented`, `Card`, `PageIntro`, `ActivityRow`, `PickerSheet`, `groupByDay` (Task 1), `getTodayISO`.

- [ ] **Step 1: Composer** — type `Segmented` (Income/Expense/Transfer) bound to existing type state; large amount input (`text-3xl font-bold`, `inputMode="decimal"`); category/account as chip buttons opening existing `PickerSheet`; brand submit. Submission logic unchanged.
- [ ] **Step 2: List** — `groupByDay(filtered, getTodayISO())`; group label eyebrow; rows `ActivityRow` with signed amount (income +, expense −, transfer 0); existing filters/actions kept.
- [ ] **Step 3: Page** — add `PageIntro title="History"`.
- [ ] **Step 4: Verify** `npx tsc -b`, `npx eslint .`, `pnpm test`, `pnpm build`; add a transaction in browser, it appears under "Today".
- [ ] **Step 5: Commit** → `feat(ui): redesign history`

---

### Task 11: Insights and charts

**Files:**
- Modify: `src/pages/Insights.tsx`, `src/components/insights/TrendCharts.tsx`, `src/components/insights/CategorySpendChart.tsx`
- Create: `src/hooks/useChartColors.ts`

**Interfaces:**
- Produces: `useChartColors(): { grid: string; axis: string; tooltipBg: string; tooltipBorder: string; text: string; brand: string; pos: string; neg: string }` — reads `getComputedStyle(document.documentElement)` token triplets as `rgb(...)` strings; recomputes when the `dark` class changes (MutationObserver on `<html>` `class`).

- [ ] **Step 1: Implement hook**; charts use it for `CartesianGrid stroke`, axis `tick.fill`, `Tooltip contentStyle`; series income → `pos`, expense → `neg`, primary → `brand`; category colors unchanged.
- [ ] **Step 2: Page** — `PageIntro title="Insights"`; panels → `Card`.
- [ ] **Step 3: Verify** `npx tsc -b`, `npx eslint .`, `pnpm build`; switch theme in Settings, return to Insights: tooltip and grid colors match theme.
- [ ] **Step 4: Commit** → `feat(ui): theme-aware insights charts`

---

### Task 12: Settings and Auth

**Files:**
- Modify: `src/pages/Settings.tsx`, `src/pages/Auth.tsx`

**Interfaces:**
- Consumes: `PageIntro`, `Card`, `Segmented`, `BrandMark`.

- [ ] **Step 1: Settings** — sections Profile, Appearance (theme `Segmented` System/Light/Dark bound to existing `themeMode` update; currency select), Data & backup, App & install; row = label + description left, control right; existing handlers unchanged.
- [ ] **Step 2: Auth** — centered `Card` on `bg-canvas`, app mark, tagline, existing Google button restyled `bg-brand text-on-brand`; flow unchanged.
- [ ] **Step 3: Verify** `npx tsc -b`, `npx eslint .`, `pnpm build`; theme switch applies immediately, `meta[name=theme-color]` value changes (check in devtools/JS).
- [ ] **Step 4: Commit** → `feat(ui): redesign settings and auth`

---

### Task 13: Final sweep and verification

**Files:**
- Modify: any file still matching the grep below.

- [ ] **Step 1: Grep** — `grep -rnE "BudgetBuddy|Tarsi|bg-white/9|text-slate-900|#5e985d|bg-slate-950|teal-[0-9]" src` → fix every hit with tokens until empty.
- [ ] **Step 2: Full checks** — `pnpm test`, `npx tsc -b`, `npx eslint .`, `pnpm build` all pass.
- [ ] **Step 3: Browser pass** at 375×812 and 1440×900, dark and light: Dashboard, Wallet, Wallet detail, Plan (index + budgets), History, Insights, Settings, Auth; mobile More sheet and quick-add; desktop sidebar collapse and "+ Add". Compare against the preview HTML.
- [ ] **Step 4: Commit** → `chore(ui): final token sweep`
