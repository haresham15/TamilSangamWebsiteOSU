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
      initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 4, filter: "blur(2px)" }}
      transition={{
        duration: 0.22,
        delay: index * 0.025 + 0.05,
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
        className={`relative flex flex-col items-center justify-center cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] rounded-full px-2.5 py-1 transition-all duration-200 ${
          isActive
            ? isDarkHero
              ? "bg-white/[0.12] border border-white/10 shadow-xs"
              : "bg-[#EFECE6] border border-[#E0D7C9] shadow-xs"
            : isDarkHero
            ? "hover:bg-white/[0.08]"
            : "hover:bg-[#2A2825]/[0.05]"
        }`}
      >
        {/* Primary Navigation Text */}
        <span
          className={`font-sans text-[12px] xl:text-[13px] leading-tight tracking-tight whitespace-nowrap transition-colors duration-200 inline-flex items-center gap-1.5 ${
            isDarkHero
              ? isActive
                ? "font-semibold text-[#FAF9F6]"
                : "font-medium text-[#FAF9F6]/85 group-hover:text-white"
              : isActive
              ? "font-semibold text-[#181716]"
              : "font-medium text-[#2C2A29] group-hover:text-[#161210]"
          }`}
        >
          {locale === "ta" ? route.ta : route.en}

          {/* New Addition Tag */}
          {route.isNew ? (
            <span
              className={`inline-flex items-center gap-1 font-mono text-[7.5px] xl:text-[8px] font-bold uppercase tracking-wider px-1.5 py-[1px] rounded-full transition-all ${
                isDarkHero
                  ? "bg-[#D4AF37]/25 text-[#F5DE88] border border-[#D4AF37]/60 shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                  : "bg-[#B85C38]/12 text-[#B85C38] border border-[#B85C38]/30 shadow-[0_0_6px_rgba(184,92,56,0.2)]"
              }`}
            >
              <span
                className={`size-1 rounded-full ${
                  isDarkHero ? "bg-[#F5DE88]" : "bg-[#B85C38]"
                } animate-pulse`}
                aria-hidden="true"
              />
              <span>{locale === "ta" ? "புதிது" : "NEW"}</span>
            </span>
          ) : (
            route.badge &&
            gamesUnsolved && (
              <span
                className="size-[5px] rounded-full bg-[#D4AF37] ring-1 ring-[#161210] shadow-[0_0_4px_#D4AF37] animate-pulse"
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
                ? "text-[#E5A93C] font-semibold opacity-100"
                : "text-[#E5A93C]/75 font-medium opacity-75"
              : isActive
              ? "text-[#8C4A27] font-semibold opacity-100"
              : "text-[#B8866B] font-medium opacity-80"
          }`}
        >
          {locale === "ta" ? route.en : route.ta}
        </span>
      </Link>
    </motion.div>
  );
};
