// src/components/games/ThodarpuThumbnail.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

export function ThodarpuThumbnail() {
  const categories = [
    {
      color: "from-[#C8952B] to-[#996D18]",
      border: "border-[#E8B94F]/60",
      accent: "#E8B94F",
      textColor: "text-[#161210]",
      tiles: [
        { en: "Veena", ta: "வீணை" },
        { en: "Ragam", ta: "ராகம்" },
        { en: "Shruti", ta: "சுருதி" },
        { en: "Talam", ta: "தாளம்" },
      ],
    },
    {
      color: "from-[#347A55] to-[#20583B]",
      border: "border-[#52B788]/60",
      accent: "#52B788",
      textColor: "text-[#FFF5E6]",
      tiles: [
        { en: "Gopuram", ta: "கோபுரம்" },
        { en: "Mandapam", ta: "மண்டபம்" },
        { en: "Prakaram", ta: "பிரகாரம்" },
        { en: "Theppam", ta: "தெப்பம்" },
      ],
    },
    {
      color: "from-[#B84E29] to-[#802F13]",
      border: "border-[#E07A5F]/60",
      accent: "#E07A5F",
      textColor: "text-[#FFF5E6]",
      tiles: [
        { en: "Nayakan", ta: "நாயகன்" },
        { en: "Thalapathi", ta: "தளபதி" },
        { en: "Padayappa", ta: "படையப்பா" },
        { en: "Anniyan", ta: "அந்நியன்" },
      ],
    },
    {
      color: "from-[#3E4F80] to-[#253256]",
      border: "border-[#7B8EC8]/60",
      accent: "#7B8EC8",
      textColor: "text-[#FFF5E6]",
      tiles: [
        { en: "Pongal", ta: "பொங்கல்" },
        { en: "Murukku", ta: "முறுக்கு" },
        { en: "Adhirasam", ta: "அதிரசம்" },
        { en: "Payasam", ta: "பாயாசம்" },
      ],
    },
  ];

  return (
    <div
      aria-hidden="true"
      className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-radial from-[#241E1B] via-[#1A1513] to-[#120F0E] p-4 flex flex-col justify-center items-center select-none border border-[#D4AF37]/20 shadow-inner group-hover:border-[#D4AF37]/50 transition-colors duration-300"
    >
      {/* Background Subtle Geometric Tile Lattice */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(45deg, #D4AF37 25%, transparent 25%), linear-gradient(-45deg, #D4AF37 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #D4AF37 75%), linear-gradient(-45deg, transparent 75%, #D4AF37 75%)`,
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
        }}
      />

      {/* Ambient Cool-Warm Lighting Aura */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#3E4F80]/20 rounded-full blur-2xl pointer-events-none" />

      {/* 4x4 Connected Cultural Tiles Matrix */}
      <div className="relative z-10 w-full max-w-[340px] flex flex-col gap-1.5 [perspective:900px]">
        {categories.map((cat, catIdx) => (
          <div
            key={catIdx}
            className="grid grid-cols-4 gap-1.5 [transform:rotateX(6deg)] group-hover:[transform:rotateX(0deg)] transition-transform duration-500 ease-out"
          >
            {cat.tiles.map((tile, tIdx) => (
              <motion.div
                key={tIdx}
                whileHover={{ y: -3, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`relative rounded-md bg-linear-to-b ${cat.color} ${cat.border} border ${cat.textColor} py-1.5 px-1 flex flex-col items-center justify-center text-center shadow-[0_3px_8px_rgba(0,0,0,0.4)]`}
              >
                <span className="font-sans text-[11px] font-bold leading-tight truncate w-full">
                  {tile.en}
                </span>
                <span className="font-tamil text-[9px] opacity-80 leading-tight truncate w-full mt-0.5">
                  {tile.ta}
                </span>

                {/* Cultural Interconnection Dot */}
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border border-[#161210] group-hover:scale-125 transition-transform"
                  style={{ backgroundColor: cat.accent }}
                />
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Editorial Caption Stamp */}
      <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-[#FAF6F0]/45">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E8B94F]" />
          4×4 CONNECTIONS MATRIX
        </span>
        <span className="text-[#D4AF37]/75">16 TILES · 4 GROUPS</span>
      </div>
    </div>
  );
}
