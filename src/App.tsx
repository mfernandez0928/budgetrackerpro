import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import UploadCSV from "./pages/UploadCSV";
import ToastContainer from "./components/Toast";
import { useStore } from "./store/useStore";

function Navbar() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-40 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            BudgetTracker Pro
          </h1>
        </div>
        <nav className="hidden md:flex gap-8">
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
        </nav>
      </div>
    </header>
  );
}

function App() {
  const { settings } = useStore();

  // Apply dark mode to document when settings change
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (settings.darkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  return (
    <Router>
      <div className="bg-white dark:bg-gray-900 transition-colors duration-200 min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/upload-csv" element={<UploadCSV />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
