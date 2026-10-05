// src/components/ui/Shutter.tsx
"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import gsap from "gsap";

export interface ShutterHandle {
  close: () => Promise<void>;
  open: () => Promise<void>;
}

interface ShutterProps {
  onClosed?: () => void;
  onOpened?: () => void;
}

/**
 * Shutter (§6.5, §5.1)
 * Two compositor-only panels using GPU transforms (yPercent).
 * Top panel slides down from -100% to 0%.
 * Bottom panel slides up from 100% to 0%.
 * Zero layout thrashing or paint reflows.
 */
export const Shutter = forwardRef<ShutterHandle, ShutterProps>(function Shutter(
  { onClosed, onOpened },
  ref
) {
  const topPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    close: () => {
      return new Promise<void>((resolve) => {
        const top = topPanelRef.current;
        const bottom = bottomPanelRef.current;
        const seam = seamRef.current;
        if (!top || !bottom) {
          resolve();
          return;
        }

        const tl = gsap.timeline({
          defaults: { ease: "power4.inOut", duration: 0.75 },
          onComplete: () => {
            onClosed?.();
            resolve();
          },
        });

        tl.to(top, { yPercent: 0 }, 0)
          .to(bottom, { yPercent: 0 }, 0)
          .fromTo(
            seam,
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1, duration: 0.4, ease: "power2.out" },
            "-=0.2"
          );
      });
    },

    open: () => {
      return new Promise<void>((resolve) => {
        const top = topPanelRef.current;
        const bottom = bottomPanelRef.current;
        const seam = seamRef.current;
        if (!top || !bottom) {
          resolve();
          return;
        }

        const tl = gsap.timeline({
          defaults: { ease: "power4.inOut", duration: 0.8 },
          onComplete: () => {
            onOpened?.();
            resolve();
          },
        });

        tl.to(seam, { scaleX: 0, opacity: 0, duration: 0.3, ease: "power2.in" }, 0)
          .to(top, { yPercent: -100 }, 0.1)
          .to(bottom, { yPercent: 100 }, 0.1);
      });
    },
  }));

  return (
    <div
      className="fixed inset-0 z-[9990] pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Top Panel: Initial state is translateY(-100%) */}
      <div
        ref={topPanelRef}
        style={{ transform: "translateY(-100%)" }}
        className="absolute top-0 left-0 w-full h-1/2 bg-[#0e0618] border-b border-[var(--sangam-gold)]/30 will-change-transform flex flex-col justify-end items-center"
      >
        {/* Subtle decorative grain or gradient glow on inner edge */}
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[var(--sangam-gold)]/60 to-transparent" />
      </div>

      {/* Center Kolam Seam Line */}
      <div
        ref={seamRef}
        style={{ transform: "translateY(-50%) scaleX(0)" }}
        className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--sangam-gold)] to-transparent opacity-0 will-change-transform z-10"
      />

      {/* Bottom Panel: Initial state is translateY(100%) */}
      <div
        ref={bottomPanelRef}
        style={{ transform: "translateY(100%)" }}
        className="absolute bottom-0 left-0 w-full h-1/2 bg-[#0e0618] border-t border-[var(--sangam-gold)]/30 will-change-transform flex flex-col justify-start items-center"
      >
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[var(--sangam-gold)]/60 to-transparent" />
      </div>
    </div>
  );
});

export default Shutter;
