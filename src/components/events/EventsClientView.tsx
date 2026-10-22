"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import gsap from "gsap";
import { EVENTS, SangamEvent } from "@/data/events";
import { CalendarResponse } from "@/lib/calendar/types";
import { CalendarView } from "@/components/calendar/CalendarView";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { audioLayer } from "@/utils/audioLayer";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { Magnetic } from "@/components/ui/Magnetic";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";
import dynamic from "next/dynamic";
import { HeroScrollStage } from "@/components/canvas/HeroScrollStage";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import { KolamSectionRule } from "@/components/ui/KolamSectionRule";
import { registerSystem } from "@/engine/masterTick";
import { useLiteMode } from "@/context/LiteModeContext";
import { useTier } from "@/components/providers/TierProvider";
import { useReducedMotion } from "framer-motion";
import { Calendar as CalendarIcon, List as ListIcon, Download } from "lucide-react";

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

interface EventsClientViewProps {
  initialCalendarData: CalendarResponse;
}

export function EventsClientView({ initialCalendarData }: EventsClientViewProps) {
  const { locale } = useLocale();
  const { playClick, playWoodClick } = useAudio();
  const eventsProgress = useRef(0);
  const { isLiteMode } = useLiteMode();
  const tier = useTier();
  const reducedMotion = useReducedMotion();
  const heroOverlayRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const staticHero = isClient ? (isLiteMode || tier === "C" || !!reducedMotion) : false;

  useEffect(() => {
    return registerSystem({
      order: 45,
      step: () => {
        if (!heroOverlayRef.current) return;
        const p = eventsProgress.current;
        const exit = Math.max(0, Math.min(1, (p - 0.72) / 0.10));
        heroOverlayRef.current.style.opacity = String(1 - exit);
        heroOverlayRef.current.style.transform = `translateY(${-24 * exit}px)`;
        heroOverlayRef.current.style.pointerEvents = exit >= 1 ? "none" : "auto";
      },
    });
  }, []);

  // View mode: 'list' or 'calendar' (default to 'list' unless ?view=calendar in URL)
  const currentView = searchParams.get("view") === "calendar" ? "calendar" : "list";

  const setViewMode = (mode: "list" | "calendar") => {
    playWoodClick();
    const params = new URLSearchParams(searchParams.toString());
    if (mode === "calendar") {
      params.set("view", "calendar");
    } else {
      params.delete("view");
      params.delete("event");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [filterYear, setFilterYear] = useState<string>("all");
  const [hoveredEvent, setHoveredEvent] = useState<SangamEvent | null>(null);

  // Support keyboard and click filtering prior to client hydration completion
  useEffect(() => {
    const onYearEvent = (e: Event) => {
      const yr = (e as CustomEvent).detail;
      if (yr) setFilterYear(yr);
    };
    const globalWin = typeof window !== "undefined" ? (window as unknown as { __pendingEventYear?: string }) : undefined;
    if (globalWin?.__pendingEventYear) {
      const pendingYear = globalWin.__pendingEventYear;
      delete globalWin.__pendingEventYear;
      queueMicrotask(() => {
        setFilterYear(pendingYear);
      });
    }
    window.addEventListener("event-year-select", onYearEvent);
    return () => window.removeEventListener("event-year-select", onYearEvent);
  }, []);

  // GSAP Cursor Floating Image Coordinates
  const riverRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const xTo = useRef<((val: number) => void) | null>(null);
  const yTo = useRef<((val: number) => void) | null>(null);

  useEffect(() => {
    if (!cursorRef.current || reducedMotion || !matchMedia("(pointer: fine)").matches) return;
    const cursor = cursorRef.current;

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
      gsap.killTweensOf(cursor);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!cursorRef.current) return;
    if (hoveredEvent) {
      gsap.to(cursorRef.current, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" });
    } else {
      gsap.to(cursorRef.current, { opacity: 0, scale: 0.95, duration: 0.2, ease: "power2.in" });
    }
  }, [hoveredEvent, reducedMotion]);

  const filteredEvents = EVENTS.filter((evt) => {
    if (filterYear === "all") return true;
    return evt.academicYear.includes(filterYear);
  });

  useEffect(() => {
    if (reducedMotion || !pathRef.current || currentView !== "list") return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => gsap.fromTo(pathRef.current,
      { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none",
        scrollTrigger: { trigger: riverRef.current, start: "top 80%", end: "bottom 60%", scrub: true, invalidateOnRefresh: true },
      }));
    return () => ctx.revert();
  }, [reducedMotion, filterYear, currentView]);

  const years = ["all", "2026-2027", "2025-2026"];

  return (
    <div className="w-full text-left bg-transparent">
      {/* 1. Cinematic Sodium-Vapor Amber Events Hero Scene - UNTOUCHED */}
      <HeroScrollStage
        id="events-hero-trigger"
        progressRef={eventsProgress}
        static={staticHero}
        tone="espresso"
      >
        {!staticHero && <EventsGen3Canvas progressRef={eventsProgress} />}
        <div
          ref={heroOverlayRef}
          className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-20 text-paper pointer-events-none transition-transform will-change-[transform,opacity]"
        >
          <h1 className="font-display text-5xl sm:text-8xl">
            {locale === "ta" ? "நிகழ்வுகள்" : "Together, in celebration."}
            <span className="sr-only"> — Campus Events &amp; Festivals | OSU Tamil Sangam at The Ohio State University</span>
          </h1>
          <a href="#gatherings-river" className="pointer-events-auto mt-6 inline-flex min-h-12 items-center underline w-fit">Explore the gatherings</a>
        </div>
      </HeroScrollStage>

      {/* =========================================================================
          THE FLOWING RIVER & LIVE CALENDAR
          Warm Ivory (#FAF9F6), Sunbaked Sand (#F4EFE6), Charcoal Espresso (#2A2825)
          Glides up as an architectural paper sheet (p = 0.84 -> 1.00)
          ========================================================================= */}
      <EditorialSheetHandoff
        id="gatherings-river"
        badge="CAMPUS GATHERINGS"
        sublabel="ALMANAC 2026–2027"
        className="text-hearth-espresso"
      >
        {/* Floating Tactile Photo Following Mouse Cursor (List View Only) */}
        {currentView === "list" && (
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
                  alt={`${hoveredEvent.titleEn} — OSU Tamil Sangam event at The Ohio State University`}
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
        )}

        {/* Content Container with Generous Negative Space */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
          {/* Central Vertical Golden-Terracotta Hairline extending from stage centerpiece */}
          <div aria-hidden="true" className="w-full flex justify-center -mt-8 mb-6">
            <div className="w-px h-12 bg-gradient-to-b from-[#D4AF37] via-[#B85C38] to-transparent" />
          </div>

          {/* Centered Airy Header */}
          <CourtyardHeader
            align="center"
            eyebrow="Campus Almanac"
            title={locale === "ta" ? "நிகழ்வுகள் & பண்பாட்டு சந்திப்புகள்" : "The Gatherings River"}
            tamilTitle={locale !== "ta" ? "பஞ்சாங்கம் · நற்கூடல்" : undefined}
          />

          {/* VIEW TOGGLE: Segmented Control (List | Calendar) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <div
              role="radiogroup"
              aria-label="Event display view mode"
              className="inline-flex items-center p-1.5 rounded-full bg-[#F4EFE6] border border-[#2A2825]/15 shadow-inner"
            >
              <button
                type="button"
                role="radio"
                aria-checked={currentView === "list"}
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer min-h-[44px] ${
                  currentView === "list"
                    ? "bg-[#FAF9F6] text-[#2A2825] shadow-sm border border-[#2A2825]/10"
                    : "text-[#57524C] hover:text-[#2A2825]"
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span>{locale === "ta" ? "பட்டியல்" : "List"}</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={currentView === "calendar"}
                onClick={() => setViewMode("calendar")}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer min-h-[44px] ${
                  currentView === "calendar"
                    ? "bg-[#FAF9F6] text-[#2A2825] shadow-sm border border-[#2A2825]/10"
                    : "text-[#57524C] hover:text-[#2A2825]"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-[#B85C38]" />
                <span>{locale === "ta" ? "நாட்காட்டி" : "Calendar"}</span>
              </button>
            </div>
          </div>

          {/* Academic Year Filter Links & Almanac Export */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){if(typeof window==='undefined')return;function handle(e){var b=e.target&&e.target.closest?e.target.closest('[data-event-year]'):null;if(b){var y=b.getAttribute('data-event-year');window.__pendingEventYear=y;window.dispatchEvent(new CustomEvent('event-year-select',{detail:y}));}}document.addEventListener('click',handle,true);document.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){handle(e);}},true);})();`,
            }}
          />
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mb-16 sm:mb-20">
            {years.map((yr) => {
              const isSelected = filterYear === yr;
              return (
                <button
                  key={yr}
                  type="button"
                  data-event-year={yr}
                  aria-pressed={isSelected}
                  onClick={() => {
                    playClick();
                    setFilterYear(yr);
                  }}
                  className={`font-sans text-xs tracking-widest uppercase font-semibold transition-colors duration-200 cursor-pointer min-h-12 pb-1 ${
                    isSelected
                      ? "text-[#B85C38] border-b-2 border-[#B85C38]"
                      : "text-[#57524C] hover:text-[#2A2825] border-b-2 border-transparent"
                  }`}
                >
                  {yr === "all" ? "All Gatherings" : yr}
                </button>
              );
            })}
            <a
              href="/calendars/almanac.ics"
              download="gatherings-almanac.ics"
              onClick={() => playClick()}
              className="font-mono text-xs tracking-widest uppercase text-[#B85C38] hover:text-[#2A2825] transition-colors duration-200 min-h-12 pb-1 inline-flex items-center gap-1.5 border-b-2 border-transparent hover:border-[#B85C38]"
              title="Download all Gatherings River events to your calendar"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Almanac (.ics)</span>
            </a>
          </div>

          {/* VIEW SWITCH: Calendar View vs River List View */}
          {currentView === "calendar" ? (
            <CalendarView
              initialEvents={initialCalendarData.events}
              initialError={initialCalendarData.error}
              isMock={initialCalendarData.isMock}
              subscribeUrl={initialCalendarData.subscribeUrl}
              webcalUrl={initialCalendarData.webcalUrl}
            />
          ) : (
            /* Flowing Open List of Events: 1px Razor-Thin Grounding Lines, Naked Typography */
            <div ref={riverRef} className="relative border-t border-hearth-espresso/20">
              <svg aria-hidden="true" viewBox="0 0 100 1000" preserveAspectRatio="none" className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-24 -translate-x-1/2 text-hearth-terracotta/50 lg:block" fill="none">
                <path ref={pathRef} d="M50 0 C-15 120 115 210 50 330 S-15 540 50 660 S115 880 50 1000" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" pathLength="1" strokeDasharray="1" />
              </svg>
              {filteredEvents.map((evt, index) => {
                return (
                  <Link
                    data-cursor="view"
                    key={evt.slug}
                    href={`/events/${evt.slug}`}
                    onClick={playClick}
                    onMouseEnter={() => {
                      audioLayer.playTapeClack();
                      if (!reducedMotion && matchMedia("(pointer: fine)").matches) setHoveredEvent(evt);
                    }}
                    onMouseLeave={() => setHoveredEvent(null)}
                    className={`group block relative py-14 sm:py-20 border-b border-hearth-espresso/20 lg:w-5/12 ${index % 2 ? "lg:ml-auto" : ""} focus-visible:outline-2 focus-visible:outline-hearth-terracotta`}
                  >
                    {/* Floating Date Lockup */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
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
                      <span>Open event dossier</span>
                      <Magnetic className="inline-flex"><span aria-hidden="true" className="magnetic-inner inline-block p-3">→</span></Magnetic>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <KolamSectionRule tone="sandstone" />

          {/* Annual Recurring Traditions (Warm Chola Sandstone Band with Recessed Specimen Cards) */}
          <div className="mt-20 sm:mt-32 -mx-6 sm:-mx-12 px-6 sm:px-12 py-20 bg-[#F2EAE0] border-y border-[#161210]/10 space-y-12 shadow-[inset_0_2px_12px_rgba(22,18,16,0.03)]">
            <div className="text-center space-y-2">
              <span className="font-sans text-xs font-semibold text-[#B85C38] tracking-widest uppercase block">
                Recurring Cycles · ஆண்டு சுழற்சி
              </span>
              <h3 className="text-3xl sm:text-4xl font-serif font-normal text-[#2A2825]">
                Annual Campus Traditions
              </h3>
              <p className="text-base text-[#57524C] font-sans max-w-xl mx-auto">
                Signature gatherings uniting generations of Buckeyes through harvests, sparklers, and feast tables.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-5xl mx-auto">
              <div className="p-8 bg-[#FAF6F0] rounded-sm border border-[#161210]/10 shadow-[0_4px_20px_rgba(22,18,16,0.04)] space-y-3">
                <span className="font-sans text-xs text-[#B85C38] uppercase tracking-widest font-semibold block">
                  Early Autumn · South Oval
                </span>
                <h4 className="text-2xl font-serif text-[#2A2825]">Welcome Chai & Lawn Social</h4>
                <p className="text-sm font-sans text-[#57524C] leading-relaxed">
                  Casual welcome mixer on the grass with filter coffee, samosas, icebreakers, and connecting freshmen with upperclassmen mentors.
                </p>
              </div>

              <div className="p-8 bg-[#FAF6F0] rounded-sm border border-[#161210]/10 shadow-[0_4px_20px_rgba(22,18,16,0.04)] space-y-3">
                <span className="font-sans text-xs text-[#E5A93C] uppercase tracking-widest font-semibold block">
                  Late Autumn · Ohio Union
                </span>
                <h4 className="text-2xl font-serif text-[#2A2825]">Diwali Sparkler Night & Festive Feast</h4>
                <p className="text-sm font-sans text-[#57524C] leading-relaxed">
                  Our signature autumn festival featuring authentic catered South Indian dinner, live student acoustic film jams, and sparklers on the plaza.
                </p>
              </div>

              <div className="p-8 bg-[#FAF6F0] rounded-sm border border-[#161210]/10 shadow-[0_4px_20px_rgba(22,18,16,0.04)] space-y-3">
                <span className="font-sans text-xs text-[#B85C38] uppercase tracking-widest font-semibold block">
                  Mid Winter · Campus Plaza
                </span>
                <h4 className="text-2xl font-serif text-[#2A2825]">Pongal Harvest Gathering (தைப்பொங்கல்)</h4>
                <p className="text-sm font-sans text-[#57524C] leading-relaxed">
                  Traditional sweet pongal pot cooking, festive kolam sidewalk chalk competitions, and celebration of the Tamil harvest season.
                </p>
              </div>

              <div className="p-8 bg-[#FAF6F0] rounded-sm border border-[#161210]/10 shadow-[0_4px_20px_rgba(22,18,16,0.04)] space-y-3">
                <span className="font-sans text-xs text-[#E5A93C] uppercase tracking-widest font-semibold block">
                  Mid Spring · Recreation Grounds
                </span>
                <h4 className="text-2xl font-serif text-[#2A2825]">Namma Jathara Spring Carnival</h4>
                <p className="text-sm font-sans text-[#57524C] leading-relaxed">
                  Joint collegiate carnival co-hosted with Telugu Tamasha, uniting 200+ students for Indian street food stalls, outdoor games, and dance.
                </p>
              </div>
            </div>
          </div>

          <KolamSectionRule tone="sandstone" />

          {/* Gateway Section to The Canvas Gallery */}
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
      </EditorialSheetHandoff>
    </div>
  );
}
