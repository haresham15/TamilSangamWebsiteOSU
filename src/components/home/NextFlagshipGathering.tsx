"use client";

import React from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { DitherVeil } from "@/components/ui/DitherVeil";
import { activeUpcomingEvent, type FlagshipEventConfig } from "@/config/upcomingEvent";

export interface NextFlagshipGatheringProps {
  config?: FlagshipEventConfig;
  className?: string;
}

export const NextFlagshipGathering: React.FC<NextFlagshipGatheringProps> = ({
  config = activeUpcomingEvent,
  className = "",
}) => {
  const { locale } = useLocale();
  const { playClick } = useAudio();
  const reduced = useReducedMotion();
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 130, damping: 20 });
  const rotateY = useSpring(tiltY, { stiffness: 130, damping: 20 });

  const aspectClass =
    config.visual.aspectRatio === "square"
      ? "aspect-square"
      : config.visual.aspectRatio === "landscape"
      ? "aspect-[16/10]"
      : "aspect-[3/4]";

  return (
    <section
      id="flagship-gathering"
      className={`relative w-full py-24 sm:py-32 px-6 sm:px-12 max-w-[1600px] mx-auto ${className}`.trim()}
    >
      {/* Architectural Courtyard Section Header */}
      <CourtyardHeader
        eyebrow="Upcoming Gathering"
        title={locale === "ta" ? "அடுத்த முக்கிய சங்கமம்" : "Next Flagship Gathering"}
        tamilTitle={locale !== "ta" ? "அடுத்த முக்கிய சங்கமம்" : undefined}
        description="Our calendar brings together authentic food, live performance, and fellowship beneath Columbus skies. Open to every Buckeye regardless of language or background."
      />

      {/* 12-Column Asymmetric Grid: Dithered Installation (5 cols) + Editorial Dossier (7 cols) */}
      <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-16 items-stretch border-b border-[#E5DDD0] pb-24 sm:pb-32">
        {/* COLS 1–5: THE DITHERED INSTALLATION (Pure Negative Space, 100% Transparent, Zero Badges/Footnotes) */}
        <div className="lg:col-span-5 relative w-full flex flex-col justify-center">
          <motion.div
            onPointerMove={(event) => {
              if (reduced || event.pointerType !== "mouse") return;
              const box = event.currentTarget.getBoundingClientRect();
              tiltX.set((0.5 - (event.clientY - box.top) / box.height) * 6);
              tiltY.set(((event.clientX - box.left) / box.width - 0.5) * 6);
            }}
            onPointerLeave={() => { tiltX.set(0); tiltY.set(0); }}
            className={`relative w-full ${aspectClass} border border-hearth-espresso/20 p-5 select-none`}
            style={{ rotateX, rotateY, transformPerspective: 900 }}
          >
            {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((position) => <span key={position} aria-hidden="true" className={`absolute ${position} font-mono text-hearth-terracotta`}>+</span>)}
            <DitherVeil
              imageSrc={config.visual.silhouetteSrc}
              veilColor={config.visual.dither.veilColor}
              shadowColor={config.visual.dither.shadowColor}
              matrixSize={config.visual.dither.matrixSize}
              grainScale={config.visual.dither.grainScale}
              noiseIntensity={config.visual.dither.noiseIntensity}
              interactive={config.visual.dither.interactive}
              className="w-full h-full"
            />
          </motion.div>
          <p className="mt-4 font-mono text-[10px] tracking-wider text-hearth-espresso/60">COLUMBUS · 40.0067 N, 83.0305 W</p>
        </div>

        {/* COLS 6–12: THE EDITORIAL DOSSIER (Even Baseline Alignment with Canvas) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            {/* 01 // Seasonal Teaser */}
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#B85C38] block font-semibold">
                01 // SEASONAL TEASER
              </span>
              <p className="font-serif italic text-lg sm:text-2xl text-[#2A2825] leading-relaxed">
                &ldquo;{config.teaserQuote}&rdquo;
              </p>
            </div>

            {/* Event Title + Tamil Sub-header */}
            <div className="space-y-2 pt-1">
              <h3 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-[#2A2825] tracking-tight leading-[1.06]">
                {config.title}
              </h3>
              <p
                lang="ta"
                style={{ letterSpacing: 0 }}
                className="font-serif text-2xl sm:text-3xl text-[#2A2825]/60 font-light"
              >
                {config.tamilTitle}
              </p>
            </div>

            {/* Narrative Essay */}
            <p className="text-base sm:text-lg font-sans text-[#57524C] leading-relaxed max-w-2xl">
              {config.description}
            </p>

            {/* Telemetry Ledger (Faint 1px Grounding Rule, generous vertical breathing space) */}
            <div className="pt-2 border-t border-stone-300/40 divide-y divide-stone-300/40">
              <div className="py-5 sm:py-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B85C38] font-medium">
                  DATE
                </span>
                <span className="font-serif text-base sm:text-lg text-[#2A2825] tracking-wide">
                  {config.telemetry.date}
                </span>
              </div>

              <div className="py-5 sm:py-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B85C38] font-medium">
                  TIME
                </span>
                <span className="font-serif text-base sm:text-lg text-[#2A2825] tracking-wide">
                  {config.telemetry.time}{" "}
                  <span className="text-xs font-sans text-[#57524C]">
                    (DOORS: {config.telemetry.doorsOpen})
                  </span>
                </span>
              </div>

              <div className="py-5 sm:py-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B85C38] font-medium">
                  VENUE
                </span>
                <span className="font-serif text-base sm:text-lg text-[#2A2825] tracking-wide">
                  {config.telemetry.location}
                </span>
              </div>

              <div className="py-5 sm:py-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B85C38] font-medium">
                  ADMISSION
                </span>
                <span className="font-serif text-base sm:text-lg text-[#2A2825] tracking-wide">
                  {config.telemetry.admission}
                </span>
              </div>
            </div>
          </div>

          {/* Magnetic Call to Action: Borderless Typographic Link Aligned to Canvas Bottom */}
          <div className="pt-4 border-t border-stone-300/40 sm:border-t-0 flex flex-wrap items-center justify-between gap-4">
            <Link
              className="group inline-flex items-center gap-3 text-xl sm:text-2xl font-serif text-[#2A2825] hover:text-[#B85C38] transition-colors cursor-pointer"
              href={config.action.href}
              target={config.action.external ? "_blank" : undefined}
              rel={config.action.external ? "noopener noreferrer" : undefined}
              onClick={() => playClick?.()}
            >
              <span>{config.action.label}</span>
              <span className="text-sm font-sans opacity-50">
                ({config.action.tamilLabel})
              </span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </Link>
            <a
              href="/calendars/kollywood-kollai.ics"
              download="kollywood-kollai.ics"
              onClick={() => playClick?.()}
              className="text-xs font-mono uppercase tracking-widest text-[#B85C38] hover:text-[#2A2825] transition-colors duration-200 border-b border-[#B85C38] pb-0.5 inline-flex items-center gap-1.5"
              title="Add Kollywood Kollai to your calendar"
            >
              <span>+ Add to Calendar (.ics)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NextFlagshipGathering;
