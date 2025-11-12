import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../config/firebase";
import { showToast } from "../components/Toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast("✅ Signed in with Google!", "success");
      navigate("/dashboard");
    } catch (error: any) {
      showToast(`❌ Google sign-in failed: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🎯 BudgetTracker Pro
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your finances with ease
          </p>
        </div>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white py-4 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
        >
          <span className="text-2xl">🔵</span>
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        {/* Features */}
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

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            💡 <strong>Secure:</strong> All data is stored locally on your
            device.
          </p>
        </div>
      </div>
    </main>
  );
}
