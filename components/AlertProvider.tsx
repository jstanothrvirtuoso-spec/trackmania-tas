"use client";

import { createContext, useContext, useState } from "react";

type AlertState = {
  message: string | null;
  showAlert: (msg: string) => void;
  hide: () => void;
};

const AlertContext = createContext<AlertState | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showAlert = (msg: string) => setMessage(msg);
  const hide = () => setMessage(null);

  return (
    <AlertContext.Provider value={{ message, showAlert, hide }}>
      {children}

      {message && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={hide}
          />

          {/* modal */}
          <div className="relative z-10 w-[90%] max-w-sm rounded-xl border border-white/10 bg-zinc-900 text-zinc-100 shadow-2xl">
            <div className="p-5">
              <p className="text-sm leading-relaxed text-zinc-200">
                {message}
              </p>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={hide}
                  className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-400 transition cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used inside AlertProvider");
  return ctx;
}
