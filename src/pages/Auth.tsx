import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleTestSignIn = async () => {
    try {
      setLoading(true);
      // Store test user in localStorage
      localStorage.setItem(
        "testUser",
        JSON.stringify({
          uid: "test-user-" + Date.now(),
          displayName: "Mark Dev",
          email: "test@budgettracker.local",
          photoURL: "https://via.placeholder.com/40",
        })
      );
      showToast("✅ Logged in as test user!", "success");
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error: any) {
      showToast(`❌ Sign-in failed: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("testUser");
    showToast("✅ Logged out!", "success");
    window.location.reload();
  };

  const isLoggedIn = localStorage.getItem("testUser");

  if (isLoggedIn) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🎯 BudgetTracker Pro
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your finances with ease
          </p>
        </div>

        <button
          onClick={handleTestSignIn}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
        >
          <span>🧪</span>
          {loading ? "Loading..." : "Enter Demo Mode"}
        </button>

        <div className="mt-8 space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <h3 className="font-semibold text-gray-800 dark:text-white">
            ✨ Features:
          </h3>
          <div className="space-y-2">
            <p>✅ Track income and expenses</p>
            <p>✅ Categorize transactions</p>
            <p>✅ View spending analytics</p>
            <p>✅ Export your data</p>
            <p>✅ Dark mode support</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            💡 <strong>Demo Mode:</strong> All data is stored locally on your
            device.
          </p>
        </div>
      </div>
    </main>
  );
}
