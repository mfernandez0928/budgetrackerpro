import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import UploadCSV from "./pages/UploadCSV";
import Auth from "./pages/Auth";
import ToastContainer from "./components/Toast";
import Footer from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useStore } from "./store/useStore";
import Navbar from "./components/Navbar";

function AppContent() {
  const { settings } = useStore();

  useEffect(() => {
    const htmlEl = document.documentElement;
    if (settings.darkMode) {
      htmlEl.classList.add("dark");
    } else {
      htmlEl.classList.remove("dark");
    }
  }, [settings.darkMode]);

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-200 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
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
      </main>
      <Footer />
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
