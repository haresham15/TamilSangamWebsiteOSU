"use client";

import React, { createContext, useContext, useState } from "react";

export type CursorVariant = "default" | "explore" | "watch" | "drag" | "play" | "draw";

interface CursorContextType {
  cursorVariant: CursorVariant;
  cursorLabel: string | null;
  setCursor: (variant: CursorVariant, customLabel?: string | null) => void;
  resetCursor: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [cursorVariant, setCursorVariant] = useState<CursorVariant>("default");
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);

  const setCursor = (variant: CursorVariant, customLabel?: string | null) => {
    setCursorVariant(variant);
    setCursorLabel(customLabel ?? null);
  };

  const resetCursor = () => {
    setCursorVariant("default");
    setCursorLabel(null);
  };

  return (
    <CursorContext.Provider value={{ cursorVariant, cursorLabel, setCursor, resetCursor }}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
}
