"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const next = searchParams.get("next") || "/";

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  async function signIn() {
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);

      if (error.message.toLowerCase().includes("email not confirmed")) {
        await supabase.auth.resend({
          type: "signup",
          email,
        });

        setErrorMessage("Confirmation email resent. Check your inbox.");
        return;
      }

      setErrorMessage(error.message);
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["profile"],
    });

    setLoading(false);

    router.push(next);
    router.refresh();
  }

  async function signUp() {
    setLoading(true);
    setErrorMessage("");

    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setErrorMessage(
      "Account opened. Please check your email now to validate your account before logging in."
    );
    alert("Account opened. Please check your email now to validate your account before logging in. Make sure to check your junk mail.")
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl backdrop-blur">
        <h1 className="mb-2 text-center text-2xl font-semibold text-slate-100">
          {mode === "login" ? "Login" : "Create account"}
        </h1>

        <p className="mb-6 text-center text-sm text-slate-400">
          {mode === "login"
            ? "Please enter your email and password"
            : "Create your TrackMania TAS account"}
        </p>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
          />

          {mode === "signup" && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
            />
          )}

          {errorMessage && (
            <div className={`text-sm ${errorMessage.startsWith("Account opened") ? "text-green-400" : "text-red-400" }`}>{errorMessage}</div>
          )}

          <button
            disabled={loading}
            onClick={mode === "login" ? signIn : signUp}
            className="w-full cursor-pointer rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Create account"}
          </button>

          <button
            onClick={() => {
              setErrorMessage("");
              setMode(mode === "login" ? "signup" : "login");
            }}
            className="w-full cursor-pointer text-sm text-slate-400 hover:text-white"
          >
            {mode === "login"
              ? "Create new account"
              : "Already have an account?"}
          </button>
        </div>
      </div>
    </main>
  );
}