"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_USER_ID =
  "90fecaa3-af3c-4653-aa1d-6d1a38c33c96";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * =========================
       * CREATE ACCOUNT
       * =========================
       */

      if (mode === "signup") {
        const {
          data,
          error: signupError,
        } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signupError) {
          throw signupError;
        }

        /*
         * Email confirmation is enabled
         */

        if (
          data.user &&
          !data.session
        ) {
          setMessage(
            "Account created successfully. Please check your email to confirm your account."
          );

          setPassword("");
          return;
        }

        /*
         * Email confirmation disabled
         */

        if (data.session) {
          const user = data.user;

          if (
            user?.id === ADMIN_USER_ID
          ) {
            router.replace("/admin");
          } else {
            router.replace("/");
          }

          router.refresh();
          return;
        }

        setMessage(
          "Account created successfully."
        );

        return;
      }

      /*
       * =========================
       * SIGN IN
       * =========================
       */

      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        throw loginError;
      }

      /*
       * Make sure a session exists
       */

      if (!data.session || !data.user) {
        throw new Error(
          "Login failed. No active session was created."
        );
      }

      /*
       * =========================
       * ADMIN REDIRECT
       * =========================
       */

      if (
        data.user.id === ADMIN_USER_ID
      ) {
        router.replace("/admin");
      } else {
        /*
         * =========================
         * NORMAL USER REDIRECT
         * =========================
         */

        router.replace("/");
      }

      router.refresh();

    } catch (err) {
      console.error(
        "AUTH ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed."
      );

    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================
   * SWITCH LOGIN / SIGNUP
   * =========================
   */

  function switchMode() {
    setError("");
    setMessage("");

    setMode(
      mode === "login"
        ? "signup"
        : "login"
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">

      <div className="w-full max-w-md">

        {/* =========================
            BRAND
        ========================= */}

        <div className="mb-8 text-center">

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            LedgerFlow
          </h1>

          <p className="mt-2 text-slate-500">
            AI Accounting Operations
          </p>

        </div>

        {/* =========================
            CARD
        ========================= */}

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">

          <div className="mb-7">

            <h2 className="text-2xl font-semibold text-slate-900">
              {mode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {mode === "login"
                ? "Sign in to your accounting dashboard"
                : "Create an account to start managing your invoices"}
            </p>

          </div>

          {/* =========================
              ERROR
          ========================= */}

          {error && (

            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

            </div>

          )}

          {/* =========================
              SUCCESS
          ========================= */}

          {message && (

            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">

              <p className="text-sm font-medium text-emerald-700">
                {message}
              </p>

            </div>

          )}

          {/* =========================
              FORM
          ========================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              />

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading
                ? mode === "login"
                  ? "Signing In..."
                  : "Creating Account..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}

            </button>

          </form>

          {/* =========================
              DIVIDER
          ========================= */}

          <div className="my-7 flex items-center gap-4">

            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-xs font-medium text-slate-400">
              OR
            </span>

            <div className="h-px flex-1 bg-slate-200" />

          </div>

          {/* =========================
              SWITCH MODE
          ========================= */}

          <button
            type="button"
            onClick={switchMode}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {mode === "login"
              ? "Create New Account"
              : "Already have an account? Sign In"}

          </button>

        </div>

        {/* =========================
            FOOTER
        ========================= */}

        <p className="mt-6 text-center text-xs text-slate-400">
          LedgerFlow • AI Accounting Operations
        </p>

      </div>

    </main>
  );
}