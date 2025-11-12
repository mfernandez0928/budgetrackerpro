import { useState } from "react";
import { useStore } from "../../store/useStore";
import { showToast } from "../Toast";

export default function CategorySettings() {
  const { categories, addCategory, deleteCategory, updateCategory } =
    useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: "", color: "#3b82f6" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  const handleAdd = () => {
    if (!form.name.trim()) {
      showToast("❌ Category name is required", "error");
      return;
    }
    addCategory({ name: form.name, color: form.color });
    setForm({ name: "", color: "#3b82f6" });
    setShowAddForm(false);
    showToast("✅ Category added successfully!", "success");
  };

  const handleUpdate = () => {
    if (!form.name.trim() || !editingId) return;
    updateCategory(editingId, { name: form.name, color: form.color });
    setEditingId(null);
    setForm({ name: "", color: "#3b82f6" });
    showToast("✅ Category updated successfully!", "success");
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    setShowDeleteConfirm(null);
    showToast("🗑️ Category deleted successfully!", "success");
  };

  const handleEdit = (cat: (typeof categories)[0]) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, color: cat.color });
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
          Custom Categories
        </h3>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            setForm({ name: "", color: "#3b82f6" });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          + Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-800 dark:text-white mb-3">
            {editingId ? "Edit Category" : "Add New Category"}
          </h4>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Category name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600"
            />
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              {editingId ? "Update" : "Add"}
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setShowAddForm(false);
                setForm({ name: "", color: "#3b82f6" });
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-2 text-gray-600 dark:text-gray-400">
              Category
            </th>
            <th className="text-left py-2 text-gray-600 dark:text-gray-400">
              Color
            </th>
            <th className="text-center py-2 text-gray-600 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr
              key={cat.id}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <td className="py-3 text-gray-800 dark:text-gray-200">
                {cat.name}
              </td>
              <td className="py-3">
                <span
                  style={{ backgroundColor: cat.color }}
                  className="inline-block w-8 h-4 rounded border border-gray-300 dark:border-gray-600"
                ></span>
              </td>
              <td className="py-3 text-center">
                <button
                  onClick={() => handleEdit(cat)}
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mx-2 transition"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(cat.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mx-2 transition"
                  title="Delete"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm">
            <p className="text-gray-800 dark:text-white font-semibold mb-4">
              Delete this category?
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
                className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
