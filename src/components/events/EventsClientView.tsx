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
import { registerSystem } from "@/engine/masterTick";
import { useLiteMode } from "@/context/LiteModeContext";
import { useTier } from "@/components/providers/TierProvider";
import { useReducedMotion } from "framer-motion";
import { Calendar as CalendarIcon, List as ListIcon, Download } from "lucide-react";
import { EditorialPhotoCarousel } from "./EditorialPhotoCarousel";
import { LiveBoxOfficeTicketModule } from "./LiveBoxOfficeTicketModule";
import { PhotoVaultArchive } from "@/components/gallery/PhotoVaultArchive";
import { CulturalSection } from "@/components/ui/CulturalSection";
import { CulturalCard } from "@/components/ui/CulturalCard";
import { Eyebrow } from "@/components/muttram/Eyebrow";

// =========================================================================
// 3D Events hero (Leo forge arena), reworked in the hero-quality art pass:
// see src/components/gen3/art/ and EventsGen3Canvas (static poster + error boundary).
// =========================================================================
const EventsGen3Canvas = dynamic(
  () =>
    import("@/components/gen3/EventsGen3Canvas").then(
      (m) => m.EventsGen3Canvas
    ),
  { ssr: false }
);

interface AnnualTradition {
  when: string;
  title: string;
  titleTa?: string;
  body: string;
}

const ANNUAL_TRADITIONS: AnnualTradition[] = [
  {
    when: "Early Autumn · South Oval",
    title: "Welcome Lawn Picnic & Social",
    body: "Casual welcome mixer out on the South Oval grass with samosas, Indian snacks, cold drinks, Kahoot trivia, and connecting freshmen with mentors.",
  },
  {
    when: "Late Autumn · Ohio Union",
    title: "Diwali Sparkler Night & Festive Feast",
    body: "Our signature autumn festival featuring authentic catered South Indian dinner, live student acoustic film jams, and sparklers on the plaza.",
  },
  {
    when: "Mid Winter · Campus Plaza",
    title: "Pongal Harvest Gathering",
    titleTa: "தைப்பொங்கல்",
    body: "Traditional sweet pongal celebration, festive kolam sidewalk chalk competitions, and cultural games honoring the harvest season.",
  },
  {
    when: "Mid Spring · Recreation Grounds",
    title: "Namma Jathara Spring Carnival",
    body: "Joint collegiate carnival co-hosted with Telugu Tamasha, uniting 200+ students for Indian snacks, hot biryani, outdoor carnival games, and open dance circle.",
  },
];

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
      {/* 1. Cinematic Events hero (Leo forge arena) */}
      <HeroScrollStage
        id="events-hero-trigger"
        progressRef={eventsProgress}
        static={staticHero}
        tone="espresso"
      >
        {/* Mounted in every mode: in static mode it renders the poster and loads no 3D. */}
        <EventsGen3Canvas progressRef={eventsProgress} />
        <div
          ref={heroOverlayRef}
          className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-20 text-[#F4F0FA] pointer-events-none transition-transform will-change-[transform,opacity]"
        >
          <div role="heading" aria-level={2} className="font-display text-5xl sm:text-8xl">
            {locale === "ta" ? "நிகழ்வுகள்" : "Together, in celebration."}
          </div>
          <a href="#gatherings-river" className="pointer-events-auto mt-6 inline-flex min-h-12 items-center underline w-fit">Explore the gatherings</a>
        </div>
      </HeroScrollStage>

      {/* =========================================================================
          BAND 1 · SANDSTONE SHEET (recipe A): almanac header + ticket drop,
          then the view toggle and year filters that drive the river below.
          ========================================================================= */}
      <EditorialSheetHandoff
        id="gatherings-river"
        surface="sandstone"
        badge="CAMPUS GATHERINGS"
        sublabel="ALMANAC 2026–2027"
      >
        {/* Floating photo that follows the cursor (list view, fine pointers only) */}
        {currentView === "list" && (
          <div
            ref={cursorRef}
            aria-hidden="true"
            className="fixed top-0 left-0 pointer-events-none z-50 w-72 sm:w-96 h-52 sm:h-64 overflow-hidden rounded-2xl border border-accent-zari/30 bg-bg-sangam-deep shadow-[0_18px_48px_rgba(28,18,43,0.35)]"
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
                <div className="absolute inset-0 bg-gradient-to-t from-bg-sangam-deep/85 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between font-sans text-xs">
                  <span className="truncate font-serif font-medium text-ink-alabaster">{hoveredEvent.titleEn}</span>
                  <span className="ml-2 shrink-0 font-medium text-accent-zari">{hoveredEvent.academicYear}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
          <div className="grid gap-10 md:grid-cols-12 md:items-start">
            <div className="md:col-span-5">
              <CourtyardHeader
                eyebrow="Campus Almanac"
                title={locale === "ta" ? "நிகழ்வுகள் & பண்பாட்டு சந்திப்புகள்" : "The Gatherings River"}
                tamilTitle={locale !== "ta" ? "பஞ்சாங்கம் · நற்கூடல்" : undefined}
                titleId="gatherings-heading"
                className="mb-0! sm:mb-0!"
              />
            </div>
            <div className="md:col-span-7">
              <LiveBoxOfficeTicketModule />
            </div>
          </div>

          {/* View toggle, year filters and almanac export */}
          <div className="mt-14 flex flex-col gap-6 border-t border-border-warm pt-8 lg:flex-row lg:items-center lg:justify-between">
            <div
              role="group"
              aria-label="Event display view mode"
              className="inline-flex w-fit items-center rounded-full border border-border-warm bg-surface-card-light p-1 shadow-[0_6px_18px_rgba(91,44,134,0.09)]"
            >
              <button
                type="button"
                aria-pressed={currentView === "list"}
                onClick={() => setViewMode("list")}
                className={`inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full px-5 font-sans text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal ${
                  currentView === "list"
                    ? "bg-brand-purple text-ink-alabaster"
                    : "text-ink-umber hover:bg-brand-purple-soft hover:text-brand-purple"
                }`}
              >
                <ListIcon className="h-4 w-4" aria-hidden="true" />
                <span lang={locale === "ta" ? "ta" : undefined}>{locale === "ta" ? "பட்டியல்" : "List"}</span>
              </button>

              <button
                type="button"
                aria-pressed={currentView === "calendar"}
                onClick={() => setViewMode("calendar")}
                className={`inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full px-5 font-sans text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal ${
                  currentView === "calendar"
                    ? "bg-brand-purple text-ink-alabaster"
                    : "text-ink-umber hover:bg-brand-purple-soft hover:text-brand-purple"
                }`}
              >
                <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                <span lang={locale === "ta" ? "ta" : undefined}>{locale === "ta" ? "நாட்காட்டி" : "Calendar"}</span>
              </button>
            </div>

            {/* Academic year filters (pre-hydration clicks are queued by this inline handler) */}
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(){if(typeof window==='undefined')return;function handle(e){var b=e.target&&e.target.closest?e.target.closest('[data-event-year]'):null;if(b){var y=b.getAttribute('data-event-year');window.__pendingEventYear=y;window.dispatchEvent(new CustomEvent('event-year-select',{detail:y}));}}document.addEventListener('click',handle,true);document.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){handle(e);}},true);})();`,
              }}
            />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div role="group" aria-label="Filter gatherings by academic year" className="flex flex-wrap items-center gap-x-6">
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
                      className={`min-h-12 cursor-pointer border-b-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal ${
                        isSelected
                          ? "border-brand-purple text-brand-purple"
                          : "border-transparent text-ink-umber hover:text-brand-purple"
                      }`}
                    >
                      {yr === "all" ? "All Gatherings" : yr}
                    </button>
                  );
                })}
              </div>
              <a
                href="/calendars/almanac.ics"
                download="gatherings-almanac.ics"
                onClick={() => playClick()}
                className="inline-flex min-h-12 items-center gap-1.5 font-sans text-sm font-semibold text-brand-teal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                title="Download all Gatherings River events to your calendar"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Export almanac (.ics)</span>
              </a>
            </div>
          </div>
        </div>
      </EditorialSheetHandoff>

      {/* =========================================================================
          BAND 2 · IVORY: the river timeline (white event cards on a bronze stroke)
          or the live calendar.
          ========================================================================= */}
      <CulturalSection variant="ivory" aria-labelledby="river-heading">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <Eyebrow>Almanac 2026–2027</Eyebrow>
              <h2 id="river-heading" className="font-serif text-3xl font-normal tracking-tight text-ink-earth sm:text-4xl">
                {currentView === "calendar"
                  ? "Live calendar"
                  : filterYear === "all"
                    ? "All gatherings"
                    : `Gatherings · ${filterYear}`}
              </h2>
            </div>
            {currentView === "list" && (
              <p className="font-sans text-sm text-ink-umber" aria-live="polite">
                {filteredEvents.length} {filteredEvents.length === 1 ? "gathering" : "gatherings"}
              </p>
            )}
          </div>

          {currentView === "calendar" ? (
            <CalendarView
              initialEvents={initialCalendarData.events}
              initialError={initialCalendarData.error}
              isMock={initialCalendarData.isMock}
              subscribeUrl={initialCalendarData.subscribeUrl}
              webcalUrl={initialCalendarData.webcalUrl}
            />
          ) : (
            <div ref={riverRef} className="relative">
              <svg aria-hidden="true" viewBox="0 0 100 1000" preserveAspectRatio="none" className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-24 -translate-x-1/2 text-accent-bronze/60 lg:block" fill="none">
                <path ref={pathRef} d="M50 0 C-15 120 115 210 50 330 S-15 540 50 660 S115 880 50 1000" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" pathLength="1" strokeDasharray="1" />
              </svg>
              <ol className="relative flex flex-col gap-8 border-l border-accent-bronze/50 pl-5 sm:pl-8 lg:gap-12 lg:border-l-0 lg:pl-0">
                {filteredEvents.map((evt, index) => (
                  <CulturalCard
                    key={evt.slug}
                    as="li"
                    variant="light"
                    className={`group lg:w-5/12 ${index % 2 ? "lg:ml-auto" : ""}`}
                  >
                    <Link
                      data-cursor="view"
                      href={`/events/${evt.slug}`}
                      onClick={playClick}
                      onMouseEnter={() => {
                        audioLayer.playTapeClack();
                        if (!reducedMotion && matchMedia("(pointer: fine)").matches) setHoveredEvent(evt);
                      }}
                      onMouseLeave={() => setHoveredEvent(null)}
                      className="block rounded-2xl p-7 sm:p-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-teal"
                    >
                      <div className="mb-4 flex flex-wrap items-center gap-2 font-sans text-xs sm:text-sm">
                        <span className="font-semibold uppercase tracking-[0.14em] text-brand-purple">{evt.date}</span>
                        <span aria-hidden="true" className="text-accent-bronze">·</span>
                        <span className="text-ink-umber">{evt.time}</span>
                      </div>

                      <h3
                        lang={locale === "ta" ? "ta" : undefined}
                        className={`font-normal text-ink-earth transition-colors group-hover:text-brand-purple ${
                          locale === "ta" ? "font-tamil text-2xl leading-[1.6] sm:text-3xl" : "font-serif text-2xl leading-[1.15] tracking-tight sm:text-4xl"
                        }`}
                      >
                        {locale === "ta" ? evt.titleTa : evt.titleEn}
                      </h3>

                      <p lang="ta" className="mt-2 font-tamil text-sm leading-[1.6] text-brand-purple sm:text-base">
                        {evt.tamilDate}
                      </p>

                      <p
                        lang={locale === "ta" ? "ta" : undefined}
                        className={`mt-4 line-clamp-3 text-base text-ink-umber ${locale === "ta" ? "font-tamil leading-[1.7]" : "font-sans leading-relaxed"}`}
                      >
                        {locale === "ta" ? evt.descriptionTa : evt.descriptionEn}
                      </p>

                      <span className="mt-6 inline-flex items-center gap-1 font-sans text-sm font-semibold text-brand-teal group-hover:underline">
                        Open event dossier
                        <Magnetic className="inline-flex"><span aria-hidden="true" className="magnetic-inner inline-block p-3">→</span></Magnetic>
                      </span>
                    </Link>
                  </CulturalCard>
                ))}
              </ol>
            </div>
          )}
        </div>
      </CulturalSection>

      {/* =========================================================================
          BAND 3 · SANGAM-DEEP JEWEL (recipe D): photo carousel + the five vaults.
          ========================================================================= */}
      <CulturalSection
        variant="sangam-deep"
        divider="korvai"
        id="photo-archives"
        aria-labelledby="editorial-photo-carousel-heading"
        className="scroll-mt-24"
      >
        <div className="mx-auto max-w-7xl space-y-16 px-6 py-20 sm:px-10 sm:py-28">
          <EditorialPhotoCarousel />
          <PhotoVaultArchive />
        </div>
      </CulturalSection>

      {/* =========================================================================
          BAND 4 · SANDSTONE LEDGER (recipe B): annual campus traditions, 2×2.
          ========================================================================= */}
      <CulturalSection variant="sandstone" aria-labelledby="traditions-heading">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Eyebrow tamil="ஆண்டு சுழற்சி">Recurring cycles</Eyebrow>
              <h2 id="traditions-heading" className="font-serif text-3xl font-normal tracking-tight text-ink-earth sm:text-5xl">
                Annual Campus Traditions
              </h2>
              <p className="max-w-xl font-sans text-base leading-relaxed text-ink-umber">
                Signature gatherings uniting generations of Buckeyes through harvests, sparklers, and feast tables.
              </p>
            </div>
            <Link
              href="/events?view=calendar#gatherings-river"
              onClick={playClick}
              className="inline-flex min-h-12 shrink-0 items-center gap-1.5 font-sans text-sm font-semibold text-brand-teal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              See dates on the live calendar
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <ol className="grid gap-x-14 md:grid-cols-2">
            {ANNUAL_TRADITIONS.map((tradition, index) => (
              <li key={tradition.title} className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-border-warm py-8">
                <span aria-hidden="true" className="font-serif text-3xl leading-none text-brand-purple">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="space-y-2">
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-umber">{tradition.when}</p>
                  <h3 className="font-serif text-2xl font-normal text-ink-earth">
                    {tradition.title}
                    {tradition.titleTa && (
                      <>
                        {" "}
                        <span lang="ta" className="font-tamil text-xl leading-[1.6] text-brand-purple">
                          ({tradition.titleTa})
                        </span>
                      </>
                    )}
                  </h3>
                  <p className="font-sans text-sm leading-relaxed text-ink-umber">{tradition.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </CulturalSection>

      {/* Closer: the page's one route gateway (bottom clearance keeps the Ask Nanba pill off it on mobile) */}
      <OrganicRouteGateway
        eyebrow="Student Fellowship"
        tamilEyebrow="இணைவு"
        title="Step Into the Warm Courtyard"
        tamilTitle="பாசமிகு திண்ணையில் இணையுங்கள்"
        description="100% Free · Open to every Ohio State student and friend regardless of language. Pull up a chair and become part of our campus community."
        primaryHref="/join"
        primaryLabel="Sign the Guestbook"
        secondaryHref="/links"
        secondaryLabel="Explore Social Links"
        className="pb-24 md:pb-0"
      />
    </div>
  );
}
