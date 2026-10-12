"use client";

import React from "react";
import Link from "next/link";
import { motion, HTMLMotionProps } from "framer-motion";

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
      "bg-[#E5A93C] text-[#2A2825] font-medium shadow-md shadow-amber-900/10 hover:bg-[#d6972b] hover:shadow-lg hover:shadow-amber-900/15",
    secondary:
      "bg-[#B85C38] text-[#FAF9F6] font-medium shadow-md shadow-stone-900/10 hover:bg-[#a04a27] hover:shadow-lg hover:shadow-stone-900/15",
    outline:
      "border-2 border-[#B85C38]/40 text-[#B85C38] font-medium hover:border-[#B85C38] hover:bg-[#B85C38]/5",
    ghost:
      "text-[#2A2825] font-medium hover:bg-[#2A2825]/5 hover:text-[#B85C38]",
  }[variant];

  const baseStyles = `inline-flex items-center justify-center rounded-full font-sans transition-colors duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] focus-visible:ring-offset-2 ${sizeStyles} ${variantStyles} ${
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
