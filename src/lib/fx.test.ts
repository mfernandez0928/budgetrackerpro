import { describe, expect, it } from "vitest";
import { createDefaultSnapshot, getAccountBalances, getWalletSummary } from "./finance";
import {
  accountCurrency,
  convertAmount,
  isStale,
  parseFrankfurter,
  resolveReceivedAmount,
  toMainCurrencyView,
  type FxRates,
} from "./fx";
import type { Account, BudgetStoreSnapshot, Transaction } from "../types/finance";

const rates: FxRates = { date: "2026-11-03", fetchedAt: 0, perEur: { EUR: 1, PHP: 70, USD: 1.1, GBP: 0.8 } };

function account(id: string, currencyCode?: Account["currencyCode"], classification: Account["classification"] = "debit"): Account {
  return { id, name: id, type: "bank", classification, openingBalance: 0, color: "#000", currencyCode };
}

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "t",
    title: "t",
    amount: 0,
    type: "expense",
    date: "2026-11-01",
    categoryId: "food",
    accountId: "php",
    paymentMethod: "cash",
    status: "cleared",
    createdAt: "2026-11-01T00:00:00.000Z",
    ...overrides,
  };
}

function snapshot(overrides: Partial<BudgetStoreSnapshot>): BudgetStoreSnapshot {
  const base = createDefaultSnapshot();
  return { ...base, ...overrides, settings: { ...base.settings, currencyCode: "EUR", ...overrides.settings } };
}

describe("convertAmount", () => {
  it("returns the amount unchanged for the same currency", () => {
    expect(convertAmount(100, "PHP", "PHP", rates)).toBe(100);
  });

  it("converts through the EUR base in both directions", () => {
    expect(convertAmount(2, "EUR", "PHP", rates)).toBeCloseTo(140);
    expect(convertAmount(140, "PHP", "EUR", rates)).toBeCloseTo(2);
    expect(convertAmount(70, "PHP", "USD", rates)).toBeCloseTo(1.1);
  });

  it("leaves the amount unconverted when no rates are loaded yet", () => {
    expect(convertAmount(100, "PHP", "EUR", null)).toBe(100);
  });
});

describe("accountCurrency", () => {
  it("uses the account's own currency, or the main currency when it has none", () => {
    expect(accountCurrency(account("a", "PHP"), "EUR")).toBe("PHP");
    expect(accountCurrency(account("a"), "EUR")).toBe("EUR");
    expect(accountCurrency(undefined, "EUR")).toBe("EUR");
  });
});

describe("toMainCurrencyView", () => {
  it("converts each transaction from its account currency to the main currency", () => {
    const view = toMainCurrencyView(
      snapshot({
        accounts: [account("php", "PHP"), account("eur", "EUR")],
        transactions: [tx({ id: "1", accountId: "php", amount: 700 }), tx({ id: "2", accountId: "eur", amount: 5 })],
      }),
      rates,
    );
    expect(view.transactions.map((item) => item.amount)).toEqual([10, 5]);
  });
});

describe("getAccountBalances", () => {
  it("credits a cross-currency transfer with the amount received", () => {
    const balances = getAccountBalances(
      snapshot({
        accounts: [account("php", "PHP"), account("eur", "EUR")],
        transactions: [tx({ type: "transfer", accountId: "php", toAccountId: "eur", amount: 7000, toAmount: 95 })],
      }),
    );
    expect(balances.map((item) => item.balance)).toEqual([-7000, 95]);
  });

  it("credits a same-currency transfer with the sent amount when no received amount is stored", () => {
    const balances = getAccountBalances(
      snapshot({
        accounts: [account("a", "EUR"), account("b", "EUR")],
        transactions: [tx({ type: "transfer", accountId: "a", toAccountId: "b", amount: 20 })],
      }),
    );
    expect(balances.map((item) => item.balance)).toEqual([-20, 20]);
  });
});

describe("getWalletSummary", () => {
  it("totals account balances in the main currency", () => {
    const summary = getWalletSummary(
      snapshot({
        accounts: [
          { ...account("php", "PHP"), openingBalance: 7000 },
          { ...account("eur", "EUR"), openingBalance: 50 },
        ],
        transactions: [],
        debts: [],
        moneyOwed: [],
      }),
      rates,
    );
    expect(summary.assets).toBeCloseTo(150);
    expect(summary.balances.map((item) => item.balance)).toEqual([7000, 50]);
  });
});

describe("rates freshness and parsing", () => {
  it("treats missing or old rates as stale", () => {
    expect(isStale(null, 1_000)).toBe(true);
    expect(isStale({ ...rates, fetchedAt: 0 }, 13 * 60 * 60 * 1000)).toBe(true);
    expect(isStale({ ...rates, fetchedAt: 0 }, 60 * 1000)).toBe(false);
  });

  it("reads a Frankfurter response into rates per EUR", () => {
    const parsed = parseFrankfurter({ base: "EUR", date: "2026-11-03", rates: { PHP: 70.9, USD: 1.11, GBP: 0.83 } }, 42);
    expect(parsed).toEqual({ date: "2026-11-03", fetchedAt: 42, perEur: { EUR: 1, PHP: 70.9, USD: 1.11, GBP: 0.83 } });
  });
});

describe("resolveReceivedAmount", () => {
  it("stores nothing extra for a same-currency transfer", () => {
    expect(resolveReceivedAmount(100, "", "EUR", "EUR", rates)).toBeUndefined();
  });

  it("uses the typed received amount for a cross-currency transfer", () => {
    expect(resolveReceivedAmount(7000, "95.5", "PHP", "EUR", rates)).toBe(95.5);
  });

  it("estimates from the rates, to the cent, when the received amount is left blank", () => {
    expect(resolveReceivedAmount(7000, "  ", "PHP", "EUR", rates)).toBe(100);
    expect(resolveReceivedAmount(1000, "", "PHP", "USD", rates)).toBe(15.71);
  });

  it("rejects a received amount that is not a positive number", () => {
    expect(resolveReceivedAmount(7000, "abc", "PHP", "EUR", rates)).toBeNull();
    expect(resolveReceivedAmount(7000, "0", "PHP", "EUR", rates)).toBeNull();
  });
});
