// src/components/ui/Magnetic.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { useTierContext } from "@/components/providers/TierProvider";
import { Spring, registerMagnetic, unregisterMagnetic, type MagneticInstance } from "@/engine/spring";
import { playCtaThud } from "@/audio/sounds";

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  /** Inner element selector for volumetric 1.4x depth translation (e.g. ".magnetic-inner") */
  innerSelector?: string;
  disabled?: boolean;
}

/**
 * Magnetic CTA Wrapper (§8)
 * Exclusively for primary CTAs (Join, ticket booking).
 * - Underdamped spring physics (k = 150, c = 15, m = 1) on the master tick
 * - Pull active within 1.4 x half-size + 60px
 * - Target offset: 0.3 x (cursor - center), clamped to 16px
 * - Inner element moves 1.4x shell for volumetric parallax
 * - Guardrails: pointer: fine & hover: hover only, disabled on reduced motion & Tier C,
 *   keyboard focus shows standard ring with zero motion, hit area never runs away.
 */
export function Magnetic({
  children,
  className = "",
  innerSelector = ".magnetic-inner",
  disabled = false,
}: MagneticProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { tier } = useTierContext();

  const instanceRef = useRef<MagneticInstance | null>(null);

  useEffect(() => {
    if (disabled || typeof window === "undefined" || tier === "C") return;

    // Check pointer and motion capabilities (§8)
    const isFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isFinePointer || prefersReducedMotion) return;

    const outer = outerRef.current;
    const shell = shellRef.current;
    if (!outer || !shell) return;

    const inner = ((innerSelector ? shell.querySelector(innerSelector) : null) as HTMLElement | null) || innerRef.current;

    const instance: MagneticInstance = {
      shellEl: shell,
      innerEl: inner,
      shellSpringX: new Spring(150, 15, 1),
      shellSpringY: new Spring(150, 15, 1),
      innerSpringX: new Spring(150, 15, 1),
      innerSpringY: new Spring(150, 15, 1),
      active: false,
    };
    instanceRef.current = instance;

    let rect = outer.getBoundingClientRect();
    const updateRect = () => {
      if (outer) rect = outer.getBoundingClientRect();
    };

    window.addEventListener("scroll", updateRect, { passive: true });
    window.addEventListener("resize", updateRect, { passive: true });

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;

      if (!instance.active) {
        rect = outer.getBoundingClientRect();
      }

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      // Active pull radius: 1.4 * half-size + 60 px (§8)
      const halfSize = Math.max(rect.width, rect.height) / 2;
      const pullRadius = 1.4 * halfSize + 60;

      if (dist <= pullRadius) {
        // Target offset = 0.3 * (cursor - center), clamped to 16 px (§8)
        const rawTx = 0.3 * dx;
        const rawTy = 0.3 * dy;
        const tx = Math.max(-16, Math.min(16, rawTx));
        const ty = Math.max(-16, Math.min(16, rawTy));

        instance.shellSpringX.target = tx;
        instance.shellSpringY.target = ty;
        // Inner text moves 1.4x the shell for depth (§8)
        instance.innerSpringX.target = tx * 1.4;
        instance.innerSpringY.target = ty * 1.4;

        if (!instance.active) {
          instance.active = true;
          registerMagnetic(instance);
          playCtaThud("magnetic-cta");
        }
      } else if (instance.active) {
        // Exited pull radius: snap back
        instance.shellSpringX.target = 0;
        instance.shellSpringY.target = 0;
        instance.innerSpringX.target = 0;
        instance.innerSpringY.target = 0;
        instance.active = false;
      }
    };

    const handlePointerLeave = () => {
      if (instance.active) {
        instance.shellSpringX.target = 0;
        instance.shellSpringY.target = 0;
        instance.innerSpringX.target = 0;
        instance.innerSpringY.target = 0;
        instance.active = false;
      }
    };

    // Keyboard focus: zero motion, native focus ring only (§8)
    const handleFocusIn = () => {
      instance.shellSpringX.reset();
      instance.shellSpringY.reset();
      instance.innerSpringX.reset();
      instance.innerSpringY.reset();
      instance.active = false;
      shell.style.transform = "";
      if (inner) inner.style.transform = "";
      unregisterMagnetic(instance);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    outer.addEventListener("pointerleave", handlePointerLeave);
    outer.addEventListener("focusin", handleFocusIn);

    return () => {
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("pointermove", handlePointerMove);
      outer.removeEventListener("pointerleave", handlePointerLeave);
      outer.removeEventListener("focusin", handleFocusIn);
      unregisterMagnetic(instance);
      shell.style.transform = "";
      if (inner) inner.style.transform = "";
    };
  }, [disabled, innerSelector, tier]);

  return (
    <div
      ref={outerRef}
      className={`relative inline-block ${className}`}
    >
      <div
        ref={shellRef}
        style={{ willChange: "transform" }}
        className="w-full h-full"
      >
        <div
          ref={innerRef}
          style={{ willChange: "transform" }}
          className="w-full h-full"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default Magnetic;
