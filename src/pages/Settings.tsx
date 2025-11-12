import { useState } from "react";
import { useStore } from "../store/useStore";
import { showToast } from "../components/Toast";
import CategorySettings from "../components/settings/CategorySettings";

export default function Settings() {
  const { transactions, categories, settings, updateSettings } = useStore();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSaveSettings = () => {
    updateSettings(localSettings);
    showToast("✅ Settings saved successfully!", "success");
  };

  const handleExport = () => {
    const data = JSON.stringify(
      { transactions, categories, settings },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `budget-tracker-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("📥 Data exported successfully!", "success");
  };

  const handleCreateBackup = () => {
    const data = { transactions, categories, settings };
    localStorage.setItem("budgetBackup", JSON.stringify(data));
    showToast("💾 Backup created successfully!", "success");
  };

  const handleRestoreBackup = () => {
    const backup = localStorage.getItem("budgetBackup");
    if (backup) {
      try {
        const data = JSON.parse(backup);
        showToast(
          "↩️ Backup restored successfully! (Reload to apply)",
          "success"
        );
      } catch {
        showToast("❌ Invalid backup data", "error");
      }
    } else {
      showToast("❌ No backup found", "error");
    }
  };

  const handleStartOver = () => {
    if (
      confirm(
        "⚠️ This will delete ALL data. This action cannot be undone. Are you sure?"
      )
    ) {
      localStorage.removeItem("budget-tracker-storage");
      localStorage.removeItem("budgetBackup");
      window.location.reload();
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your app preferences
          </p>
        </div>

        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 transition-colors">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            General Settings
          </h2>
          <div className="space-y-4">
            {/* AI Transaction Categorization */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  AI Transaction Categorization
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Auto-categorize transactions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.aiCategorization}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      aiCategorization: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  🌙 Dark Mode
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enable dark theme
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.darkMode}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      darkMode: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Currency Symbol */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  💱 Currency Symbol
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your currency
                </p>
              </div>
              <select
                value={localSettings.currency}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    currency: e.target.value,
                  })
                }
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option>$ (USD)</option>
                <option>₱ (PHP)</option>
                <option>€ (EUR)</option>
                <option>£ (GBP)</option>
              </select>
            </div>

            {/* Start of Month */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  📅 Start of Month
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  First day of your billing cycle
                </p>
              </div>
              <select
                value={localSettings.startOfMonth}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    startOfMonth: parseInt(e.target.value),
                  })
                }
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1st day</option>
                <option value="15">15th day</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            ✅ Save Settings
          </button>
        </div>

        {/* Category Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 transition-colors">
          <CategorySettings />
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            📊 Data Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
            >
              📥 Export All Data
            </button>
            <button
              onClick={handleCreateBackup}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
            >
              💾 Create Backup
            </button>
            <button
              onClick={handleRestoreBackup}
              className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
            >
              ↩️ Restore Backup
            </button>
            <button
              onClick={handleStartOver}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
            >
              🔄 Start Over
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
