"use client";

import React from "react";

export interface CulturalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "peacock" | "parchment" | "pathirikai";
  topStripe?: "purple" | "teal" | "zari" | "kumkum" | "none";
  /** Render as a different element (e.g. "article", "li"). */
  as?: "div" | "article" | "li" | "aside";
  className?: string;
  children: React.ReactNode;
}

const VARIANT = {
  light:
    "bg-surface-card-light border border-border-warm text-ink-earth shadow-[0_6px_24px_rgba(38,26,20,0.06)] hover:border-brand-purple/40 hover:shadow-[0_10px_30px_rgba(91,44,134,0.09)]",
  parchment:
    "bg-surface-card-parchment border border-border-warm text-ink-earth",
  dark:
    "bg-surface-card-dark border border-border-zari-muted text-ink-alabaster shadow-[0_12px_32px_rgba(10,6,18,0.35)] hover:border-accent-bronze-dark/55",
  peacock:
    "bg-surface-card-peacock border border-border-zari-muted text-ink-alabaster shadow-[0_12px_32px_rgba(4,14,18,0.35)] hover:border-accent-bronze-dark/55",
  pathirikai:
    "card-pathirikai bg-bg-sangam-deep border border-accent-zari/50 text-ink-alabaster shadow-[0_16px_48px_rgba(28,18,43,0.35)]",
} as const;

const STRIPE = {
  purple: "border-t-[3px] border-t-brand-purple",
  teal: "border-t-[3px] border-t-brand-teal",
  zari: "border-t-[3px] border-t-accent-zari",
  kumkum: "border-t-[3px] border-t-accent-kumkum",
  none: "",
} as const;

/**
 * CulturalCard — the one card recipe for discrete objects (events, forms, passes, featured items).
 * Do not use it to box intros, quotes, stats, lists or FAQs (composition rule R2).
 */
export function CulturalCard({
  variant = "light",
  topStripe = "none",
  as: Tag = "div",
  className = "",
  children,
  ...props
}: CulturalCardProps) {
  return (
    <Tag
      data-cultural-card="true"
      data-variant={variant}
      className={`relative overflow-hidden rounded-2xl transition-[border-color,box-shadow] duration-200 ${VARIANT[variant]} ${STRIPE[topStripe]} ${className}`.trim()}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    >
      {variant === "pathirikai" &&
        (["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"] as const).map((pos) => (
          <span
            key={pos}
            aria-hidden="true"
            className={`pointer-events-none absolute ${pos} select-none font-serif text-[10px] leading-none text-accent-zari/40`}
          >
            ❖
          </span>
        ))}
      {children}
    </Tag>
  );
}
