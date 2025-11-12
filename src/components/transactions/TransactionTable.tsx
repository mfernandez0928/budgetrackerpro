export default function TransactionTable({ transactions, onDelete }) {
  // Optionally support pages or date filtering here
  return (
    <table className="w-full bg-white rounded-lg shadow text-sm">
      <thead>
        <tr className="text-gray-500 bg-gray-100">
          <th className="py-2 px-3 text-left">Date</th>
          <th className="py-2 px-3 text-left">Description</th>
          <th className="py-2 px-3 text-left">Category</th>
          <th className="py-2 px-3 text-right">Amount</th>
          <th className="py-2 px-3 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx.id} className="border-t last:border-b">
            <td className="py-2 px-3">{tx.date}</td>
            <td className="py-2 px-3">{tx.description}</td>
            <td className="py-2 px-3">{tx.category}</td>
            <td
              className={`py-2 px-3 text-right ${
                tx.amount < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {tx.amount < 0
                ? `-$${Math.abs(tx.amount).toFixed(2)}`
                : `+$${tx.amount.toFixed(2)}`}
            </td>
            <td className="py-2 px-3 text-center">
              <button
                className="text-red-500 px-2"
                onClick={() => onDelete(tx.id)}
                title="Delete"
              >
                🗑
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
