"use client";

import { useEffect } from "react";
import { getActiveLenis, useLenis } from "@/components/providers/MotionProvider";

/**
 * useModalScrollLock
 * Unified Lenis + DOM scroll locking hook for all modals, drawers, and lightboxes.
 * Ensures:
 * 1. Lenis smooth scroll engine is paused (`lenis.stop()`), eliminating background wheel hitching.
 * 2. `document.documentElement` and `document.body` overflow are locked to `hidden`.
 * 3. Escape key closes the modal via optional `onEscape` callback.
 * 4. Cleanup unconditionally restores Lenis (`lenis.start()`) and original overflow.
 */
export function useModalScrollLock(isOpen: boolean, onEscape?: () => void) {
  const contextLenis = useLenis();

  useEffect(() => {
    if (!isOpen) return;

    const lenis =
      contextLenis ||
      getActiveLenis() ||
      (typeof window !== "undefined" ? window.__lenis : null);

    lenis?.stop();

    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      lenis?.start();
    };
  }, [isOpen, contextLenis, onEscape]);
}
