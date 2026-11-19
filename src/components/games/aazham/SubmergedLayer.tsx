// src/components/games/aazham/SubmergedLayer.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

interface SubmergedLayerProps {
  depthProgress: number; // 0.0 to 1.0
  roundIndex: number; // 0 to 6
}

export function SubmergedLayer({
  depthProgress,
  roundIndex,
}: SubmergedLayerProps) {
  // Parallax translation: silhouettes drift upward as player sinks
  const translateY = -depthProgress * 480;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-10"
    >
      {/* 1. CENTER STAGE ROTATING KOLAM-ASTROLABE COMPASS RING */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] pointer-events-none opacity-[0.045]">
        <motion.svg
          animate={{
            rotate: 360 + roundIndex * 30,
          }}
          transition={{
            rotate: {
              duration: 120,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          viewBox="0 0 400 400"
          className="w-full h-full text-[#DFB968]"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
        >
          {/* Concentric Astrolabe Rings */}
          <circle cx="200" cy="200" r="190" strokeDasharray="4 6" />
          <circle cx="200" cy="200" r="160" />
          <circle cx="200" cy="200" r="120" strokeDasharray="2 4" />
          <circle cx="200" cy="200" r="70" />

          {/* Compass 16-Point Cardinal Spoke System */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16;
            const rad = (angle * Math.PI) / 180;
            const x1 = 200 + Math.cos(rad) * 70;
            const y1 = 200 + Math.sin(rad) * 70;
            const x2 = 200 + Math.cos(rad) * 190;
            const y2 = 200 + Math.sin(rad) * 190;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}

          {/* Sangam Sikku Kolam Knotwork in Core */}
          <path
            d="M 170 200 Q 200 170 230 200 Q 200 230 170 200 Z"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path
            d="M 200 170 Q 230 200 200 230 Q 170 200 200 170 Z"
            fill="currentColor"
            fillOpacity="0.2"
          />
        </motion.svg>
      </div>

      {/* 2. PARALLAX DRIFTING MARITIME STRATA CONTAINER */}
      <motion.div
        animate={{ y: translateY }}
        transition={{ type: "spring", stiffness: 70, damping: 22 }}
        className="relative w-full h-[220vh] top-0 left-0"
      >
        {/* STRATUM A (0m – 1,500m): Shallow Coral & Wave Refractions */}
        <div className="absolute top-[8vh] w-full px-8 flex justify-between opacity-15">
          {/* Left Reef Fronds */}
          <svg
            className="w-48 h-64 text-[#5EEAD4]"
            viewBox="0 0 100 160"
            fill="currentColor"
          >
            <path d="M 20 160 Q 30 100 10 60 Q 25 20 40 0 Q 30 50 45 90 Q 55 130 50 160 Z" />
            <path d="M 50 160 Q 70 110 60 70 Q 75 30 85 10 Q 70 60 75 110 Q 80 140 70 160 Z" opacity="0.6" />
          </svg>

          {/* Right Reef Fronds */}
          <svg
            className="w-48 h-64 text-[#5EEAD4] transform scale-x-[-1]"
            viewBox="0 0 100 160"
            fill="currentColor"
          >
            <path d="M 20 160 Q 30 100 10 60 Q 25 20 40 0 Q 30 50 45 90 Q 55 130 50 160 Z" />
          </svg>
        </div>

        {/* STRATUM B (2,000m – 4,500m): Submerged Poompuhar Chola Gopuram & Ancient Merchant Ship */}
        <div className="absolute top-[75vh] w-full px-6 flex justify-between items-end opacity-[0.08]">
          {/* Submerged Chola Stepped Gopuram Silhouette (Left) */}
          <svg
            className="w-72 h-80 text-[#DFB968]"
            viewBox="0 0 200 240"
            fill="currentColor"
          >
            {/* Stepped Temple Tiers */}
            <rect x="20" y="200" width="160" height="40" />
            <rect x="35" y="165" width="130" height="35" />
            <rect x="50" y="130" width="100" height="35" />
            <rect x="65" y="95" width="70" height="35" />
            <rect x="80" y="60" width="40" height="35" />
            <polygon points="100,20 85,60 115,60" />
            {/* Temple Gateway Arch */}
            <path d="M 85 240 L 85 210 Q 100 195 115 210 L 115 240 Z" fill="#02080C" />
          </svg>

          {/* Submerged Ancient Tamil Merchant Ship Hull (Right) */}
          <svg
            className="w-80 h-48 text-[#DFB968]"
            viewBox="0 0 260 140"
            fill="currentColor"
          >
            {/* Curved Hull of a Sangam Chola 'Naavai' Ship */}
            <path d="M 10 50 Q 80 120 220 100 Q 250 90 260 40 Q 230 75 160 70 Q 70 65 10 50 Z" />
            {/* Mast and Rigging Silhouettes */}
            <line x1="120" y1="5" x2="120" y2="70" stroke="currentColor" strokeWidth="2.5" />
            <line x1="80" y1="20" x2="80" y2="65" stroke="currentColor" strokeWidth="2" />
            <line x1="120" y1="15" x2="200" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          </svg>
        </div>

        {/* STRATUM C (5,000m – 7,000m): Kumari Trench Hairline Topography & Ancient Sangam Glyphs */}
        <div className="absolute top-[145vh] w-full px-12 flex justify-between items-center opacity-[0.055]">
          {/* Giant Ancient Tamil Glyph (அ) */}
          <div lang="ta" className="font-tamil text-9xl text-[#00F5D4] select-none">
            அ
          </div>

          {/* Bathymetric Topographic Contour Lines */}
          <svg
            className="w-96 h-64 text-[#00F5D4]"
            viewBox="0 0 300 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          >
            <path d="M 10 100 Q 80 40 160 80 T 290 60" />
            <path d="M 20 120 Q 90 60 170 100 T 280 80" />
            <path d="M 30 140 Q 100 80 180 120 T 270 100" />
            <path d="M 40 160 Q 110 100 190 140 T 260 120" strokeDasharray="4 6" />
          </svg>

          {/* Giant Ancient Tamil Glyph (ழ) */}
          <div lang="ta" className="font-tamil text-9xl text-[#DFB968] select-none">
            ழ
          </div>
        </div>
      </motion.div>
    </div>
  );
}
