"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export type MuttramButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type MuttramButtonSize = "sm" | "md" | "lg";

export interface MuttramButtonProps {
  children: React.ReactNode;
  variant?: MuttramButtonVariant;
  size?: MuttramButtonSize;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: React.ReactNode;
  /** Set when the button sits on a sangam-deep / peacock-deep band. */
  onDark?: boolean;
  /** Opens href in a new tab (external links). */
  external?: boolean;
  ariaLabel?: string;
}

export const MuttramButton: React.FC<MuttramButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  icon,
  onDark = false,
  external = false,
  ariaLabel,
}) => {
  const sizeStyles = {
    sm: "min-h-11 px-4 py-2 text-sm gap-1.5",
    md: "min-h-12 px-6 py-3 text-sm gap-2",
    lg: "px-8 py-4 text-base gap-2.5",
  }[size];

  // Color roles (C2): teal = action, purple = identity/secondary, zari ring = cultural hover cue.
  const variantStyles = (onDark
    ? {
        primary:
          "bg-brand-teal-dark text-ink-on-teal font-semibold hover:bg-brand-teal-hover-dark hover:ring-2 hover:ring-accent-zari/40",
        secondary:
          "border border-brand-lavender/60 text-brand-lavender font-medium hover:bg-brand-lavender/10 hover:border-brand-lavender",
        outline:
          "border border-accent-bronze-dark/50 text-ink-alabaster font-medium hover:border-accent-zari hover:bg-white/5",
        ghost: "text-ink-sand font-medium hover:text-brand-teal-dark",
      }
    : {
        primary:
          "bg-brand-teal text-ink-alabaster font-medium shadow-[0_6px_18px_rgba(15,118,110,0.18)] hover:bg-brand-teal-hover hover:ring-2 hover:ring-accent-zari/40",
        secondary:
          "border border-brand-purple/45 text-brand-purple font-medium hover:bg-brand-purple-soft hover:border-brand-purple",
        outline:
          "border border-accent-bronze/50 text-ink-earth font-medium hover:border-brand-purple/50 hover:bg-surface-card-parchment",
        ghost: "text-ink-earth font-medium hover:text-brand-teal",
      })[variant];

  const baseStyles = `inline-flex items-center justify-center rounded-full font-sans transition-colors duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${sizeStyles} ${variantStyles} ${
    disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
  } ${className}`;

  if (href) {
    return (
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="inline-block"
      >
        <Link
          href={href}
          onClick={onClick}
          className={baseStyles}
          aria-label={ariaLabel}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={baseStyles}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};
