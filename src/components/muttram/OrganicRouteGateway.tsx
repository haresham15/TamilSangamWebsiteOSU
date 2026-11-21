"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useLocale } from "@/context/LocaleContext";
import { Magnet } from "@/components/ui/react-bits";
import { Eyebrow } from "./Eyebrow";

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
  "/guide": { chapter: "06", fallbackTitleEn: "Student Guide & FAQ", fallbackTitleTa: "வழிகாட்டி" },
  "/suggestions": { chapter: "07", fallbackTitleEn: "The Ideas Hearth", fallbackTitleTa: "கருத்து" },
  "/ideas": { chapter: "07", fallbackTitleEn: "The Ideas Hearth", fallbackTitleTa: "கருத்து" },
  "/join": { chapter: "08", fallbackTitleEn: "Join the Fellowship", fallbackTitleTa: "இணைவு" },
};

export const OrganicRouteGateway: React.FC<OrganicRouteGatewayProps> = ({
  title,
  tamilTitle,
  description,
  primaryHref,
  primaryLabel = "Enter Chapter",
  secondaryHref,
  secondaryLabel,
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
    <section className={`relative w-full border-t border-accent-zari/35 bg-bg-peacock-deep text-ink-alabaster overflow-hidden select-none ${className}`}>
      {/* Ambient Peacock Backdrop Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_700px_350px_at_20%_50%,rgba(91,44,134,0.18),transparent_70%)]"
        aria-hidden="true"
      />
      <Link
        href={primaryHref}
        onClick={playClick}
        onMouseEnter={playWoodClick}
        aria-label={`Next Chapter: ${displayTitle}`}
        className="group relative block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-teal-dark"
      >
        {/* Kinetic Peacock Teal Curtain Fill on Hover */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-brand-teal origin-bottom sm:origin-left scale-y-0 sm:scale-y-100 sm:scale-x-0 group-hover:scale-y-100 sm:group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
        />

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-12 py-10 sm:py-14 lg:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-400 group-hover:text-ink-alabaster">
          
          {/* Left: Chapter Index */}
          <div className="flex items-center gap-3 shrink-0">
            <span aria-hidden="true" className="w-2 h-2 rotate-45 bg-accent-zari group-hover:bg-ink-alabaster transition-colors duration-300" />
            <Eyebrow tone="peacock" className="group-hover:text-ink-alabaster transition-colors duration-300">
              Next chapter · {routeMeta.chapter}
            </Eyebrow>
          </div>

          {/* Center: Editorial Serif Headline + Tamil Script + optional one-line description */}
          <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-5">
            <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight leading-tight transition-transform duration-300 group-hover:translate-x-1 text-ink-alabaster">
              {displayTitle}
            </h3>
            {displayTamil && (
              <span
                lang="ta"
                style={{ letterSpacing: 0 }}
                className="font-tamil text-lg sm:text-xl leading-[1.6] text-brand-teal-dark group-hover:text-ink-alabaster transition-colors duration-300 shrink-0"
              >
                {displayTamil}
              </span>
            )}
          </div>

            {description && (
              <p className="max-w-2xl font-sans text-sm leading-relaxed text-ink-sand group-hover:text-ink-alabaster/90 transition-colors duration-300">
                {description}
              </p>
            )}
          </div>

          {/* Right: Action Label + Magnetic Circular Arrow */}
          <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
            <span className="hidden sm:inline-block font-sans text-sm font-medium text-ink-sand group-hover:text-ink-alabaster transition-colors duration-300">
              {primaryLabel}
            </span>
            <Magnet magnetStrength={2.5} maxOffset={10}>
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full border border-border-zari-muted group-hover:border-accent-zari flex items-center justify-center bg-surface-card-peacock group-hover:bg-bg-peacock-deep text-ink-alabaster group-hover:text-brand-teal-dark shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-[background-color,border-color,color,box-shadow,transform] duration-200">
                <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Magnet>
          </div>

        </div>
      </Link>
      {secondaryHref && secondaryLabel && (
        <div className="relative z-10 mx-auto w-full max-w-[1600px] border-t border-border-zari-muted px-6 py-4 sm:px-12">
          <Link
            href={secondaryHref}
            onClick={playClick}
            className="inline-flex min-h-12 items-center gap-1.5 font-sans text-sm font-semibold text-brand-teal-dark underline decoration-brand-teal-dark/30 underline-offset-4 transition-colors hover:decoration-brand-teal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
          >
            {secondaryLabel}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
};
