"use client";

import React from "react";
import Link from "next/link";
import { useAudio } from "@/context/AudioContext";
import { useLocale } from "@/context/LocaleContext";

export interface PalagaiButtonProps {
  children?: React.ReactNode;
  primaryText?: string;
  secondaryText?: string; // Tamil or alternate script translation that smoothly rolls into view
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  variant?: "primary" | "mint" | "white" | "dark";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  target?: string;
  rel?: string;
  "aria-label"?: string;
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
}) => {
  const { playClick, playWoodClick } = useAudio();
  const { locale } = useLocale();

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
    dark: "bg-[#250d38] text-[#55CCA2] border-2 border-[#55CCA2] shadow-[3px_3px_0px_#55CCA2,6px_6px_0px_#4c2472] hover:bg-[#34144e] hover:shadow-[5px_5px_0px_#55CCA2,8px_8px_0px_#4c2472] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0px_#55CCA2]",
  }[variant];

  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-[11px] min-h-[36px]",
    md: "px-5 py-2.5 text-xs min-h-[44px]",
    lg: "px-7 py-3.5 text-sm min-h-[50px]",
  }[size];

  // Primary label logic
  const mainLabel = primaryText || (typeof children === "string" ? children : "");
  // Alternate label if user provided secondaryText
  const altLabel = secondaryText;

  const content = (
    <span className="relative z-10 flex items-center gap-2 font-mono font-bold uppercase tracking-wider select-none">
      {/* Kolam Top-Left Corner Flourish */}
      <span
        aria-hidden="true"
        className="absolute -top-1 -left-1 text-[8px] leading-none opacity-40 group-hover:opacity-100 transition-opacity font-mono text-current"
      >
        +
      </span>

      {icon && iconPosition === "left" && (
        <span className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5">
          {icon}
        </span>
      )}

      {/* Kinetic Text Track: If secondaryText is provided, roll on hover */}
      {altLabel ? (
        <span className="relative block h-[1.35em] overflow-hidden leading-tight">
          <span className="block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
            <span className="block h-[1.35em] flex items-center">{mainLabel}</span>
            <span
              className="block h-[1.35em] flex items-center font-tamil text-[1.05em] normal-case"
              lang={locale === "ta" ? "en" : "ta"}
              style={{ letterSpacing: 0 }}
            >
              {altLabel}
            </span>
          </span>
        </span>
      ) : (
        <span>{children || mainLabel}</span>
      )}

      {icon && iconPosition === "right" && (
        <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-1">
          {icon}
        </span>
      )}

      {/* Kolam Bottom-Right Corner Flourish */}
      <span
        aria-hidden="true"
        className="absolute -bottom-1 -right-1 text-[8px] leading-none opacity-40 group-hover:opacity-100 transition-opacity font-mono text-current"
      >
        +
      </span>
    </span>
  );

  const combinedClasses = `group relative inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 ${variantClasses} ${sizeClasses} ${className} ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`;

  if (href && !disabled) {
    return (
      <Link
        href={href}
        onClick={handleClick}
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
      disabled={disabled}
      className={combinedClasses}
      aria-label={ariaLabel || (typeof mainLabel === "string" ? mainLabel : undefined)}
    >
      {content}
    </button>
  );
};
