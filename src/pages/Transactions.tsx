import { useState } from "react";
import TransactionForm from "../components/transactions/TransactionForm";
import TransactionTable from "../components/transactions/TransactionTable";

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
  {
    id: 5,
    date: "2025-06-07",
    description: "Electric Bill",
    category: "Utilities",
    amount: -85,
  },
  // Continue mock data for all transaction rows shown in the screenshot
];

export default function Transactions() {
  const [transactions, setTransactions] = useState(initialTransactions);
  // Optional: filtering logic, pagination, etc.

  const addTransaction = (tx) =>
    setTransactions([...transactions, { ...tx, id: Date.now() }]);
  const removeTransaction = (id) =>
    setTransactions(transactions.filter((t) => t.id !== id));

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h2 className="font-bold text-xl mb-4">Transaction History</h2>
      <div className="mb-7">
        <TransactionForm onAdd={addTransaction} />
      </div>
      <TransactionTable
        transactions={transactions}
        onDelete={removeTransaction}
      />
    </main>
  );
}
