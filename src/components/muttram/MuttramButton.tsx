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
}) => {
  const sizeStyles = {
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-6 py-3 text-sm gap-2",
    lg: "px-8 py-4 text-base gap-2.5",
  }[size];

  const variantStyles = {
    primary:
      "bg-[#A6F0CF] text-[#140C20] font-medium shadow-md shadow-amber-900/10 hover:bg-[#7AE7B5] hover:shadow-lg hover:shadow-amber-900/15",
    secondary:
      "bg-[#A6F0CF] text-[#140C20] font-medium shadow-md shadow-stone-900/10 hover:bg-[#7AE7B5] hover:shadow-lg hover:shadow-stone-900/15",
    outline:
      "border-2 border-[#A6F0CF]/35 text-[#A6F0CF] font-medium hover:border-[#A6F0CF] hover:bg-[#7AE7B5]/5",
    ghost:
      "text-[#F4F0FA] font-medium hover:bg-[#25173B]/5 hover:text-[#A6F0CF]",
  }[variant];

  const baseStyles = `inline-flex items-center justify-center rounded-full font-sans transition-colors duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4FD6E0] focus-visible:ring-offset-2 ${sizeStyles} ${variantStyles} ${
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
        <Link href={href} onClick={onClick} className={baseStyles}>
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
