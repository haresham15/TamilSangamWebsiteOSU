"use client";

import React, { useState } from "react";
import { useReducedMotion } from "framer-motion";

export interface StarBorderProps {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
  color?: string;
  trailColor?: string;
  speed?: string;
  thickness?: number;
  hoverOnly?: boolean;
  hover?: string;
  clickPulse?: boolean;
}

/**
 * StarBorder Primitive (Inspired by reactbits.dev/animations/star-border)
 * Sends a delicate 1px Antique Gold & Terracotta perimeter glint around cards & CTAs.
 */
export function StarBorder({
  as: Component = "div",
  className = "",
  children,
  color = "#D4AF37",
  trailColor = "#C85A32",
  speed = "5s",
  thickness = 1,
  hoverOnly = false,
}: StarBorderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = Component as any;

  const active = !hoverOnly || isHovered;

  return (
    <Tag
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-[inherit] ${className}`}
      style={{ padding: `${thickness}px` }}
    >
      {/* Animated Conic Light Glint */}
      {!shouldReduceMotion && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-[-150%] transition-opacity duration-300 ${
            active ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, ${trailColor} 65%, ${color} 85%, transparent 100%)`,
            animation: `star-border-spin ${speed} linear infinite`,
          }}
        />
      )}

      {/* Inner Content Surface */}
      <div className="relative z-10 w-full h-full rounded-[inherit]">
        {children}
      </div>

      <style jsx>{`
        @keyframes star-border-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Tag>
  );
}
