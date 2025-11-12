import { create } from "zustand";

type Transaction = {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
};

type Category = {
  name: string;
  color: string;
};

type Store = {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: number) => void;
  addCategory: (cat: Category) => void;
  deleteCategory: (name: string) => void;
  setTransactions: (txs: Transaction[]) => void;
  setCategories: (cats: Category[]) => void;
};

export const useStore = create<Store>((set) => ({
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
  categories: [
    { name: "Income", color: "#4ade80" },
    { name: "Housing", color: "#3b82f6" },
    { name: "Food", color: "#fbbf24" },
    { name: "Transportation", color: "#a78bfa" },
    { name: "Utilities", color: "#f472b6" },
    { name: "Entertainment", color: "#ef4444" },
    { name: "Healthcare", color: "#06b6d4" },
    { name: "Other", color: "#6b7280" },
  ],

  addTransaction: (tx) =>
    set((state) => ({
      transactions: [...state.transactions, tx],
    })),

  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.id !== id),
    })),

  addCategory: (cat) =>
    set((state) => ({
      categories: [...state.categories, cat],
    })),

  deleteCategory: (name) =>
    set((state) => ({
      categories: state.categories.filter((cat) => cat.name !== name),
    })),

  setTransactions: (txs) => set({ transactions: txs }),
  setCategories: (cats) => set({ categories: cats }),
}));
