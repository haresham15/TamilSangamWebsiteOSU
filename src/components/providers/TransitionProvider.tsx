// src/components/providers/TransitionProvider.tsx
"use client";

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Shutter, ShutterHandle } from "@/components/ui/Shutter";
import { useTierContext } from "@/components/providers/TierProvider";
import { waitForSceneReady } from "@/engine/bootStore";

interface TransitionContextValue {
  isTransitioning: boolean;
  navigate: (href: string, targetSceneId?: string) => Promise<void>;
}

const TransitionContext = createContext<TransitionContextValue>({
  isTransitioning: false,
  navigate: async () => {},
});

export const usePageTransition = () => useContext(TransitionContext);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { tier } = useTierContext();
  const shutterRef = useRef<ShutterHandle>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const navigate = useCallback(
    async (href: string, targetSceneId?: string) => {
      // Do nothing if navigating to the same URL
      if (href === window.location.pathname) {
        return;
      }

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Tier C or reduced motion: instant swap with polite announcement (§5.4)
      if (tier === "C" || prefersReducedMotion) {
        setAnnouncement(`Navigating to ${href}`);
        router.push(href);
        return;
      }

      setIsTransitioning(true);

      try {
        // 1) Shutter closes (§5.1)
        if (shutterRef.current) {
          await shutterRef.current.close();
        }

        // 2) Trigger Next.js route change
        router.push(href);

        // 3) Wait for target scene ready with a 1.2s safety cap (§5.1)
        if (targetSceneId) {
          await waitForSceneReady(targetSceneId, 1200);
        } else {
          // Brief pause for DOM mount
          await new Promise((r) => setTimeout(r, 150));
        }

        // 4) Shutter opens (§5.1)
        if (shutterRef.current) {
          await shutterRef.current.open();
        }
      } catch (err) {
        console.warn("[TransitionProvider] Navigation interrupted:", err);
        if (shutterRef.current) {
          await shutterRef.current.open();
        }
      } finally {
        setIsTransitioning(false);

        // 5) Accessibility: Shift focus to <main> and announce (§5.3)
        const main = document.querySelector("main");
        if (main) {
          main.setAttribute("tabindex", "-1");
          main.focus({ preventScroll: true });
        }
        setAnnouncement(`Navigated to ${document.title || href}`);
      }
    },
    [router, tier]
  );

  // Global link interception for internal links (§5.1, §5.2)
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Ignore right clicks or modifier keys (Cmd, Ctrl, Shift, Alt)
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = e.target instanceof Element ? e.target.closest("a") : null;
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, anchors, mailto, tel, or links marked with download/target
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.hasAttribute("download") ||
        (target.getAttribute("target") && target.getAttribute("target") !== "_self")
      ) {
        return;
      }

      // Internal same-origin route navigation
      e.preventDefault();
      navigate(href);
    };

    // Warm next route on pointerenter or focus (§5.2)
    const handleDocumentHover = (e: MouseEvent | FocusEvent) => {
      const target = e.target instanceof Element ? e.target.closest("a") : null;
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("/") && !href.startsWith("//")) {
        router.prefetch(href);
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    document.addEventListener("pointerenter", handleDocumentHover, { capture: true });
    document.addEventListener("focusin", handleDocumentHover, { capture: true });

    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      document.removeEventListener("pointerenter", handleDocumentHover, { capture: true });
      document.removeEventListener("focusin", handleDocumentHover, { capture: true });
    };
  }, [navigate, router]);

  return (
    <TransitionContext.Provider value={{ isTransitioning, navigate }}>
      {/* Polite Screen Reader Live Region (§5.3) */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>

      {/* Persistent Shutter Overlay */}
      <Shutter ref={shutterRef} />

      {children}
    </TransitionContext.Provider>
  );
}

export default TransitionProvider;
