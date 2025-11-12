const categories = [
  { name: "Income", color: "bg-green-600" },
  { name: "Housing", color: "bg-blue-600" },
  { name: "Food", color: "bg-yellow-500" },
  { name: "Transportation", color: "bg-purple-400" },
  { name: "Utilities", color: "bg-pink-400" },
  { name: "Entertainment", color: "bg-red-500" },
  { name: "Healthcare", color: "bg-cyan-500" },
  { name: "Personal", color: "bg-indigo-400" },
  { name: "Education", color: "bg-yellow-700" },
  { name: "Savings", color: "bg-green-800" },
  { name: "Other", color: "bg-gray-600" },
];

export default function CategorySettings() {
  return (
    <div>
      <h3 className="font-bold mb-2">Custom Categories</h3>
      <table className="w-full text-sm mb-2">
        <thead>
          <tr>
            <th className="text-left py-2">Category</th>
            <th className="text-left py-2">Color</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.name} className="border-b">
              <td className="py-2">{cat.name}</td>
              <td className="py-2">
                <span className={`block w-6 h-3 rounded ${cat.color}`}></span>
              </td>
              <td className="py-2">
                <button className="text-blue-500 px-2" title="Edit">
                  ✏️
                </button>
                <button className="text-red-500 px-2" title="Delete">
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="bg-blue-600 text-white px-3 py-1 rounded mt-2">
        + Add Category
      </button>
    </div>
  );
}
