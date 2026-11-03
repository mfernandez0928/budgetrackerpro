import type { Account, BudgetStoreSnapshot, CurrencyCode } from "../types/finance";

// Daily ECB reference rates, as units of each currency per 1 EUR.
export interface FxRates {
  date: string;
  fetchedAt: number;
  perEur: Partial<Record<CurrencyCode, number>>;
}

export const FX_SOURCE_URL = "https://api.frankfurter.dev/v1/latest?base=EUR&symbols=PHP,USD,GBP";
const REFRESH_AFTER_MS = 12 * 60 * 60 * 1000;

// Without rates (first offline launch) amounts pass through unconverted rather than showing nothing.
export function convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode, rates: FxRates | null): number {
  if (from === to || !rates) return amount;
  const fromRate = rates.perEur[from];
  const toRate = rates.perEur[to];
  if (!fromRate || !toRate) return amount;
  return (amount / fromRate) * toRate;
}

export function accountCurrency(account: Pick<Account, "currencyCode"> | undefined, main: CurrencyCode): CurrencyCode {
  return account?.currencyCode ?? main;
}

// Transactions re-expressed in the main currency, for totals, budgets and charts.
export function toMainCurrencyView<T extends BudgetStoreSnapshot>(snapshot: T, rates: FxRates | null): T {
  const main = snapshot.settings.currencyCode;
  const currencyById = new Map(snapshot.accounts.map((account) => [account.id, accountCurrency(account, main)]));
  return {
    ...snapshot,
    transactions: snapshot.transactions.map((transaction) => {
      const from = currencyById.get(transaction.accountId) ?? main;
      return from === main ? transaction : { ...transaction, amount: convertAmount(transaction.amount, from, main, rates) };
    }),
  };
}

export function isStale(rates: FxRates | null, now: number): boolean {
  return !rates || now - rates.fetchedAt > REFRESH_AFTER_MS;
}

export function parseFrankfurter(
  body: { base?: string; date: string; rates: Partial<Record<CurrencyCode, number>> },
  fetchedAt: number,
): FxRates {
  return { date: body.date, fetchedAt, perEur: { EUR: 1, ...body.rates } };
}

// Amount landing in the destination of a transfer: undefined when both sides share a currency,
// the typed value when given, otherwise an estimate from the rates; null when the input is invalid.
export function resolveReceivedAmount(
  sent: number,
  receivedInput: string,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: FxRates | null,
): number | undefined | null {
  if (from === to) return undefined;
  if (!receivedInput.trim()) return Math.round(convertAmount(sent, from, to, rates) * 100) / 100;
  const received = Number(receivedInput);
  return Number.isFinite(received) && received > 0 ? received : null;
}
