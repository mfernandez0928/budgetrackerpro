import { describe, expect, it } from "vitest";
import {
  clampPercent,
  getActiveNavKey,
  groupByDay,
  progressTone,
  readSidebarCollapsed,
  resolveTheme,
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
  });
});
