// src/components/games/aazham/AazhamPressureGauge.tsx
"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface AazhamPressureGaugeProps {
  timeLeft: number;
  maxTime?: number;
}

export function AazhamPressureGauge({
  timeLeft,
  maxTime = 25,
}: AazhamPressureGaugeProps) {
  const fraction = Math.max(0, Math.min(1, timeLeft / maxTime));

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - fraction * circumference;

  // Status color logic
  const { strokeColor, glowColor, textColor, pulse } = useMemo(() => {
    if (timeLeft <= 4) {
      return {
        strokeColor: "#F87171", // Crimson
        glowColor: "rgba(248, 113, 113, 0.4)",
        textColor: "text-red-400",
        pulse: true,
      };
    }
    if (timeLeft <= 8) {
      return {
        strokeColor: "#FBBF24", // Turmeric amber
        glowColor: "rgba(251, 191, 36, 0.35)",
        textColor: "text-amber-400",
        pulse: false,
      };
    }
    return {
      strokeColor: "#A6F0CF", // Mint bloom
      glowColor: "rgba(166, 240, 207, 0.3)",
      textColor: "text-[#A6F0CF]",
      pulse: false,
    };
  }, [timeLeft]);

  return (
    <div
      className="relative flex items-center justify-center select-none"
      aria-label={`Time remaining: ${timeLeft} seconds`}
    >
      <svg className="w-18 h-18 -rotate-90 transform" viewBox="0 0 68 68">
        {/* Background track circle */}
        <circle
          cx="34"
          cy="34"
          r={radius}
          stroke="rgba(125, 96, 166, 0.25)"
          strokeWidth="4"
          fill="transparent"
        />

        {/* Animated active stroke */}
        <motion.circle
          cx="34"
          cy="34"
          r={radius}
          stroke={strokeColor}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            filter: `drop-shadow(0 0 6px ${glowColor})`,
          }}
          transition={{ duration: 0.25, ease: "linear" }}
        />
      </svg>

      {/* Center Counter */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center font-mono ${textColor} ${
          pulse ? "animate-pulse" : ""
        }`}
      >
        <div className="flex items-center text-xs font-bold leading-none">
          <span>{timeLeft}</span>
          <span className="text-[9px] text-[#F4F0FA]/50 ml-0.5">s</span>
        </div>
        <Clock className="size-2.5 mt-0.5 text-[#F4F0FA]/40" />
      </div>
    </div>
  );
}
