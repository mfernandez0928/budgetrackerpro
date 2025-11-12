import { useState } from "react";
import { useStore } from "../../store/useStore";
import { showToast } from "../Toast";

export default function CategorySettings() {
  const { categories, addCategory, deleteCategory, updateCategory } =
    useStore();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6b7280");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("📦");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editEmoji, setEditEmoji] = useState("");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      showToast("❌ Category name is required", "error");
      return;
    }
    addCategory({
      name: newCategoryName,
      color: newCategoryColor,
      emoji: newCategoryEmoji,
    });
    setNewCategoryName("");
    setNewCategoryColor("#6b7280");
    setNewCategoryEmoji("📦");
    showToast("✅ Category added!", "success");
  };

  const handleEditCategory = (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (category) {
      setEditingId(id);
      setEditName(category.name);
      setEditColor(category.color);
      setEditEmoji(category.emoji);
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      showToast("❌ Category name is required", "error");
      return;
    }
    if (editingId) {
      updateCategory(editingId, {
        name: editName,
        color: editColor,
        emoji: editEmoji,
      });
      showToast("✅ Category updated!", "success");
      setEditingId(null);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategory(id);
      showToast("✅ Category deleted!", "success");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        📁 Manage Categories
      </h2>

      {/* Add New Category */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          ➕ Add Custom Category
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="color"
            value={newCategoryColor}
            onChange={(e) => setNewCategoryColor(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg h-10 cursor-pointer"
          />
          <input
            type="text"
            placeholder="Emoji"
            value={newCategoryEmoji}
            onChange={(e) => setNewCategoryEmoji(e.target.value)}
            maxLength={2}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold transition-colors"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Categories Table/List */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          All Categories (Editable & Deletable)
        </p>
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-2xl">{category.emoji}</span>
                <span className="text-gray-800 dark:text-white font-medium">
                  {category.name}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditCategory(category.id)}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm px-3 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-700 font-semibold text-sm px-3 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full transition-colors">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Edit Category
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg h-10 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Emoji
                </label>
                <input
                  type="text"
                  value={editEmoji}
                  onChange={(e) => setEditEmoji(e.target.value)}
                  maxLength={2}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingId(null)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg px-4 py-2 font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
