import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import UploadCSV from "./pages/UploadCSV";
import Auth from "./pages/Auth";
import ToastContainer from "./components/Toast";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useStore } from "./store/useStore";

function Navbar() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-md sticky top-0 z-40 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            BudgetTracker Pro
          </h1>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
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
          <a
            href="/settings"
            className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition"
          >
            Settings
          </a>
          {user && (
            <div className="flex items-center gap-2 pl-4 border-l border-gray-300 dark:border-gray-700">
              <img
                src={user.photoURL || "https://via.placeholder.com/40"}
                alt={user.displayName || "User"}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user.displayName || user.email?.split("@")[0]}
              </span>
            </div>
          )}
        </nav>
      </div>
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
