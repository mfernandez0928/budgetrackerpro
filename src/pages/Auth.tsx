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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.22),_rgba(2,6,23,1)_55%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-200/80">
            Budget smarter
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-white">
            A finance tracker that helps build better habits, not just store receipts.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            Track income, plan category budgets, stay ahead of recurring bills, and grow savings
            goals in a mobile-first app that installs like a real product.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/60 backdrop-blur">
          <img
            src="/icon-512.svg"
            alt={`${APP_BRANDING.name} logo`}
            className="h-16 w-16 rounded-3xl border border-white/10 bg-white/5 p-2"
          />
          <h2 className="mt-6 text-2xl font-semibold text-white">Welcome to {APP_BRANDING.shortName}</h2>
          <p className="mt-2 text-sm text-slate-400">
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
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-teal-400 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Continue with Google"}
          </button>
        </section>
      </div>
    </main>
  );
}
