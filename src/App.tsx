import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ToastContainer from "./components/Toast";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useStore } from "./store/useStore";
import { AppShell } from "./components/layout/AppShell";
import { APP_BRANDING } from "./config/app";

const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Planning = lazy(() => import("./pages/Planning"));
const Goals = lazy(() => import("./pages/Goals"));
const Insights = lazy(() => import("./pages/Insights"));
const Settings = lazy(() => import("./pages/Settings"));

function AppContent() {
  const { settings } = useStore();

  useEffect(() => {
    const htmlEl = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark =
      settings.themeMode === "dark" ||
      (settings.themeMode === "system" && prefersDark);

    htmlEl.lang = "en";
    if (shouldUseDark) {
      htmlEl.classList.add("dark");
    } else {
      htmlEl.classList.remove("dark");
    }
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", APP_BRANDING.themeColor);
    }
  }, [settings.themeMode]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
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
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/goals" element={<Goals />} />
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
