// src/components/games/AazhamThumbnail.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Anchor, Compass, Sparkles } from "lucide-react";

export function AazhamThumbnail() {
  return (
    <div
      aria-hidden="true"
      className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-radial from-[#1A2639] via-[#121927] to-[#0A0D15] p-4 flex flex-col justify-between select-none border border-[#A6F0CF]/35 shadow-inner group-hover:border-[#A6F0CF] transition-colors duration-300"
    >
      {/* Background Oceanic Depth Wave Pattern */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#A6F0CF 1px, transparent 1px), radial-gradient(#38BDF8 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0, 12px 12px",
        }}
      />

      {/* Bioluminescent Ocean Light Rays */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-56 h-28 bg-[#38BDF8]/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 right-10 w-44 h-24 bg-[#A6F0CF]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header Depth Gauge Indicator */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#A6F0CF]">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#140C20]/80 border border-[#A6F0CF]/30">
          <Anchor className="size-3 text-[#A6F0CF]" />
          <span>0m ➔ 7,000m</span>
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
          <Sparkles className="size-2.5 text-[#A6F0CF]" />
          <span>Valampuri 100pt</span>
        </span>
      </div>

      {/* Submerged Sangam Visual Stage */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center">
        {/* Floating Tier Badges Stack */}
        <div className="w-full max-w-[280px] flex flex-col gap-1.5 [perspective:900px]">
          {/* Top: 15pt Trap Warning Tile */}
          <motion.div
            whileHover={{ y: -2 }}
            className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs font-mono shadow-xs"
          >
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              புத்திசாலி Trap
            </span>
            <span className="font-bold text-amber-300">+150m (15pt)</span>
          </motion.div>

          {/* Middle: 60pt The Deep Tile */}
          <motion.div
            whileHover={{ y: -2 }}
            className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 text-xs font-mono shadow-xs"
          >
            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
              ஆழம் · The Deep
            </span>
            <span className="font-bold text-indigo-200">+600m (60pt)</span>
          </motion.div>

          {/* Bottom: 100pt Valampuri Pearl Pearl Tile */}
          <motion.div
            whileHover={{ y: -2 }}
            className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#A6F0CF] text-[#140C20] text-xs font-mono shadow-[0_0_15px_rgba(166,240,207,0.3)] font-bold"
          >
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider">
              <Compass className="size-3" />
              <span>கோடியில் ஒன்னு</span>
            </span>
            <span>+1,000m (100pt)</span>
          </motion.div>
        </div>
      </div>

      {/* Trench Glowing Tamil Glyphs */}
      <div className="relative z-10 flex items-center justify-between pt-2 border-t border-[rgba(125,96,166,0.25)] text-xs font-mono">
        <span className="text-[#F4F0FA]/60 text-[10px]">7 Prompts · 25s Clocks</span>
        <div lang="ta" className="flex items-center gap-2 font-tamil text-sm text-[#A6F0CF]/80">
          <span className="hover:text-[#A6F0CF] transition-colors">அ</span>
          <span className="text-[#38BDF8]">·</span>
          <span className="hover:text-[#A6F0CF] transition-colors">ழ</span>
          <span className="text-[#38BDF8]">·</span>
          <span className="hover:text-[#A6F0CF] transition-colors">க</span>
        </div>
      </div>
    </div>
  );
}
