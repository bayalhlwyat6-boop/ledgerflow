"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [mode, setMode] =
    useState<"login" | "signup">("login");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const SITE_URL =
    "https://ledgerflow-opal.vercel.app";

  /*
   * =========================
   * AUTH STATE
   * =========================
   */

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(
          "AUTH EVENT:",
          event
        );

        console.log(
          "AUTH SESSION:",
          session
        );

        if (
          session &&
          (
            event === "SIGNED_IN" ||
            event === "INITIAL_SESSION"
          )
        ) {
          router.replace("/");
          router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  /*
   * =========================
   * SUBMIT
   * =========================
   */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(
        "Please enter your email."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
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
       * SIGN UP
       * =========================
       */

      if (mode === "signup") {
        const {
          data,
          error: signupError,
        } =
          await supabase.auth.signUp({
            email: cleanEmail,
            password,

            options: {
              emailRedirectTo:
                `${SITE_URL}/login`,
            },
          });

        if (signupError) {
          throw signupError;
        }

        console.log(
          "SIGNUP USER:",
          data.user
        );

        console.log(
          "SIGNUP SESSION:",
          data.session
        );

        /*
         * Confirm Email = ON
         *
         * Supabase returns:
         * user = exists
         * session = null
         */

        if (
          data.user &&
          !data.session
        ) {
          setMessage(
            "Account created successfully. Please check your email and click the confirmation link before signing in."
          );

          setPassword("");

          return;
        }

        /*
         * Confirm Email = OFF
         */

        if (data.session) {
          router.replace("/");
          router.refresh();

          return;
        }

        setMessage(
          "Account created. Please check your email."
        );

        return;
      }

      /*
       * =========================
       * LOGIN
       * =========================
       */

      const {
        data,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email: cleanEmail,
            password,
          }
        );

      if (loginError) {
        console.error(
          "LOGIN ERROR:",
          loginError
        );

        throw loginError;
      }

      console.log(
        "LOGIN USER:",
        data.user
      );

      console.log(
        "LOGIN SESSION:",
        data.session
      );

      if (!data.session) {
        throw new Error(
          "Login succeeded but no session was created."
        );
      }

      /*
       * Login successful
       */

      router.replace("/");
      router.refresh();

    } catch (err) {
      console.error(
        "AUTH ERROR:",
        err
      );

      if (
        err instanceof Error
      ) {
        /*
         * Helpful message for
         * unconfirmed email
         */

        if (
          err.message
            .toLowerCase()
            .includes(
              "email not confirmed"
            )
        ) {
          setError(
            "Your email has not been confirmed yet. Please open the confirmation email and click the confirmation link."
          );

          return;
        }

        setError(
          err.message
        );

        return;
      }

      setError(
        "Authentication failed."
      );

    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================
   * SWITCH MODE
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

  /*
   * =========================
   * UI
   * =========================
   */

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">

      <div className="w-full max-w-md">

        {/* BRAND */}

        <div className="mb-8 text-center">

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            LedgerFlow
          </h1>

          <p className="mt-2 text-slate-500">
            AI Accounting Operations
          </p>

        </div>

        {/* CARD */}

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

          {/* ERROR */}

          {error && (

            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

            </div>

          )}

          {/* SUCCESS */}

          {message && (

            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">

              <p className="text-sm font-medium text-emerald-700">
                {message}
              </p>

            </div>

          )}

          {/* FORM */}

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
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="you@example.com"
                disabled={loading}
                required
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
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="••••••••"
                disabled={loading}
                required
                minLength={6}
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

          {/* DIVIDER */}

          <div className="my-7 flex items-center gap-4">

            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-xs font-medium text-slate-400">
              OR
            </span>

            <div className="h-px flex-1 bg-slate-200" />

          </div>

          {/* SWITCH */}

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

        {/* FOOTER */}

        <p className="mt-6 text-center text-xs text-slate-400">
          LedgerFlow • AI Accounting Operations
        </p>

      </div>

    </main>
  );
}