"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type VisibleTablesContextType = {
  showRta: boolean;
  showTimeSaved: boolean;
  setShowRta: (value: boolean) => void;
  setShowTimeSaved: (value: boolean) => void;
};

const VisibleTablesContext = createContext<VisibleTablesContextType | undefined>(undefined);

export function VisibleTablesProvider({ children }: { children: ReactNode }) {
  const [showRta, setShowRta] = useState(true);
  const [showTimeSaved, setShowTimeSaved] = useState(true);

  return (
    <VisibleTablesContext.Provider value={{ showRta, showTimeSaved, setShowRta, setShowTimeSaved }}>
      {children}
    </VisibleTablesContext.Provider>
  );
}

export function useVisibleTables() {
  const context = useContext(VisibleTablesContext);
  if (context === undefined) {
    throw new Error("useVisibleTables must be used within VisibleTablesProvider");
  }
  return context;
}
