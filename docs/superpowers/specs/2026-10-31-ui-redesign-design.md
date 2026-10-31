# UI Redesign — Design Spec

Date: 2026-10-31
Status: Approved in chat, pending written-spec review
Visual reference: [2026-10-31-ui-redesign-preview.html](2026-10-31-ui-redesign-preview.html) (static mockup, dummy data)

## 1. Goal

Give Budget Tracker Pro a modern, premium finance-app look — dark-first with a working light theme — inspired by (not copied from) the user's reference screenshots. The app is a mobile-first PWA, so mobile and desktop navigation must match.

### Success criteria

- Every page uses one shared token-based visual system; no hardcoded `bg-white/92`, `text-slate-900`, `#5e985d`-style values left in page/component code.
- Dark and light themes both render correctly and follow `settings.themeMode` (System / Light / Dark). The current bug — dark `bg-slate-950` app wrapper behind light-only components, leaving dark text on dark backgrounds — is gone.
- Mobile bottom nav and desktop sidebar are driven by the same config and expose the same destinations.
- Mascot "Tarsi" (`BudgetBuddy`) is fully replaced by the new wolf mascot "Susi".
- `tsc -b`, `eslint .`, and `pnpm build` pass.

### Out of scope

- New features or pages (Calendar, Income, Who Owes You, Investments, Statements, Chat, Personal/Business toggle).
- Drag-to-rearrange wallets.
- Changes to store, data model, finance logic, Firebase, or routes.
- Real bank logos or bank card artwork.
- Major dependency upgrades (Tailwind 4, Vite 8, etc.).

## 2. Foundation: design tokens

Approach: CSS custom properties defined in `src/index.css`, exposed to Tailwind as semantic colors in `tailwind.config.js`. Components use one set of classes; values flip per theme. (Rejected: per-class `dark:` variants — doubles class strings; new component library — unnecessary dependency.)

Theme is selected by the existing `dark` class on `<html>` (`darkMode: "class"` already configured).

| Token | Tailwind name | Dark | Light | Use |
|---|---|---|---|---|
| `--bg` | `bg-canvas` | `#0b0d0c` | `#f4f6f2` | Page background |
| `--surface` | `bg-surface` | `#141715` | `#ffffff` | Cards, sidebar, nav |
| `--raised` | `bg-raised` | `#1c201d` | `#f0f3ee` | Inner tiles, inputs, icon wells |
| `--line` | `border-line` | `rgba(255,255,255,.08)` | `rgba(15,23,15,.08)` | Hairline borders, dividers |
| `--text` | `text-ink` | `#f2f5f2` | `#121712` | Primary text |
| `--muted` | `text-muted` | `#8d968f` | `#69736b` | Secondary text, labels |
| `--brand` | `brand` | `#6fbf6a` | `#4f9a4b` | Accent, active states, primary CTA |
| `--brand-ink` | `text-on-brand` | `#0d1a0c` | `#ffffff` | Text on `brand` fills |
| `--pos` | `text-pos` | `#7ad275` | `#2f8a2b` | Income / positive amounts |
| `--neg` | `text-neg` | `#ff7a7a` | `#d63c3c` | Expense / negative amounts |
| `--warn` | `text-warn` | `#f5b54a` | `#b7791f` | Budget near limit |

Tokens are stored as RGB channel triplets (e.g. `--surface: 20 23 21`) so Tailwind opacity modifiers work (`bg-brand/15`).

Shape and type:
- Radius: cards `rounded-3xl` (22–24px), tiles/buttons `rounded-2xl`, pills `rounded-full`.
- Borders: `border border-line`; no heavy drop shadows. Wallet cards may keep one soft shadow.
- Type scale: page title 26–30px bold; section title 16px semibold; eyebrow labels 11px uppercase `tracking-[0.16em]` `text-muted`; large amounts 28–34px extrabold. Remove the oversized `text-[2rem]`/`text-[3rem] font-black` section titles.
- Brand gradients (Net balance, Net worth, hero) are defined once as utility classes in `index.css` (`.bg-brand-gradient`, `.bg-hero`) with dark and light variants.

### Theme wiring

- `src/index.css`: remove hardcoded light `:root` colors and body radial gradients; set `body { background: rgb(var(--bg)); color: rgb(var(--text)); }`; `color-scheme` follows theme.
- `src/App.tsx`: drop `bg-slate-950 text-white` wrapper and Suspense fallback colors in favor of tokens. Keep the existing `themeMode` effect, and additionally:
  - listen to `prefers-color-scheme` changes while in `system` mode;
  - set `<meta name="theme-color">` to the current `--bg` value (dark `#0b0d0c`, light `#f4f6f2`) so the PWA status bar matches.
- `src/config/app.ts`: update `themeColor`/`backgroundColor` to the dark canvas; keep `public/manifest.webmanifest` in sync.

## 3. Navigation (PWA-consistent)

Single source: new `src/components/layout/navigation.ts`.

```ts
export const primaryNav = [
  { to: "/dashboard", label: "Home", icon: HomeIcon },
  { to: "/wallet", label: "Wallet", icon: WalletIcon },
  { to: "/plan", label: "Plan", icon: ChartPieIcon },
];
export const moreNav = [
  { to: "/transactions", label: "History", icon: ClockIcon },
  { to: "/insights", label: "Insights", icon: ChartBarIcon },
  { to: "/settings", label: "Settings", icon: Cog6ToothIcon },
];
export const quickActions = [/* moved from BottomNavigation.tsx, unchanged */];
```

### Desktop (`md+`) — new `Sidebar.tsx`

- Fixed left column, 232px; collapsible to an icon rail (72px). Collapsed state is a per-device convenience stored in `localStorage` (wrapped in try/catch).
- Top: app mark + name ("BudgetPro", small "PERSONAL" label).
- "+ Add" brand button opens the quick-action list as a popover anchored to the button.
- Group "Main": `primaryNav`. Group "More": `moreNav`. Sign out at the bottom.
- Active item: `bg-brand/15`, `text-ink`, 3px brand inset bar on the left.

### Mobile (`< md`) — restyled `BottomNavigation.tsx`

- Five slots: Home, Wallet, **+** (center, raised brand square), Plan, More.
- "+" opens the existing quick-action sheet (restyled).
- "More" opens a bottom sheet with `moreNav` items plus Sign out. "More" shows as active when the current route is one of `moreNav`.
- Sheets: dim backdrop, tap-outside and Escape to close, focus moves into the sheet.

### Shell — `AppShell.tsx`

- Grid: sidebar + content on desktop; content only on mobile.
- Content max width ~1200px, padding 16px mobile / 24px desktop.
- Bottom padding on mobile accounts for nav height + `env(safe-area-inset-bottom)`.
- Offline banner and `InstallPromptCard` kept, restyled with tokens; banner respects `env(safe-area-inset-top)`.
- Remove the old top pill nav. Delete unused `AppHeader.tsx` (not imported anywhere).

### PWA requirements

- `viewport-fit=cover` is already set; apply `env(safe-area-inset-*)` to bottom nav, sheets, and top of the shell.
- Tap targets at least 44×44px.
- No hover-only interactions; all hover styles also have active/focus-visible styles.

## 4. Mascot: Susi

- New `src/components/illustrations/Susi.tsx`: original flat SVG wolf (Susi is Finnish for "wolf"). Gray coat (`#8a94a0` / `#6b7480`), light muzzle, dark eyes and nose, brand-green scarf. Matches the preview mockup.
- Props: `mood?: "wave" | "think"`, `size?: number` (default 128), plus `className`. `wave` adds a raised paw; `think` tilts the head slightly with a small thought dot.
- `aria-hidden` by default (decorative); the coach text carries the meaning.
- Usage: Dashboard hero (`wave`, coach label "Susi"), Wallet net-worth card (`think`, small), optionally `EmptyState`.
- Remove `BudgetBuddy.tsx` and every "Tarsi" string.

## 5. Shared UI components (restyle / add)

All in `src/components/ui/`:

- `PageIntro` — eyebrow (optional) + title + optional description + `action` slot. New compact type scale.
- `Card` (new) — `bg-surface border border-line rounded-3xl p-4 md:p-5`; optional header with title and action link (`pill` style "View all →").
- `StatCard` — token-based; tones `default | good | warn | danger` map to `pos/warn/neg` tints.
- `ProgressBar` — status color by ratio: `< alertThreshold` brand, `≥ alertThreshold` warn, `> 100%` neg.
- `Segmented` (new) — pill segmented control used for All/Debit/Credit, Grid/List, Month/Week/Day, Income/Expense/Transfer.
- `WalletCard` (new) — see §6.
- `ActivityRow` (new) — icon well, title, "account · date" meta, signed colored amount. Used by Dashboard recent activity and History list.
- `EmptyState`, `SectionHeader`, `PickerSheet`, `BrandMark` — token restyle only.

## 6. Pages

Same data and handlers as today; layout and styling change only.

### Dashboard (`src/pages/Dashboard.tsx`)

1. **Hero**: date eyebrow, "Good {morning|afternoon|evening}, {name}!", coach bubble labeled "Susi" with `getCoachLine(...)`, `Susi` mascot on the right, soft hills SVG shape. `bg-hero` gradient.
2. **Stat row**: large Net balance card (brand gradient, eye toggle hides amounts, decorative sparkline), then Days until payday, Next bill, Left to spend. Desktop: 4 columns. Mobile: Net balance full width, the other three in a horizontal scroll row.
3. **Wallets preview**: 3 stacked `WalletCard`s (top card = first account), "All (n) →" links to `/wallet`, action buttons Open / Expense / Transfer (navigate to existing routes).
4. **Recent activity**: last 5–6 transactions as `ActivityRow`, "View all →" to `/transactions`.
5. **This month**: Income, Expenses, Savings, Savings rate tiles; Last 7 days bars and Today total merged into this card. The existing Day/Week/Month buttons do nothing today, so they are removed rather than restyled.
6. Existing `UpcomingPaymentsPanel`, `MonthlyInsightsPanel`, `OnboardingGuide`: kept, token restyle.

The eye toggle state is local UI state (not persisted).

### Wallet (`src/pages/Wallet.tsx`)

1. `PageIntro` (eyebrow "BudgetPro", title "Wallet") with round brand "+" action (existing add-account flow).
2. **Net worth card**: brand gradient, amount, eye toggle, two inner tiles Assets (debit totals) and Liabilities (credit balances), small `Susi mood="think"`.
3. **Toolbar**: All / Debit / Credit `Segmented` (existing `tab` state) and Grid / List `Segmented` (new local state).
4. **Grid**: 4 / 2 / 1 columns (lg / sm / base). **List**: compact rows (BrandMark, name, details, balance).
5. Existing insight and daily balance panels: token restyle; remove "Press and hold an account card to rearrange it." text (feature out of scope).

`WalletCard`: credit-card aspect ratio (1.586), gradient from `account.color` to a lighter mix, two translucent decorative circles, chip graphic, `BrandMark` initials + name, "Balance" or "Available credit" label with amount, usage bar for credit accounts, "…" menu button where it exists today. No bank logos.

### Wallet account detail (`WalletAccountDetail.tsx`)

Top uses a large `WalletCard`; panels below become `Card`s; no logic changes.

### Plan (`src/pages/Plan.tsx`)

- Index view: grid of tiles (icon well, title, one-line summary such as "3 budgets · ₱12k left", chevron). 2 columns desktop, 1 mobile.
- Sub-views keep their current content; "Back to plan" becomes a small ghost button beside the page title.
- `BudgetPlanner`, `SavingsGoalsPanel`, `RecurringBillsPanel`: token restyle, `ProgressBar` with status colors.

### History (`src/pages/Transactions.tsx`)

- `TransactionComposer`: Income/Expense/Transfer `Segmented` at top, large amount input, category and account as chip pickers (existing `PickerSheet`), primary brand submit.
- `TransactionList`: grouped by date ("Today", "Yesterday", "Oct 30"), rows use `ActivityRow`; existing filters/actions kept.

### Insights (`src/pages/Insights.tsx`)

- Stat row with restyled `StatCard`.
- `TrendCharts` / `CategorySpendChart`: Recharts grid, axis, and tooltip colors read from tokens (via `getComputedStyle` helper or CSS vars passed as strings); series use brand / pos / neg plus the existing category colors.

### Settings (`src/pages/Settings.tsx`)

- Grouped list sections: Profile, Appearance (theme System/Light/Dark as `Segmented`, currency), Data & backup, App & install.
- Row layout: label + description left, control right.

### Auth (`src/pages/Auth.tsx`)

- Centered card on `bg-canvas`, app mark, short tagline, "Continue with Google". Flow unchanged.

## 7. Error handling and edge cases

- Empty data: every card has an empty state (e.g. no wallets → `EmptyState` with Susi and "Add account"); Net balance shows ₱0.00, not blank.
- Long names truncate with ellipsis in `WalletCard`, `ActivityRow`, and nav.
- Multi-currency accounts keep their own `currencyCode` formatting.
- `localStorage` access for sidebar collapse is wrapped in try/catch and defaults to expanded.
- `prefers-reduced-motion` rule in `index.css` stays.

## 8. Testing and verification

- `npx tsc -b`, `npx eslint .`, `pnpm build` must pass.
- Visual check in the browser at 375px and 1440px, dark and light, for: Dashboard, Wallet, Wallet detail, Plan (index + one sub-view), History, Insights, Settings, Auth.
- Check bottom nav, More sheet, and quick-add sheet on mobile; sidebar collapse and "+ Add" popover on desktop.
- Check theme switching in Settings applies immediately and `theme-color` meta updates.
- Grep check: no `BudgetBuddy`, `Tarsi`, `bg-white/9`, `text-slate-900`, or `#5e985d` left in `src/`.

## 9. Files touched (summary)

- Config/styles: `tailwind.config.js`, `src/index.css`, `src/config/app.ts`, `public/manifest.webmanifest`, `src/App.tsx`
- Layout: `AppShell.tsx`, `BottomNavigation.tsx`, new `Sidebar.tsx`, new `navigation.ts`, delete `AppHeader.tsx`
- Illustrations: new `Susi.tsx`, delete `BudgetBuddy.tsx`
- UI: `PageIntro`, `StatCard`, `ProgressBar`, `EmptyState`, `SectionHeader`, `PickerSheet`, `BrandMark`, new `Card`, `Segmented`, `WalletCard`, `ActivityRow`
- Pages: all in `src/pages/`
- Feature components: `dashboard/*`, `goals/*`, `insights/*`, `planning/*`, `pwa/*`, `transactions/*`, `Toast.tsx`
