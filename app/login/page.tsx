"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  async function signIn() {
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl backdrop-blur">
        <h1 className="mb-6 text-center text-2xl font-semibold text-slate-100">
          Login
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full rounded-lg border border-slate-700
              bg-slate-800 px-4 py-2.5
              text-sm text-slate-100
              placeholder:text-slate-500
              focus:border-slate-500 focus:outline-none
            "
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full rounded-lg border border-slate-700
              bg-slate-800 px-4 py-2.5
              text-sm text-slate-100
              placeholder:text-slate-500
              focus:border-slate-500 focus:outline-none
            "
          />

          {errorMessage && (
            <div className="text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          <button
            onClick={signIn}
            disabled={loading}
            className="
              w-full rounded-lg
              bg-emerald-500 px-4 py-2.5
              text-sm font-semibold text-slate-950
              transition-all duration-150
              hover:bg-emerald-400
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}