"use client";

import React from "react";
import Link from "next/link";
import { useAudio } from "@/context/AudioContext";
import { useLocale } from "@/context/LocaleContext";
import { audioLayer } from "@/utils/audioLayer";

export interface PalagaiButtonProps {
  children?: React.ReactNode;
  primaryText?: string;
  secondaryText?: string; // Tamil or alternate script translation that smoothly rolls into view
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  variant?: "primary" | "mint" | "white" | "dark" | "gold-foil";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  target?: string;
  rel?: string;
  "aria-label"?: string;
  chamfer?: boolean;
  glow?: boolean;
}

/**
 * PalagaiButton: Artisanal, non-AI-generated South Indian architectural button.
 * Inspired by temple thresholds (Palagai / Padi), featuring:
 * 1. Stepped dual-tier architectural drop shadows.
 * 2. Specular Zari gold thread light sweep on hover.
 * 3. Kinetic bilingual tumbler roll (English <-> Tamil script).
 * 4. Micro Kolam geometric corner markers.
 * 5. Authentic tactile wood-click acoustic feedback.
 */
export const PalagaiButton: React.FC<PalagaiButtonProps> = ({
  children,
  primaryText,
  secondaryText,
  href,
  onClick,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "right",
  className = "",
  disabled = false,
  type = "button",
  target,
  rel,
  "aria-label": ariaLabel,
  chamfer = false,
  glow = false,
}) => {
  const { playClick, playWoodClick } = useAudio();
  const { locale } = useLocale();

  // Primary label logic
  const mainLabel = primaryText || (typeof children === "string" ? children : "");
  // Alternate label if user provided secondaryText
  const altLabel = secondaryText;

  const isPrimaryAction =
    variant === "gold-foil" ||
    variant === "primary" ||
    (typeof mainLabel === "string" && mainLabel.toLowerCase().includes("join"));

  const handlePointerDown = () => {
    if (disabled) return;
    if (isPrimaryAction) {
      audioLayer.playSubBassThud();
    }
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    audioLayer.playTapeClack();
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (disabled) return;
    try {
      playWoodClick();
    } catch {
      playClick();
    }
    if (onClick) onClick(e);
  };

  // Base styling per variant
  const variantClasses = {
    primary: "btn-sangam text-white",
    mint: "btn-sangam-mint text-[#240e36]",
    white: "btn-sangam-white text-[#250d38]",
    dark: "bg-[#250d38] text-[#55CCA2] border-2 border-[#55CCA2] shadow-[3px_3px_0px_#55CCA2,6px_6px_0px_#4c2472] hover:bg-[#34144e] hover:shadow-[4px_4px_0px_#55CCA2,7px_7px_0px_#4c2472] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#55CCA2]",
    "gold-foil": "btn-gold-foil text-[#1a0826] border border-amber-200/70 shadow-[3px_3px_0px_#8B5A2B] hover:shadow-[0_0_35px_rgba(255,184,77,0.45)]",
  }[variant];

  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-[11px] min-h-[36px]",
    md: "px-5 py-2.5 text-xs min-h-[44px]",
    lg: "px-7 py-3.5 text-sm min-h-[50px]",
  }[size];


  const content = (
    <span className="relative z-10 flex items-center gap-2 font-mono font-bold uppercase tracking-wider select-none">
      {icon && iconPosition === "left" && (
        <span className="shrink-0 transition-transform duration-150 ease-out group-hover:-translate-x-0.5 transform-gpu">
          {icon}
        </span>
      )}

      {/* Stable, Highly Legible Bilingual Typography (No Disorienting Roll on Hover) */}
      <span className="flex items-center gap-1.5 leading-tight">
        <span>{children || mainLabel}</span>
        {altLabel && altLabel !== mainLabel && (
          <span
            className="text-[10px] opacity-80 font-tamil font-normal tracking-normal lowercase first-letter:uppercase"
            lang={locale === "ta" ? "en" : "ta"}
            style={{ letterSpacing: 0 }}
          >
            {altLabel}
          </span>
        )}
      </span>

      {icon && iconPosition === "right" && (
        <span className="shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-0.5 transform-gpu">
          {icon}
        </span>
      )}
    </span>
  );

  const chamferClass = chamfer ? "ticket-chamfer-tl-br" : "rounded-none";
  const glowClass = glow ? (variant === "mint" ? "hover:glow-halogen-mint" : "hover:glow-sodium") : "";

  const combinedClasses = `group relative inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out ${variantClasses} ${sizeClasses} ${chamferClass} ${glowClass} ${className} ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`;

  if (href && !disabled) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onPointerDown={handlePointerDown}
        data-cursor="bracket"
        target={target}
        rel={rel}
        className={combinedClasses}
        aria-label={ariaLabel || (typeof mainLabel === "string" ? mainLabel : undefined)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onPointerDown={handlePointerDown}
      data-cursor="bracket"
      disabled={disabled}
      className={combinedClasses}
      aria-label={ariaLabel || (typeof mainLabel === "string" ? mainLabel : undefined)}
    >
      {content}
    </button>
  );
};
