"use client";

import { useEffect, useState } from "react";
import { useVisibleTables } from "@/lib/VisibleTablesContext";

export default function VisitorCounter() {
  const [visits, setVisits] = useState<string>("0");
  const [uniqueVisitors, setUniqueVisitors] = useState<string>("0");
  const [onSite, setOnSite] = useState<string>("0");
  const [mounted, setMounted] = useState(false);
  const { showVisitorCounter } = useVisibleTables();

  useEffect(() => {
    setMounted(true);

    // Get or initialize visitor data from localStorage
    const storedData = localStorage.getItem("visitorData");
    let visitorData = storedData
      ? JSON.parse(storedData)
      : {
          visits: 0,
          uniqueVisitors: [],
          sessionId: null,
          lastActivity: null,
        };

    // Generate or get visitor ID
    let visitorId = localStorage.getItem("visitorId");
    let isNewVisitor = false;
    
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("visitorId", visitorId);
      isNewVisitor = true;
    }

    // Only increment visits if this is a new visitor
    if (!visitorData.uniqueVisitors.includes(visitorId)) {
      visitorData.uniqueVisitors.push(visitorId);
      visitorData.visits += 1;
      isNewVisitor = true;
    }

    // Generate session ID for this visit
    let sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("sessionId", sessionId);
    }

    // Update last activity timestamp
    visitorData.lastActivity = Date.now();
    localStorage.setItem("visitorData", JSON.stringify(visitorData));

    // Get active sessions (on-site count)
    let activeSessions = JSON.parse(sessionStorage.getItem("activeSessions") || "[]");
    if (!activeSessions.includes(sessionId)) {
      activeSessions.push(sessionId);
      sessionStorage.setItem("activeSessions", JSON.stringify(activeSessions));
    }

    // Format numbers with leading zeros
    setVisits(String(visitorData.visits).padStart(6, "0"));
    setUniqueVisitors(String(visitorData.uniqueVisitors.length).padStart(6, "0"));
    setOnSite(String(activeSessions.length).padStart(6, "0"));

    // Cleanup inactive sessions every 30 seconds
    const cleanupInterval = setInterval(() => {
      let currentSessions = JSON.parse(sessionStorage.getItem("activeSessions") || "[]");
      // Keep sessions active for 5 minutes of inactivity
      currentSessions = currentSessions.filter((id: string) => {
        const isActive = sessionStorage.getItem(`session_${id}_active`) !== null;
        return isActive;
      });
      sessionStorage.setItem("activeSessions", JSON.stringify(currentSessions));
      setOnSite(String(currentSessions.length).padStart(6, "0"));
    }, 30000);

    // Update activity timestamp every 30 seconds
    const activityInterval = setInterval(() => {
      sessionStorage.setItem(`session_${sessionId}_active`, Date.now().toString());
    }, 30000);

    // Initial activity marker
    sessionStorage.setItem(`session_${sessionId}_active`, Date.now().toString());

    return () => {
      clearInterval(cleanupInterval);
      clearInterval(activityInterval);
    };
  }, []);

  if (!mounted || !showVisitorCounter) return null;

  return (
    <div className="fixed bottom-6 right-6 rounded border border-green-500 bg-black/80 p-4 font-mono text-xs text-green-400 backdrop-blur-md">
      <div className="space-y-1">
        <div>Visits: <span className="float-right">{visits}</span></div>
        <div>Unique Visitors: <span className="float-right">{uniqueVisitors}</span></div>
        <div>On-site: <span className="float-right">{onSite}</span></div>
      </div>
    </div>
  );
}