// src/components/games/aazham/AtmosphericOverlay.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AtmosphericOverlayProps {
  depthProgress: number; // 0.0 to 1.0
  urgency: number; // 0.0 to 1.0
  triggerShockwave?: boolean; // triggers on 85/100pt hits
}

export function AtmosphericOverlay({
  depthProgress,
  urgency,
  triggerShockwave = false,
}: AtmosphericOverlayProps) {
  // Vignette darkens as depth increases
  const vignetteOpacity = 0.25 + depthProgress * 0.43; // 0.25 at 0m to 0.68 at 7000m

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-40 overflow-hidden"
    >
      {/* 1. CINEMATIC 3.5% FILM GRAIN OVERLAY (Kills gradient banding) */}
      <div
        className="absolute inset-0 w-full h-full opacity-[0.038] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* 2. DYNAMIC BATHYMETRIC PRESSURE VIGNETTE */}
      <div
        className="absolute inset-0 w-full h-full transition-opacity duration-700"
        style={{
          opacity: vignetteOpacity,
          background:
            "radial-gradient(circle at 50% 48%, transparent 42%, rgba(1, 5, 10, 0.95) 96%)",
        }}
      />

      {/* 3. ESCALATING TIME URGENCY CORAL PULSE (< 5s) */}
      {urgency > 0.05 && (
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-300"
          style={{
            opacity: urgency * 0.35,
            background:
              "radial-gradient(circle at 50% 50%, transparent 60%, rgba(251, 113, 133, 0.8) 100%)",
          }}
        />
      )}

      {/* 4. BIOLUMINESCENT SHOCKWAVE RING (Triggers on 85 / 100 pt hits) */}
      <AnimatePresence>
        {triggerShockwave && (
          <motion.div
            initial={{ scale: 0.1, opacity: 0.9 }}
            animate={{ scale: 2.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full border-2 border-[#00F5D4] shadow-[0_0_50px_#00F5D4]"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
