"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring, useMotionValue, useReducedMotion } from "framer-motion";

export interface MagnetProps {
  children: React.ReactNode;
  className?: string;
  padding?: number;
  magnetStrength?: number;
  maxOffset?: number;
  tilt?: number;
  disabled?: boolean;
}

/**
 * Magnet Primitive (Inspired by reactbits.dev/animations/magnet)
 * Tactile spring-physics attraction that pulls interactive buttons toward the cursor.
 */
export function Magnet({
  children,
  className = "",
  padding = 60,
  magnetStrength = 2.8,
  maxOffset = 12,
  tilt = 3,
  disabled = false,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 220, mass: 0.6 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (disabled || shouldReduceMotion) return;

    const el = ref.current;
    if (!el) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      const activeRadius = Math.max(rect.width, rect.height) / 2 + padding;

      if (dist < activeRadius) {
        setIsHovered(true);
        const offsetX = (e.clientX - centerX) / activeRadius;
        const offsetY = (e.clientY - centerY) / activeRadius;

        const targetX = Math.max(-maxOffset, Math.min(maxOffset, offsetX * maxOffset * (magnetStrength / 2)));
        const targetY = Math.max(-maxOffset, Math.min(maxOffset, offsetY * maxOffset * (magnetStrength / 2)));

        x.set(targetX);
        y.set(targetY);
        rotateX.set(-offsetY * tilt);
        rotateY.set(offsetX * tilt);
      } else if (isHovered) {
        setIsHovered(false);
        x.set(0);
        y.set(0);
        rotateX.set(0);
        rotateY.set(0);
      }
    };

    const handlePointerLeave = () => {
      setIsHovered(false);
      x.set(0);
      y.set(0);
      rotateX.set(0);
      rotateY.set(0);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    el.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [disabled, shouldReduceMotion, padding, magnetStrength, maxOffset, tilt, isHovered, x, y, rotateX, rotateY]);

  if (shouldReduceMotion || disabled) {
    return <div className={`inline-block ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{
        x: smoothX,
        y: smoothY,
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        transformStyle: "preserve-3d",
      }}
      className={`inline-block will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}
