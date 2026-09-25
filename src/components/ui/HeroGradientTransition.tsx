"use client";

import React from "react";

export type HeroGradientVariant =
  | "home"
  | "about"
  | "events"
  | "gallery"
  | "board"
  | "guide"
  | "suggestions";

interface HeroGradientTransitionProps {
  variant: HeroGradientVariant;
  className?: string;
}

const GRADIENT_CONFIGS: Record<
  HeroGradientVariant,
  {
    gradientClass: string;
    ambientGlow: string;
    lineAccent?: string;
  }
> = {
  // 1. Home: Deep Cosmic Plum (#10061a) -> Royal Sangam Purple (#250d38) -> Warm Ivory (#fffdfa)
  home: {
    gradientClass:
      "bg-gradient-to-b from-[#10061a] via-[#250d38] via-60% to-[#fffdfa]",
    ambientGlow:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(85,204,162,0.18) 0%, rgba(76,36,114,0.3) 45%, transparent 80%)",
    lineAccent: "border-t border-[#55CCA2]/25",
  },

  // 2. About: Dravidian Temple Night (#120a1f) -> Chola Bronze & Plum (#250d38) -> Warm Ivory (#fffdfa)
  about: {
    gradientClass:
      "bg-gradient-to-b from-[#120a1f] via-[#250d38] via-55% to-[#fffdfa]",
    ambientGlow:
      "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,197,38,0.15) 0%, rgba(37,13,56,0.35) 50%, transparent 85%)",
    lineAccent: "border-t border-[#FFC526]/20",
  },

  // 3. Events: Sodium-Vapor Amber Concert Night (#0c0a08) -> Terracotta Dusk (#3e1c10) -> Pure White (#ffffff)
  events: {
    gradientClass:
      "bg-gradient-to-b from-[#0c0a08] via-[#2b160d] via-40% via-[#633017] via-65% via-[#d69f72] via-88% to-[#ffffff]",
    ambientGlow:
      "radial-gradient(ellipse 75% 55% at 50% 0%, rgba(255,170,68,0.28) 0%, rgba(99,48,23,0.3) 45%, transparent 80%)",
    lineAccent: "border-t border-[#FFAA44]/30",
  },

  // 4. Gallery: ECR Acoustic Sunset (#1F0A05) -> Warm Terracotta (#541d10) -> Warm Cream (#fbf9f5)
  gallery: {
    gradientClass:
      "bg-gradient-to-b from-[#1F0A05] via-[#48170c] via-45% via-[#a44c25] via-72% via-[#eec5a8] via-90% to-[#fbf9f5]",
    ambientGlow:
      "radial-gradient(ellipse 75% 55% at 50% 0%, rgba(255,157,92,0.25) 0%, rgba(72,23,12,0.35) 50%, transparent 80%)",
    lineAccent: "border-t border-[#FF9D5C]/30",
  },

  // 5. Board: Mandapam Torchlit Stone (#1C120A) -> Molten Gold Halo -> Imperial Chola Obsidian (#120A06)
  board: {
    gradientClass:
      "bg-gradient-to-b from-[#1C120A] via-[#23150c] via-50% to-[#120A06]",
    ambientGlow:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,175,55,0.22) 0%, rgba(35,21,12,0.4) 50%, transparent 80%)",
    lineAccent: "border-t border-[#D4AF37]/25",
  },

  // 6. Guide: Southern Railway Mechanical Station (#0c0907) -> Tungsten Lamp Spill -> Platform Console (#070504)
  guide: {
    gradientClass:
      "bg-gradient-to-b from-[#0c0907] via-[#16100a] via-50% to-[#070504]",
    ambientGlow:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.2) 0%, rgba(22,16,10,0.35) 50%, transparent 80%)",
    lineAccent: "border-t border-[#f59e0b]/20",
  },

  // 7. Suggestions: 3D Architectural Blueprint (#0b1026) -> Cyan Grid Shimmer -> Midnight Base (#0a0e22)
  suggestions: {
    gradientClass:
      "bg-gradient-to-b from-[#0b1026] via-[#101738] via-50% to-[#0a0e22]",
    ambientGlow:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(85,204,162,0.22) 0%, rgba(16,23,56,0.35) 50%, transparent 80%)",
    lineAccent: "border-t border-[#55CCA2]/25",
  },
};

/**
 * HeroGradientTransition
 * A smooth, cinematic multi-stop color gradient transition placed at the boundary
 * between top 3D interactive hero scenes and DOM content below.
 */
export function HeroGradientTransition({
  variant,
  className = "",
}: HeroGradientTransitionProps) {
  const config = GRADIENT_CONFIGS[variant];

  return (
    <div
      className={`relative w-full h-24 sm:h-36 lg:h-44 pointer-events-none select-none z-10 overflow-hidden ${config.gradientClass} ${className}`}
      aria-hidden="true"
    >
      {/* Dynamic atmospheric radial spotlight reflecting top 3D lighting */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ background: config.ambientGlow }}
      />

      {/* Subtle architectural hairline border at seam */}
      {config.lineAccent && (
        <div className={`absolute top-0 inset-x-0 w-full ${config.lineAccent}`} />
      )}
    </div>
  );
}
