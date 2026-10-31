import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { APP_BRANDING } from "../config/app";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../components/Toast";

export default function Auth() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="pt-safe min-h-screen bg-canvas bg-[radial-gradient(circle_at_top_left,_rgb(var(--brand)/0.18),_transparent_55%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
            Budget smarter
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-ink md:text-5xl">
            A finance tracker that helps build better habits, not just store receipts.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted">
            Track income, plan category budgets, stay ahead of recurring bills, and grow savings
            goals in a mobile-first app that installs like a real product.
          </p>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-6">
          <img
            src="/icon-512.svg"
            alt={`${APP_BRANDING.name} logo`}
            className="h-16 w-16 rounded-3xl border border-line bg-raised p-2"
          />
          <h2 className="mt-6 text-2xl font-bold text-ink">Welcome to {APP_BRANDING.shortName}</h2>
          <p className="mt-2 text-sm text-muted">
            Sign in to continue with your finance workspace and local budgeting data.
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              try {
                setLoading(true);
                await signInWithPopup(auth, new GoogleAuthProvider());
                showToast("Signed in successfully.", "success");
                navigate("/dashboard", { replace: true });
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : "Google sign-in failed.";
                showToast(message, "error");
              } finally {
                setLoading(false);
              }
            }}
            className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-on-brand transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Continue with Google"}
          </button>
        </section>
      </div>
    </main>
  );
}
