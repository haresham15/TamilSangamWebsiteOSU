"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useLocale } from "@/context/LocaleContext";

export interface OrganicRouteGatewayProps {
  eyebrow?: string;
  tamilEyebrow?: string;
  title: string;
  tamilTitle?: string;
  description?: string;
  primaryHref: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
}

const ROUTE_CHAPTER_MAP: Record<string, { chapter: string; fallbackTitleEn: string; fallbackTitleTa: string }> = {
  "/": { chapter: "01", fallbackTitleEn: "The Hearth", fallbackTitleTa: "முகப்பு" },
  "/events": { chapter: "02", fallbackTitleEn: "The Gatherings River", fallbackTitleTa: "நிகழ்வுகள்" },
  "/about": { chapter: "03", fallbackTitleEn: "The Sangam Epic", fallbackTitleTa: "அறிமுகம்" },
  "/board": { chapter: "04", fallbackTitleEn: "The Executive Board", fallbackTitleTa: "அவை" },
  "/gallery": { chapter: "05", fallbackTitleEn: "The Canvas", fallbackTitleTa: "நினைவுகள்" },
  "/guide": { chapter: "06", fallbackTitleEn: "Student Guide & FAQ", fallbackTitleTa: "வழிகாட்டி" },
  "/suggestions": { chapter: "07", fallbackTitleEn: "The Ideas Hearth", fallbackTitleTa: "கருத்து" },
  "/ideas": { chapter: "07", fallbackTitleEn: "The Ideas Hearth", fallbackTitleTa: "கருத்து" },
  "/join": { chapter: "08", fallbackTitleEn: "Join the Fellowship", fallbackTitleTa: "இணைவு" },
};

export const OrganicRouteGateway: React.FC<OrganicRouteGatewayProps> = ({
  title,
  tamilTitle,
  primaryHref,
  primaryLabel = "Enter Chapter",
  className = "",
}) => {
  const { playClick, playWoodClick } = useAudio();
  const { locale } = useLocale();

  const routeMeta = ROUTE_CHAPTER_MAP[primaryHref] || {
    chapter: "02",
    fallbackTitleEn: title,
    fallbackTitleTa: tamilTitle || "அடுத்த அத்தியாயம்",
  };

  const displayTitle = title || (locale === "ta" ? routeMeta.fallbackTitleTa : routeMeta.fallbackTitleEn);
  const displayTamil = tamilTitle || (locale !== "ta" ? routeMeta.fallbackTitleTa : undefined);

  return (
    <section className={`relative w-full border-t border-[#161210]/15 bg-[#FAF9F6] text-[#161210] overflow-hidden select-none ${className}`}>
      <Link
        href={primaryHref}
        onClick={playClick}
        onMouseEnter={playWoodClick}
        aria-label={`Next Chapter: ${displayTitle}`}
        className="group relative block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C85A32]"
      >
        {/* Kinetic Terracotta Curtain Fill on Hover */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#C85A32] origin-bottom sm:origin-left scale-y-0 sm:scale-y-100 sm:scale-x-0 group-hover:scale-y-100 sm:group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
        />

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-12 py-10 sm:py-14 lg:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-400 group-hover:text-[#FAF7F2]">
          
          {/* Left: Chapter Index */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#B85C38] group-hover:bg-[#E5A93C] transition-colors duration-300" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#57524C] group-hover:text-[#FAF7F2]/80 transition-colors duration-300">
              NEXT CHAPTER // {routeMeta.chapter}
            </span>
          </div>

          {/* Center: Editorial Serif Headline + Tamil Script */}
          <div className="flex-1 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-5 min-w-0">
            <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight leading-tight transition-transform duration-300 group-hover:translate-x-1">
              {displayTitle}
            </h3>
            {displayTamil && (
              <span
                lang="ta"
                style={{ letterSpacing: 0 }}
                className="font-tamil text-lg sm:text-xl text-[#B85C38] group-hover:text-[#FAF7F2]/90 transition-colors duration-300 shrink-0"
              >
                {displayTamil}
              </span>
            )}
          </div>

          {/* Right: Action Label + Magnetic Circular Arrow */}
          <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
            <span className="hidden sm:inline-block font-mono text-xs uppercase tracking-wider text-[#57524C] group-hover:text-[#FAF7F2]/80 transition-colors duration-300">
              {primaryLabel}
            </span>
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-[#161210]/15 group-hover:border-white/40 flex items-center justify-center bg-white/70 group-hover:bg-white text-[#161210] group-hover:text-[#C85A32] shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
              <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>

        </div>
      </Link>
    </section>
  );
};
