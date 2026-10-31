import { describe, expect, it } from "vitest";
import {
  accountDetails,
  accountInitials,
  clampPercent,
  getActiveNavKey,
  groupByDay,
  nextFocusIndex,
  progressTone,
  readSidebarCollapsed,
  resolveTheme,
  writeSidebarCollapsed,
} from "./ui";

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
    ["/dashboard", "home"],
    ["/wallet", "wallet"],
    ["/wallet/abc", "wallet"],
    ["/plan", "plan"],
    ["/transactions", "more"],
    ["/insights", "more"],
    ["/settings", "more"],
    ["/auth", null],
  ])("%s -> %s", (path, key) => expect(getActiveNavKey(path)).toBe(key));
});

describe("readSidebarCollapsed", () => {
  it("defaults to false when storage throws", () => {
    expect(
      readSidebarCollapsed({
        getItem: () => {
          throw new Error("blocked");
        },
      }),
    ).toBe(false);
  });

  it("defaults to false when the localStorage getter itself throws", () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new Error("SecurityError");
      },
    });
    try {
      expect(readSidebarCollapsed()).toBe(false);
      expect(() => writeSidebarCollapsed(true)).not.toThrow();
    } finally {
      if (original) Object.defineProperty(globalThis, "localStorage", original);
      else delete (globalThis as { localStorage?: Storage }).localStorage;
    }
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
    const items = [
      { id: 1, date: "2026-10-29" },
      { id: 2, date: "2026-10-31" },
      { id: 3, date: "2026-10-30" },
      { id: 4, date: "2026-10-31" },
    ];
    const groups = groupByDay(items, "2026-10-31");
    expect(groups.map((g) => g.label)).toEqual(["Today", "Yesterday", "Oct 29"]);
    expect(groups[0].items.map((i) => i.id)).toEqual([2, 4]);
    expect(groups.map((g) => g.key)).toEqual(["2026-10-31", "2026-10-30", "2026-10-29"]);
  });

  it("keeps same calendar day in different years apart and labels the older year", () => {
    const items = [
      { id: 1, date: "2026-10-29" },
      { id: 2, date: "2025-10-29" },
    ];
    const groups = groupByDay(items, "2026-10-31");
    expect(groups.map((g) => g.key)).toEqual(["2026-10-29", "2025-10-29"]);
    expect(groups.map((g) => g.label)).toEqual(["Oct 29", "Oct 29, 2025"]);
  });
});

describe("nextFocusIndex", () => {
  it("wraps forward from the last item to the first", () => {
    expect(nextFocusIndex(2, 3, false)).toBe(0);
  });

  it("wraps backward from the first item to the last", () => {
    expect(nextFocusIndex(0, 3, true)).toBe(2);
  });

  it("returns null when focus is in the middle so Tab moves normally", () => {
    expect(nextFocusIndex(1, 3, false)).toBeNull();
    expect(nextFocusIndex(1, 3, true)).toBeNull();
  });

  it("pulls focus back in when it is outside the dialog", () => {
    expect(nextFocusIndex(-1, 3, false)).toBe(0);
    expect(nextFocusIndex(-1, 3, true)).toBe(2);
  });
});

describe("accountInitials", () => {
  it("uses the icon, upper-cased and capped at 3 chars", () => {
    expect(accountInitials("GCash", "gc", "EUR")).toBe("GC");
    expect(accountInitials("Bitcoin", "btc1", "EUR")).toBe("BTC");
  });

  it("falls back to the first two letters of the name", () => {
    expect(accountInitials("Main Bank", undefined, "EUR")).toBe("MA");
  });

  it("swaps a currency-symbol icon for the app currency's symbol", () => {
    expect(accountInitials("Cash Wallet", "₱", "EUR")).toBe("€");
    expect(accountInitials("Cash Wallet", "₱", "USD")).toBe("$");
  });
});

describe("accountDetails", () => {
  it("replaces a stored currency code with the app currency", () => {
    expect(accountDetails("Debit • PHP • 1.25% yearly", "debit", "EUR")).toBe("Debit • EUR • 1.25% yearly");
  });

  it("leaves details without a currency code alone", () => {
    expect(accountDetails("Stocks • AAPL", "debit", "EUR")).toBe("Stocks • AAPL");
  });

  it("builds a label when there are no details", () => {
    expect(accountDetails(undefined, "credit", "GBP")).toBe("credit • GBP");
  });
});
