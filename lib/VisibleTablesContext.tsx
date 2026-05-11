"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type VisibleTablesContextType = {
  showRta: boolean;
  showTimeSaved: boolean;
  showRecent: boolean;
  showLeaderboard: boolean;
  showRtaLeaderboard: boolean;
  setShowRta: (value: boolean) => void;
  setShowTimeSaved: (value: boolean) => void;
  setShowRecent: (value: boolean) => void;
  setShowLeaderboard: (value: boolean) => void;
  setShowRtaLeaderboard: (value: boolean) => void;
};

const VisibleTablesContext = createContext<VisibleTablesContextType | undefined>(undefined);

export function VisibleTablesProvider({ children }: { children: ReactNode }) {
  const [showRta, setShowRta] = useState(true);
  const [showTimeSaved, setShowTimeSaved] = useState(true);
  const [showRecent, setShowRecent] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showRtaLeaderboard, setShowRtaLeaderboard] = useState(true);

  return (
    <VisibleTablesContext.Provider value={{ 
      showRta, showTimeSaved, showRecent, showLeaderboard, showRtaLeaderboard,
      setShowRta, setShowTimeSaved, setShowRecent, setShowLeaderboard, setShowRtaLeaderboard
      }}>
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
