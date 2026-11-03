import { describe, expect, it } from "vitest";
import { createDefaultSnapshot } from "./finance";
import { decideSync, mergeSnapshots, pickSnapshot } from "./sync";
import type { BudgetStoreSnapshot, Transaction } from "../types/finance";

function tx(id: string, title = id): Transaction {
  return {
    id,
    title,
    amount: 10,
    type: "expense",
    date: "2026-11-01",
    categoryId: "food",
    accountId: "wallet-cash",
    paymentMethod: "cash",
    status: "cleared",
    createdAt: "2026-11-01T00:00:00.000Z",
  };
}

function snapshot(overrides: Partial<BudgetStoreSnapshot> = {}): BudgetStoreSnapshot {
  return { ...createDefaultSnapshot(), ...overrides };
}

describe("decideSync", () => {
  it("uploads when the cloud has nothing yet", () => {
    expect(decideSync({ cloudUpdatedAt: null, syncedAt: null, localUpdatedAt: 0 })).toBe("upload");
  });

  it("merges the first time a device meets existing cloud data", () => {
    expect(decideSync({ cloudUpdatedAt: 500, syncedAt: null, localUpdatedAt: 900 })).toBe("merge");
  });

  it("does nothing when neither side changed since the last sync", () => {
    expect(decideSync({ cloudUpdatedAt: 500, syncedAt: 500, localUpdatedAt: 500 })).toBe("none");
  });

  it("downloads when only the cloud changed", () => {
    expect(decideSync({ cloudUpdatedAt: 800, syncedAt: 500, localUpdatedAt: 500 })).toBe("download");
  });

  it("uploads when only this device changed", () => {
    expect(decideSync({ cloudUpdatedAt: 500, syncedAt: 500, localUpdatedAt: 700 })).toBe("upload");
  });

  it("lets the newer side win when both changed", () => {
    expect(decideSync({ cloudUpdatedAt: 800, syncedAt: 500, localUpdatedAt: 900 })).toBe("upload");
    expect(decideSync({ cloudUpdatedAt: 950, syncedAt: 500, localUpdatedAt: 900 })).toBe("download");
  });
});

describe("mergeSnapshots", () => {
  it("keeps records from both sides, matched by id", () => {
    const local = snapshot({ transactions: [tx("a"), tx("b")] });
    const cloud = snapshot({ transactions: [tx("b"), tx("c")] });
    const ids = mergeSnapshots(local, cloud).transactions.map((item) => item.id).sort();
    expect(ids).toEqual(["a", "b", "c"]);
  });

  it("prefers the cloud copy when both sides have the same id", () => {
    const local = snapshot({ transactions: [tx("a", "local title")] });
    const cloud = snapshot({ transactions: [tx("a", "cloud title")] });
    expect(mergeSnapshots(local, cloud).transactions).toEqual([tx("a", "cloud title")]);
  });

  it("does not duplicate the shared default accounts", () => {
    const merged = mergeSnapshots(snapshot(), snapshot());
    expect(merged.accounts).toHaveLength(createDefaultSnapshot().accounts.length);
  });

  it("takes settings from the cloud and keeps onboarding done if either side finished it", () => {
    const local = snapshot({ profile: { hasCompletedOnboarding: true } });
    const cloud = snapshot({
      settings: { ...createDefaultSnapshot().settings, currencyCode: "EUR" },
      profile: { hasCompletedOnboarding: false },
    });
    const merged = mergeSnapshots(local, cloud);
    expect(merged.settings.currencyCode).toBe("EUR");
    expect(merged.profile.hasCompletedOnboarding).toBe(true);
  });
});

describe("pickSnapshot", () => {
  it("drops store actions and keeps only data", () => {
    const state = { ...snapshot(), addTransaction: () => undefined };
    const picked = pickSnapshot(state);
    expect("addTransaction" in picked).toBe(false);
    expect(picked.accounts).toEqual(state.accounts);
  });
});
