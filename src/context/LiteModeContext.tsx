"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LiteModeContextType {
  isLiteMode: boolean;
  toggleLiteMode: () => void;
  setLiteMode: (enabled: boolean) => void;
}

const LiteModeContext = createContext<LiteModeContextType | undefined>(undefined);

export function LiteModeProvider({ children }: { children: React.ReactNode }) {
  const [isLiteMode, setIsLiteModeState] = useState<boolean>(false);

  useEffect(() => {
    queueMicrotask(() => {
      // Check saved preference
      const saved = localStorage.getItem("sangam_lite_mode");
      if (saved !== null) {
        setIsLiteModeState(saved === "true");
        return;
      }

      // Auto-detect reduced motion or low connection
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
      const saveData = connection?.saveData;

      if (prefersReducedMotion || saveData) {
        setIsLiteModeState(true);
      }
    });
  }, []);

  const setLiteMode = (enabled: boolean) => {
    setIsLiteModeState(enabled);
    localStorage.setItem("sangam_lite_mode", String(enabled));
  };

  const toggleLiteMode = () => {
    setLiteMode(!isLiteMode);
  };

  return (
    <LiteModeContext.Provider value={{ isLiteMode, toggleLiteMode, setLiteMode }}>
      {children}
    </LiteModeContext.Provider>
  );
}

export function useLiteMode() {
  const context = useContext(LiteModeContext);
  if (!context) {
    throw new Error("useLiteMode must be used within a LiteModeProvider");
  }
  return context;
}
