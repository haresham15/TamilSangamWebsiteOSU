"use client";

import React, { useRef, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  goldColor?: string;
  radius?: number;
}

/**
 * SpotlightCard Primitive (Inspired by reactbits.dev/components/spotlight-card)
 * Renders an organic Warm Hearth radial glow that follows cursor coordinates.
 */
export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(200, 90, 50, 0.09)",
  goldColor = "rgba(212, 175, 55, 0.04)",
  radius = 420,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [opacity, setOpacity] = useState(0);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (shouldReduceMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      cardRef.current.style.setProperty("--mouse-x", `${x}px`);
      cardRef.current.style.setProperty("--mouse-y", `${y}px`);
      setOpacity(1);
    },
    [shouldReduceMotion]
  );

  const handlePointerLeave = useCallback(() => {
    setOpacity(0);
  }, []);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Radial Spotlight Surface Glow */}
      {!shouldReduceMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity,
            background: `radial-gradient(${radius}px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), ${spotlightColor}, ${goldColor} 40%, transparent 70%)`,
          }}
        />
      )}

      {children}
    </div>
  );
}
