import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { showToast } from "../components/Toast";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import CategorySettings from "../components/settings/CategorySettings";

export default function Settings() {
  const { transactions, categories, settings, updateSettings } = useStore();

  const [localSettings, setLocalSettings] = useState({
    currency: settings.currency,
    darkMode: settings.darkMode,
    aiCategorization: settings.aiCategorization,
    startOfMonth: settings.startOfMonth,
  });

  useEffect(() => {
    setLocalSettings({
      currency: settings.currency,
      darkMode: settings.darkMode,
      aiCategorization: settings.aiCategorization,
      startOfMonth: settings.startOfMonth,
    });
  }, [settings]);

  const handleAICategorization = (checked: boolean) => {
    setLocalSettings({ ...localSettings, aiCategorization: checked });
    updateSettings({ aiCategorization: checked });
    showToast(
      checked
        ? "✅ AI categorization enabled!"
        : "❌ AI categorization disabled!",
      "success"
    );
  };

  const handleCurrencyChange = (value: string) => {
    setLocalSettings({ ...localSettings, currency: value });
    updateSettings({ currency: value });
    showToast("✅ Currency updated!", "success");
  };

  const handleDarkModeChange = (checked: boolean) => {
    setLocalSettings({ ...localSettings, darkMode: checked });
    updateSettings({ darkMode: checked });
    showToast(
      checked ? "🌙 Dark mode enabled!" : "☀️ Light mode enabled!",
      "success"
    );
  };

  const handleStartOfMonth = (value: number) => {
    setLocalSettings({ ...localSettings, startOfMonth: value });
    updateSettings({ startOfMonth: value });
    showToast("✅ Start of month updated!", "success");
  };

  const handleExport = () => {
    try {
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
    } catch (error) {
      showToast("❌ Export failed!", "error");
    }
  };

  const handleCreateBackup = () => {
    try {
      const data = { transactions, categories, settings };
      localStorage.setItem("budgetBackup", JSON.stringify(data));
      showToast("💾 Backup created successfully!", "success");
    } catch (error) {
      showToast("❌ Backup failed!", "error");
    }
  };

  const handleRestoreBackup = () => {
    try {
      const backup = localStorage.getItem("budgetBackup");
      if (!backup) {
        showToast("❌ No backup found", "error");
        return;
      }
      const data = JSON.parse(backup);
      if (data.transactions && data.categories && data.settings) {
        updateSettings(data.settings);
        showToast(
          "✅ Backup restored successfully! (Reload to see all changes)",
          "success"
        );
      } else {
        showToast("❌ Invalid backup data", "error");
      }
    } catch (error) {
      showToast("❌ Restore failed!", "error");
    }
  };

  const handleStartOver = () => {
    const confirmMessage =
      "⚠️ COMPLETE RESET\n\n" +
      "This will DELETE:\n" +
      "❌ ALL transactions\n" +
      "❌ ALL categories\n" +
      "❌ ALL settings\n" +
      "❌ You will be logged out\n\n" +
      "This CANNOT be undone.\n\n" +
      "Type CONFIRM to proceed:";

    const userConfirm = prompt(confirmMessage);

    if (userConfirm === "CONFIRM") {
      try {
        // Clear all data
        localStorage.removeItem("budget-tracker-storage");
        localStorage.removeItem("budgetBackup");
        localStorage.removeItem("testUser");

        // Clear session storage
        sessionStorage.clear();

        // Sign out
        signOut(auth).catch(() => {});

        showToast("🔄 Complete reset in progress...", "warning");

        // Redirect after delay
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1500);
      } catch (error) {
        showToast("❌ Reset failed!", "error");
      }
    } else if (userConfirm !== null) {
      showToast("❌ You must type CONFIRM to reset", "error");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 transition-colors">
      <div className="max-w-3xl mx-auto">
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
            {/* AI Categorization */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  🤖 AI Transaction Categorization
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically categorize transactions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.aiCategorization}
                  onChange={(e) => handleAICategorization(e.target.checked)}
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
                  Enable dark theme for the app
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.darkMode}
                  onChange={(e) => handleDarkModeChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Currency */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  💱 Currency Symbol
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your preferred currency
                </p>
              </div>
              <select
                value={localSettings.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
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
                onChange={(e) => handleStartOfMonth(parseInt(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="1">1st day</option>
                <option value="15">15th day</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 transition-colors">
          <CategorySettings />
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 transition-colors">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            📊 Data Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Export, backup, and manage your data
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg px-4 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              📥 Export All Data
            </button>
            <button
              onClick={handleCreateBackup}
              className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg px-4 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              💾 Create Backup
            </button>
            <button
              onClick={handleRestoreBackup}
              className="bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white rounded-lg px-4 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              ↩️ Restore Backup
            </button>
            <button
              onClick={handleStartOver}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg px-4 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              🔄 Complete Reset
            </button>
          </div>

          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
            <p className="text-sm text-red-900 dark:text-red-300">
              <strong>⚠️ Complete Reset:</strong> Deletes ALL data and logs you
              out. Type "CONFIRM" in the prompt to proceed. This cannot be
              undone!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
