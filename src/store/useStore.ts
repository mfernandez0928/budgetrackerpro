import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Transaction = {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
};

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Settings = {
  currency: string;
  darkMode: boolean;
  aiCategorization: boolean;
  startOfMonth: number;
};

type Store = {
  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: number) => void;
  updateTransaction: (id: number, tx: Omit<Transaction, "id">) => void;
  clearAllTransactions: () => void;

  // Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, "id">) => void;
  deleteCategory: (id: string) => void;
  updateCategory: (id: string, cat: Omit<Category, "id">) => void;

  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;

  // Utility functions
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getCategoryBreakdown: () => Array<{
    name: string;
    amount: number;
    percent: number;
    color: string;
  }>;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial transactions
      transactions: [
        {
          id: 1,
          date: "2025-06-01",
          description: "Monthly Salary",
          category: "Income",
          amount: 4500,
        },
        {
          id: 2,
          date: "2025-06-02",
          description: "Rent Payment",
          category: "Housing",
          amount: -1200,
        },
        {
          id: 3,
          date: "2025-06-03",
          description: "Grocery Shopping",
          category: "Food",
          amount: -150,
        },
        {
          id: 4,
          date: "2025-06-05",
          description: "Gas Station",
          category: "Transportation",
          amount: -45,
        },
      ],

      // Initial categories
      categories: [
        { id: "1", name: "Income", color: "#4ade80" },
        { id: "2", name: "Housing", color: "#3b82f6" },
        { id: "3", name: "Food", color: "#fbbf24" },
        { id: "4", name: "Transportation", color: "#a78bfa" },
        { id: "5", name: "Utilities", color: "#f472b6" },
        { id: "6", name: "Entertainment", color: "#ef4444" },
        { id: "7", name: "Healthcare", color: "#06b6d4" },
        { id: "8", name: "Other", color: "#6b7280" },
      ],

      // Initial settings
      settings: {
        currency: "$ (USD)",
        darkMode: false,
        aiCategorization: false,
        startOfMonth: 1,
      },

      // Transaction operations
      addTransaction: (tx) =>
        set((state) => ({
          transactions: [{ ...tx, id: Date.now() }, ...state.transactions],
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      updateTransaction: (id, tx) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...tx, id } : t
          ),
        })),

      clearAllTransactions: () => set({ transactions: [] }),

      // Category operations
      addCategory: (cat) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...cat, id: Date.now().toString() },
          ],
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      updateCategory: (id, cat) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...cat, id } : c
          ),
        })),

      // Settings operations
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Utility functions
      getTotalIncome: () => {
        const { transactions } = get();
        return transactions
          .filter((t) => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getTotalExpenses: () => {
        const { transactions } = get();
        return Math.abs(
          transactions
            .filter((t) => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0)
        );
      },

      getBalance: () => {
        const { transactions } = get();
        return transactions.reduce((sum, t) => sum + t.amount, 0);
      },

      getCategoryBreakdown: () => {
        const { transactions, categories } = get();
        const expenses = transactions.filter((t) => t.amount < 0);
        const total = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));

        const breakdown: Record<string, { amount: number; color: string }> = {};

        expenses.forEach((t) => {
          const category = categories.find((c) => c.name === t.category);
          if (!breakdown[t.category]) {
            breakdown[t.category] = {
              amount: 0,
              color: category?.color || "#6b7280",
            };
          }
          breakdown[t.category].amount += Math.abs(t.amount);
        });

        return Object.entries(breakdown).map(([name, data]) => ({
          name,
          amount: data.amount,
          color: data.color,
          percent: total > 0 ? Math.round((data.amount / total) * 100) : 0,
        }));
      },
    }),
    {
      name: "budget-tracker-storage",
    }
  )
);
