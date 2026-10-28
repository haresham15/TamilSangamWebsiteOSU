// src/components/ui/Shutter.tsx
"use client";

import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { KolamLoader } from "./KolamLoader";
import { playCinematicWhoosh } from "@/audio/sounds";
import { useTier } from "@/components/providers/TierProvider";
import { useLiteMode } from "@/context/LiteModeContext";

export interface ShutterHandle {
  close: (targetRoute?: string) => Promise<void>;
  open: () => Promise<void>;
}

export type KolamTransitionHandle = ShutterHandle;

interface ShutterProps {
  onClosed?: () => void;
  onOpened?: () => void;
}

/**
 * KolamTransition / Shutter
 * Replaces the static two-panel shutter with an authentic Tamil Kolam Iris Aperture.
 * 
 * Flow:
 * 1. Navigation starts: Kolam veil covers the screen with deep hearth espresso.
 * 2. Center displays unique 25-pulli Sikku Kolam drawing-on with cultural chapter title.
 * 3. Hero finishes loading: The screen EXPANDS OPEN via a circular roundel iris
 *    (radial aperture mask 0% -> 150%) revealing the active 3D hero animation underneath.
 */
export const Shutter = forwardRef<ShutterHandle, ShutterProps>(function Shutter(
  { onClosed, onOpened },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRingRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [targetRoute, setTargetRoute] = useState<string | undefined>(undefined);
  const [maskRadius, setMaskRadius] = useState(0);
  const [isExpanding, setIsExpanding] = useState(false);

  const tier = useTier();
  const { isLiteMode } = useLiteMode();

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mq.matches);
        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
      } catch {}
    }
  }, []);

  const isReduced = prefersReducedMotion || isLiteMode || tier === "C";

  useImperativeHandle(ref, () => ({
    close: (nextRoute?: string) => {
      return new Promise<void>((resolve) => {
        setTargetRoute(nextRoute);
        setIsActive(true);
        setIsExpanding(false);
        setMaskRadius(0);

        const el = containerRef.current;
        if (!el) {
          onClosed?.();
          resolve();
          return;
        }

        if (isReduced) {
          el.style.opacity = "1";
          onClosed?.();
          resolve();
          return;
        }

        // Fast, smooth veil fade-in
        gsap.killTweensOf(el);
        gsap.fromTo(
          el,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.16,
            ease: "power2.out",
            onComplete: () => {
              onClosed?.();
              resolve();
            },
          }
        );
      });
    },

    open: () => {
      return new Promise<void>((resolve) => {
        const el = containerRef.current;
        if (!el) {
          setIsActive(false);
          onOpened?.();
          resolve();
        }
        if (isReduced) {
          gsap.to(el, {
            opacity: 0,
            duration: 0.15,
            ease: "power2.out",
            onComplete: () => {
              setIsActive(false);
              onOpened?.();
              resolve();
            },
          });
          return;
        }

        setIsExpanding(true);

        // Sound cue: subtle cinematic whoosh as the portal expands
        try {
          playCinematicWhoosh(0.2);
        } catch {}

        const ring = portalRingRef.current;
        const state = { radius: 0 };

        // Fast circular iris aperture mask expansion
        const tl = gsap.timeline({
          onUpdate: () => {
            setMaskRadius(state.radius);
            if (ring) {
              const ringSize = state.radius * 2.8;
              ring.style.width = `${ringSize}vmax`;
              ring.style.height = `${ringSize}vmax`;
              ring.style.opacity = state.radius < 125 ? String(Math.max(0, 1 - state.radius / 135)) : "0";
            }
          },
          onComplete: () => {
            setIsActive(false);
            setIsExpanding(false);
            setMaskRadius(0);
            if (el) {
              el.style.opacity = "0";
              el.style.maskImage = "none";
              el.style.webkitMaskImage = "none";
            }
            onOpened?.();
            resolve();
          },
        });

        // Fast aperture expansion (0.32s crisp opening)
        tl.to(state, {
          radius: 145,
          duration: 0.32,
          ease: "power2.out",
        });
      });
    },
  }));

  if (!isActive) {
    return null;
  }

  // Radial mask calculation:
  // When maskRadius == 0: no mask (100% covered)
  // When maskRadius > 0: transparent circle expands from center (50% 50%)
  const maskStyle =
    maskRadius > 0
      ? {
          maskImage: `radial-gradient(circle at center, transparent ${maskRadius}%, black ${maskRadius + 2}%)`,
          WebkitMaskImage: `radial-gradient(circle at center, transparent ${maskRadius}%, black ${maskRadius + 2}%)`,
        }
      : {};

  return (
    <div
      ref={containerRef}
      role="status"
      aria-live="polite"
      aria-label="Loading page hero animation"
      className="fixed inset-0 z-[9990] pointer-events-none select-none overflow-hidden bg-[#140F0D] flex items-center justify-center will-change-transform"
      style={maskStyle}
    >
      {/* Background Ambient Warm Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(42,26,18,0.45) 0%, rgba(20,15,13,0.92) 75%, #140F0D 100%)",
        }}
      />

      {/* Expanding Iris Golden Edge Ring */}
      <div
        ref={portalRingRef}
        className="absolute rounded-full pointer-events-none border border-[#D4AF37]/70 shadow-[0_0_35px_rgba(212,175,55,0.45),inset_0_0_20px_rgba(85,204,162,0.3)] will-change-transform"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "0px",
          height: "0px",
          opacity: 0,
        }}
      />

      {/* Center Kolam Loader Motif */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <KolamLoader
          route={targetRoute}
          size={230}
          isExpanding={isExpanding}
        />
      </div>
    </div>
  );
});

export const KolamTransition = Shutter;
export default Shutter;
