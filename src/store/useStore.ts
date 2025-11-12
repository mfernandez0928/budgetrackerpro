import { create } from "zustand";

export const useStore = create((set) => ({
  transactions: [],
  categories: [],
  // Add actions and other global states as needed
}));
