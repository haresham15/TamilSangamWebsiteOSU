// src/components/navigation/NavBilingualItem.tsx
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { NavRoute } from "./navRoutes";

interface NavBilingualItemProps {
  route: NavRoute;
  isActive: boolean;
  isDarkHero: boolean;
  locale: "en" | "ta";
  gamesUnsolved: boolean;
  isExpanded: boolean;
  onClick: () => void;
  index: number;
}

export const NavBilingualItem: React.FC<NavBilingualItemProps> = ({
  route,
  isActive,
  isDarkHero,
  locale,
  gamesUnsolved,
  isExpanded,
  onClick,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8, filter: "blur(3px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{
        opacity: 0,
        x: -4,
        filter: "blur(2px)",
        transition: { duration: 0.12, ease: "easeOut" },
      }}
      transition={{
        duration: 0.22,
        delay: index * 0.025 + 0.04,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative shrink-0"
    >
      <Link
        href={route.href}
        onClick={onClick}
        tabIndex={isExpanded ? 0 : -1}
        aria-hidden={!isExpanded}
        aria-current={isActive ? "page" : undefined}
        aria-label={
          route.isNew
            ? `${locale === "ta" ? route.ta : route.en}, new page addition`
            : route.badge && gamesUnsolved
            ? `${locale === "ta" ? route.ta : route.en}, new puzzles available`
            : undefined
        }
        className={`relative flex flex-col items-center justify-center cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark rounded-full px-2 xl:px-2.5 py-1 transition-all duration-200 ${
          isActive
            ? isDarkHero
              ? "bg-white/[0.12] border border-white/10 shadow-xs"
              : "bg-surface-card-dark border border-border-zari-muted shadow-xs"
            : isDarkHero
            ? "hover:bg-white/[0.08]"
            : "hover:bg-surface-card-dark/[0.05]"
        }`}
      >
        {/* Primary Navigation Text */}
        <span
          className={`font-sans text-[12px] xl:text-[13px] leading-tight tracking-tight whitespace-nowrap transition-colors duration-200 inline-flex items-center gap-1.5 ${
            isDarkHero
              ? isActive
                ? "font-semibold text-ink-alabaster"
                : "font-medium text-ink-sand group-hover:text-ink-alabaster"
              : isActive
              ? "font-semibold text-ink-alabaster"
              : "font-medium text-ink-alabaster group-hover:text-ink-alabaster"
          }`}
        >
          {locale === "ta" ? route.ta : route.en}

          {/* Route Tags */}
          {route.isNextEvent ? (
            <span
              className="inline-flex items-center gap-1 font-sans text-[7.5px] xl:text-[8px] font-semibold uppercase tracking-[0.14em] px-1.5 py-[1px] rounded-full transition-all bg-brand-teal/25 text-brand-teal-dark border border-brand-teal-dark/50"
            >
              <span
                className="size-1 rounded-full bg-brand-teal-dark"
                aria-hidden="true"
              />
              <span>{locale === "ta" ? "அடுத்தது" : "NEXT"}</span>
            </span>
          ) : route.isNew ? (
            <span
              className="inline-flex items-center gap-1 font-sans text-[7.5px] xl:text-[8px] font-semibold uppercase tracking-[0.14em] px-1.5 py-[1px] rounded-full transition-all bg-accent-zari/20 text-accent-zari border border-accent-zari/40"
            >
              <span
                className="size-1 rounded-full bg-accent-zari"
                aria-hidden="true"
              />
              <span>{locale === "ta" ? "புதிது" : "NEW"}</span>
            </span>
          ) : (
            route.badge &&
            gamesUnsolved && (
              <span
                className="size-[5px] rounded-full bg-accent-zari ring-1 ring-bg-sangam-deep"
                aria-hidden="true"
              />
            )
          )}
        </span>

        {/* Secondary Tamil Subtitle */}
        <span
          lang="ta"
          style={{ letterSpacing: 0 }}
          className={`font-tamil text-[9px] xl:text-[9.5px] leading-none mt-0.5 whitespace-nowrap transition-all duration-200 pointer-events-none ${
            isDarkHero
              ? isActive
                ? "text-brand-teal-dark font-semibold opacity-100"
                : "text-brand-teal-dark/75 font-medium opacity-75"
              : isActive
              ? "text-brand-teal-dark font-semibold opacity-100"
              : "text-brand-teal-dark font-medium opacity-80"
          }`}
        >
          {locale === "ta" ? route.en : route.ta}
        </span>
      </Link>
    </motion.div>
  );
};
