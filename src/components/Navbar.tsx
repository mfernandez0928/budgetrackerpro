import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "./Toast";

function Navbar() {
  const { user, isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) return <div className="p-4">Loading user...</div>;
  if (error)
    return <div className="p-4 text-red-600">Error: {error.message}</div>;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("✅ Logged out successfully!", "success");
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      window.location.href = "/auth";
    } catch (error: any) {
      showToast(`❌ Logout failed: ${error.message}`, "error");
    }
  };

  const handleNavigateSettings = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/settings");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between relative">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/BTP.png"
            alt="BudgetTracker Pro Logo"
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            BudgetTracker Pro
          </h1>
        </div>

        {isAuthenticated && (
          <>
            {/* Desktop Links */}
            <nav className="hidden md:flex gap-8 items-center">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition"
              >
                Dashboard
              </Link>
              <Link
                to="/transactions"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition"
              >
                Transactions
              </Link>
              <Link
                to="/upload-csv"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition"
              >
                Upload CSV
              </Link>
            </nav>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-600 dark:text-gray-300 focus:outline-none"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="text-2xl">☰</span>
            </button>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <nav className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-4 px-4 py-4 z-50 md:hidden">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/transactions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition"
                >
                  Transactions
                </Link>
                <Link
                  to="/upload-csv"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition"
                >
                  Upload CSV
                </Link>

                {/* Mobile User Section */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                  <div className="flex items-center gap-3 px-2">
                    <img
                      src={user?.photoURL || "https://via.placeholder.com/40"}
                      alt={user?.displayName || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.displayName || user?.email?.split("@")[0]}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/settings");
                    }}
                    className="w-full mt-3 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 rounded"
                  >
                    ⚙️ Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 mt-1 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 rounded"
                  >
                    🚪 Logout
                  </button>
                </div>
              </nav>
            )}

            {/* User Dropdown (desktop) */}
            <div className="relative ml-6 hidden md:block">
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

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
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
          </>
        )}
      </div>

      {/* Close dropdowns when clicking outside */}
      {(dropdownOpen || mobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setDropdownOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}

export default Navbar;
