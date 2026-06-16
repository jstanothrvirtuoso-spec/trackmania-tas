
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useAlert } from "@/components/providers/AlertProvider";

const supabase = createClient();

function validatePassword(password: string) {
  
  const minLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  if (!minLength) return "Password must be at least 8 characters";
  if (!hasLower) return "Password must include a lowercase letter";
  if (!hasUpper) return "Password must include an uppercase letter";
  if (!hasNumber) return "Password must include a number";
  if (!hasSymbol) return "Password must include a symbol";

  return null;
}

export default function ResetPasswordPage() {
  
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      await supabase.auth.signOut();
      queryClient.removeQueries({ queryKey: ["profile_public_me"] });
      queryClient.removeQueries({ queryKey: ["profile_private"] });

      showAlert("Password updated successfully. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl backdrop-blur">
        <h1 className="mb-2 text-center text-2xl font-semibold text-slate-100">
          Reset Password
        </h1>

        <p className="mb-6 text-center text-sm text-slate-400">
          Enter your new password below
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="text-sm text-slate-400">
            Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol.
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
          />

          {errorMessage && (
            <div className="text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Update Password"}
          </button>
        </form>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[9999] cursor-wait" />
      )}
    </main>
  );
}
