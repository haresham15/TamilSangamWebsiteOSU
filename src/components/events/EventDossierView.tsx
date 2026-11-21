"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Download, Calendar, Clock, MapPin, Shirt, Music2 } from "lucide-react";
import type { SangamEvent } from "@/data/events";
import { GALLERY_ALBUMS } from "@/data/gallery";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { useReducedMotion } from "framer-motion";
import { useLiteMode } from "@/context/LiteModeContext";
import { SplitText } from "./SplitText";
import { EventPhotoVault } from "./EventPhotoVault";
import { VaultCta } from "./VaultCta";
import { EditorialBackgroundCanvas } from "@/components/ui/EditorialBackgroundCanvas";
import { CulturalSection } from "@/components/ui/CulturalSection";
import { CulturalCard } from "@/components/ui/CulturalCard";
import { PathirikaiFormFrame } from "@/components/ui/PathirikaiFormFrame";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { SITE_CONFIG } from "@/data/siteConfig";

interface EventDossierViewProps {
  event: SangamEvent;
  photos: string[];
}

/**
 * Event dossier (/events/[slug]).
 * Sangam-deep hero header (frozen), then courtyard bands:
 * ivory overview + timetable, sandstone registration (when present),
 * the photo archive (alternating light band), and the peacock VaultCta.
 */
export function EventDossierView({ event, photos }: EventDossierViewProps) {
  const { locale } = useLocale();
  const { playClick } = useAudio();
  const reducedMotion = useReducedMotion();
  const { isLiteMode } = useLiteMode();
  const [downloadFeedback, setDownloadFeedback] = useState(false);

  const displayTitle = locale === "ta" ? event.titleTa : event.titleEn;
  const secondaryTitle = locale === "ta" ? event.titleEn : event.titleTa;
  const displayTagline = locale === "ta" ? event.taglineTa : event.taglineEn;
  const displayDescription = locale === "ta" ? event.descriptionTa : event.descriptionEn;
  const hasRegistration = event.slug === "namma-deepavali-2026";
  const vaultUrl =
    GALLERY_ALBUMS.find((a) => a.eventSlug === event.slug || a.slug === event.slug)?.googlePhotosUrl ||
    event.googlePhotosUrl ||
    SITE_CONFIG.googlePhotosAlbums.album2;

  const handleDownloadIcs = () => {
    try {
      playClick();
    } catch {
      // Audio optional
    }

    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OSU Tamil Sangam//Events Calendar//EN
BEGIN:VEVENT
UID:${event.slug}@osutamilsangam.org
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
SUMMARY:${event.titleEn} - OSU Tamil Sangam
DESCRIPTION:${event.descriptionEn}
LOCATION:${event.venueAddress}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${event.slug}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadFeedback(true);
    setTimeout(() => setDownloadFeedback(false), 2500);
  };

  return (
    <article className="relative w-full overflow-x-clip bg-bg-sangam-deep font-sans text-ink-alabaster selection:bg-brand-teal-dark/30">
      <EditorialBackgroundCanvas />
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-32">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-14 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/events"
            onClick={playClick}
            className="inline-flex min-h-12 items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-accent-zari transition-colors duration-200 hover:text-ink-alabaster focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Return to gatherings register</span>
          </Link>
          {event.status === "upcoming" && (
            <Link
              href="/#flagship-gathering"
              onClick={playClick}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border-zari-muted px-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-alabaster transition-colors hover:border-accent-zari hover:text-accent-zari focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent-zari" />
              <span>Home flagship showcase ↗</span>
            </Link>
          )}
        </nav>

        {/* ============================================================ */}
        {/* HEADER SECTION: ReactBits SplitText & Broadsheet Colophon   */}
        {/* ============================================================ */}
        <header className="border-b border-[#C79347]/30 pb-16 mb-20">
          {/* Metadata Flags (Naked typography with divider dots) */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono tracking-widest text-[#FAF5ED]/75 uppercase mb-6">
            <span className="text-[#C79347] font-semibold">{event.academicYear}</span>
            <span className="text-[#FAF5ED]/30">/</span>
            <span>{event.tamilDate}</span>
            {event.status === "upcoming" && (
              <>
                <span className="text-[#FAF5ED]/30">/</span>
                <span className="text-[#2BB5A8] font-semibold">UPCOMING GATHERING</span>
              </>
            )}
          </div>

          {/* Primary Massive Event Title with ReactBits SplitText */}
          <h1 lang={locale === "ta" ? "ta" : "en"} className={`text-5xl sm:text-7xl lg:text-8xl font-serif text-[#FAF5ED] mb-4 ${locale === "ta" ? "tracking-normal leading-relaxed" : "tracking-tight leading-[1.05]"}`}>
            {reducedMotion || isLiteMode ? displayTitle : <SplitText text={displayTitle} />}
          </h1>

          {/* Bilingual Secondary Subheading */}
          <p lang={locale === "ta" ? "en" : "ta"} className="text-xl sm:text-2xl font-serif text-[#D4A36A] italic leading-relaxed mb-8">
            {secondaryTitle}
          </p>

          {/* Editorial Tagline */}
          <p lang={locale === "ta" ? "ta" : "en"} className="text-lg sm:text-xl text-[#FAF5ED]/90 font-sans font-light max-w-3xl leading-relaxed mb-10">
            {displayTagline}
          </p>

          {/* Fast Spec Bar (Zero cards: pure typographic table layout) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-[#C79347]/30 text-xs font-sans">
            <div>
              <span className="block font-mono uppercase tracking-wider text-[#CBBBA8] mb-1">
                DATE
              </span>
              <p className="font-medium text-[#FAF5ED] text-sm flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#2BB5A8]" />
                {event.date}
              </p>
            </div>
            <div>
              <span className="block font-mono uppercase tracking-wider text-[#CBBBA8] mb-1">
                TIME
              </span>
              <p className="font-medium text-[#FAF5ED] text-sm flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2BB5A8]" />
                {event.time}
              </p>
            </div>
            <div>
              <span className="block font-mono uppercase tracking-wider text-[#CBBBA8] mb-1">
                LOCATION
              </span>
              <p className="font-medium text-[#FAF5ED] text-sm flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2BB5A8] shrink-0 mt-0.5" />
                <span>{event.location}</span>
              </p>
            </div>
            <div>
              <span className="block font-mono uppercase tracking-wider text-[#CBBBA8] mb-1">
                ADMISSION
              </span>
              <p className="font-serif text-[#FAF5ED] text-base">{event.price}</p>
            </div>
          </div>
        </header>
      </div>

      {/* ============================================================ */}
      {/* BAND 1 · IVORY (recipe A): overview beside a white timetable  */}
      {/* ============================================================ */}
      <CulturalSection variant="ivory" aria-labelledby="dossier-overview-heading">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-20 sm:px-10 sm:py-28 md:grid-cols-12">
          <div className="space-y-6 self-start md:sticky md:top-28 md:col-span-5">
            <h2 id="dossier-overview-heading">
              <Eyebrow>Overview</Eyebrow>
            </h2>
            <p
              lang={locale === "ta" ? "ta" : "en"}
              className={`text-xl text-ink-earth sm:text-2xl ${locale === "ta" ? "font-tamil leading-[1.7]" : "font-serif leading-relaxed"}`}
            >
              {displayDescription}
            </p>

            <div className="flex items-start gap-3 border-t border-border-warm pt-6">
              <Shirt className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" aria-hidden="true" />
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-earth">Dress note</p>
                <p
                  lang={locale === "ta" ? "ta" : "en"}
                  className={`mt-1 text-sm text-ink-umber ${locale === "ta" ? "font-tamil leading-[1.6]" : "font-sans leading-relaxed"}`}
                >
                  {locale === "ta" ? event.dressCodeTa : event.dressCodeEn}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <CulturalCard variant="light" topStripe="purple" className="p-6 sm:p-9">
              <h3 className="flex flex-wrap items-baseline gap-x-3 font-serif text-2xl font-normal text-ink-earth sm:text-3xl">
                Timetable
                <span lang="ta" className="font-tamil text-lg leading-[1.6] text-brand-purple">
                  நிரல்
                </span>
              </h3>

              <ol className="mt-6 divide-y divide-border-warm border-y border-border-warm">
                {event.schedule.map((slot, idx) => (
                  <li key={idx} className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 py-4 sm:grid-cols-[8rem_1fr]">
                    <span className="font-sans text-sm font-semibold tabular-nums text-brand-purple">{slot.time}</span>
                    <span
                      lang={locale === "ta" ? "ta" : "en"}
                      className={`text-base text-ink-earth ${locale === "ta" ? "font-tamil leading-[1.6]" : "font-sans"}`}
                    >
                      {locale === "ta" ? slot.activityTa : slot.activityEn}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <MuttramButton
                  href={event.interestFormUrl || event.ticketUrl || "https://linktr.ee/osutamilsangam"}
                  external
                  icon={<ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
                >
                  {(event.interestFormUrl || event.ticketUrl) ? "Sign up / performance form" : "Official ticketing / RSVP"}
                </MuttramButton>
                <MuttramButton
                  variant="secondary"
                  onClick={handleDownloadIcs}
                  icon={<Download className="h-4 w-4" aria-hidden="true" />}
                >
                  {downloadFeedback ? "Calendar added ✓" : "Save to calendar (.ics)"}
                </MuttramButton>
                {event.status === "upcoming" && (
                  <Link
                    href="/dance"
                    onClick={playClick}
                    className="inline-flex min-h-12 items-center gap-1.5 px-2 font-sans text-sm font-semibold text-brand-teal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                  >
                    <Music2 className="h-4 w-4" aria-hidden="true" />
                    Dance / stage sign-ups ↗
                  </Link>
                )}
              </div>
              <p role="status" className="sr-only">
                {downloadFeedback ? "Event saved to your calendar file." : ""}
              </p>
            </CulturalCard>
          </div>
        </div>
      </CulturalSection>

      {/* ============================================================ */}
      {/* BAND 2 · SANDSTONE: live Google Form registration (if any)   */}
      {/* ============================================================ */}
      {hasRegistration && (
        <CulturalSection variant="sandstone" aria-labelledby="dossier-registration-heading">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
            <div className="mb-10 space-y-3">
              <Eyebrow tamil="நிகழ்வுப் பதிவு">Registration</Eyebrow>
              <h2 id="dossier-registration-heading" className="font-serif text-3xl font-normal tracking-tight text-ink-earth sm:text-4xl">
                Sign up and register
              </h2>
            </div>
            <div className="max-w-4xl">
              <PathirikaiFormFrame
                titleEn="Official Sign-Up & Registration Form"
                titleTa="நிகழ்வுப் பதிவு படிவம்"
                formUrl={event.interestFormUrl || "https://docs.google.com/forms/d/e/1FAIpQLSes22yw_nxw1WnmTWIbgWFXsri0v-P7FB_wqkvI8XxE1epgfA/viewform"}
                embedSrc="https://docs.google.com/forms/d/e/1FAIpQLSes22yw_nxw1WnmTWIbgWFXsri0v-P7FB_wqkvI8XxE1epgfA/viewform?embedded=true"
                minHeight="720px"
              />
            </div>
          </div>
        </CulturalSection>
      )}

      {/* ============================================================ */}
      {/* BAND 3 · ARCHIVE: alternates with the band above it          */}
      {/* ============================================================ */}
      <EventPhotoVault
        eventSlug={event.slug}
        eventTitle={event.titleEn}
        scatterPhotos={photos}
        surface={hasRegistration ? "ivory" : "sandstone"}
      />

      {/* ============================================================ */}
      {/* BAND 4 · PEACOCK: the page's single Google Photos CTA        */}
      {/* ============================================================ */}
      <VaultCta googlePhotosUrl={vaultUrl} totalPhotosCount={300} />
    </article>
  );
}

export default EventDossierView;
