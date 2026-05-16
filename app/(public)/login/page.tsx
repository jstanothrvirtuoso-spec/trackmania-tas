"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/";

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function signIn() {
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
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
    
    router.push(next);
    router.refresh();
  }

  async function signUp() {
    setLoading(true);
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setErrorMessage(
        "Sign up failed. Possibly email already exists."
      );
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
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
            <div className="text-sm text-red-400">{errorMessage}</div>
          )}

          <button
            disabled={loading}
            onClick={mode === "login" ? signIn : signUp}
            className="w-full rounded-xl cursor-pointer bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
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
    </div>
  );
}