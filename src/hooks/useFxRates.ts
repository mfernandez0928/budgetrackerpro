import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { FX_SOURCE_URL, isStale, parseFrankfurter, toMainCurrencyView, type FxRates } from "../lib/fx";
import { useStore } from "../store/useStore";

interface FxState {
  rates: FxRates | null;
  setRates: (rates: FxRates) => void;
}

// Kept apart from the budget store: rates are per device and must not trigger a cloud sync.
export const useFxStore = create<FxState>()(
  persist(
    (set) => ({
      rates: null,
      setRates: (rates) => set({ rates }),
    }),
    { name: "btp.fx", storage: createJSONStorage(() => localStorage) },
  ),
);

async function refreshRates() {
  if (!isStale(useFxStore.getState().rates, Date.now()) || !navigator.onLine) return;
  try {
    const response = await fetch(FX_SOURCE_URL);
    if (!response.ok) return;
    useFxStore.getState().setRates(parseFrankfurter(await response.json(), Date.now()));
  } catch {
    // Keep the last known rates; the next launch or reconnect tries again.
  }
}

export function useFxRefresh() {
  useEffect(() => {
    void refreshRates();
    window.addEventListener("online", refreshRates);
    return () => window.removeEventListener("online", refreshRates);
  }, []);
}

// The store with every transaction expressed in the main currency, for totals, budgets and charts.
export function useMainCurrencyView() {
  const store = useStore();
  const rates = useFxStore((state) => state.rates);
  return useMemo(() => toMainCurrencyView(store, rates), [store, rates]);
}
