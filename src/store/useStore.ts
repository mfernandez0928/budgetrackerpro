import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  BudgetStoreSnapshot,
  BudgetStoreState,
  Category,
  Transaction,
} from "../types/finance";
import {
  advanceRecurringDate,
  createDefaultSnapshot,
  createId,
  normalizeCurrencyCode,
} from "../lib/finance";
import { getTodayISO } from "../lib/date";

function migrateLegacyState(persistedState: unknown): BudgetStoreSnapshot {
  const defaults = createDefaultSnapshot();
  const state = (persistedState ?? {}) as Record<string, unknown>;

  if (Array.isArray((state as BudgetStoreSnapshot).accounts)) {
    return {
      ...defaults,
      ...(state as BudgetStoreSnapshot),
    };
  }

  const legacyCategories: Category[] = Array.isArray(state.categories)
    ? (state.categories as Array<Record<string, string>>).map((category) => ({
        id: category.id ?? createId("cat"),
        name: category.name ?? "Other",
        color: category.color ?? "#6b7280",
        icon: "dots",
        type: (category.name === "Income" ? "income" : "expense") as
          | "income"
          | "expense",
      }))
    : defaults.categories;

  const categoryByName = new Map(
    legacyCategories.map((category) => [category.name.toLowerCase(), category.id])
  );

  const transactions: Transaction[] = Array.isArray(state.transactions)
    ? (state.transactions as Array<Record<string, unknown>>).map((transaction) => {
        const amount = Number(transaction.amount ?? 0);
        const type = (amount > 0 ? "income" : "expense") as "income" | "expense";
        return {
          id: String(transaction.id ?? createId("tx")),
          createdAt: new Date().toISOString(),
          title: String(transaction.description ?? "Imported transaction"),
          amount: Math.abs(amount),
          type,
          date: String(transaction.date ?? getTodayISO()),
          categoryId:
            categoryByName.get(String(transaction.category ?? "other").toLowerCase()) ??
            legacyCategories.find((category) => category.type === type)?.id ??
            legacyCategories[0]?.id ??
            "other",
          accountId: defaults.accounts[0].id,
          paymentMethod: "cash" as const,
          notes: "",
          status: "cleared" as const,
        };
      })
    : [];

  return {
    ...defaults,
    categories: legacyCategories,
    transactions,
    debts: [],
    moneyOwed: [],
    plannedPayments: [],
    installments: [],
    settings: {
      ...defaults.settings,
      currencyCode: normalizeCurrencyCode(
        (state.settings as Record<string, string> | undefined)?.currency
      ),
      themeMode:
        (state.settings as Record<string, boolean> | undefined)?.darkMode === true
          ? "dark"
          : "system",
      startOfMonth: Number(
        (state.settings as Record<string, number> | undefined)?.startOfMonth ?? 1
      ),
    },
    profile: {
      hasCompletedOnboarding: transactions.length > 0,
    },
  };
}

function mergeSnapshot(
  current: BudgetStoreSnapshot,
  incoming: Partial<BudgetStoreSnapshot>
): BudgetStoreSnapshot {
  return {
    transactions: incoming.transactions ?? current.transactions,
    categories: incoming.categories ?? current.categories,
    accounts: incoming.accounts ?? current.accounts,
    budgets: incoming.budgets ?? current.budgets,
    savingsGoals: incoming.savingsGoals ?? current.savingsGoals,
    recurringBills: incoming.recurringBills ?? current.recurringBills,
    debts: incoming.debts ?? current.debts,
    moneyOwed: incoming.moneyOwed ?? current.moneyOwed,
    plannedPayments: incoming.plannedPayments ?? current.plannedPayments,
    installments: incoming.installments ?? current.installments,
    settings: incoming.settings ? { ...current.settings, ...incoming.settings } : current.settings,
    profile: incoming.profile ? { ...current.profile, ...incoming.profile } : current.profile,
  };
}

export const useStore = create<BudgetStoreState>()(
  persist(
    (set) => ({
      ...createDefaultSnapshot(),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            {
              ...transaction,
              id: createId("tx"),
              createdAt: new Date().toISOString(),
            },
            ...state.transactions,
          ],
          profile: {
            hasCompletedOnboarding: true,
          },
        })),

      updateTransaction: (transactionId, updates) =>
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === transactionId
              ? { ...transaction, ...updates }
              : transaction
          ),
        })),

      deleteTransaction: (transactionId) =>
        set((state) => ({
          transactions: state.transactions.filter(
            (transaction) => transaction.id !== transactionId
          ),
        })),

      upsertBudget: (budget) =>
        set((state) => {
          const existingBudget = state.budgets.find(
            (item) =>
              item.month === budget.month && item.categoryId === budget.categoryId
          );
          if (existingBudget) {
            return {
              budgets: state.budgets.map((item) =>
                item.id === existingBudget.id ? { ...item, ...budget } : item
              ),
            };
          }
          return {
            budgets: [...state.budgets, { ...budget, id: createId("budget") }],
          };
        }),

      deleteBudget: (budgetId) =>
        set((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== budgetId),
        })),

      addSavingsGoal: (goal) =>
        set((state) => ({
          savingsGoals: [...state.savingsGoals, { ...goal, id: createId("goal") }],
          profile: {
            hasCompletedOnboarding: true,
          },
        })),

      updateSavingsGoal: (goalId, updates) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((goal) =>
            goal.id === goalId ? { ...goal, ...updates } : goal
          ),
        })),

      deleteSavingsGoal: (goalId) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((goal) => goal.id !== goalId),
        })),

      addRecurringBill: (bill) =>
        set((state) => ({
          recurringBills: [...state.recurringBills, { ...bill, id: createId("bill") }],
          profile: {
            hasCompletedOnboarding: true,
          },
        })),

      updateRecurringBill: (billId, updates) =>
        set((state) => ({
          recurringBills: state.recurringBills.map((bill) =>
            bill.id === billId ? { ...bill, ...updates } : bill
          ),
        })),

      deleteRecurringBill: (billId) =>
        set((state) => ({
          recurringBills: state.recurringBills.filter((bill) => bill.id !== billId),
        })),

      markRecurringBillPaid: (billId, paidDate = getTodayISO()) =>
        set((state) => {
          const bill = state.recurringBills.find((item) => item.id === billId);
          if (!bill) return state;

          const paidTransaction: Transaction = {
            id: createId("tx"),
            createdAt: new Date().toISOString(),
            title: bill.title,
            amount: bill.amount,
            type: bill.type,
            date: paidDate,
            categoryId: bill.categoryId,
            accountId: bill.accountId,
            paymentMethod: bill.paymentMethod,
            notes: bill.notes,
            recurringId: bill.id,
            isRecurringInstance: true,
            status: "cleared",
          };

          return {
            transactions: [paidTransaction, ...state.transactions],
            recurringBills: state.recurringBills.map((item) =>
              item.id === billId ? advanceRecurringDate(item, paidDate) : item
            ),
          };
        }),

      addAccount: (account) =>
        set((state) => ({
          accounts: [...state.accounts, { ...account, id: createId("acct") }],
        })),

      updateAccount: (accountId, updates) =>
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.id === accountId ? { ...account, ...updates } : account
          ),
        })),

      deleteAccount: (accountId) =>
        set((state) => ({
          accounts: state.accounts.filter((account) => account.id !== accountId),
        })),

      addDebt: (debt) =>
        set((state) => ({
          debts: [...state.debts, { ...debt, id: createId("debt") }],
        })),

      deleteDebt: (debtId) =>
        set((state) => ({
          debts: state.debts.filter((debt) => debt.id !== debtId),
        })),

      addMoneyOwed: (moneyOwed) =>
        set((state) => ({
          moneyOwed: [...state.moneyOwed, { ...moneyOwed, id: createId("owed") }],
        })),

      deleteMoneyOwed: (moneyOwedId) =>
        set((state) => ({
          moneyOwed: state.moneyOwed.filter((item) => item.id !== moneyOwedId),
        })),

      addPlannedPayment: (payment) =>
        set((state) => ({
          plannedPayments: [
            ...state.plannedPayments,
            { ...payment, id: createId("planned") },
          ],
        })),

      deletePlannedPayment: (paymentId) =>
        set((state) => ({
          plannedPayments: state.plannedPayments.filter((payment) => payment.id !== paymentId),
        })),

      addInstallment: (installment) =>
        set((state) => ({
          installments: [
            ...state.installments,
            { ...installment, id: createId("installment") },
          ],
        })),

      deleteInstallment: (installmentId) =>
        set((state) => ({
          installments: state.installments.filter(
            (installment) => installment.id !== installmentId
          ),
        })),

      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, { ...category, id: createId("cat") }],
        })),

      updateCategory: (categoryId, updates) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === categoryId ? { ...category, ...updates } : category
          ),
        })),

      deleteCategory: (categoryId) =>
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== categoryId),
        })),

      updateSettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates,
          },
        })),

      completeOnboarding: () =>
        set(() => ({
          profile: {
            hasCompletedOnboarding: true,
          },
        })),

      importSnapshot: (snapshot) =>
        set((state) => mergeSnapshot(state, snapshot)),

      resetToDefaults: () => set(() => createDefaultSnapshot()),
    }),
    {
      name: "budget-tracker-storage",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => migrateLegacyState(persistedState),
      partialize: (state) => ({
        transactions: state.transactions,
        categories: state.categories,
        accounts: state.accounts,
        budgets: state.budgets,
        savingsGoals: state.savingsGoals,
        recurringBills: state.recurringBills,
        debts: state.debts,
        moneyOwed: state.moneyOwed,
        plannedPayments: state.plannedPayments,
        installments: state.installments,
        settings: state.settings,
        profile: state.profile,
      }),
    }
  )
);
