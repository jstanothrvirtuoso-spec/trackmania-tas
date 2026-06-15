"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAlert } from "@/components/AlertProvider";

const supabase = createClient();

export default function LoginPage() {

  const { showAlert } = useAlert();
  const router = useRouter();
  const queryClient = useQueryClient();

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

    try {
        
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          await supabase.auth.resend({ type: "signup", email });
          setErrorMessage("Confirmation email resent. Check your inbox.");
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["profile_public_me"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["profile_private"],
      });

      router.push("/");
      router.refresh();

    } finally {
      setLoading(false);
    }
  }

  async function signUp() {
    setLoading(true);
    setErrorMessage("");

    try {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setErrorMessage(passwordError);
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      showAlert("Account opened. You will receive a confirmation email from Supabase. Use this to verify your account before logging in. Make sure to check your junk mail.")
      setPassword("");
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  }

  async function sendResetPassword() {
    setLoading(true);
    setErrorMessage("");

    try {
      if (!email) {
        setErrorMessage("Enter your email to reset your password");
        return;
      }

      const redirectTo = `${window.location.origin}/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectTo })

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      showAlert("If an account exists for that email, a password reset link has been sent.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl backdrop-blur">
        <h1 className="mb-2 text-center text-2xl font-semibold text-slate-100">
          {mode === "login" ? "Login" : "Create account"}
        </h1>

        <p className="mb-6 text-center text-sm text-slate-400">
          {mode === "login" ? "Please enter your email and password" : "Create your TrackMania TAS account"}
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
            <>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
              />

              <div className="text-sm text-slate-400">
                Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol.
              </div>
            </>
          )}

          {errorMessage && (
            <div className={`text-sm ${errorMessage.startsWith("Account opened") ? "text-green-400" : "text-red-400" }`}>{errorMessage}</div>
          )}

          <button
            disabled={loading}
            onClick={mode === "login" ? signIn : signUp}
            className="w-full cursor-pointer rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>

          <button
            onClick={() => {
              setErrorMessage("");
              setMode(mode === "login" ? "signup" : "login");
            }}
            className="w-full cursor-pointer text-sm text-slate-400 hover:text-white"
          >
            {mode === "login" ? "Create new account" : "Already have an account?"}
          </button>

          {mode === "login" && (
            <button
              onClick={sendResetPassword}
              disabled={loading}
              className="w-full cursor-pointer text-sm text-red-400 hover:text-red-300"
            >
              Forgot password?
            </button>
          )}

        </div>
      </div>
      
      {loading && (
        <div className="fixed inset-0 z-[9999] cursor-wait" />
      )}
    </main>
  );
}
