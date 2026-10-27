// src/components/games/SolluThumbnail.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

export function SolluThumbnail() {
  return (
    <div
      aria-hidden="true"
      className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-radial from-[#241E1B] via-[#1A1513] to-[#120F0E] p-4 flex flex-col justify-center items-center select-none border border-[#D4AF37]/20 shadow-inner group-hover:border-[#D4AF37]/50 transition-colors duration-300"
    >
      {/* Background Architectural Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#D4AF37 1px, transparent 1px), radial-gradient(#C85A32 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
        }}
      />

      {/* Ambient Warm Studio Lighting */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

      {/* 3D Angled Letterpress Tray */}
      <div className="relative z-10 w-full max-w-[340px] flex flex-col gap-2.5 [perspective:900px]">
        {/* Row 1: Solved Tamil Akshara Tiles (Emerald Enamel & Embossed Gold) */}
        <div className="grid grid-cols-5 gap-2 [transform:rotateX(6deg)] group-hover:[transform:rotateX(0deg)] transition-transform duration-500 ease-out">
          {[
            { ta: "சொ", sub: "SO", state: "correct" },
            { ta: "ல்", sub: "L", state: "correct" },
            { ta: "லு", sub: "LU", state: "correct" },
            { ta: "க்", sub: "K", state: "correct" },
            { ta: "கு", sub: "KU", state: "correct" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative aspect-square rounded-lg bg-linear-to-b from-[#347A55] to-[#20583B] border border-[#52B788]/60 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] flex flex-col items-center justify-center p-1"
            >
              <span className="font-tamil text-base sm:text-lg font-bold text-[#FFF5E6] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] leading-none">
                {item.ta}
              </span>
              <span className="font-mono text-[8px] font-semibold text-[#D4AF37] tracking-wider mt-0.5 opacity-90">
                {item.sub}
              </span>
              {/* Corner Gold Brass Accent */}
              <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#D4AF37] opacity-60" />
            </motion.div>
          ))}
        </div>

        {/* Row 2: Tanglish Guess Tiles (K-O-L-A-M Wordle Matrix) */}
        <div className="grid grid-cols-5 gap-2 [transform:rotateX(6deg)] group-hover:[transform:rotateX(0deg)] transition-transform duration-500 ease-out">
          {[
            { en: "K", type: "present" },
            { en: "O", type: "absent" },
            { en: "L", type: "absent" },
            { en: "A", type: "present" },
            { en: "M", type: "correct" },
          ].map((item, idx) => {
            const isCorrect = item.type === "correct";
            const isPresent = item.type === "present";

            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center p-1 border transition-colors ${
                  isCorrect
                    ? "bg-linear-to-b from-[#347A55] to-[#20583B] border-[#52B788]/60 text-[#FFF5E6] shadow-[0_3px_8px_rgba(0,0,0,0.4)]"
                    : isPresent
                    ? "bg-linear-to-b from-[#C8952B] to-[#996D18] border-[#E8B94F]/70 text-[#161210] font-extrabold shadow-[0_3px_8px_rgba(0,0,0,0.4)]"
                    : "bg-[#251F1C] border-[#161210] text-[#FAF6F0]/40 shadow-inner"
                }`}
              >
                <span className="font-sans text-sm sm:text-base font-bold leading-none">
                  {item.en}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Row 3: Recessed Empty Letterpress Slots */}
        <div className="grid grid-cols-5 gap-2 opacity-50 [transform:rotateX(6deg)] group-hover:[transform:rotateX(0deg)] transition-transform duration-500 ease-out">
          {[0, 1, 2, 3, 4].map((slot) => (
            <div
              key={slot}
              className="aspect-square rounded-lg border border-dashed border-[#D4AF37]/30 bg-[#161210]/40 flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/30" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Editorial Caption Stamp */}
      <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-[#FAF6F0]/45">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#52B788]" />
          WORDLE MATRIX
        </span>
        <span className="text-[#D4AF37]/75">6 ATTEMPTS</span>
      </div>
    </div>
  );
}
