"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CURRENT_BOARD, SUBCOMMITTEE_MEMBERS, BoardMember } from "@/data/board";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import {
  Mail,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";
import CountUp from "@/components/CountUp";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import { KolamSectionRule } from "@/components/ui/KolamSectionRule";
import { SpotlightCard } from "@/components/ui/react-bits";
import { PronounceableQuote } from "@/components/ui/PronounceableQuote";
import { TechFiresideGateway } from "@/components/gateways/TechFiresideGateway";
import { HeroKolamLoader } from "@/components/ui/HeroKolamLoader";
import styles from "./board.module.css";

const BoardHeroCanvas = dynamic(
  () => import("@/components/board/BoardHeroCanvas").then((m) => m.BoardHeroCanvas),
  {
    ssr: false,
    loading: () => <HeroKolamLoader route="/board" />,
  }
);

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

/**
 * Museum-grade framed portrait or sculpted monogram display
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
  const initials = member.nameEn
    .split(/\s+/)
    .map((part) => part[0])
    .join("");
  const hasPhoto = member.photoUrl && member.photoUrl !== "/emblem.svg";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-gradient-to-b from-[#25173B] to-[#140C20] border border-[rgba(125,96,166,0.25)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.25)] ${className}`}
    >
      {/* Archival Corner Registration Marks */}
      <span className="absolute top-2 left-2.5 font-mono text-[10px] text-[#A6F0CF]/75 select-none z-10 leading-none">
        +
      </span>
      <span className="absolute top-2 right-2.5 font-mono text-[10px] text-[#A6F0CF]/75 select-none z-10 leading-none">
        +
      </span>
      <span className="absolute bottom-8 left-2.5 font-mono text-[10px] text-[#A6F0CF]/75 select-none z-10 leading-none">
        +
      </span>
      <span className="absolute bottom-8 right-2.5 font-mono text-[10px] text-[#A6F0CF]/75 select-none z-10 leading-none">
        +
      </span>

      {hasPhoto ? (
        <div className="relative w-full h-full min-h-[16rem]">
          <Image
            src={member.photoUrl}
            alt={member.nameEn}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 450px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140C20]/55 via-transparent to-transparent pointer-events-none" />
        </div>
      ) : (
        <div className="relative w-full h-full min-h-[16rem] grid place-items-center select-none overflow-hidden">
          {/* Sacred Bronze Geometry Watermark */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
            viewBox="0 0 200 200"
            fill="none"
          >
            <circle cx="100" cy="100" r="75" stroke="#F26BB5" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="58" stroke="#A6F0CF" strokeWidth="1" />
            <circle cx="100" cy="100" r="42" stroke="#F26BB5" strokeWidth="0.75" />
            <line x1="100" y1="15" x2="100" y2="185" stroke="#A6F0CF" strokeWidth="0.5" strokeOpacity="0.5" />
            <line x1="15" y1="100" x2="185" y2="100" stroke="#A6F0CF" strokeWidth="0.5" strokeOpacity="0.5" />
          </svg>

          {/* Sculpted Monogram */}
          <span className="font-serif text-6xl sm:text-7xl lg:text-8xl font-normal text-[#A6F0CF] tracking-tight drop-shadow-[0_4px_12px_rgba(242,107,181,0.25)] relative z-2">
            {initials}
          </span>
        </div>
      )}

      {/* Museum Plaque Footer */}
      <div className="absolute bottom-0 inset-x-0 bg-[#140C20]/95 backdrop-blur-xs border-t border-[#A6F0CF]/35 px-3.5 py-1.5 flex items-center justify-between text-[11px] font-mono z-10 text-[#F4F0FA]/80">
        <span className="font-bold text-[#A6F0CF]">
          #{String(index + 1).padStart(2, "0")} · {member.term}
        </span>
        <span
          lang="ta"
          className="font-tamil text-xs text-[#F4F0FA]/90 font-medium truncate max-w-[55%]"
        >
          {member.nameTa}
        </span>
      </div>
    </div>
  );
}

export default function BoardPage() {
  const { locale } = useLocale();
  const { playClick, playMarimba } = useAudio();
  const reduceMotion = useReducedMotion();
  const [hoveredMember, setHoveredMember] = useState<BoardMember>(CURRENT_BOARD[0]);
  const [expandedMobileId, setExpandedMobileId] = useState<string>(CURRENT_BOARD[0].id);
  const officersRef = useRef<HTMLDivElement>(null);
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
    targetRow?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentIndex, playClick]);

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

  return (
    <div className="w-full text-left bg-transparent">
      {/* Semantic SSR H1 for Search Engine Crawlers & Screen Readers */}
      <h1 className="sr-only">
        Executive Board &amp; Student Leadership — OSU Tamil Sangam at The Ohio State University
      </h1>

      <div id="board-hero-trigger" data-hero-container="true" className="relative z-10 w-full">
        <BoardHeroCanvas bezel={null} />
      </div>

      <EditorialSheetHandoff
        badge="EXECUTIVE LEADERSHIP"
        sublabel="OFFICERS 2026–2027"
        className="text-[#F4F0FA]"
        overflowClass="overflow-x-clip"
      >
        {/* Physical Top Border Metrics Bezel */}
        <dl className={styles.bezel} aria-label="Tamil Sangam at a glance">
          <div>
            <dt>Buckeye Members</dt>
            <dd>{reduceMotion ? 120 : <CountUp to={120} duration={2} />}+</dd>
          </div>
          <div>
            <dt>Executive Officers</dt>
            <dd>{reduceMotion ? 9 : <CountUp to={9} duration={1.5} />}</dd>
          </div>
          <div>
            <dt>Campus Galas & Events</dt>
            <dd>{reduceMotion ? 14 : <CountUp to={14} duration={1.8} />}</dd>
          </div>
          <div>
            <dt>Est. at Ohio State</dt>
            <dd>{reduceMotion ? 2021 : <CountUp to={2021} from={2000} duration={2.2} separator="" />}</dd>
          </div>
        </dl>

        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 pt-28 sm:pt-36 pb-24 sm:pb-32 scroll-mt-32">
          <CourtyardHeader
            align="left"
            title={locale === "ta" ? "நிர்வாகக் குழு & வழிகாட்டிகள்" : "The Executive Board"}
            tamilTitle={locale !== "ta" ? "ஆளுமை · மாணவர் தலைமை" : undefined}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mt-14 sm:mt-20">
            {/* Desktop Sticky Dossier Panel */}
            <aside
              className={`${styles.portrait} hidden lg:block lg:col-span-5 z-20`}
              aria-label="Selected officer dossier"
              data-testid="officer-portrait"
            >
              <div className={`${styles.dossierCard} !bg-[#25173B] !border-[#A6F0CF]/35 !shadow-[inset_0_2px_10px_rgba(0,0,0,0.2),0_12px_36px_rgba(0,0,0,0.3)]`}>
                {/* Dossier Header Bar with Quick Nav */}
                <div className="flex items-center justify-between border-b border-[rgba(125,96,166,0.25)] pb-3 mb-4 select-none">
                  <div className="text-[10px] font-mono tracking-widest text-[#A6F0CF] uppercase">
                    <span>{locale === "ta" ? "நிர்வாக ஆவணம்" : "OFFICER DOSSIER"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-[#F4F0FA]/60 mr-2">
                      {String(currentIndex + 1).padStart(2, "0")} / {String(CURRENT_BOARD.length).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigateOfficer("prev")}
                      aria-label="Previous officer profile"
                      className="p-1 rounded-md hover:bg-[#352254] text-[#F4F0FA]/70 hover:text-[#F4F0FA] transition-colors focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateOfficer("next")}
                      aria-label="Next officer profile"
                      className="p-1 rounded-md hover:bg-[#352254] text-[#F4F0FA]/70 hover:text-[#F4F0FA] transition-colors focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={hoveredMember.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: reduceMotion ? 0 : 0.22 }}
                    className="space-y-4"
                  >
                    {/* Framed Archival Portrait */}
                    <OfficerPortraitMedia
                      member={hoveredMember}
                      index={currentIndex}
                      className="h-64 sm:h-72"
                    />

                    {/* Identity & Role Meta */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#A6F0CF]">
                          {hoveredMember.roleEn}
                        </span>
                        <span className="text-xs font-mono text-[#F4F0FA]/60">
                          {hoveredMember.term}
                        </span>
                      </div>

                      <p
                        lang="ta"
                        className="font-tamil text-sm text-[#F4F0FA]/80 leading-relaxed font-medium"
                      >
                        {hoveredMember.roleTa} · {hoveredMember.nameTa}
                      </p>

                      <h2 className="text-3xl font-serif text-[#F4F0FA] leading-tight font-normal">
                        {hoveredMember.nameEn}
                      </h2>

                      <p className="text-xs font-sans text-[#F4F0FA]/70 italic">
                        {locale === "ta" ? hoveredMember.committeeTa : hoveredMember.committeeEn}
                      </p>

                      <p
                        className="text-sm leading-relaxed text-[#F4F0FA]/85 font-sans pt-1"
                        lang={locale === "ta" ? "ta" : undefined}
                      >
                        {locale === "ta" ? hoveredMember.bioTa : hoveredMember.bioEn}
                      </p>
                    </div>

                    {/* Key Responsibilities - Solves "hard to see further details" */}
                    <div className="pt-3 border-t border-[rgba(125,96,166,0.25)] space-y-2">
                      <span className="font-mono text-[11px] font-semibold tracking-wider text-[#A6F0CF] uppercase flex items-center gap-1.5">
                        <Sparkles className="size-3.5 shrink-0" />
                        {locale === "ta" ? "முக்கியப் பொறுப்புகள்" : "Key Responsibilities"}
                      </span>
                      <ul className="space-y-1.5 text-xs text-[#F4F0FA]/85">
                        {(locale === "ta"
                          ? hoveredMember.responsibilitiesTa
                          : hoveredMember.responsibilitiesEn
                        ).map((resp, i) => (
                          <li key={i} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-[#A6F0CF] font-bold select-none mt-0.5">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cultural Quote */}
                    {hoveredMember.quote && (
                      <PronounceableQuote
                        tamilText={hoveredMember.quote}
                        label={`Cultural Quote: ${hoveredMember.quote}. Click to hear pronunciation.`}
                        tone="light"
                        badgePosition="inline"
                        className="p-0.5 block"
                      >
                        <blockquote className="text-xs font-serif italic text-[#F4F0FA]/90 bg-[#140C20]/60 border-l-2 border-[#A6F0CF] px-3.5 py-2.5 rounded-r-md leading-relaxed">
                          &ldquo;{hoveredMember.quote}&rdquo;
                        </blockquote>
                      </PronounceableQuote>
                    )}

                    {/* Direct Contact Actions */}
                    <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-[rgba(125,96,166,0.25)]">
                      <a
                        href={"mailto:" + hoveredMember.email}
                        className="min-h-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#140C20]/40 hover:bg-[#352254] text-xs font-mono text-[#F4F0FA] transition-colors focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
                      >
                        <Mail className="size-3.5 text-[#A6F0CF] shrink-0" aria-hidden="true" />
                        <span>{hoveredMember.email}</span>
                      </a>
                      {hoveredMember.instagram && (
                        <a
                          href={"https://instagram.com/" + hoveredMember.instagram.replace("@", "")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#140C20]/40 hover:bg-[#352254] text-xs font-mono text-[#F4F0FA] transition-colors focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
                        >
                          <InstagramIcon className="size-3.5 text-[#A6F0CF] shrink-0" />
                          <span>{hoveredMember.instagram}</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </aside>

            {/* Officer Directory List */}
            <div ref={officersRef} className="lg:col-span-7 space-y-4">
              {CURRENT_BOARD.map((member, index) => {
                const isSelected = hoveredMember.id === member.id;
                const isMobileExpanded = expandedMobileId === member.id;
                const initials = member.nameEn
                  .split(/\s+/)
                  .map((part) => part[0])
                  .join("");
                const hasPhoto = member.photoUrl && member.photoUrl !== "/emblem.svg";

                return (
                  <SpotlightCard
                    key={member.id}
                    className={`rounded-xl transition-all duration-200 border ${
                      isSelected
                        ? "border-[#A6F0CF]/35 bg-[#140C20] shadow-sm"
                        : "border-[rgba(125,96,166,0.25)] bg-transparent hover:bg-[#352254]/30"
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
                      className={styles.officer + " w-full flex items-start gap-4 sm:gap-6"}
                    >
                      {/* Avatar Portrait Thumbnail */}
                      <div
                        className={`size-14 sm:size-16 rounded-xl overflow-hidden shrink-0 relative border transition-all duration-200 ${
                          isSelected
                            ? "border-[#A6F0CF] ring-2 ring-[#A6F0CF]/25 shadow-md scale-105"
                            : "border-[#A6F0CF]/35 bg-[#140C20]"
                        }`}
                      >
                        {hasPhoto ? (
                          <Image
                            src={member.photoUrl}
                            alt={member.nameEn}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center bg-[#140C20] text-[#A6F0CF] font-serif font-medium text-lg sm:text-xl">
                            {initials}
                          </div>
                        )}
                      </div>

                      {/* Header and Identity */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-mono uppercase tracking-widest text-[#A6F0CF] font-semibold">
                            {member.roleEn}
                          </span>

                          {/* Indicator Badge */}
                          {isSelected && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-[#A6F0CF] bg-[#A6F0CF]/10 px-2.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A6F0CF] animate-pulse" />
                              <span className="hidden sm:inline">VIEWING PROFILE</span>
                              <span className="sm:hidden">ACTIVE</span>
                            </span>
                          )}
                        </div>

                        <span className="block font-serif text-2xl sm:text-4xl text-[#F4F0FA] leading-tight mt-2 font-normal">
                          {member.nameEn}
                        </span>

                        <span
                          lang="ta"
                          className="block font-tamil text-base sm:text-lg text-[#F4F0FA]/80 leading-relaxed mt-1"
                        >
                          {member.nameTa} · {member.roleTa}
                        </span>

                        <span className="block text-xs font-sans text-[#F4F0FA]/60 italic mt-1">
                          {locale === "ta" ? member.committeeTa : member.committeeEn}
                        </span>

                        <span className="block text-xs sm:text-sm text-[#F4F0FA]/80 leading-relaxed mt-2.5 line-clamp-2 max-w-xl">
                          {locale === "ta" ? member.bioTa : member.bioEn}
                        </span>

                        {/* Mobile Toggle Cue */}
                        <div className="lg:hidden mt-3 pt-2 border-t border-[rgba(125,96,166,0.25)] flex items-center justify-between text-xs font-mono text-[#A6F0CF]">
                          <span>{isMobileExpanded ? "Tap to hide details" : "Tap to view full details & picture"}</span>
                          {isMobileExpanded ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Mobile & Tablet Inline Expanded Profile (<1024px) */}
                    <AnimatePresence>
                      {isMobileExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: reduceMotion ? 0 : 0.25 }}
                          className="lg:hidden px-4 pb-6 pt-2 border-t border-[rgba(125,96,166,0.25)] space-y-4"
                        >
                          {/* Framed Mobile Portrait */}
                          <OfficerPortraitMedia
                            member={member}
                            index={index}
                            className="h-60 sm:h-72"
                          />

                          {/* Full Bio */}
                          <div className="space-y-2">
                            <span className="font-mono text-[11px] font-semibold text-[#A6F0CF] uppercase tracking-wider block">
                              Executive Biography
                            </span>
                            <p
                              className="text-sm leading-relaxed text-[#F4F0FA]/85 font-sans"
                              lang={locale === "ta" ? "ta" : undefined}
                            >
                              {locale === "ta" ? member.bioTa : member.bioEn}
                            </p>
                          </div>

                          {/* Key Responsibilities */}
                          <div className="pt-2 border-t border-[rgba(125,96,166,0.25)] space-y-2">
                            <span className="font-mono text-[11px] font-semibold tracking-wider text-[#A6F0CF] uppercase flex items-center gap-1.5">
                              <Sparkles className="size-3.5 shrink-0" />
                              {locale === "ta" ? "முக்கியப் பொறுப்புகள்" : "Key Responsibilities"}
                            </span>
                            <ul className="space-y-1.5 text-xs text-[#F4F0FA]/85">
                              {(locale === "ta"
                                ? member.responsibilitiesTa
                                : member.responsibilitiesEn
                              ).map((resp, i) => (
                                <li key={i} className="flex items-start gap-2 leading-relaxed">
                                  <span className="text-[#A6F0CF] font-bold select-none">•</span>
                                  <span>{resp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Quote */}
                          {member.quote && (
                            <PronounceableQuote
                              tamilText={member.quote}
                              label={`Cultural Quote: ${member.quote}. Click to hear pronunciation.`}
                              tone="light"
                              badgePosition="inline"
                              className="p-0.5 block"
                            >
                              <blockquote className="text-xs font-serif italic text-[#F4F0FA]/90 bg-[#140C20]/60 border-l-2 border-[#A6F0CF] px-3 py-2 rounded-r-md leading-relaxed">
                                &ldquo;{member.quote}&rdquo;
                              </blockquote>
                            </PronounceableQuote>
                          )}

                          {/* Contact Links */}
                          <div className="pt-2 flex flex-wrap items-center gap-2">
                            <a
                              href={"mailto:" + member.email}
                              className="min-h-11 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#140C20]/40 hover:bg-[#352254] text-xs font-mono text-[#F4F0FA] transition-colors focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
                            >
                              <Mail className="size-3.5 text-[#A6F0CF] shrink-0" />
                              <span>{member.email}</span>
                            </a>
                            {member.instagram && (
                              <a
                                href={"https://instagram.com/" + member.instagram.replace("@", "")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="min-h-11 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#140C20]/40 hover:bg-[#352254] text-xs font-mono text-[#F4F0FA] transition-colors focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
                              >
                                <InstagramIcon className="size-3.5 text-[#A6F0CF] shrink-0" />
                                <span>{member.instagram}</span>
                              </a>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </SpotlightCard>
                );
              })}
            </div>
          </div>

          <KolamSectionRule tone="sandstone" />

          {/* Working Subcommittee Councils & Constitution (Violet Surface Band) */}
          <div className="mt-20 sm:mt-32 -mx-6 sm:-mx-10 lg:-mx-16 px-6 sm:px-10 lg:px-16 py-20 bg-[#25173B] border-y border-[rgba(125,96,166,0.25)] shadow-[inset_0_2px_12px_rgba(0,0,0,0.2)] space-y-20">
            <div className="space-y-16">
              <div className="text-center space-y-3">
                <span className="font-sans text-xs font-semibold text-[#A6F0CF] tracking-widest uppercase block">
                  Working Groups · துணைக் குழுக்கள்
                </span>
                <h3 className="text-3xl sm:text-5xl font-serif font-normal text-[#F4F0FA]">
                  Subcommittee Coordinators
                </h3>
                <p className="text-base text-[#F4F0FA]/80 font-sans max-w-xl mx-auto leading-relaxed">
                  Dedicated student organizers leading choreography, social media trailers, campus catering, and community service.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 text-left max-w-5xl mx-auto">
                {SUBCOMMITTEE_MEMBERS.map((sub, i) => (
                  <div
                    key={sub.id || i}
                    className={styles.coordinator + " space-y-2 p-6 bg-[#140C20] rounded-sm border border-[rgba(125,96,166,0.25)] shadow-[0_2px_8px_rgba(0,0,0,0.25)]"}
                    onPointerMove={(event) => {
                      if (
                        !window.matchMedia(
                          "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
                        ).matches
                      )
                        return;
                      const rect = event.currentTarget.getBoundingClientRect();
                      event.currentTarget.style.setProperty("--pointer-x", event.clientX - rect.left + "px");
                      event.currentTarget.style.setProperty("--pointer-y", event.clientY - rect.top + "px");
                    }}
                    onPointerLeave={(event) => {
                      event.currentTarget.style.removeProperty("--pointer-x");
                      event.currentTarget.style.removeProperty("--pointer-y");
                    }}
                  >
                    <span className="font-mono text-xs text-[#A6F0CF] uppercase tracking-widest font-semibold block">
                      {sub.areaEn}
                    </span>
                    <h4 className="text-2xl sm:text-3xl font-serif text-[#F4F0FA]">{sub.nameEn}</h4>
                    <p className="text-sm font-sans text-[#F4F0FA]/80" lang="ta">
                      {sub.nameTa} · {sub.areaTa}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plain-Language Democratic Governance */}
            <div className="pt-16 border-t border-[rgba(125,96,166,0.25)] space-y-6 max-w-3xl mx-auto text-center sm:text-left">
              <span className="font-sans text-xs font-semibold text-[#A6F0CF] tracking-widest uppercase block">
                Democratic Governance · ஜனநாயக விதிகள்
              </span>
              <h4 className="text-3xl sm:text-4xl font-serif text-[#F4F0FA]">
                Constitution of Tamil Sangam at Ohio State
              </h4>
              <p className="text-base sm:text-lg font-sans text-[#F4F0FA]/80 leading-relaxed">
                Our organization is fully student-run and democratically governed under Ohio State University Student Activities guidelines. Executive officers are elected annually by general body vote, and all constitutional amendments are publicly accessible.
              </p>
              <div className="pt-2">
                <MuttramButton href="/guide" variant="secondary" size="md" onClick={playClick}>
                  Read Organization FAQ & Guidelines →
                </MuttramButton>
              </div>
            </div>
          </div>

          <KolamSectionRule tone="sandstone" />

          {/* Open Community Gateway: Tamil Nadu x Ohio State Tech & Career Firesides */}
          <div className="mt-20 sm:mt-28">
            <TechFiresideGateway variant="light" />
          </div>

          {/* Borderless Organic Transportation to Join */}
          <div className="mt-28 sm:mt-36">
            <OrganicRouteGateway
              primaryHref="/join"
              primaryLabel="Sign the Guestbook"
              eyebrow="Step Across the Threshold · அடுத்த வாசல்"
              title="Join the Sangam Fellowship"
              tamilTitle="எங்களுடன் இணையுங்கள்"
              description="Membership is open to every student, alumni, and community member in Columbus. Sign the digital guestbook and take your place at the hearth."
            />
          </div>
        </div>
      </EditorialSheetHandoff>
    </div>
  );
}
