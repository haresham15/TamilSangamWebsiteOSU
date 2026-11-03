"use client";

import React from "react";

export type HeroGradientVariant =
  | "home"
  | "about"
  | "events"
  | "gallery"
  | "board"
  | "guide"
  | "suggestions"
  | "join";

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
      "bg-gradient-to-b from-[#10061a] via-[#250d38] via-60% to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(85,204,162,0.18) 0%, rgba(76,36,114,0.3) 45%, transparent 80%)",
  },

  // 2. About: Dravidian Temple Night (#120a1f) -> Chola Bronze & Plum (#250d38) -> Warm Ivory (#fffdfa)
  about: {
    gradientClass:
      "bg-gradient-to-b from-[#120a1f] via-[#250d38] via-55% to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(166,240,207,0.15) 0%, rgba(37,13,56,0.35) 50%, transparent 85%)",
  },

  // 3. Events: Sodium-Vapor Amber Concert Night (#0c0a08) -> Terracotta Dusk (#3e1c10) -> Pure White (#ffffff)
  events: {
    gradientClass:
      "bg-gradient-to-b from-[#140C20] via-[#25173B] via-40% via-[#352254] via-65% via-[#452C6D] via-88% to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 75% 55% at 50% 0%, rgba(79,214,224,0.25) 0%, rgba(37,23,59,0.3) 45%, transparent 80%)",
  },

  // 4. Gallery: ECR Acoustic Sunset (#1F0A05) -> Warm Terracotta (#541d10) -> Warm Cream (#fbf9f5)
  gallery: {
    gradientClass:
      "bg-gradient-to-b from-[#140C20] via-[#25173B] via-45% via-[#352254] via-72% via-[#452C6D] via-90% to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 75% 55% at 50% 0%, rgba(242,107,181,0.22) 0%, rgba(37,23,59,0.35) 50%, transparent 80%)",
  },

  // 5. Board: Mandapam Torchlit Stone (#120A06) -> Molten Gold / Bronze Halo -> Warm Sandstone Ledger (#F7F0E4)
  board: {
    gradientClass:
      "bg-gradient-to-b from-[#140C20] via-[#25173B] via-35% via-[#352254] via-65% via-[#452C6D] via-88% to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(166,240,207,0.15) 0%, rgba(37,23,59,0.3) 50%, transparent 80%)",
  },

  // 6. Guide: Southern Railway Mechanical Station (#0c0907) -> Amber Tungsten Lamp Spill -> Platform Console (#FAF6EE)
  guide: {
    gradientClass:
      "bg-gradient-to-b from-[#140C20] via-[#25173B] via-35% via-[#352254] via-65% via-[#452C6D] via-88% to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(79,214,224,0.22) 0%, rgba(37,23,59,0.4) 50%, transparent 80%)",
  },

  // 7. Suggestions: 3D Kaththi War Room Blueprint (#0F050A) -> Bruised Plum (#150914) -> Amber Shimmer
  suggestions: {
    gradientClass:
      "bg-gradient-to-b from-[#140C20] via-[#25173B] to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(79,214,224,0.18) 0%, rgba(37,23,59,0.25) 50%, transparent 80%)",
  },

  // 8. Join: Night Sky (#140C20) -> Royal Violet -> Deep Violet (#140C20)
  join: {
    gradientClass:
      "bg-gradient-to-b from-[#140C20] via-[#250d38] via-40% via-[#352254] via-75% to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(166,240,207,0.20) 0%, rgba(37,23,59,0.15) 50%, transparent 80%)",
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
    </div>
  );
}
