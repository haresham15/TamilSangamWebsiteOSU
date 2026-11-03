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
  // 1. Home: Deep Cosmic Plum -> Royal Violet -> Luminous Mint Horizon
  home: {
    gradientClass:
      "bg-gradient-to-b from-[#10061a] via-[#250d38] via-60% to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 75% 55% at 50% 0%, rgba(166,240,207,0.28) 0%, rgba(79,214,224,0.14) 35%, rgba(76,36,114,0.3) 65%, transparent 85%)",
  },

  // 2. About: Dravidian Temple Night -> Chola Bronze & Plum -> Mint Horizon
  about: {
    gradientClass:
      "bg-gradient-to-b from-[#120a1f] via-[#250d38] via-55% to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(166,240,207,0.28) 0%, rgba(79,214,224,0.14) 35%, rgba(37,13,56,0.35) 65%, transparent 85%)",
  },

  // 3. Events: Sodium-Vapor Amber Concert Night -> Mint Horizon
  events: {
    gradientClass:
      "bg-gradient-to-b from-[#140C20] via-[#25173B] via-40% via-[#352254] via-65% via-[#452C6D] via-88% to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 75% 55% at 50% 0%, rgba(166,240,207,0.28) 0%, rgba(79,214,224,0.18) 35%, rgba(37,23,59,0.3) 65%, transparent 85%)",
  },

  // 4. Gallery: ECR Acoustic Sunset -> Chromatic Pink & Mint
  gallery: {
    gradientClass:
      "bg-gradient-to-b from-[#140C20] via-[#25173B] via-45% via-[#352254] via-72% via-[#452C6D] via-90% to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 75% 55% at 50% 0%, rgba(166,240,207,0.26) 0%, rgba(242,107,181,0.18) 35%, rgba(37,23,59,0.35) 65%, transparent 85%)",
  },

  // 5. Board: Mandapam Stone -> Mint Horizon Halo
  board: {
    gradientClass:
      "bg-gradient-to-b from-[#140C20] via-[#25173B] via-35% via-[#352254] via-65% via-[#452C6D] via-88% to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(166,240,207,0.28) 0%, rgba(79,214,224,0.15) 35%, rgba(37,23,59,0.3) 65%, transparent 85%)",
  },

  // 6. Guide: Southern Railway Mechanical Station -> Mint Horizon
  guide: {
    gradientClass:
      "bg-gradient-to-b from-[#140C20] via-[#25173B] via-35% via-[#352254] via-65% via-[#452C6D] via-88% to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(166,240,207,0.28) 0%, rgba(79,214,224,0.18) 35%, rgba(37,23,59,0.4) 65%, transparent 85%)",
  },

  // 7. Suggestions: 3D Drafting Table -> Mint Horizon
  suggestions: {
    gradientClass:
      "bg-gradient-to-b from-[#140C20] via-[#25173B] to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(166,240,207,0.26) 0%, rgba(79,214,224,0.16) 35%, rgba(37,23,59,0.25) 65%, transparent 85%)",
  },

  // 8. Join: Night Sky -> Mint Horizon Aura
  join: {
    gradientClass:
      "bg-gradient-to-b from-[#140C20] via-[#250d38] via-40% via-[#352254] via-75% to-[#140C20]",
    ambientGlow:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(166,240,207,0.32) 0%, rgba(79,214,224,0.15) 35%, rgba(37,23,59,0.15) 65%, transparent 85%)",
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
