export const getCurrencySymbol = (currency: string): string => {
  const currencyMap: Record<string, string> = {
    "$ (USD)": "$",
    "₱ (PHP)": "₱",
    "€ (EUR)": "€",
    "£ (GBP)": "£",
  };
  return currencyMap[currency] || "$";
};

export const formatCurrency = (amount: number, currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${Math.abs(amount).toFixed(2)}`;
};
