"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CURRENT_BOARD, SUBCOMMITTEE_MEMBERS, BoardMember } from "@/data/board";
import { SITE_CONFIG } from "@/data/siteConfig";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import {
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";
import CountUp from "@/components/CountUp";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import { CulturalSection } from "@/components/ui/CulturalSection";
import { CulturalCard } from "@/components/ui/CulturalCard";
import { PronounceableQuote } from "@/components/ui/PronounceableQuote";
import { HeroKolamLoader } from "@/components/ui/HeroKolamLoader";

const BoardHeroCanvas = dynamic(
  () => import("@/components/board/BoardHeroCanvas").then((m) => m.BoardHeroCanvas),
  {
    ssr: false,
    loading: () => <HeroKolamLoader route="/board" />,
  }
);

const CONTAINER = "mx-auto w-full max-w-7xl px-6 sm:px-10";
const BAND = "py-20 sm:py-28";
const FOCUS_DARK =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sangam-deep";
const FOCUS_LIGHT =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-ivory";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("");

/**
 * Framed portrait, or a zari-framed sculpted monogram when no photo exists.
 */
function OfficerPortraitMedia({
  member,
  index,
  className = "",
}: {
  member: BoardMember;
  index: number;
  className?: string;
}) {
  const hasPhoto = member.photoUrl && member.photoUrl !== "/emblem.svg";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-accent-zari/40 bg-gradient-to-b from-surface-card-dark to-bg-sangam-deep shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)] ${className}`}
    >
      {hasPhoto ? (
        <div className="relative w-full h-full min-h-[16rem]">
          <Image
            src={member.photoUrl}
            alt={member.nameEn}
            fill
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 450px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-sangam-deep/60 via-transparent to-transparent pointer-events-none" />
        </div>
      ) : (
        <div className="relative w-full h-full min-h-[16rem] grid place-items-center select-none overflow-hidden">
          {/* Zari monogram frame */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full opacity-30 pointer-events-none text-accent-zari"
            viewBox="0 0 200 200"
            fill="none"
          >
            <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="58" stroke="currentColor" strokeWidth="1" />
            <circle cx="100" cy="100" r="42" stroke="currentColor" strokeWidth="0.75" />
            <line x1="100" y1="15" x2="100" y2="185" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
            <line x1="15" y1="100" x2="185" y2="100" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
          </svg>

          <span
            role="img"
            aria-label={`${member.nameEn} monogram`}
            className="relative z-[2] font-serif text-6xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-accent-zari drop-shadow-[0_4px_12px_rgba(212,163,106,0.3)]"
          >
            {initialsOf(member.nameEn)}
          </span>
        </div>
      )}

      {/* Plaque footer */}
      <div className="absolute bottom-0 inset-x-0 z-10 flex items-center justify-between border-t border-accent-zari/30 bg-bg-sangam-deep/95 px-3.5 py-1.5 text-xs text-ink-alabaster/90">
        <span className="font-sans font-semibold text-accent-zari">
          {String(index + 1).padStart(2, "0")} · {member.term}
        </span>
        <span lang="ta" className="max-w-[55%] truncate font-tamil text-xs leading-[1.6] tracking-normal text-ink-alabaster">
          {member.nameTa}
        </span>
      </div>
    </div>
  );
}

export function BoardClient() {
  const { locale } = useLocale();
  const { playClick, playMarimba } = useAudio();
  const reduceMotion = useReducedMotion();
  const [hoveredMember, setHoveredMember] = useState<BoardMember>(CURRENT_BOARD[0]);
  const [expandedMobileId, setExpandedMobileId] = useState<string>(CURRENT_BOARD[0].id);
  const officersRef = useRef<HTMLUListElement>(null);
  const userPinnedRef = useRef<number>(0);

  const currentIndex = CURRENT_BOARD.findIndex((m) => m.id === hoveredMember.id);

  const selectMember = useCallback((member: BoardMember, isClick = false) => {
    setHoveredMember(member);
    setExpandedMobileId(member.id);
    if (isClick) {
      userPinnedRef.current = typeof window !== "undefined" ? window.performance.now() : 0;
      playClick();
    }
  }, [playClick]);

  const navigateOfficer = useCallback((direction: "prev" | "next") => {
    playClick();
    userPinnedRef.current = typeof window !== "undefined" ? window.performance.now() : 0;
    const nextIdx =
      direction === "next"
        ? (currentIndex + 1) % CURRENT_BOARD.length
        : (currentIndex - 1 + CURRENT_BOARD.length) % CURRENT_BOARD.length;
    const nextMember = CURRENT_BOARD[nextIdx];
    setHoveredMember(nextMember);
    setExpandedMobileId(nextMember.id);

    // Smoothly scroll the corresponding officer row into view in the list
    const targetRow = officersRef.current?.querySelector(`[data-officer-id="${nextMember.id}"]`);
    targetRow?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
  }, [currentIndex, playClick, reduceMotion]);

  useEffect(() => {
    const rows = officersRef.current?.querySelectorAll<HTMLButtonElement>("[data-officer-id]");
    if (!rows) return;
    const visible = new Map<Element, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.set(entry.target, entry);
          else visible.delete(entry.target);
        });

        // If the user manually clicked within the last 3.5 seconds, don't let scroll-jitter flip their selection
        const now = Date.now();
        if (userPinnedRef.current && now - userPinnedRef.current < 3500) {
          return;
        }

        const nearest = [...visible.values()].sort(
          (a, b) =>
            Math.abs(a.target.getBoundingClientRect().top - window.innerHeight * 0.35) -
            Math.abs(b.target.getBoundingClientRect().top - window.innerHeight * 0.35)
        )[0];

        const id = (nearest?.target as HTMLElement | undefined)?.dataset.officerId;
        const member = CURRENT_BOARD.find((item) => item.id === id);
        if (member) {
          setHoveredMember(member);
          setExpandedMobileId(member.id);
        }
      },
      { rootMargin: "-10% 0px -30% 0px", threshold: [0, 0.25, 0.5] }
    );

    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  const stats = [
    { label: "Buckeye Members", value: <><CountUp to={120} duration={2} />+</> },
    { label: "Executive Officers", value: <CountUp to={CURRENT_BOARD.length} duration={1.5} /> },
    { label: "Campus Galas & Events", value: <CountUp to={14} duration={1.8} /> },
    {
      label: "Est. at Ohio State",
      value: <CountUp to={Number(SITE_CONFIG.informalFoundingYear)} from={2000} duration={2.2} separator="" />,
    },
  ];

  return (
    <div className="w-full text-left bg-transparent">
      <div id="board-hero-trigger" data-hero-container="true" className="relative z-10 w-full">
        <BoardHeroCanvas bezel={null} />
      </div>

      <EditorialSheetHandoff
        badge="EXECUTIVE LEADERSHIP"
        sublabel="OFFICERS 2026–2027"
        surface="ivory"
        overflowClass="overflow-x-clip"
      >
        {/* 1 · Ivory · Stats ledger row + officer split-view */}
        <section aria-labelledby="board-heading" className={`${CONTAINER} ${BAND} scroll-mt-32`}>
          <CourtyardHeader
            align="left"
            titleId="board-heading"
            title={locale === "ta" ? "நிர்வாகக் குழு & வழிகாட்டிகள்" : "The Executive Board"}
            tamilTitle={locale !== "ta" ? "ஆளுமை · மாணவர் தலைமை" : undefined}
          />

          {/* Unboxed stats ledger */}
          <dl
            aria-label="Tamil Sangam at a glance"
            className="grid grid-cols-2 md:grid-cols-4 border-y border-border-warm divide-border-warm md:divide-x"
          >
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col-reverse gap-1 py-6 md:px-6 md:first:pl-0 ${
                  i < 2 ? "border-b border-border-warm md:border-b-0" : ""
                } ${i % 2 === 1 ? "pl-6 border-l border-border-warm md:border-l-0" : ""}`}
              >
                <dt className="font-sans text-xs font-semibold uppercase tracking-[0.14em] leading-[1.6] text-ink-umber">
                  {stat.label}
                </dt>
                <dd className="font-serif text-4xl sm:text-5xl font-light leading-none text-brand-purple">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-14 sm:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Desktop sticky spotlight */}
            <aside
              className="hidden lg:block lg:col-span-5 lg:sticky lg:top-28 self-start z-20 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto"
              aria-label="Selected officer dossier"
              data-testid="officer-portrait"
            >
              <CulturalCard variant="pathirikai" className="p-6">
                <div className="mb-4 flex items-center justify-between border-b border-border-zari-muted pb-3 select-none">
                  <Eyebrow tone="dark">{locale === "ta" ? "நிர்வாக ஆவணம்" : "Officer dossier"}</Eyebrow>
                  <div className="flex items-center gap-1">
                    <span className="mr-1 font-sans text-xs tabular-nums text-ink-sand">
                      {String(currentIndex + 1).padStart(2, "0")} / {String(CURRENT_BOARD.length).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigateOfficer("prev")}
                      aria-label="Previous officer profile"
                      className={`inline-grid size-12 place-items-center rounded-full text-ink-sand transition-colors hover:bg-surface-card-dark hover:text-ink-alabaster ${FOCUS_DARK}`}
                    >
                      <ChevronLeft className="size-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateOfficer("next")}
                      aria-label="Next officer profile"
                      className={`inline-grid size-12 place-items-center rounded-full text-ink-sand transition-colors hover:bg-surface-card-dark hover:text-ink-alabaster ${FOCUS_DARK}`}
                    >
                      <ChevronRight className="size-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={hoveredMember.id}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
                    transition={{ duration: reduceMotion ? 0 : 0.22 }}
                    className="space-y-4"
                  >
                    <OfficerPortraitMedia member={hoveredMember} index={currentIndex} className="h-64 sm:h-72" />

                    <div className="space-y-2 pt-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-lavender">
                          {hoveredMember.roleEn}
                        </span>
                        <span className="font-sans text-xs text-ink-sand">{hoveredMember.term}</span>
                      </div>

                      <p lang="ta" className="font-tamil text-sm font-medium leading-[1.6] tracking-normal text-accent-bronze-dark">
                        {hoveredMember.roleTa} · {hoveredMember.nameTa}
                      </p>

                      <h3 className="font-serif text-3xl font-normal leading-tight text-ink-alabaster">
                        {hoveredMember.nameEn}
                      </h3>

                      <p className="font-sans text-xs italic text-ink-sand">
                        {locale === "ta" ? hoveredMember.committeeTa : hoveredMember.committeeEn}
                      </p>

                      <p
                        className={`pt-1 text-sm text-ink-alabaster/90 ${
                          locale === "ta" ? "font-tamil leading-[1.7] tracking-normal" : "font-sans leading-relaxed"
                        }`}
                        lang={locale === "ta" ? "ta" : undefined}
                      >
                        {locale === "ta" ? hoveredMember.bioTa : hoveredMember.bioEn}
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-border-zari-muted pt-3">
                      <Eyebrow tone="dark" as="p">
                        {locale === "ta" ? "முக்கியப் பொறுப்புகள்" : "Key responsibilities"}
                      </Eyebrow>
                      <ul className="space-y-1.5 text-sm text-ink-alabaster/90">
                        {(locale === "ta" ? hoveredMember.responsibilitiesTa : hoveredMember.responsibilitiesEn).map(
                          (resp, i) => (
                            <li
                              key={i}
                              lang={locale === "ta" ? "ta" : undefined}
                              className={`flex items-start gap-2 ${locale === "ta" ? "font-tamil leading-[1.7]" : "leading-relaxed"}`}
                            >
                              <span aria-hidden="true" className="mt-0.5 select-none text-accent-zari">❖</span>
                              <span>{resp}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {hoveredMember.quote && (
                      <PronounceableQuote
                        tamilText={hoveredMember.quote}
                        label={`Cultural Quote: ${hoveredMember.quote}. Click to hear pronunciation.`}
                        tone="gold"
                        badgePosition="inline"
                        className="block p-0.5"
                      >
                        <blockquote className="border-l-2 border-accent-zari py-1 pl-4 pr-10 font-serif text-sm italic leading-relaxed text-ink-alabaster">
                          &ldquo;{hoveredMember.quote}&rdquo;
                        </blockquote>
                      </PronounceableQuote>
                    )}

                    <div className="flex flex-wrap items-center gap-2 border-t border-border-zari-muted pt-3">
                      <a
                        href={"mailto:" + hoveredMember.email}
                        className={`inline-flex min-h-12 items-center gap-2 rounded-full border border-border-zari-muted px-4 font-sans text-sm text-ink-alabaster transition-colors hover:border-accent-zari ${FOCUS_DARK}`}
                      >
                        <Mail className="size-4 shrink-0 text-brand-teal-dark" aria-hidden="true" />
                        <span>{hoveredMember.email}</span>
                      </a>
                      {hoveredMember.instagram && (
                        <a
                          href={"https://instagram.com/" + hoveredMember.instagram.replace("@", "")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex min-h-12 items-center gap-2 rounded-full border border-border-zari-muted px-4 font-sans text-sm text-ink-alabaster transition-colors hover:border-accent-zari ${FOCUS_DARK}`}
                        >
                          <InstagramIcon className="size-4 shrink-0 text-brand-teal-dark" />
                          <span>{hoveredMember.instagram}</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </CulturalCard>
            </aside>

            {/* Officer directory rows */}
            <ul ref={officersRef} className="lg:col-span-7 space-y-3" aria-label="Executive officers">
              {CURRENT_BOARD.map((member, index) => {
                const isSelected = hoveredMember.id === member.id;
                const isMobileExpanded = expandedMobileId === member.id;
                const hasPhoto = member.photoUrl && member.photoUrl !== "/emblem.svg";

                return (
                  <li
                    key={member.id}
                    className={`overflow-hidden rounded-xl border border-l-[3px] transition-[background-color,border-color,box-shadow] duration-200 ${
                      isSelected
                        ? "border-border-warm border-l-brand-purple bg-brand-purple-soft shadow-[0_10px_30px_rgba(91,44,134,0.09)]"
                        : "border-border-warm border-l-transparent bg-surface-card-light hover:border-l-brand-purple/40"
                    }`}
                  >
                    <button
                      type="button"
                      data-officer-id={member.id}
                      aria-pressed={isSelected}
                      onMouseEnter={() => {
                        playMarimba();
                        selectMember(member, false);
                      }}
                      onFocus={() => selectMember(member, false)}
                      onClick={() => {
                        selectMember(member, true);
                        if (isMobileExpanded) {
                          setExpandedMobileId("");
                        } else {
                          setExpandedMobileId(member.id);
                        }
                      }}
                      className="flex w-full scroll-mt-32 items-start gap-4 sm:gap-6 rounded-xl p-5 sm:p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-teal"
                    >
                      <div
                        className={`relative size-14 sm:size-16 shrink-0 overflow-hidden rounded-xl border transition-colors duration-200 ${
                          isSelected ? "border-brand-purple" : "border-border-warm"
                        }`}
                      >
                        {hasPhoto ? (
                          <Image src={member.photoUrl} alt={member.nameEn} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div
                            aria-hidden="true"
                            className="grid h-full w-full place-items-center bg-bg-sandstone font-serif text-lg sm:text-xl font-medium text-brand-purple"
                          >
                            {initialsOf(member.nameEn)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-purple">
                            {member.roleEn}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-teal-soft px-2.5 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-teal">
                              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-teal" />
                              <span className="hidden sm:inline">Viewing profile</span>
                              <span className="sm:hidden">Active</span>
                            </span>
                          )}
                        </div>

                        <span className="mt-2 block font-serif text-2xl sm:text-4xl font-normal leading-tight text-ink-earth">
                          {member.nameEn}
                        </span>

                        <span lang="ta" className="mt-1 block font-tamil text-base sm:text-lg leading-[1.6] tracking-normal text-brand-purple">
                          {member.nameTa} · {member.roleTa}
                        </span>

                        <span className="mt-1 block font-sans text-xs italic text-ink-umber">
                          {locale === "ta" ? member.committeeTa : member.committeeEn}
                        </span>

                        <span
                          lang={locale === "ta" ? "ta" : undefined}
                          className={`mt-2.5 block max-w-xl text-xs sm:text-sm text-ink-umber line-clamp-2 ${
                            locale === "ta" ? "font-tamil leading-[1.7]" : "leading-relaxed"
                          }`}
                        >
                          {locale === "ta" ? member.bioTa : member.bioEn}
                        </span>

                        <span className="mt-3 flex items-center justify-between border-t border-border-warm pt-2 font-sans text-xs font-medium text-brand-teal lg:hidden">
                          <span>{isMobileExpanded ? "Tap to hide details" : "Tap to view full details & picture"}</span>
                          {isMobileExpanded ? (
                            <ChevronUp className="size-4" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="size-4" aria-hidden="true" />
                          )}
                        </span>
                      </div>
                    </button>

                    {/* Mobile & tablet inline profile (<1024px) */}
                    <AnimatePresence>
                      {isMobileExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: reduceMotion ? 0 : 0.25 }}
                          className="space-y-4 border-t border-border-warm px-4 pb-6 pt-4 lg:hidden"
                        >
                          <OfficerPortraitMedia member={member} index={index} className="h-60 sm:h-72" />

                          <div className="space-y-2">
                            <Eyebrow as="p">Executive biography</Eyebrow>
                            <p
                              className={`text-sm text-ink-earth ${
                                locale === "ta" ? "font-tamil leading-[1.7] tracking-normal" : "font-sans leading-relaxed"
                              }`}
                              lang={locale === "ta" ? "ta" : undefined}
                            >
                              {locale === "ta" ? member.bioTa : member.bioEn}
                            </p>
                          </div>

                          <div className="space-y-2 border-t border-border-warm pt-3">
                            <Eyebrow as="p">{locale === "ta" ? "முக்கியப் பொறுப்புகள்" : "Key responsibilities"}</Eyebrow>
                            <ul className="space-y-1.5 text-sm text-ink-umber">
                              {(locale === "ta" ? member.responsibilitiesTa : member.responsibilitiesEn).map((resp, i) => (
                                <li
                                  key={i}
                                  lang={locale === "ta" ? "ta" : undefined}
                                  className={`flex items-start gap-2 ${locale === "ta" ? "font-tamil leading-[1.7]" : "leading-relaxed"}`}
                                >
                                  <span aria-hidden="true" className="mt-0.5 select-none text-accent-bronze">❖</span>
                                  <span>{resp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {member.quote && (
                            <PronounceableQuote
                              tamilText={member.quote}
                              label={`Cultural Quote: ${member.quote}. Click to hear pronunciation.`}
                              tone="sandstone"
                              badgePosition="inline"
                              className="block p-0.5"
                            >
                              <blockquote className="border-l-2 border-accent-bronze py-1 pl-4 pr-10 font-serif text-sm italic leading-relaxed text-ink-earth">
                                &ldquo;{member.quote}&rdquo;
                              </blockquote>
                            </PronounceableQuote>
                          )}

                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            <a
                              href={"mailto:" + member.email}
                              className={`inline-flex min-h-12 items-center gap-2 rounded-full border border-border-warm bg-surface-card-light px-4 font-sans text-sm text-ink-earth transition-colors hover:border-brand-teal ${FOCUS_LIGHT}`}
                            >
                              <Mail className="size-4 shrink-0 text-brand-teal" aria-hidden="true" />
                              <span>{member.email}</span>
                            </a>
                            {member.instagram && (
                              <a
                                href={"https://instagram.com/" + member.instagram.replace("@", "")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex min-h-12 items-center gap-2 rounded-full border border-border-warm bg-surface-card-light px-4 font-sans text-sm text-ink-earth transition-colors hover:border-brand-teal ${FOCUS_LIGHT}`}
                              >
                                <InstagramIcon className="size-4 shrink-0 text-brand-teal" />
                                <span>{member.instagram}</span>
                              </a>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* 2 · Sandstone · Recipe B ledger: subcommittees + constitution row */}
        <CulturalSection variant="sandstone" divider="korvai" aria-labelledby="board-subcommittees-heading">
          <div className={`${CONTAINER} ${BAND}`}>
            <div className="max-w-3xl space-y-3">
              <Eyebrow tamil="துணைக் குழுக்கள்">Working Groups</Eyebrow>
              <h2
                id="board-subcommittees-heading"
                className="font-serif text-3xl sm:text-5xl font-normal leading-[1.12] tracking-tight text-ink-earth"
              >
                Subcommittee Coordinators
              </h2>
              <p className="font-sans text-base sm:text-lg leading-relaxed text-ink-umber">
                Dedicated student organizers leading choreography, social media trailers, campus catering, and community service.
              </p>
            </div>

            <ol className="mt-12 sm:mt-16 border-y border-border-warm divide-y divide-border-warm">
              {SUBCOMMITTEE_MEMBERS.map((sub, i) => (
                <li
                  key={sub.id || i}
                  className="grid grid-cols-[3rem_1fr] md:grid-cols-12 gap-x-4 gap-y-2 md:gap-x-8 py-6 sm:py-8 items-baseline"
                >
                  <span aria-hidden="true" className="font-serif text-3xl leading-none text-brand-purple md:col-span-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-snug text-ink-earth md:col-span-5">
                    {sub.nameEn}
                  </h3>
                  <div className="col-start-2 md:col-start-auto md:col-span-6 space-y-0.5">
                    <p className="font-sans text-base text-ink-umber">{sub.areaEn}</p>
                    <p lang="ta" className="font-tamil text-sm leading-[1.6] tracking-normal text-brand-purple">
                      {sub.nameTa} · {sub.areaTa}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Constitution: an inline ledger row, not a centered block */}
            <div className="grid grid-cols-[3rem_1fr] md:grid-cols-12 gap-x-4 gap-y-4 md:gap-x-8 border-b border-border-warm py-8 sm:py-10 items-start">
              <FileText aria-hidden="true" className="size-7 text-brand-purple md:col-span-1" />
              <div className="md:col-span-5 space-y-2">
                <Eyebrow tamil="ஜனநாயக விதிகள்">Democratic Governance</Eyebrow>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-snug text-ink-earth">
                  Constitution of Tamil Sangam at Ohio State
                </h3>
              </div>
              <div className="col-start-2 md:col-start-auto md:col-span-6 space-y-5">
                <p className="font-sans text-base leading-relaxed text-ink-umber">
                  Our organization is fully student-run and democratically governed under Ohio State University Student Activities guidelines. Executive officers are elected annually by general body vote, and all constitutional amendments are publicly accessible.
                </p>
                <div className="flex flex-wrap gap-3">
                  <MuttramButton href={SITE_CONFIG.constitutionPdfPath} external variant="primary" onClick={playClick}>
                    View Official Constitution
                  </MuttramButton>
                  <MuttramButton href="/guide" variant="secondary" onClick={playClick}>
                    Read Organization FAQ &amp; Guidelines
                  </MuttramButton>
                </div>
              </div>
            </div>
          </div>
        </CulturalSection>

        {/* 3 · Peacock closer, always last */}
        <OrganicRouteGateway
          primaryHref="/join"
          primaryLabel="Sign the Guestbook"
          eyebrow="Step Across the Threshold · அடுத்த வாசல்"
          title="Join the Sangam Fellowship"
          tamilTitle="எங்களுடன் இணையுங்கள்"
          description="Membership is open to every student, alumni, and community member in Columbus. Sign the digital guestbook and take your place at the hearth."
        />
      </EditorialSheetHandoff>
    </div>
  );
}
