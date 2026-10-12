"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { EVENTS, SangamEvent } from "@/data/events";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { audioLayer } from "@/utils/audioLayer";
import { HeroGradientTransition } from "@/components/ui/HeroGradientTransition";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";
import dynamic from "next/dynamic";

// =========================================================================
// CRITICAL & IMMUTABLE: 3D Sodium-Vapor Amber Events Hero Scene
// HERO ANIMATIONS ARE NEVER TOUCHED OR MODIFIED UNDER ANY CIRCUMSTANCES
// =========================================================================
const EventsGen3Canvas = dynamic(
  () =>
    import("@/components/gen3/EventsGen3Canvas").then(
      (m) => m.EventsGen3Canvas
    ),
  { ssr: false }
);

export default function EventsPage() {
  const { locale } = useLocale();
  const { playClick } = useAudio();

  const [filterYear, setFilterYear] = useState<string>("all");
  const [hoveredEvent, setHoveredEvent] = useState<SangamEvent | null>(null);

  // GSAP Cursor Floating Image Coordinates
  const cursorRef = useRef<HTMLDivElement>(null);
  const xTo = useRef<((val: number) => void) | null>(null);
  const yTo = useRef<((val: number) => void) | null>(null);

  useEffect(() => {
    if (!cursorRef.current) return;

    // Center cursor card on mouse pointer
    gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50, opacity: 0 });

    xTo.current = gsap.quickTo(cursorRef.current, "x", { duration: 0.25, ease: "power3.out" });
    yTo.current = gsap.quickTo(cursorRef.current, "y", { duration: 0.25, ease: "power3.out" });

    const handlePointerMove = (e: PointerEvent) => {
      if (xTo.current && yTo.current) {
        xTo.current(e.clientX);
        yTo.current(e.clientY);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  // Update cursor image opacity when hoveredEvent changes
  useEffect(() => {
    if (!cursorRef.current) return;
    if (hoveredEvent) {
      gsap.to(cursorRef.current, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" });
    } else {
      gsap.to(cursorRef.current, { opacity: 0, scale: 0.95, duration: 0.2, ease: "power2.in" });
    }
  }, [hoveredEvent]);

  const filteredEvents = EVENTS.filter((evt) => {
    if (filterYear === "all") return true;
    return evt.academicYear.includes(filterYear);
  });

  const years = ["all", "2026-2027", "2025-2026"];

  return (
    <div className="w-full text-left bg-transparent">
      {/* 1. Cinematic Sodium-Vapor Amber Events Hero Scene - UNTOUCHED */}
      <div
        id="events-hero-trigger"
        data-hero-container="true"
        className="w-full h-[100dvh] relative z-10 overflow-hidden bg-transparent"
      >
        <EventsGen3Canvas />
      </div>

      {/* Hero to Content Gradient Transition */}
      <HeroGradientTransition variant="events" className="-mt-32 relative z-20" />

      {/* =========================================================================
          THE FLOWING RIVER: OPEN, BREATHABLE GATHERINGS LIST
          Warm Ivory (#FAF9F6), Sunbaked Sand (#F4EFE6), Charcoal Espresso (#2A2825)
          ========================================================================= */}
      <div className="relative z-20 w-full bg-[#FAF9F6] text-[#2A2825] overflow-hidden">
        {/* Floating Tactile Photo Following Mouse Cursor (Warm Organic Card) */}
        <div
          ref={cursorRef}
          aria-hidden="true"
          className="fixed top-0 left-0 pointer-events-none z-50 w-72 sm:w-96 h-52 sm:h-64 overflow-hidden rounded-2xl shadow-2xl shadow-stone-900/25 bg-white border border-[#2A2825]/10"
          style={{ willChange: "transform, opacity" }}
        >
          {hoveredEvent && (
            <div className="relative w-full h-full">
              <Image
                src={hoveredEvent.posterImage || hoveredEvent.hoverImage}
                alt={hoveredEvent.titleEn}
                fill
                className="object-cover"
                sizes="400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-sans text-white">
                <span className="font-serif font-medium truncate text-[#FAF9F6]">{hoveredEvent.titleEn}</span>
                <span className="text-[#E5A93C] shrink-0 ml-2 font-medium">{hoveredEvent.academicYear}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Container with Generous Negative Space */}
        <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
          
          {/* Centered Airy Header */}
          <CourtyardHeader
            align="center"
            eyebrow="Campus Gatherings & Almanac"
            title={locale === "ta" ? "நிகழ்வுகள் & பண்பாட்டு சந்திப்புகள்" : "The Gatherings River"}
            tamilTitle={locale !== "ta" ? "பஞ்சாங்கம் · நற்கூடல்" : undefined}
            description="Start the Aatam, Paatam, and Kondatam! From casual lawn picnics on the Oval and street food nights to spring cultural carnivals — our events are relaxed, social, and open to all students regardless of language or background."
          />

          {/* Academic Year Filter Links (Zero Pill Buttons) */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mb-20 sm:mb-28">
            {years.map((yr) => {
              const isSelected = filterYear === yr;
              return (
                <button
                  key={yr}
                  onClick={() => {
                    playClick();
                    setFilterYear(yr);
                  }}
                  className={`font-sans text-xs tracking-widest uppercase font-semibold transition-colors duration-200 cursor-pointer pb-1 ${
                    isSelected
                      ? "text-[#B85C38] border-b-2 border-[#B85C38]"
                      : "text-[#57524C] hover:text-[#2A2825] border-b-2 border-transparent"
                  }`}
                >
                  {yr === "all" ? "All Gatherings" : yr}
                </button>
              );
            })}
          </div>

          {/* Flowing Open List of Events: 1px Razor-Thin Grounding Lines, Naked Typography */}
          <div className="border-t border-[#E5DDD0] divide-y divide-[#E5DDD0]">
            {filteredEvents.map((evt) => {
              return (
                <Link
                  key={evt.slug}
                  href={`/events/${evt.slug}`}
                  onClick={playClick}
                  onMouseEnter={() => {
                    audioLayer.playTapeClack();
                    setHoveredEvent(evt);
                  }}
                  onMouseLeave={() => setHoveredEvent(null)}
                  className="group block py-14 sm:py-20 text-center relative select-none transition-colors"
                >
                  {/* Floating Date Lockup */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="font-sans text-xs sm:text-sm font-semibold text-[#B85C38] uppercase tracking-widest">
                      {evt.date}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="font-sans text-xs sm:text-sm text-[#57524C]">
                      {evt.time}
                    </span>
                  </div>

                  {/* Centered Massive Serif Event Title */}
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#2A2825] group-hover:text-[#B85C38] transition-colors leading-[1.15] tracking-tight max-w-3xl mx-auto">
                    {locale === "ta" ? evt.titleTa : evt.titleEn}
                  </h2>

                  {/* Tamil Subscript Date */}
                  <p className="mt-2 font-tamil text-sm sm:text-base text-[#E5A93C] font-medium" lang="ta">
                    {evt.tamilDate}
                  </p>

                  {/* Narrative Description & Location */}
                  <p className="mt-5 text-base sm:text-lg text-[#57524C] font-sans leading-relaxed max-w-2xl mx-auto line-clamp-2 group-hover:text-[#2A2825] transition-colors">
                    {locale === "ta" ? evt.descriptionTa : evt.descriptionEn}
                  </p>

                  <div className="mt-8 inline-flex items-center gap-2 text-xs font-sans font-semibold text-[#B85C38] group-hover:text-[#E5A93C] tracking-wider uppercase border-b border-[#B85C38] pb-0.5">
                    <span>{evt.location}</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Annual Recurring Traditions (Staggered Typographic List, Zero Beige Boxes) */}
          <div className="mt-28 sm:mt-40 space-y-12">
            <div className="text-center space-y-2">
              <span className="font-sans text-xs font-semibold text-[#B85C38] tracking-widest uppercase block">
                Recurring Cycles // ஆண்டு சுழற்சி
              </span>
              <h3 className="text-3xl sm:text-4xl font-serif font-normal text-[#2A2825]">
                Annual Campus Traditions
              </h3>
              <p className="text-base text-[#57524C] font-sans max-w-xl mx-auto">
                Signature gatherings uniting generations of Buckeyes through harvests, sparklers, and feast tables.
              </p>
            </div>

            <div className="border-t border-[#E5DDD0] divide-y divide-[#E5DDD0] text-left">
              <div className="py-10 sm:py-14 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
                <div className="md:col-span-4 space-y-1">
                  <span className="font-sans text-xs text-[#B85C38] uppercase tracking-widest font-semibold block">
                    Early Autumn · South Oval
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-serif text-[#2A2825]">Welcome Chai & Lawn Social</h4>
                </div>
                <div className="md:col-span-8">
                  <p className="text-base font-sans text-[#57524C] leading-relaxed">
                    Casual welcome mixer on the grass with filter coffee, samosas, icebreakers, and connecting freshmen with upperclassmen mentors.
                  </p>
                </div>
              </div>

              <div className="py-10 sm:py-14 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline md:pl-8">
                <div className="md:col-span-4 space-y-1">
                  <span className="font-sans text-xs text-[#E5A93C] uppercase tracking-widest font-semibold block">
                    Late Autumn · Ohio Union
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-serif text-[#2A2825]">Diwali Sparkler Night & Festive Feast</h4>
                </div>
                <div className="md:col-span-8">
                  <p className="text-base font-sans text-[#57524C] leading-relaxed">
                    Our signature autumn festival featuring authentic catered South Indian dinner, live student acoustic film jams, and sparklers on the plaza.
                  </p>
                </div>
              </div>

              <div className="py-10 sm:py-14 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
                <div className="md:col-span-4 space-y-1">
                  <span className="font-sans text-xs text-[#B85C38] uppercase tracking-widest font-semibold block">
                    Mid Winter · Campus Plaza
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-serif text-[#2A2825]">Pongal Harvest Gathering (தைப்பொங்கல்)</h4>
                </div>
                <div className="md:col-span-8">
                  <p className="text-base font-sans text-[#57524C] leading-relaxed">
                    Traditional sweet pongal pot cooking, festive kolam sidewalk chalk competitions, and celebration of the Tamil harvest season.
                  </p>
                </div>
              </div>

              <div className="py-10 sm:py-14 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline md:pl-8">
                <div className="md:col-span-4 space-y-1">
                  <span className="font-sans text-xs text-[#E5A93C] uppercase tracking-widest font-semibold block">
                    Mid Spring · Recreation Grounds
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-serif text-[#2A2825]">Namma Jathara Spring Carnival</h4>
                </div>
                <div className="md:col-span-8">
                  <p className="text-base font-sans text-[#57524C] leading-relaxed">
                    Joint collegiate carnival co-hosted with Telugu Tamasha, uniting 200+ students for Indian street food stalls, outdoor games, and dance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gateway Section to The Canvas Gallery (Organic Route Gateway) */}
          <OrganicRouteGateway
            eyebrow="35mm Memories"
            tamilEyebrow="நிழற்படம்"
            title="Step Into The Canvas Gallery"
            tamilTitle="நினைவுகள் மற்றும் கல்லூரி புகைப்படத் தொகுப்பு"
            description="Explore candid photographs from our South Oval picnics, rehearsal stages, and late-night library study breaks."
            primaryHref="/gallery"
            primaryLabel="View Photo Canvas"
            secondaryHref="/join"
            secondaryLabel="Sign the Guestbook"
          />

        </div>
      </div>
    </div>
  );
}
