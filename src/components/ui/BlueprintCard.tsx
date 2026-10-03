"use client";

import React, { forwardRef } from "react";

export interface BlueprintCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Chamfer style */
  variant?: "chamfer-tl-br" | "chamfer-tr-bl" | "straight";
  /** Diegetic hover light spill color */
  glowColor?: "sodium" | "mint" | "crimson" | "none";
  /** Technical index stamp (e.g. "[#01 // EVENT]") */
  indexStamp?: string;
  /** Optional date or venue metadata */
  metaStamp?: string;
  /** Show drafting corner crosshairs (+) */
  showCrosshairs?: boolean;
}

/**
 * BlueprintCard ("Ticket & Blueprint" Geometry)
 * Eradicates the bubbly SaaS card aesthetic with sharp drafting lines,
 * chamfered edges (Alaipayuthey / Kaththi), crosshairs, and diegetic ambient glow.
 */
export const BlueprintCard = forwardRef<HTMLDivElement, BlueprintCardProps>(
  function BlueprintCard(
    {
      children,
      className = "",
      variant = "chamfer-tl-br",
      glowColor = "sodium",
      ...props
    },
    ref
  ) {
    const chamferClass =
      variant === "chamfer-tl-br"
        ? "ticket-chamfer-tl-br"
        : variant === "chamfer-tr-bl"
        ? "ticket-chamfer-tr-bl"
        : "rounded-none";

    const glowHoverClass =
      glowColor === "sodium"
        ? "hover:glow-sodium hover:border-[#f59e0b]/60"
        : glowColor === "mint"
        ? "hover:glow-halogen-mint hover:border-[#55CCA2]/60"
        : glowColor === "crimson"
        ? "hover:glow-kumkumam hover:border-rose-500/60"
        : "";

    return (
      <div
        ref={ref}
        className={`relative group bg-[#130b1c]/90 border border-white/15 transition-all duration-200 ${chamferClass} ${glowHoverClass} ${className}`}
        {...props}
      >
        {/* Card Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);
