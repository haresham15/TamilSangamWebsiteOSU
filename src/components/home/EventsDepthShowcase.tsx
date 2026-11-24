"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { EVENTS, SangamEvent } from "@/data/events";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import type { DepthCarouselItem } from "@/components/ui/DepthCarousel";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { DialogShell } from "@/components/ui/DialogShell";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { FadeImage } from "@/components/ui/FadeImage";

const DepthCarousel = dynamic(
  () => import("@/components/ui/DepthCarousel").then((m) => m.DepthCarousel),
  {
    ssr: false,
    loading: () => <div className="w-full h-full rounded-2xl bg-[#140C20]/40" aria-hidden="true" />,
  }
);

interface EventsDepthShowcaseProps {
  className?: string;
}

export const EventsDepthShowcase: React.FC<EventsDepthShowcaseProps> = ({ className = "" }) => {
  const { locale } = useLocale();
  const { playClick } = useAudio();

  // Get the 3 existing events
  const recentEvents = useMemo(() => {
    return [...EVENTS]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeEvent: SangamEvent = recentEvents[activeIndex] || recentEvents[0];

  // Map events to DepthCarousel items
  const carouselItems: DepthCarouselItem[] = useMemo(() => {
    return recentEvents.map((evt) => ({
      image: evt.posterImage || evt.hoverImage,
      alt: evt.titleEn,
      title: locale === "ta" ? evt.titleTa : evt.titleEn,
      badge: locale === "ta" ? evt.statusBadgeTa : evt.statusBadgeEn,
      date: evt.date,
      slug: evt.slug,
      event: evt,
    }));
  }, [recentEvents, locale]);

  const handleCarouselChange = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <section className={`relative w-full py-20 sm:py-28 px-6 sm:px-12 max-w-[1600px] mx-auto select-none ${className}`}>
      {/* Section Header */}
      <CourtyardHeader
        eyebrow={locale === "ta" ? "நிகழ்வுகள் & பண்பாட்டு நினைவுகள்" : "Recent Gatherings · Campus Chronicles"}
        title={locale === "ta" ? "கல்லூரி நினைவுகள் & நிகழ்வுகள்" : "Moments On The Olentangy"}
        tamilTitle={locale !== "ta" ? "கல்லூரி நினைவுகள்" : undefined}
        description={
          locale === "ta"
            ? "ஓஹியோ ஸ்டேட் வளாகத்தில் தமிழ் சங்கம் நடத்திய மூன்று முக்கிய நிகழ்வுகளின் நேரடி ஆவணக் காட்சி."
            : "Lawn blankets on the South Oval with fresh strawberries, sizzling kothu parotta, and collaborative campus festivals captured across Columbus."
        }
        action={
          <Link
            href="/events"
            onClick={playClick}
            className="font-semibold text-sm font-sans text-[#2BB5A8] border-b-2 border-[#2BB5A8] pb-1 hover:border-[#C79347] hover:text-[#C79347] transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>{locale === "ta" ? "அனைத்து நிகழ்வுகளும் →" : "Explore All Events →"}</span>
          </Link>
        }
      />

      {/* Main Grid: Description Side Panel + Depth Carousel */}
      <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* ========================================================================= */}
        {/* 1. LEFT COLUMN: SYNCHRONIZED EVENT DESCRIPTION CARD                       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="relative text-left pr-0 lg:pr-4">

            <AnimatePresence mode="wait">
              <motion.div
                key={activeEvent.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5 text-left"
              >
                {/* Clean Editorial Eyebrow */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="uppercase tracking-widest text-[#C79347] font-semibold">
                    {locale === "ta" ? activeEvent.statusBadgeTa : activeEvent.statusBadgeEn} · {activeEvent.academicYear}
                  </span>
                  <span className="font-semibold text-[#CBBBA8]/60 tracking-wider">
                    0{activeIndex + 1} / 0{recentEvents.length}
                  </span>
                </div>

                {/* Event Titles */}
                <div className="space-y-1.5">
                  <h3 className="font-serif text-3xl sm:text-4xl text-[#FAF5ED] font-normal leading-tight tracking-tight">
                    {locale === "ta" ? activeEvent.titleTa : activeEvent.titleEn}
                  </h3>
                  <p
                    lang="ta"
                    style={{ letterSpacing: 0 }}
                    className="font-serif text-base sm:text-lg text-[#2BB5A8] font-normal"
                  >
                    {locale === "ta" ? activeEvent.titleEn : activeEvent.titleTa}
                  </p>
                </div>

                {/* Logistics Bar (Clean Bordered Hairlines) */}
                <div className="py-3.5 border-t border-b border-[rgba(212,163,106,0.25)] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-[#CBBBA8]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2BB5A8]" />
                    <span className="font-semibold text-[#FAF5ED]">{activeEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#2BB5A8]" />
                    <span>{activeEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <MapPin className="w-3.5 h-3.5 text-[#2BB5A8]" />
                    <span className="line-clamp-1">{activeEvent.location}</span>
                  </div>
                </div>

                {/* Event Description */}
                <p className="font-sans text-base text-[#CBBBA8] leading-relaxed">
                  {locale === "ta" ? activeEvent.descriptionTa : activeEvent.descriptionEn}
                </p>

                {/* Action Link */}
                <div className="pt-2">
                  <Link
                    href={`/events/${activeEvent.slug}`}
                    onClick={playClick}
                    className="group inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#2BB5A8] hover:text-[#FAF5ED] transition-colors border-b border-[#2BB5A8]/35 pb-0.5"
                  >
                    <span>{locale === "ta" ? "முழு விபரம் அறிவீர்" : "Explore Gathering"}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. RIGHT COLUMN: REACT BITS DEPTH CAROUSEL                                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 flex items-center justify-center relative min-h-[520px] sm:min-h-[580px]">
          <div className="w-full h-[520px] sm:h-[580px] relative">
            <DepthCarousel
              items={carouselItems}
              cardWidth={380}
              cardHeight={490}
              radius={14}
              depth={210}
              spread={85}
              tilt={20}
              tiltDirection="right"
              perspective={1400}
              visibleCards={4}
              falloff={0.22}
              blur={5}
              duration={650}
              ease="power3.out"
              loop
              showControls
              showIndicators
              onChange={handleCarouselChange}
            />
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. EXPANDABLE EVENT DESCRIPTION MODAL (DialogShell)                       */}
      {/* ========================================================================= */}
      <DialogShell
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tone="dark"
        size="lg"
        ariaLabel={locale === "ta" ? activeEvent.titleTa : activeEvent.titleEn}
        closeLabel="Close modal"
      >
        {/* Modal Header Banner Image */}
        <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-bg-sangam-deep">
          <FadeImage
            src={activeEvent.posterImage || activeEvent.hoverImage}
            alt={`${activeEvent.titleEn} — OSU Tamil Sangam campus event at The Ohio State University`}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover brightness-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-sangam-deep via-transparent to-bg-sangam-deep/40" />

          {/* Badge Overlay */}
          <div className="absolute top-4 left-4">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] px-3 py-1 rounded-full bg-accent-zari text-ink-earth shadow-md">
              {locale === "ta" ? activeEvent.statusBadgeTa : activeEvent.statusBadgeEn}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5 -mt-6 relative text-left">
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink-alabaster">
              {locale === "ta" ? activeEvent.titleTa : activeEvent.titleEn}
            </h3>
            <p
              lang="ta"
              style={{ letterSpacing: 0 }}
              className="font-tamil text-sm leading-[1.6] text-brand-lavender font-medium mt-0.5"
            >
              {locale === "ta" ? activeEvent.titleEn : activeEvent.titleTa}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-y border-border-zari-muted text-xs font-sans text-ink-sand">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-teal-dark shrink-0" aria-hidden="true" />
              <span className="font-medium text-ink-alabaster">{activeEvent.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-teal-dark shrink-0" aria-hidden="true" />
              <span>{activeEvent.time}</span>
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-teal-dark shrink-0" aria-hidden="true" />
              <span>{activeEvent.location} · {activeEvent.venueAddress}</span>
            </div>
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <Eyebrow tone="dark" as="p">
              {locale === "ta" ? "நிகழ்வு விளக்கம்" : "Event Chronicle"}
            </Eyebrow>
            <p className="font-sans text-sm text-ink-sand leading-relaxed">
              {locale === "ta" ? activeEvent.descriptionTa : activeEvent.descriptionEn}
            </p>
          </div>

          {/* Schedule Teaser if available */}
          {activeEvent.schedule && activeEvent.schedule.length > 0 && (
            <div className="space-y-2">
              <Eyebrow tone="dark" as="p">
                {locale === "ta" ? "நிகழ்ச்சி நிரல்" : "Program Schedule"}
              </Eyebrow>
              <ul className="divide-y divide-border-zari-muted text-xs font-sans">
                {activeEvent.schedule.slice(0, 4).map((slot, i) => (
                  <li key={i} className="flex items-start gap-3 py-2">
                    <span className="font-sans font-semibold tabular-nums text-brand-teal-dark text-[11px] shrink-0">{slot.time}</span>
                    <span className="text-ink-alabaster line-clamp-1">{locale === "ta" ? slot.activityTa : slot.activityEn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modal Footer CTA */}
          <div className="pt-4 flex items-center justify-between gap-4 border-t border-border-zari-muted">
            <span className="text-xs font-sans text-ink-sand">{activeEvent.price}</span>

            <MuttramButton
              href={`/events/${activeEvent.slug}`}
              onClick={() => {
                playClick();
                setIsModalOpen(false);
              }}
              variant="primary"
              size="md"
              onDark
            >
              {locale === "ta" ? "முழு நிகழ்வுப் பக்கம் செல்லவும்" : "Go to Full Event Page →"}
            </MuttramButton>
          </div>
        </div>
      </DialogShell>
    </section>
  );
};
