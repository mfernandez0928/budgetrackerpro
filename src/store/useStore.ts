import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Category {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface Settings {
  currency: string;
  darkMode: boolean;
  aiCategorization: boolean;
  startOfMonth: number;
}

interface Store {
  transactions: Transaction[];
  categories: Category[];
  settings: Settings;

  addTransaction: (tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  addCategory: (category: Omit<Category, "id">) => void;
  deleteCategory: (id: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  getCategoryBreakdown: () => any[];
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  resetToDefaults: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: [
        { id: "income", name: "Income", color: "#4ade80", emoji: "💰" },
        { id: "housing", name: "Housing", color: "#3b82f6", emoji: "🏠" },
        { id: "food", name: "Food", color: "#fbbf24", emoji: "🍔" },
        {
          id: "transportation",
          name: "Transportation",
          color: "#a78bfa",
          emoji: "🚗",
        },
        { id: "other", name: "Other", color: "#6b7280", emoji: "📦" },
      ],
      settings: {
        currency: "$ (USD)",
        darkMode: false,
        aiCategorization: false,
        startOfMonth: 1,
      },

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...tx, id: Date.now().toString() },
          ],
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      addCategory: (category) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...category, id: Date.now().toString() },
          ],
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      getCategoryBreakdown: () => {
        const state = get();
        const categoryTotals: { [key: string]: number } = {};

        state.transactions.forEach((tx) => {
          if (tx.amount < 0) {
            categoryTotals[tx.category] =
              (categoryTotals[tx.category] || 0) + Math.abs(tx.amount);
          }
        });

        return Object.entries(categoryTotals)
          .map(([catName, amount]) => {
            const category = state.categories.find((c) => c.name === catName); // ✅ FIX: Search by name
            const total = Object.values(categoryTotals).reduce(
              (a, b) => a + b,
              0
            );
            return {
              name: catName,
              amount: parseFloat(amount.toFixed(2)),
              color: category?.color || "#6b7280",
              percent: total > 0 ? Math.round((amount / total) * 100) : 0,
            };
          })
          .filter((item) => item.amount > 0) // Only show categories with expenses
          .sort((a, b) => b.amount - a.amount); // Sort by amount descending
      },

      getTotalIncome: () => {
        const state = get();
        return state.transactions
          .filter((tx) => tx.amount > 0)
          .reduce((sum, tx) => sum + tx.amount, 0);
      },

      getTotalExpenses: () => {
        const state = get();
        return state.transactions
          .filter((tx) => tx.amount < 0)
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      },

      getBalance: () => {
        const state = get();
        return state.transactions.reduce((sum, tx) => sum + tx.amount, 0);
      },

      resetToDefaults: () =>
        set({
          transactions: [],
          categories: [
            { id: "income", name: "Income", color: "#4ade80", emoji: "💰" },
            { id: "housing", name: "Housing", color: "#3b82f6", emoji: "🏠" },
            { id: "food", name: "Food", color: "#fbbf24", emoji: "🍔" },
            {
              id: "transportation",
              name: "Transportation",
              color: "#a78bfa",
              emoji: "🚗",
            },
            { id: "other", name: "Other", color: "#6b7280", emoji: "📦" },
          ],
          settings: {
            currency: "$ (USD)",
            darkMode: false,
            aiCategorization: false,
            startOfMonth: 1,
          },
        }),
    }),
    {
      name: "budget-tracker-storage",
    }
  )
);
