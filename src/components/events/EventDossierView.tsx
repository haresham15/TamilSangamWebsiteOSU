"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Download, Calendar, Clock, MapPin, Shirt, Shuffle } from "lucide-react";
import type { SangamEvent } from "@/data/events";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { useReducedMotion } from "framer-motion";
import { useLiteMode } from "@/context/LiteModeContext";
import { SplitText } from "./SplitText";
import { ParallaxScatter } from "./ParallaxScatter";
import { VaultGateway } from "./VaultGateway";

interface EventDossierViewProps {
  event: SangamEvent;
  photos: string[];
}

/**
 * The Muttram Aesthetic Event Dossier View.
 * Strict Safeguards:
 * 1. Zero Cards: No floating boxes, no drop shadows, no pill buttons.
 * 2. Raw negative space, Warm Ivory (#FAF9F6) background, Charcoal (#2A2825) typography.
 * 3. ReactBits SplitText header entrance.
 * 4. ReactBits ParallaxScatter for randomized 5-8 local photos with 0px radius.
 * 5. ReactBits VaultGateway magnetic proximity footer handoff.
 */
export function EventDossierView({ event, photos }: EventDossierViewProps) {
  const { locale } = useLocale();
  const { playClick, playCardSlide } = useAudio();
  const reducedMotion = useReducedMotion();
  const { isLiteMode } = useLiteMode();
  const [downloadFeedback, setDownloadFeedback] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState(() => [...new Set(photos)]);
  const [shuffleCount, setShuffleCount] = useState(0);

  const shuffleArchive = () => {
    playClick();
    playCardSlide();
    setSelectedPhotos(current => {
      const next = [...current];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      if (next.length > 1 && next.every((photo, index) => photo === current[index])) {
        next.push(next.shift()!);
      }
      return next;
    });
    setShuffleCount(count => count + 1);
  };

  const displayTitle = locale === "ta" ? event.titleTa : event.titleEn;
  const secondaryTitle = locale === "ta" ? event.titleEn : event.titleTa;
  const displayTagline = locale === "ta" ? event.taglineTa : event.taglineEn;
  const displayDescription = locale === "ta" ? event.descriptionTa : event.descriptionEn;

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
    <article className="w-full min-h-screen bg-paper text-hearth-espresso font-sans selection:bg-hearth-terracotta/20">
      <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-32 pb-16">
        {/* Navigation Breadcrumb (Minimal Typographic Link, No Pills) */}
        <nav aria-label="Breadcrumb" className="mb-14">
          <Link
            href="/events"
            onClick={playClick}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-hearth-terracotta hover:text-hearth-espresso transition-colors duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-hearth-terracotta" />
            <span>RETURN TO GATHERINGS REGISTER</span>
          </Link>
        </nav>

        {/* ============================================================ */}
        {/* HEADER SECTION: ReactBits SplitText & Broadsheet Colophon   */}
        {/* ============================================================ */}
        <header className="border-b border-hearth-espresso/15 pb-16 mb-20">
          {/* Metadata Flags (Naked typography with divider dots) */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono tracking-widest text-hearth-espresso/75 uppercase mb-6">
            <span className="text-hearth-terracotta font-semibold">{event.academicYear}</span>
            <span className="text-hearth-espresso/30">/</span>
            <span>{event.tamilDate}</span>
            {event.status === "upcoming" && (
              <>
                <span className="text-hearth-espresso/30">/</span>
                <span className="text-[#55CCA2] font-semibold">UPCOMING GATHERING</span>
              </>
            )}
          </div>

          {/* Primary Massive Event Title with ReactBits SplitText */}
          <h1 lang={locale === "ta" ? "ta" : "en"} className={`text-5xl sm:text-7xl lg:text-8xl font-serif text-hearth-espresso mb-4 ${locale === "ta" ? "tracking-normal leading-relaxed" : "tracking-tight leading-[1.05]"}`}>
            {reducedMotion || isLiteMode ? displayTitle : <SplitText text={displayTitle} />}
          </h1>

          {/* Bilingual Secondary Subheading */}
          <p lang={locale === "ta" ? "en" : "ta"} className="text-xl sm:text-2xl font-serif text-hearth-espresso/75 italic leading-relaxed mb-8">
            {secondaryTitle}
          </p>

          {/* Editorial Tagline */}
          <p lang={locale === "ta" ? "ta" : "en"} className="text-lg sm:text-xl text-hearth-espresso font-sans font-light max-w-3xl leading-relaxed mb-10">
            {displayTagline}
          </p>

          {/* Fast Spec Bar (Zero cards: pure typographic table layout) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-hearth-espresso/10 text-xs font-sans">
            <div>
              <span className="block font-mono uppercase tracking-wider text-hearth-espresso/75 mb-1">
                DATE
              </span>
              <p className="font-medium text-hearth-espresso text-sm flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-hearth-terracotta" />
                {event.date}
              </p>
            </div>
            <div>
              <span className="block font-mono uppercase tracking-wider text-hearth-espresso/75 mb-1">
                TIME
              </span>
              <p className="font-medium text-hearth-espresso text-sm flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-hearth-terracotta" />
                {event.time}
              </p>
            </div>
            <div>
              <span className="block font-mono uppercase tracking-wider text-hearth-espresso/75 mb-1">
                LOCATION
              </span>
              <p className="font-medium text-hearth-espresso text-sm flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-hearth-terracotta shrink-0 mt-0.5" />
                <span>{event.location}</span>
              </p>
            </div>
            <div>
              <span className="block font-mono uppercase tracking-wider text-hearth-espresso/75 mb-1">
                ADMISSION
              </span>
              <p className="font-serif text-hearth-espresso text-base">{event.price}</p>
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* EDITORIAL ESSAY & SCHEDULE (Naked Typography, Zero Cards)    */}
        {/* ============================================================ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24 items-start">
          {/* Narrative Column */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-hearth-terracotta font-semibold">
              OVERVIEW
            </h2>
            <p lang={locale === "ta" ? "ta" : "en"} className="text-xl sm:text-2xl font-serif text-hearth-espresso leading-relaxed">
              {displayDescription}
            </p>

            {/* Dress code & venue notes (Naked typographic callout) */}
            <div className="pt-6 border-t border-hearth-espresso/10 space-y-4 text-sm text-hearth-espresso/75">
              <div className="flex items-start gap-3">
                <Shirt className="w-4 h-4 text-hearth-terracotta shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-hearth-espresso block font-medium">
                    DRESS NOTE
                  </span>
                  <span>{locale === "ta" ? event.dressCodeTa : event.dressCodeEn}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Column (Broadsheet Ledger Lines) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-hearth-terracotta font-semibold">
              TIMETABLE / நிரல்
            </h2>
            <div className="divide-y divide-hearth-espresso/10 border-t border-b border-hearth-espresso/10">
              {event.schedule.map((slot, idx) => (
                <div key={idx} className="py-4 flex items-baseline justify-between gap-4">
                  <span className="text-xs font-mono text-hearth-terracotta font-semibold tracking-wider shrink-0 w-24">
                    {slot.time}
                  </span>
                  <span className="text-sm font-sans text-hearth-espresso text-left flex-1">
                    {locale === "ta" ? slot.activityTa : slot.activityEn}
                  </span>
                </div>
              ))}
            </div>

            {/* Calendar & External Action Links (Naked text anchors) */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono uppercase tracking-wider">
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="inline-flex items-center gap-1.5 text-hearth-espresso/75 hover:text-hearth-terracotta transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-hearth-terracotta" />
                <span>{downloadFeedback ? "CALENDAR ADDED ✓" : "SAVE TO CALENDAR (.ICS)"}</span>
              </button>

              <a
                href="https://linktr.ee/osutamilsangam"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-hearth-espresso/75 hover:text-hearth-terracotta transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-hearth-terracotta" />
                <span>OFFICIAL TICKETING / RSVP</span>
              </a>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* EDITORIAL PHOTO SPREAD (ReactBits Parallax Scatter)          */}
        {/* ============================================================ */}
        <section aria-label="Curated Photographic Dossier" className="mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-hearth-espresso/15 pb-4 mb-16">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif text-hearth-espresso flex items-baseline gap-3">
                <span>Selected Archive</span>
                <span lang="ta" className="text-xl sm:text-2xl font-tamil text-hearth-espresso/50 font-normal">
                  தொகுப்பு
                </span>
                <span className="text-xs font-mono text-hearth-terracotta font-semibold">
                  ({selectedPhotos.length})
                </span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={shuffleArchive}
            disabled={selectedPhotos.length < 2}
            className="mb-12 inline-flex min-h-12 items-center gap-3 border-b border-hearth-terracotta text-hearth-terracotta font-mono text-xs tracking-widest hover:text-hearth-espresso focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hearth-terracotta disabled:opacity-50"
          >
            <Shuffle aria-hidden="true" className="h-4 w-4" />
            SHUFFLE ARCHIVE
          </button>
          <p role="status" className="sr-only">{shuffleCount > 0 ? `Archive reshuffled. ${selectedPhotos.length} selected samples.` : ""}</p>

          {/* The Asymmetrical Parallax Scatter */}
          {selectedPhotos.length > 0 ? (
            <ParallaxScatter photos={selectedPhotos} eventTitle={event.titleEn} />
          ) : (
            <div className="py-24 text-center font-serif text-xl text-hearth-espresso/75 italic">
              Photographic prints being cataloged in the local vault.
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* PHASE 3: THE VAULT DOOR (ReactBits Magnetic Proximity)       */}
        {/* ============================================================ */}
        <VaultGateway
          googlePhotosUrl={event.googlePhotosUrl || "https://photos.app.goo.gl/XUS5MJz4vFRSefJa7"}
          totalPhotosCount={300}
        />
      </main>
    </article>
  );
}

export default EventDossierView;
