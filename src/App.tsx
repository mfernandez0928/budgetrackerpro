import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import UploadCSV from "./pages/UploadCSV";
import Auth from "./pages/Auth";
import ToastContainer from "./components/Toast";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useStore } from "./store/useStore";
import { signOut } from "firebase/auth";
import { auth } from "./config/firebase";
import { showToast } from "./components/Toast";

function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("✅ Logged out successfully!", "success");
      setDropdownOpen(false);
      window.location.href = "/auth";
    } catch (error: any) {
      showToast(`❌ Logout failed: ${error.message}`, "error");
    }
  };

  const handleNavigateSettings = () => {
    setDropdownOpen(false);
    navigate("/settings");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            BudgetTracker Pro
          </h1>
        </div>

        {/* Navigation */}
        {isAuthenticated ? (
          <nav className="flex gap-8 items-center">
            {/* Desktop Links */}
            <div className="hidden md:flex gap-8">
              <a
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition"
              >
                Dashboard
              </a>
              <a
                href="/transactions"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition"
              >
                Transactions
              </a>
              <a
                href="/upload-csv"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition"
              >
                Upload CSV
              </a>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                title="Account menu"
              >
                <img
                  src={user?.photoURL || "https://via.placeholder.com/40"}
                  alt={user?.displayName || "User"}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.displayName?.split(" ")[0] ||
                    user?.email?.split("@")[0]}
                </span>
                <span
                  className={`text-xs transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={handleNavigateSettings}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      ⚙️ Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 border-t border-gray-200 dark:border-gray-600"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        ) : null}
      </div>

      {/* Close dropdown when clicking outside */}
      {dropdownOpen && (
        <div className="fixed inset-0" onClick={() => setDropdownOpen(false)} />
      )}
    </header>
  );
}

function AppContent() {
  const { settings } = useStore();

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (settings.darkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-200 min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-csv"
          element={
            <ProtectedRoute>
              <UploadCSV />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
