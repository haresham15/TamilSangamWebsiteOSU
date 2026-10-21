"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { DitherVeil } from "@/components/ui/DitherVeil";
import { activeUpcomingEvent, type FlagshipEventConfig } from "@/config/upcomingEvent";
import { CalendarEvent } from "@/lib/calendar/types";
import { formatEventDateDisplay, formatEventTimeET } from "@/lib/calendar/parse";
import { Calendar } from "lucide-react";
import { Magnet, SpotlightCard } from "@/components/ui/react-bits";

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

  // Optional dynamically loaded next event from Google Calendar
  const [liveEvent, setLiveEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/events")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data || !Array.isArray(data.events)) return;
        const now = Date.now();
        // Find first upcoming event
        const upcoming = data.events.find((e: CalendarEvent) => {
          const t = new Date(e.start).getTime();
          return !isNaN(t) && t >= now - 4 * 3600000; // within 4 hours of event start
        });
        if (upcoming) {
          setLiveEvent(upcoming);
        }
      })
      .catch(() => {
        // Safe fallback to hardcoded activeUpcomingEvent
      });

    return () => {
      active = false;
    };
  }, []);

  // Compute displayed values: live event if available, otherwise config default
  const title = liveEvent
    ? (locale === "ta" && liveEvent.titleTa ? liveEvent.titleTa : liveEvent.titleEn)
    : config.title;
  const tamilTitle = liveEvent
    ? (liveEvent.titleTa || config.tamilTitle)
    : config.tamilTitle;
  const description = liveEvent && liveEvent.description ? liveEvent.description : config.description;
  const displayDate = liveEvent ? formatEventDateDisplay(liveEvent.start).toUpperCase() : config.telemetry.date;
  const displayTime = liveEvent ? formatEventTimeET(liveEvent.start, liveEvent.end, liveEvent.allDay) : config.telemetry.time;
  const displayLocation = liveEvent ? liveEvent.location.toUpperCase() : config.telemetry.location;

  // Split location into primary venue name and optional street address / city if detailed
  const { venueName, venueAddress } = useMemo(() => {
    const raw = displayLocation.trim();
    const parts = raw.split(",").map((p) => p.trim());
    if (parts.length > 2) {
      const addressIdx = parts.findIndex(
        (p) => /^\d+\s+[A-Z]/i.test(p) || /^(COLUMBUS|OH|OHIO)\b/i.test(p)
      );
      if (addressIdx > 0) {
        return {
          venueName: parts.slice(0, addressIdx).join(", "),
          venueAddress: parts.slice(addressIdx).join(", "),
        };
      }
    }
    return { venueName: raw, venueAddress: "" };
  }, [displayLocation]);

  const actionHref = liveEvent
    ? (liveEvent.slug ? `/events/${liveEvent.slug}` : `/events?view=calendar&event=${encodeURIComponent(liveEvent.id)}`)
    : config.action.href;
  const icsDownloadHref = liveEvent
    ? `/api/events/${encodeURIComponent(liveEvent.id)}/ics`
    : "/calendars/yaar-andha-killer.ics";

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

      {/* 12-Column Asymmetric Grid: Dithered Installation (5 cols) + Editorial Dossier (7 cols) inside Recessed Archival Well */}
      <div className="relative w-full rounded-sm bg-[#F2EAE0]/60 p-6 sm:p-10 lg:p-12 border border-[#161210]/10 shadow-[inset_0_2px_12px_rgba(22,18,16,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-16 items-stretch">
        {/* COLS 1–5: THE DITHERED INSTALLATION */}
        <div className="lg:col-span-5 relative w-full flex flex-col justify-center">
          <SpotlightCard className="w-full bg-transparent border-0 p-0">
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
          </SpotlightCard>
        </div>

        {/* COLS 6–12: THE EDITORIAL DOSSIER */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            {/* Seasonal Preview */}
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#B85C38] block font-semibold">
                Seasonal Preview
              </span>
              <p className="font-serif italic text-lg sm:text-2xl text-[#2A2825] leading-relaxed">
                &ldquo;{config.teaserQuote}&rdquo;
              </p>
            </div>

            {/* Event Title + Tamil Sub-header */}
            <div className="space-y-2 pt-1">
              <h3 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-[#2A2825] tracking-tight leading-[1.06]">
                {title}
              </h3>
              <p
                lang="ta"
                style={{ letterSpacing: 0 }}
                className="font-serif text-2xl sm:text-3xl text-[#2A2825]/60 font-light"
              >
                {tamilTitle}
              </p>
            </div>

            {/* Narrative Essay */}
            <p className="text-base sm:text-lg font-sans text-[#57524C] leading-relaxed max-w-2xl whitespace-pre-line">
              {description}
            </p>

            {/* Telemetry Ledger */}
            <div className="pt-2 border-t border-stone-300/40 divide-y divide-stone-300/40">
              <div className="py-5 sm:py-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-6">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B85C38] font-medium shrink-0">
                  DATE
                </span>
                <span className="font-serif text-base sm:text-lg text-[#2A2825] tracking-wide sm:text-right">
                  {displayDate}
                </span>
              </div>

              <div className="py-5 sm:py-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-6">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B85C38] font-medium shrink-0">
                  TIME
                </span>
                <span className="font-serif text-base sm:text-lg text-[#2A2825] tracking-wide sm:text-right">
                  {displayTime}{" "}
                  <span className="text-xs font-sans text-[#57524C]">
                    (DOORS: {config.telemetry.doorsOpen})
                  </span>
                </span>
              </div>

              <div className="py-5 sm:py-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-6">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B85C38] font-medium shrink-0">
                  VENUE
                </span>
                <span className="font-serif text-base sm:text-lg text-[#2A2825] tracking-wide sm:text-right">
                  {venueName}
                  {venueAddress && (
                    <span className="block text-xs font-sans text-[#57524C] tracking-normal mt-0.5">
                      {venueAddress}
                    </span>
                  )}
                </span>
              </div>

              <div className="py-5 sm:py-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-6">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B85C38] font-medium shrink-0">
                  ADMISSION
                </span>
                <span className="font-serif text-base sm:text-lg text-[#2A2825] tracking-wide sm:text-right">
                  {config.telemetry.admission}
                </span>
              </div>
            </div>
          </div>

          {/* Magnetic Call to Action: Link Aligned to Canvas Bottom */}
          <div className="pt-4 border-t border-stone-300/40 sm:border-t-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Magnet padding={40} magnetStrength={2.0} maxOffset={10}>
                <Link
                  className="group inline-flex items-center gap-3 text-xl sm:text-2xl font-serif text-[#2A2825] hover:text-[#B85C38] transition-colors cursor-pointer"
                  href={actionHref}
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
              </Magnet>
              <a
                href={icsDownloadHref}
                download
                onClick={() => playClick?.()}
                className="text-xs font-mono uppercase tracking-widest text-[#B85C38] hover:text-[#2A2825] transition-colors duration-200 border-b border-[#B85C38] pb-0.5 inline-flex items-center gap-1.5"
                title="Add gathering to your calendar (.ics)"
              >
                <span>+ Add to Calendar (.ics)</span>
              </a>
            </div>

            {/* See Full Calendar Link */}
            <div className="pt-2">
              <Link
                href="/events?view=calendar"
                onClick={() => playClick?.()}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#57524C] hover:text-[#B85C38] uppercase tracking-wider transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-[#B85C38]" />
                <span>See full calendar →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NextFlagshipGathering;
