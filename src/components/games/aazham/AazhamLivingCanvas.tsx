// src/components/games/aazham/AazhamLivingCanvas.tsx
"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface AazhamLivingCanvasProps {
  currentDepth: number; // 0 to 7,000 meters
  children: React.ReactNode;
}

export function AazhamLivingCanvas({
  currentDepth,
  children,
}: AazhamLivingCanvasProps) {
  // Compute depth zone
  const depthZone = useMemo(() => {
    if (currentDepth >= 5000) {
      return {
        nameEn: "Kumari Kandam Hadal Trench",
        nameTa: "குமரிக்கண்ட படுகுழி",
        bgLinear:
          "linear-gradient(180deg, #07090F 0%, #05070D 40%, #0A121A 100%)",
        accentGlow: "rgba(166, 240, 207, 0.12)",
        glyphsGlow: true,
      };
    }
    if (currentDepth >= 3000) {
      return {
        nameEn: "Submerged Poompuhar Mandapam",
        nameTa: "பூம்புகார் மூழ்கிய மண்டபம்",
        bgLinear:
          "linear-gradient(180deg, #0F1322 0%, #0A0D18 50%, #070912 100%)",
        accentGlow: "rgba(129, 140, 248, 0.1)",
        glyphsGlow: false,
      };
    }
    if (currentDepth >= 1000) {
      return {
        nameEn: "Gulf of Mannar Twilight Zone",
        nameTa: "மன்னார் வளைகுடா அந்தி மண்டலம்",
        bgLinear:
          "linear-gradient(180deg, #182038 0%, #101628 50%, #0B0E1B 100%)",
        accentGlow: "rgba(56, 189, 248, 0.12)",
        glyphsGlow: false,
      };
    }
    return {
      nameEn: "Bay of Bengal Sunlit Surface",
      nameTa: "வங்கக்கடல் பகல் வெளிச்சம்",
      bgLinear:
        "linear-gradient(180deg, #162B3D 0%, #11202E 50%, #0E1824 100%)",
      accentGlow: "rgba(79, 214, 224, 0.15)",
      glyphsGlow: false,
    };
  }, [currentDepth]);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-[rgba(125,96,166,0.3)] transition-colors duration-700 shadow-2xl"
      style={{
        background: depthZone.bgLinear,
      }}
    >
      {/* Background Ambient Caustic / Bioluminescent Glow */}
      <motion.div
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-3/4 h-64 rounded-full blur-3xl pointer-events-none"
        style={{
          background: depthZone.accentGlow,
        }}
      />

      {/* Floating Bioluminescent Glyphs in Hadal Trench (>= 5000m) */}
      {depthZone.glyphsGlow && (
        <div
          aria-hidden="true"
          lang="ta"
          className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-20"
        >
          <span className="absolute top-10 left-8 font-tamil text-5xl text-[#A6F0CF] blur-[1px]">
            அ
          </span>
          <span className="absolute bottom-16 left-1/4 font-tamil text-6xl text-[#38BDF8] blur-[1.5px]">
            ழ
          </span>
          <span className="absolute top-24 right-12 font-tamil text-5xl text-[#A6F0CF] blur-[1px]">
            க
          </span>
          <span className="absolute bottom-8 right-1/4 font-tamil text-5xl text-[#C084FC] blur-[1.5px]">
            ஔ
          </span>
        </div>
      )}

      {/* Water Column Depth Metric Bar (Sticky Top) */}
      <div className="relative z-20 flex items-center justify-between px-5 py-3 border-b border-[rgba(125,96,166,0.25)] bg-[#140C20]/60 backdrop-blur-md text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#A6F0CF]" />
          <span className="font-bold text-[#A6F0CF]">
            {depthZone.nameEn}
          </span>
          <span className="text-[#F4F0FA]/40 hidden md:inline">|</span>
          <span
            lang="ta"
            className="font-tamil text-[#C4B7D7] hidden md:inline"
          >
            {depthZone.nameTa}
          </span>
        </div>

        <div className="flex items-center gap-2 text-right">
          <span className="text-[#F4F0FA]/60 text-[11px]">Current Depth:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#25173B] border border-[#A6F0CF]/40 text-[#A6F0CF] font-bold text-sm shadow-xs">
            {currentDepth.toLocaleString()}m
            <span className="text-[10px] text-[#F4F0FA]/50 font-normal ml-1">
              / 7,000m
            </span>
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10">{children}</div>
    </div>
  );
}
