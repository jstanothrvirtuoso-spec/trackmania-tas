"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type RtaContextType = {
  showRta: boolean;
  setShowRta: (value: boolean) => void;
};

const RtaContext = createContext<RtaContextType | undefined>(undefined);

export function RtaProvider({ children }: { children: ReactNode }) {
  const [showRta, setShowRta] = useState(true);

  return (
    <RtaContext.Provider value={{ showRta, setShowRta }}>
      {children}
    </RtaContext.Provider>
  );
}

export function useRta() {
  const context = useContext(RtaContext);
  if (context === undefined) {
    throw new Error("useRta must be used within RtaProvider");
  }
  return context;
}
