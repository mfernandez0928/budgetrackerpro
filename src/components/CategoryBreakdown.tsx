const tableData = [
  { category: "Housing", amount: 1200, percent: 36 },
  { category: "Food", amount: 800, percent: 24 },
  { category: "Transportation", amount: 400, percent: 12 },
  { category: "Utilities", amount: 300, percent: 9 },
  { category: "Entertainment", amount: 400, percent: 12 },
  { category: "Healthcare", amount: 200, percent: 6 },
  { category: "Other", amount: 100, percent: 3 },
];

export default function CategoryBreakdown() {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="font-bold mb-4">Category Breakdown</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="text-left pb-2">Category</th>
            <th className="text-right pb-2">Amount</th>
            <th className="text-right pb-2">% of Total</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr key={row.category} className="border-b last:border-none">
              <td className="py-2">{row.category}</td>
              <td className="py-2 text-right">${row.amount.toFixed(2)}</td>
              <td className="py-2 text-right">{row.percent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
