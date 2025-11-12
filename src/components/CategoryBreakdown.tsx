import { useStore } from "../store/useStore";

export default function CategoryBreakdown() {
  const { getCategoryBreakdown } = useStore();
  const breakdown = getCategoryBreakdown();

  if (breakdown.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Category Breakdown
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No expense data available
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Category Breakdown
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
              CATEGORY
            </th>
            <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
              AMOUNT
            </th>
            <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
              % OF TOTAL
            </th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                <span className="flex items-center gap-2">
                  <span
                    style={{ backgroundColor: row.color }}
                    className="inline-block w-3 h-3 rounded-full"
                  ></span>
                  {row.name}
                </span>
              </td>
              <td className="py-3 px-4 text-right text-gray-800 dark:text-gray-200 font-medium">
                ${row.amount.toFixed(2)}
              </td>
              <td className="py-3 px-4 text-right text-gray-800 dark:text-gray-200 font-medium">
                {row.percent}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
