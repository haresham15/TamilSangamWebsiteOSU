"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Clock, ArrowRight, X } from "lucide-react";
import { EVENTS, SangamEvent } from "@/data/events";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { DepthCarousel, DepthCarouselItem } from "@/components/ui/DepthCarousel";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";

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

  useModalScrollLock(isModalOpen, () => setIsModalOpen(false));
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Keyboard Escape listener & body scroll lock for modal
  React.useEffect(() => {
    if (!isModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isModalOpen]);

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
            className="font-semibold text-sm font-sans text-[#A6F0CF] border-b-2 border-[#A6F0CF] pb-1 hover:border-[#A6F0CF] hover:text-[#A6F0CF] transition-colors cursor-pointer inline-flex items-center gap-1.5"
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
                  <span className="uppercase tracking-widest text-[#A6F0CF] font-semibold">
                    {locale === "ta" ? activeEvent.statusBadgeTa : activeEvent.statusBadgeEn} · {activeEvent.academicYear}
                  </span>
                  <span className="font-semibold text-[#C4B7D7]/60 tracking-wider">
                    0{activeIndex + 1} / 0{recentEvents.length}
                  </span>
                </div>

                {/* Event Titles */}
                <div className="space-y-1.5">
                  <h3 className="font-serif text-3xl sm:text-4xl text-[#F4F0FA] font-normal leading-tight tracking-tight">
                    {locale === "ta" ? activeEvent.titleTa : activeEvent.titleEn}
                  </h3>
                  <p
                    lang="ta"
                    style={{ letterSpacing: 0 }}
                    className="font-serif text-base sm:text-lg text-[#A6F0CF] font-normal"
                  >
                    {locale === "ta" ? activeEvent.titleEn : activeEvent.titleTa}
                  </p>
                </div>

                {/* Logistics Bar (Clean Bordered Hairlines) */}
                <div className="py-3.5 border-t border-b border-[rgba(125,96,166,0.25)] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-[#C4B7D7]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#A6F0CF]" />
                    <span className="font-semibold text-[#F4F0FA]">{activeEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#A6F0CF]" />
                    <span>{activeEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <MapPin className="w-3.5 h-3.5 text-[#A6F0CF]" />
                    <span className="line-clamp-1">{activeEvent.location}</span>
                  </div>
                </div>

                {/* Event Description */}
                <p className="font-sans text-base text-[#C4B7D7] leading-relaxed">
                  {locale === "ta" ? activeEvent.descriptionTa : activeEvent.descriptionEn}
                </p>

                {/* Action Link */}
                <div className="pt-2">
                  <Link
                    href={`/events/${activeEvent.slug}`}
                    onClick={playClick}
                    className="group inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#A6F0CF] hover:text-[#F4F0FA] transition-colors border-b border-[#A6F0CF]/35 pb-0.5"
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
      {/* 3. EXPANDABLE EVENT DESCRIPTION MODAL (PORTALED TO DOCUMENT.BODY)         */}
      {/* ========================================================================= */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsModalOpen(false)}
                  className="absolute inset-0 bg-[#140C20]/70 backdrop-blur-md cursor-pointer"
                />

                {/* Modal Dialog Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 16 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  data-lenis-prevent
                  className="relative w-full max-w-2xl bg-[#140C20] border border-[rgba(125,96,166,0.25)] rounded-3xl shadow-2xl overflow-hidden z-10 text-left max-h-[85vh] overflow-y-auto overscroll-contain"
                >
                  {/* Modal Header Banner Image */}
                  <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-[#140C20]">
                    <Image
                      src={activeEvent.posterImage || activeEvent.hoverImage}
                      alt={`${activeEvent.titleEn} — OSU Tamil Sangam campus event at The Ohio State University`}
                      fill
                      sizes="(max-width: 768px) 100vw, 672px"
                      className="object-cover brightness-90"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#140C20] via-transparent to-black/40" />

                    {/* Close Button */}
                    <button
                      onClick={() => setIsModalOpen(false)}
                      aria-label="Close modal"
                      className="absolute top-4 right-4 w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-black/60 hover:bg-[#A6F0CF] hover:text-[#140C20] text-white flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Badge Overlay */}
                    <div className="absolute top-4 left-4">
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[#A6F0CF] text-[#140C20] shadow-md">
                        {locale === "ta" ? activeEvent.statusBadgeTa : activeEvent.statusBadgeEn}
                      </span>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 sm:p-8 space-y-5 -mt-6 relative">
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#F4F0FA]">
                        {locale === "ta" ? activeEvent.titleTa : activeEvent.titleEn}
                      </h3>
                      <p
                        lang="ta"
                        style={{ letterSpacing: 0 }}
                        className="font-tamil text-sm text-[#A6F0CF] font-medium mt-0.5"
                      >
                        {locale === "ta" ? activeEvent.titleEn : activeEvent.titleTa}
                      </p>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-y border-[rgba(125,96,166,0.25)] text-xs font-sans text-[#C4B7D7]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#A6F0CF] shrink-0" />
                        <span className="font-medium text-[#F4F0FA]">{activeEvent.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#A6F0CF] shrink-0" />
                        <span>{activeEvent.time}</span>
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#A6F0CF] shrink-0" />
                        <span>{activeEvent.location} · {activeEvent.venueAddress}</span>
                      </div>
                    </div>

                    {/* Full Description */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[#A6F0CF] font-bold">
                        {locale === "ta" ? "நிகழ்வு விளக்கம்" : "Event Chronicle"}
                      </h4>
                      <p className="font-sans text-sm text-[#C4B7D7] leading-relaxed">
                        {locale === "ta" ? activeEvent.descriptionTa : activeEvent.descriptionEn}
                      </p>
                    </div>

                    {/* Schedule Teaser if available */}
                    {activeEvent.schedule && activeEvent.schedule.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-[#F4F0FA] font-semibold">
                          {locale === "ta" ? "நிகழ்ச்சி நிரல்" : "Program Schedule"}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                          {activeEvent.schedule.slice(0, 4).map((slot, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 bg-[#25173B] rounded-lg">
                              <span className="font-mono font-bold text-[#A6F0CF] text-[11px] shrink-0">{slot.time}</span>
                              <span className="text-[#F4F0FA] line-clamp-1">{locale === "ta" ? slot.activityTa : slot.activityEn}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Modal Footer CTA */}
                    <div className="pt-4 flex items-center justify-between gap-4 border-t border-[rgba(125,96,166,0.25)]">
                      <span className="text-xs font-sans text-[#C4B7D7]">
                        {activeEvent.price}
                      </span>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/events/${activeEvent.slug}`}
                          onClick={() => {
                            playClick();
                            setIsModalOpen(false);
                          }}
                          className="px-5 py-2.5 bg-[#A6F0CF] hover:bg-[#7AE7B5] text-[#140C20] font-sans font-semibold text-xs rounded-full shadow-md transition-colors"
                        >
                          {locale === "ta" ? "முழு நிகழ்வுப் பக்கம் செல்லவும்" : "Go to Full Event Page →"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
};
