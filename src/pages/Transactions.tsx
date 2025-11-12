import { useState, useMemo } from "react";
import { useStore } from "../store/useStore";
import { showToast } from "../components/Toast";
import { formatCurrency } from "../utils/currency";

export default function Transactions() {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    categories,
    settings,
  } = useStore();

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "Income",
    amount: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.amount || parseFloat(form.amount) === 0)
      newErrors.amount = "Amount must be non-zero";
    if (!form.date) newErrors.date = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const amount =
      form.category === "Income"
        ? Math.abs(parseFloat(form.amount))
        : -Math.abs(parseFloat(form.amount));

    if (editingId) {
      updateTransaction(editingId, {
        ...form,
        amount,
      });
      showToast("✅ Transaction updated successfully!", "success");
      setEditingId(null);
    } else {
      addTransaction({
        date: form.date,
        description: form.description,
        category: form.category,
        amount,
      });
      showToast("✅ Transaction added successfully!", "success");
    }

    setForm({
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "Income",
      amount: "",
    });
    setErrors({});
  };

  const handleDelete = (id: number) => {
    deleteTransaction(id);
    setShowDeleteConfirm(null);
    showToast("🗑️ Transaction deleted successfully!", "success");
  };

  const handleEdit = (tx: (typeof transactions)[0]) => {
    setEditingId(tx.id);
    setForm({
      date: tx.date,
      description: tx.description,
      category: tx.category,
      amount: Math.abs(tx.amount).toString(),
    });
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== "All") {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return Math.abs(b.amount) - Math.abs(a.amount);
      }
    });

    return filtered;
  }, [transactions, searchTerm, filterCategory, sortBy]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 transition-colors">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Transaction History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Add, edit, and manage your transactions
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 transition-colors">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {editingId ? "Edit Transaction" : "Add New Transaction"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.date
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Coffee, Rent..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.amount
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold transition-colors"
                >
                  {editingId ? "Update" : "+ Add"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        date: new Date().toISOString().split("T")[0],
                        description: "",
                        category: "Income",
                        amount: "",
                      });
                    }}
                    className="bg-gray-400 hover:bg-gray-500 text-white rounded-lg px-3 py-2 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row gap-4 transition-colors">
          <input
            type="text"
            placeholder="🔍 Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option>All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "amount")}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">No transactions found</p>
              <p className="text-sm">Start by adding a transaction above</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                      {tx.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 font-medium">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-semibold">
                        {tx.category}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-semibold text-right ${
                        tx.amount >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {tx.amount >= 0 ? "+" : "-"}
                      {formatCurrency(Math.abs(tx.amount), settings.currency)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mr-3 transition"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(tx.id)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm transition-colors">
              <p className="text-gray-800 dark:text-white font-semibold mb-4">
                Are you sure you want to delete this transaction?
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg px-4 py-2 font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 font-semibold transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
