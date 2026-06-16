"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ConfirmContextValue = {
  confirm: (message: string) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState<{
    message: string;
    resolve: (result: boolean) => void;
  } | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  const confirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setPrompt({ message, resolve });
    });
  }, []);

  const close = useCallback(
    (result: boolean) => {
      if (!prompt) return;
      prompt.resolve(result);
      setPrompt(null);
    },
    [prompt],
  );

  useEffect(() => {
    if (!prompt) return;
    confirmButtonRef.current?.focus();
  }, [prompt]);

  useEffect(() => {
    if (!prompt) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(false);
      }
      if (event.key === "Enter") {
        event.preventDefault();
        close(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prompt, close]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {prompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-4 border-red-400 bg-slate-950/95 text-white shadow-[0_0_60px_rgba(255,0,0,0.35)]">
            <div className="border-b-4 border-red-500 bg-gradient-to-r from-red-900 via-black to-red-900 px-6 py-4 text-center">
              <p className="text-xl font-extrabold uppercase tracking-[0.4em] text-red-300 drop-shadow-lg">Dangerous action ahead</p>
              <p className="mt-2 text-sm uppercase tracking-[0.2em] text-amber-300">ADMIN WARNING — PROCEED AT YOUR OWN RISK</p>
            </div>
            <div className="space-y-6 px-6 py-6">
              <div className="rounded-3xl border border-red-500/40 bg-red-950/70 p-4 text-sm leading-7 text-slate-100">
                <p className="text-2xl font-black uppercase tracking-[0.2em] text-red-300 whitespace-nowrap">☠️ DO NOT TAKE THIS LIGHTLY ☠️</p>
                <p className="mt-4 whitespace-pre-line">{prompt.message}</p>
                <p className="mt-4 text-sm text-rose-200/80">This is an admin-only override method. If you are not catastrophically certain, click ABORT.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                <button
                  onClick={() => close(false)}
                  className="rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-200 cursor-pointer transition hover:bg-slate-700"
                >
                  Abort mission
                </button>
                <button
                  ref={confirmButtonRef}
                  onClick={() => close(true)}
                  className="
                    rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 px-4 py-3 
                    text-sm font-bold uppercase tracking-[0.12em] text-slate-950 cursor-pointer 
                    shadow-[0_0_30px_rgba(255,165,0,0.45)] transition hover:brightness-130"
                >
                  Yes, destroy it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider");
  return ctx.confirm;
}
