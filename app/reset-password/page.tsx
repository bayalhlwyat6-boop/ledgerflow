"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /*
   * =========================
   * CHECK RESET SESSION
   * =========================
   */

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const {
          data,
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "RESET SESSION ERROR:",
            sessionError
          );

          if (mounted) {
            setError(
              "This password reset link is invalid or has expired."
            );

            setLoading(false);
          }

          return;
        }

        /*
         * Supabase should create a recovery
         * session after the email link is opened.
         */

        if (!data.session) {
          if (mounted) {
            setError(
              "This password reset link is invalid or has expired. Please request a new one."
            );

            setLoading(false);
          }

          return;
        }

        if (mounted) {
          setLoading(false);
        }

      } catch (err) {
        console.error(
          "RESET CHECK ERROR:",
          err
        );

        if (mounted) {
          setError(
            "Unable to verify the reset link."
          );

          setLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * =========================
   * UPDATE PASSWORD
   * =========================
   */

  async function updatePassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setSaving(true);

    try {
      const {
        error: updateError,
      } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setMessage(
        "Your password has been updated successfully."
      );

      setPassword("");
      setConfirmPassword("");

      /*
       * Give the user a moment to see
       * the success message, then return
       * to login.
       */

      setTimeout(async () => {
        await supabase.auth.signOut();

        router.replace("/login");
        router.refresh();
      }, 1500);

    } catch (err) {
      console.error(
        "PASSWORD UPDATE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not update password."
      );

    } finally {
      setSaving(false);
    }
  }

  /*
   * =========================
   * LOADING
   * =========================
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">

        <div className="rounded-xl bg-white px-8 py-6 shadow-sm ring-1 ring-slate-200">

          <p className="text-sm font-medium text-slate-600">
            Verifying password reset link...
          </p>

        </div>

      </main>
    );
  }

  /*
   * =========================
   * PAGE
   * =========================
   */

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">

      <div className="w-full max-w-md">

        {/* BRAND */}

        <div className="mb-8 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-xl font-bold text-white">
            L
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            LedgerFlow
          </h1>

          <p className="mt-2 text-slate-500">
            AI Accounting Operations
          </p>

        </div>

        {/* CARD */}

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">

          <h2 className="text-2xl font-semibold text-slate-900">
            Create new password
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Enter your new password below.
          </p>

          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.replace("/login")
                }
                className="mt-3 text-sm font-medium text-red-800 underline"
              >
                Request a new reset link
              </button>

            </div>
          )}

          {/* SUCCESS */}

          {message && (
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">

              <p className="text-sm font-medium text-emerald-700">
                {message}
              </p>

            </div>
          )}

          {!error && !message && (
            <form
              onSubmit={updatePassword}
              className="mt-7 space-y-5"
            >

              {/* NEW PASSWORD */}

              <div>

                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  New Password
                </label>

                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="••••••••"
                  minLength={6}
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />

              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirm New Password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="••••••••"
                  minLength={6}
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />

              </div>

              {/* BUTTON */}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Updating Password..."
                  : "Update Password"}
              </button>

            </form>
          )}

        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          LedgerFlow • AI Accounting Operations
        </p>

      </div>

    </main>
  );
}