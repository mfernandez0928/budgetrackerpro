const categories = [
  { name: "Housing", amount: 1200, percent: 36 },
  { name: "Food", amount: 800, percent: 24 },
  { name: "Transportation", amount: 400, percent: 12 },
  { name: "Utilities", amount: 300, percent: 9 },
  { name: "Entertainment", amount: 400, percent: 12 },
  { name: "Healthcare", amount: 200, percent: 6 },
  { name: "Other", amount: 100, percent: 3 },
];

export default function CategoryBreakdown() {
  return (
    <>
      <h3 className="text-md font-semibold mb-2">Category Breakdown</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 border-b">
            <th className="text-left pb-2">CATEGORY</th>
            <th className="text-right pb-2">AMOUNT</th>
            <th className="text-right pb-2">% OF TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((row) => (
            <tr key={row.name} className="border-b last:border-b-0">
              <td className="py-3 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                {row.name}
              </td>
              <td className="py-3 text-right">${row.amount.toFixed(2)}</td>
              <td className="py-3 text-right">{row.percent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
