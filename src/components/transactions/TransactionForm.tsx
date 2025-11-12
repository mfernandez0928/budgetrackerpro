import { useForm } from "react-hook-form";

const categoryOptions = [
  "Income",
  "Housing",
  "Food",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Personal",
];

export default function TransactionForm({ onAdd }) {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data) => {
    data.amount = Number(data.amount);
    onAdd(data);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-wrap gap-4 bg-white rounded-lg p-6 shadow"
    >
      <input
        {...register("date")}
        type="date"
        className="border px-2 py-1 rounded w-32"
        required
      />
      <input
        {...register("description")}
        type="text"
        placeholder="Description"
        className="border px-2 py-1 rounded w-44"
        required
      />
      <input
        {...register("amount")}
        type="number"
        step="0.01"
        placeholder="Amount"
        className="border px-2 py-1 rounded w-24"
        required
      />
      <select
        {...register("category")}
        className="border px-2 py-1 rounded w-36"
        required
      >
        <option value="">Select category</option>
        {categoryOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
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
