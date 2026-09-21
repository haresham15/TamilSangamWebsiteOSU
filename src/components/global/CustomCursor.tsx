"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { useCursor } from "@/context/CursorContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { useLocale } from "@/context/LocaleContext";

function subscribeFinePointer(callback: () => void) {
  const mediaQuery = window.matchMedia("(pointer: fine) and (hover: hover)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia("(pointer: fine) and (hover: hover)").matches;
}

function getFinePointerServerSnapshot() {
  return false;
}

export const CustomCursor: React.FC = () => {
  const { cursorVariant, cursorLabel } = useCursor();
  const { isLiteMode } = useLiteMode();
  const { locale } = useLocale();

  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const isPointerFine = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  if (!isPointerFine || isLiteMode || !isVisible) {
    return null;
  }

  const getLabel = (): string | null => {
    if (cursorLabel) return cursorLabel;
    switch (cursorVariant) {
      case "explore":
        return locale === "ta" ? "ஆராயுங்கள்" : "Explore";
      case "watch":
        return locale === "ta" ? "பாருங்கள்" : "Watch";
      case "play":
        return locale === "ta" ? "இயக்கு" : "Play";
      case "drag":
        return locale === "ta" ? "நகர்த்துக" : "Drag";
      case "draw":
        return locale === "ta" ? "வரைக" : "Draw";
      default:
        return null;
    }
  };

  const label = getLabel();
  const isExpanded = cursorVariant !== "default" || !!label;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[9999] transition-transform duration-75 ease-out"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
    >
      <div
        className={`-translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-transform duration-150 ease-out ${
          isExpanded
            ? "px-3 py-1.5 bg-[var(--accent-tint)] text-black font-semibold text-[11px] shadow-lg shadow-[var(--accent-glow)] scale-100 backdrop-blur-sm"
            : "w-4 h-4 bg-white/40 border border-white/60 backdrop-blur-[2px] scale-100"
        }`}
      >
        {label && <span className="tracking-wider uppercase whitespace-nowrap">{label}</span>}
      </div>
    </div>
  );
};
