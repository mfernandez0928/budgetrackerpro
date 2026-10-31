import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ToastContainer from "./components/Toast";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useStore } from "./store/useStore";
import { AppShell } from "./components/layout/AppShell";
import { THEME_COLORS } from "./config/app";
import { resolveTheme } from "./lib/ui";

const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Wallet = lazy(() => import("./pages/Wallet"));
const WalletAccountDetail = lazy(() => import("./pages/WalletAccountDetail"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Plan = lazy(() => import("./pages/Plan"));
const Insights = lazy(() => import("./pages/Insights"));
const Settings = lazy(() => import("./pages/Settings"));

function AppContent() {
  const { settings } = useStore();

  useEffect(() => {
    const htmlEl = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const theme = resolveTheme(settings.themeMode, media.matches);
      htmlEl.classList.toggle("dark", theme === "dark");
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", theme === "dark" ? THEME_COLORS.dark : THEME_COLORS.light);
    };

    htmlEl.lang = "en";
    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [settings.themeMode]);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-canvas text-muted">
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/wallet/:accountId" element={<WalletAccountDetail />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/planning" element={<Navigate to="/plan" replace />} />
            <Route path="/goals" element={<Navigate to="/plan" replace />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
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
