"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Download, Calendar, Clock, MapPin, Shirt, Music2 } from "lucide-react";
import type { SangamEvent } from "@/data/events";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { useReducedMotion } from "framer-motion";
import { useLiteMode } from "@/context/LiteModeContext";
import { SplitText } from "./SplitText";
import { EventPhotoVault } from "./EventPhotoVault";
import { VaultGateway } from "./VaultGateway";
import { EditorialBackgroundCanvas } from "@/components/ui/EditorialBackgroundCanvas";
import { KolamSectionRule } from "@/components/ui/KolamSectionRule";
import { PathirikaiFormFrame } from "@/components/ui/PathirikaiFormFrame";

interface EventDossierViewProps {
  event: SangamEvent;
  photos: string[];
}

/**
 * The Muttram Aesthetic Event Dossier View.
 * Strict Safeguards:
 * 1. Zero Cards: No floating boxes, no drop shadows, no pill buttons.
 * 2. Raw negative space, Royal Violet (#140C20) background, Off-White (#F4F0FA) typography.
 * 3. ReactBits SplitText header entrance.
 * 4. ReactBits ParallaxScatter for randomized 5-8 local photos with 0px radius.
 * 5. ReactBits VaultGateway magnetic proximity footer handoff.
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
    <article className="relative w-full min-h-screen bg-[#1C122B] text-[#FAF5ED] font-sans selection:bg-[#2BB5A8]/30 overflow-hidden">
      <EditorialBackgroundCanvas />
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-32 pb-28">
        {/* Navigation Breadcrumb (Minimal Typographic Link, No Pills) */}
        <nav aria-label="Breadcrumb" className="mb-14 flex items-center justify-between flex-wrap gap-4">
          <Link
            href="/events"
            onClick={playClick}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C79347] hover:text-[#FAF5ED] transition-colors duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C79347]" />
            <span>RETURN TO GATHERINGS REGISTER</span>
          </Link>
          {event.status === "upcoming" && (
            <Link
              href="/#flagship-gathering"
              onClick={playClick}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] text-[#FAF5ED] bg-[#271A3C] border border-[#C79347]/40 hover:border-[#C79347] px-3.5 py-1.5 rounded-full hover:text-[#C79347] transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C79347]" />
              <span>HOME FLAGSHIP SHOWCASE ↗</span>
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

        {/* ============================================================ */}
        {/* EDITORIAL ESSAY & SCHEDULE (Naked Typography, Zero Cards)    */}
        {/* ============================================================ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24 items-start">
          {/* Narrative Column */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-[#C79347] font-semibold">
              OVERVIEW
            </h2>
            <p lang={locale === "ta" ? "ta" : "en"} className="text-xl sm:text-2xl font-serif text-[#FAF5ED] leading-relaxed">
              {displayDescription}
            </p>

            {/* Dress code & venue notes (Naked typographic callout) */}
            <div className="pt-6 border-t border-[#C79347]/30 space-y-4 text-sm text-[#CBBBA8]">
              <div className="flex items-start gap-3">
                <Shirt className="w-4 h-4 text-[#C79347] shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#FAF5ED] block font-medium">
                    DRESS NOTE
                  </span>
                  <span>{locale === "ta" ? event.dressCodeTa : event.dressCodeEn}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Column (Broadsheet Ledger Lines) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-[#C79347] font-semibold">
              TIMETABLE · நிரல்
            </h2>
            <div className="divide-y divide-[#C79347]/20 border-t border-b border-[#C79347]/30">
              {event.schedule.map((slot, idx) => (
                <div key={idx} className="py-4 flex items-baseline justify-between gap-4">
                  <span className="text-xs font-mono text-[#2BB5A8] font-semibold tracking-wider shrink-0 w-24">
                    {slot.time}
                  </span>
                  <span className="text-sm font-sans text-[#FAF5ED] text-left flex-1">
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
                className="inline-flex items-center gap-1.5 text-[#FAF5ED]/80 hover:text-[#2BB5A8] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#2BB5A8]" />
                <span>{downloadFeedback ? "CALENDAR ADDED ✓" : "SAVE TO CALENDAR (.ICS)"}</span>
              </button>

              <a
                href={event.interestFormUrl || event.ticketUrl || "https://linktr.ee/osutamilsangam"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#FAF5ED]/80 hover:text-[#2BB5A8] transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-[#2BB5A8]" />
                <span>{(event.interestFormUrl || event.ticketUrl) ? "SIGN UP / PERFORMANCE FORM ↗" : "OFFICIAL TICKETING / RSVP"}</span>
              </a>

              {event.status === "upcoming" && (
                <Link
                  href="/dance"
                  onClick={playClick}
                  className="inline-flex items-center gap-1.5 text-[#2BB5A8] hover:text-[#FAF5ED] transition-colors"
                >
                  <Music2 className="w-3.5 h-3.5 text-[#2BB5A8]" />
                  <span>DANCE / STAGE SIGN-UPS ↗</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* LIVE GOOGLE FORM SIGN-UP EMBED (For Namma Deepavali)        */}
        {/* ============================================================ */}
        {event.slug === "namma-deepavali-2026" && (
          <section aria-label="Event Registration and Performance Sign-Up" className="mb-20">
            <PathirikaiFormFrame
              titleEn="Official Sign-Up & Registration Form"
              titleTa="நிகழ்வுப் பதிவு படிவம்"
              formUrl={event.interestFormUrl || "https://docs.google.com/forms/d/e/1FAIpQLSes22yw_nxw1WnmTWIbgWFXsri0v-P7FB_wqkvI8XxE1epgfA/viewform"}
              embedSrc="https://docs.google.com/forms/d/e/1FAIpQLSes22yw_nxw1WnmTWIbgWFXsri0v-P7FB_wqkvI8XxE1epgfA/viewform?embedded=true"
              minHeight="720px"
            />
          </section>
        )}

        {/* ============================================================ */}
        {/* EDITORIAL PHOTO VAULT & LIGHTBOX (Consolidated Gallery)     */}
        {/* ============================================================ */}
        <EventPhotoVault
          eventSlug={event.slug}
          eventTitle={event.titleEn}
          scatterPhotos={photos}
          googlePhotosUrl={event.googlePhotosUrl}
        />

        <KolamSectionRule tone="sandstone" />

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
