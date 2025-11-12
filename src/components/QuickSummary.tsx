import { useStore } from "../store/useStore";

export default function QuickSummary() {
  const { getTotalIncome, getTotalExpenses, getBalance } = useStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-6 text-center hover:shadow-md transition-all">
        <p className="text-green-700 dark:text-green-400 text-sm font-semibold mb-2">
          💰 Total Income
        </p>
        <p className="text-4xl font-bold text-green-600 dark:text-green-400">
          ${getTotalIncome().toFixed(2)}
        </p>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-xl p-6 text-center hover:shadow-md transition-all">
        <p className="text-red-700 dark:text-red-400 text-sm font-semibold mb-2">
          📉 Total Expenses
        </p>
        <p className="text-4xl font-bold text-red-600 dark:text-red-400">
          ${getTotalExpenses().toFixed(2)}
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 text-center hover:shadow-md transition-all">
        <p className="text-blue-700 dark:text-blue-400 text-sm font-semibold mb-2">
          💵 Balance
        </p>
        <p
          className={`text-4xl font-bold ${
            getBalance() >= 0
              ? "text-blue-600 dark:text-blue-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          ${getBalance().toFixed(2)}
        </p>
      </div>
    </div>
  );
}
