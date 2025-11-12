import { useState } from "react";

// Example initial data:
const initialTransactions = [
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
  // ...add more rows based on your screenshot
];

function TransactionForm({ onAdd }) {
  const [form, setForm] = useState({
    date: "",
    description: "",
    category: "",
    amount: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleSubmit(e) {
    e.preventDefault();
    onAdd({ ...form, amount: Number(form.amount), id: Date.now() });
    setForm({ date: "", description: "", category: "", amount: "" });
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap gap-4 bg-white rounded-lg p-6 shadow mb-5"
    >
      <input
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        className="border px-2 py-1 rounded w-32"
        required
      />
      <input
        name="description"
        type="text"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="border px-2 py-1 rounded w-44"
        required
      />
      <input
        name="amount"
        type="number"
        step="0.01"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
        className="border px-2 py-1 rounded w-24"
        required
      />
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="border px-2 py-1 rounded w-36"
        required
      >
        <option value="">Category</option>
        <option>Income</option>
        <option>Housing</option>
        <option>Food</option>
        <option>Transportation</option>
        <option>Utilities</option>
        <option>Entertainment</option>
        <option>Healthcare</option>
        <option>Personal</option>
      </select>
      <button
        type="submit"
        className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Transaction
      </button>
    </form>
  );
}

function TransactionTable({ transactions, onDelete }) {
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
                onClick={() => onDelete(tx.id)}
                className="text-red-500 px-2"
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

export default function Transactions() {
  const [transactions, setTransactions] = useState(initialTransactions);
  function addTransaction(tx) {
    setTransactions([...transactions, tx]);
  }
  function removeTransaction(id) {
    setTransactions(transactions.filter((tx) => tx.id !== id));
  }
  return (
    <main className="max-w-4xl mx-auto p-8">
      <h2 className="font-bold text-xl mb-4">Transaction History</h2>
      <TransactionForm onAdd={addTransaction} />
      <TransactionTable
        transactions={transactions}
        onDelete={removeTransaction}
      />
    </main>
  );
}
