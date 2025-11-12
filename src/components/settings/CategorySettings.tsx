import { useState } from "react";
import { useStore } from "../../store/useStore";
import { showToast } from "../Toast";

export default function CategorySettings() {
  const { categories, addCategory, deleteCategory, updateCategory } =
    useStore();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6b7280");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("📦");

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

  const handleDeleteCategory = (id: string) => {
    if (["income", "housing", "food", "transportation", "other"].includes(id)) {
      showToast("❌ Cannot delete default categories", "error");
      return;
    }
    deleteCategory(id);
    showToast("✅ Category deleted!", "success");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        📁 Manage Categories
      </h2>

      {/* Add New Category */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Add Custom Category
        </p>
        <div className="space-y-3">
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
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold"
            >
              ➕ Add
            </button>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Existing Categories
        </p>
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-3"
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
            {!["income", "housing", "food", "transportation", "other"].includes(
              category.id
            ) && (
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
