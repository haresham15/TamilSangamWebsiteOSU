"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { CulturalSection } from "@/components/ui/CulturalSection";
import { CulturalCard } from "@/components/ui/CulturalCard";
import { DitherVeil } from "@/components/ui/DitherVeil";
import { activeUpcomingEvent, type FlagshipEventConfig } from "@/config/upcomingEvent";
import { ArrowUpRight, Calendar, Sparkles } from "lucide-react";
import { SpotlightCard } from "@/components/ui/react-bits";
import { useDeviceTilt } from "@/hooks/useDeviceTilt";

export interface NextFlagshipGatheringProps {
  config?: FlagshipEventConfig;
  className?: string;
}

const RAIL_LINK =
  "group flex min-h-12 w-full items-center justify-between gap-4 py-3 font-sans text-sm font-semibold text-brand-teal transition-colors hover:text-brand-teal-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sandstone";

const LEDGER_LABEL = "font-sans text-xs font-semibold uppercase tracking-[0.14em] text-accent-zari shrink-0";
const LEDGER_VALUE = "font-serif text-base sm:text-lg text-ink-alabaster sm:text-right";

/**
 * Home band 2 (recipe E, sandstone): intro rail on the left, the flagship event
 * as one featured pathirikai card on the right.
 */
export const NextFlagshipGathering: React.FC<NextFlagshipGatheringProps> = ({
  config = activeUpcomingEvent,
  className = "",
}) => {
  const { locale } = useLocale();
  const { playClick } = useAudio();
  const {
    rotateX,
    rotateY,
    onPointerMove,
    onPointerLeave,
    containerRef: tiltFrameRef,
  } = useDeviceTilt({ maxTilt: 7, stiffness: 130, damping: 20 });

  // Compute displayed values directly from curated config
  const title = config.title;
  const tamilTitle = config.tamilTitle;
  const description = config.description;
  const displayDate = config.telemetry.date;
  const displayTime = config.telemetry.time;
  const displayLocation = config.telemetry.location;

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

  const actionHref = config.action.href;
  const icsDownloadHref =
    config.telemetry.date && !config.telemetry.date.includes("COMING SOON")
      ? `/calendars/${config.id}.ics`
      : "";

  const aspectClass =
    config.visual.aspectRatio === "square"
      ? "aspect-square"
      : config.visual.aspectRatio === "landscape"
      ? "aspect-[16/10]"
      : "aspect-[3/4]";

  return (
    <CulturalSection variant="sandstone" aria-labelledby="next-gathering-title" className={className}>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14">
        {/* Intro rail */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 self-start">
          <CourtyardHeader
            eyebrow="Upcoming Gathering"
            title={locale === "ta" ? "அடுத்த முக்கிய சங்கமம்" : "Next Flagship Gathering"}
            tamilTitle={locale !== "ta" ? "அடுத்த முக்கிய சங்கமம்" : undefined}
            description="Our calendar brings together authentic food, live performance, and fellowship beneath Columbus skies. Open to every Buckeye regardless of language or background."
            titleId="next-gathering-title"
          />

          <ul className="divide-y divide-border-warm border-y border-border-warm">
            <li>
              <Link href="/events" onClick={() => playClick?.()} className={RAIL_LINK}>
                <span className="underline decoration-brand-teal/50 decoration-2 underline-offset-[6px] group-hover:decoration-brand-teal-hover">
                  View Event Schedule
                </span>
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </li>
            <li>
              <Link href="/events?view=calendar" onClick={() => playClick?.()} className={RAIL_LINK}>
                <span className="inline-flex items-center gap-2 group-hover:underline underline-offset-[6px]">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  See full calendar
                </span>
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </li>
            <li>
              <Link href="/join" onClick={() => playClick?.()} className={RAIL_LINK}>
                <span className="group-hover:underline underline-offset-[6px]">Sign Guestbook</span>
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Featured flagship card */}
        <CulturalCard
          as="article"
          variant="pathirikai"
          aria-labelledby="flagship-event-title"
          className="lg:col-span-7 p-6 sm:p-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-8 sm:items-end">
            <div className="sm:col-span-2 w-full max-w-[16rem] sm:max-w-none">
              <SpotlightCard className="w-full bg-transparent border-0 p-0">
                <motion.div
                  ref={tiltFrameRef}
                  onPointerMove={onPointerMove}
                  onPointerLeave={onPointerLeave}
                  className={`relative w-full ${aspectClass} select-none flex items-center justify-center`}
                  style={{ rotateX, rotateY, transformPerspective: 900 }}
                >
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

            <div className="sm:col-span-3 space-y-4">
              <Eyebrow tone="dark">Seasonal Preview</Eyebrow>
              <h3
                id="flagship-event-title"
                className="text-4xl sm:text-5xl font-serif text-ink-alabaster tracking-tight leading-[1.06]"
              >
                {title}
              </h3>
              <p lang="ta" style={{ letterSpacing: 0 }} className="font-tamil text-xl sm:text-2xl leading-[1.6] text-brand-lavender">
                {tamilTitle}
              </p>
            </div>
          </div>

          <p className="mt-8 font-serif italic text-lg sm:text-xl text-ink-alabaster leading-relaxed">
            &ldquo;{config.teaserQuote}&rdquo;
          </p>
          <p className="mt-4 text-base font-sans text-ink-sand leading-relaxed whitespace-pre-line">
            {description}
          </p>

          {/* Telemetry Ledger */}
          <dl className="mt-8 border-t border-border-zari-muted divide-y divide-border-zari-muted">
            <div className="py-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5 sm:gap-6">
              <dt className={LEDGER_LABEL}>Date</dt>
              <dd className={LEDGER_VALUE}>
                <time>{displayDate}</time>
              </dd>
            </div>
            <div className="py-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5 sm:gap-6">
              <dt className={LEDGER_LABEL}>Time</dt>
              <dd className={LEDGER_VALUE}>
                {displayTime}
                {config.telemetry.doorsOpen && config.telemetry.doorsOpen !== "COMING SOON" && (
                  <span className="text-xs font-sans text-ink-sand ml-2">
                    (Doors: {config.telemetry.doorsOpen})
                  </span>
                )}
              </dd>
            </div>
            <div className="py-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5 sm:gap-6">
              <dt className={LEDGER_LABEL}>Venue</dt>
              <dd className={LEDGER_VALUE}>
                <address className="not-italic">
                  {venueName}
                  {venueAddress && (
                    <span className="block text-xs font-sans text-ink-sand mt-0.5">{venueAddress}</span>
                  )}
                </address>
              </dd>
            </div>
            <div className="py-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5 sm:gap-6">
              <dt className={LEDGER_LABEL}>Admission</dt>
              <dd className={LEDGER_VALUE}>{config.telemetry.admission}</dd>
            </div>
          </dl>

          {/* Actions */}
          <div className="mt-6 pt-6 border-t border-border-zari-muted flex flex-wrap items-center gap-x-4 gap-y-3">
            {config.signUpAction && (
              <MuttramButton
                href={config.signUpAction.href}
                external={config.signUpAction.external}
                onClick={() => playClick?.()}
                onDark
                icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
              >
                {config.signUpAction.label}
              </MuttramButton>
            )}
            <MuttramButton
              href={actionHref}
              external={config.action.external}
              onClick={() => playClick?.()}
              variant="secondary"
              onDark
            >
              {config.action.label}{" "}
              <span lang="ta" className="font-tamil text-xs leading-[1.6] opacity-80">
                ({config.action.tamilLabel})
              </span>{" "}
              <ArrowUpRight className="inline h-4 w-4 align-[-2px]" aria-hidden="true" />
            </MuttramButton>
            {icsDownloadHref && !displayDate.includes("COMING SOON") && (
              <a
                href={icsDownloadHref}
                download
                onClick={() => playClick?.()}
                className="inline-flex min-h-12 items-center font-sans text-sm font-semibold text-brand-teal-dark hover:text-brand-teal-hover-dark underline decoration-brand-teal-dark/40 underline-offset-[6px] hover:decoration-brand-teal-hover-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark rounded-sm"
                title="Add gathering to your calendar (.ics)"
              >
                Add to calendar (.ics)
              </a>
            )}
          </div>
        </CulturalCard>
      </div>
    </CulturalSection>
  );
};

export default NextFlagshipGathering;
