"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useAudio } from "@/context/AudioContext";
import dynamic from "next/dynamic";
import { HeroKolamLoader } from "@/components/ui/HeroKolamLoader";

const DigitalKolamHero = dynamic(
  () => import("@/components/hero/DigitalKolamHero").then((mod) => mod.DigitalKolamHero),
  {
    ssr: false,
    loading: () => <HeroKolamLoader route="/" minHeight="100dvh" />,
  }
);
import { SilkHoverPillars } from "@/components/home/SilkHoverPillars";
import { HeritageTextureOverlay } from "@/components/ui/HeritageTextureOverlay";
import { setHeroScrollProgress } from "@/engine/heroScrollStore";
import { motion, useReducedMotion } from "framer-motion";
import CountUp from "@/components/CountUp";
import { useLiteMode } from "@/context/LiteModeContext";
import { useTier } from "@/components/providers/TierProvider";
import { audioLayer } from "@/utils/audioLayer";
import { soundEngine } from "@/lib/soundEngine";
import { SANGAM_CIPHER_CHARS } from "@/utils/scrambleTerminal";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";
import { NextFlagshipGathering } from "@/components/home/NextFlagshipGathering";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import { KorvaiDivider } from "@/components/ui/CulturalDividers";
import { CulturalSection } from "@/components/ui/CulturalSection";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { EventJsonLd } from "@/components/seo/JsonLd";
import { useTamilSpeech } from "@/lib/tamilSpeech";
import { ThirukkuralAudioButton, PronounceableQuote } from "@/components/ui/PronounceableQuote";
import { useDeviceTilt } from "@/hooks/useDeviceTilt";

interface LivingPillar {
  id: string;
  num: string;
  title: string;
  tamilSubtitle: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
  badge: string;
  actionLabel: string;
}

const LIVING_PILLARS: LivingPillar[] = [
  {
    id: "cultural-heritage",
    num: "01",
    title: "Cultural Heritage & Language",
    tamilSubtitle: "மரபு & மொழி",
    description:
      "Conversational Tamil workshops, living Sangam literature explorations, historical linguistics & Dravidian living arts.",
    href: "/about",
    image: "/events/yaar-andha-killer/killer-03.jpg",
    imageAlt: "Tamil Sangam cultural presentation and community gathering at Ohio State",
    badge: "LIVING TRADITIONS",
    actionLabel: "Explore Archive ↗",
  },
  {
    id: "festivals-banquet",
    num: "02",
    title: "Festivals & Banquet Table",
    tamilSubtitle: "விழாக்கள் & விருந்து",
    description:
      "Authentic South Indian feast tables, streetside sapad & major campus festivals like Diwali and Pongal.",
    href: "/events",
    image: "/events/yaar-andha-killer/killer-02.jpg",
    imageAlt: "Students sharing authentic South Indian festive cuisine and banquet dining",
    badge: "CAMPUS CELEBRATIONS",
    actionLabel: "View Gatherings ↗",
  },
  {
    id: "peer-mentorship",
    num: "03",
    title: "Peer Mentorship & Kinship",
    tamilSubtitle: "தோழமை & வழிகாட்டல்",
    description:
      "Freshman peer guidance, community volunteering, student solidarity & inclusive Buckeye kinship.",
    href: "/join",
    image: "/events/yaar-andha-killer/killer-04.jpg",
    imageAlt: "Buckeyes sharing laughs and bonding together during a Sangam gathering",
    badge: "COMMUNITY HEARTH",
    actionLabel: "Join the Community ↗",
  },
];

export function HomeClient() {
  const { playClick } = useAudio();
  const [activePillar, setActivePillar] = useState(0);
  const {
    rotateX: pillarRotateX,
    rotateY: pillarRotateY,
    onPointerMove: onPillarPointerMove,
    onPointerLeave: onPillarPointerLeave,
    containerRef: pillarFrameRef,
  } = useDeviceTilt({ maxTilt: 6, stiffness: 140, damping: 22 });
  const { isLiteMode } = useLiteMode();
  const tier = useTier();
  const reducedMotion = useReducedMotion();
  const staticHero = isLiteMode || tier === "C" || !!reducedMotion;
  const { isSpeaking, toggleSpeak } = useTamilSpeech();
  const kural81Tamil = "இருந்தோம்பி இல்வாழ்வ தெல்லாம் விருந்தோம்பி வேளாண்மை செய்தற் பொருட்டு.";
  const isSpeakingKural81 = isSpeaking(kural81Tamil);

  const pinnedWrapperRef = useRef<HTMLDivElement>(null);
  const pinnedViewportRef = useRef<HTMLDivElement>(null);
  const actIIKuralRef = useRef<HTMLDivElement>(null);
  const kuralTamilRef = useRef<HTMLQuoteElement>(null);
  const kuralEnglishRef = useRef<HTMLParagraphElement>(null);
  const kuralMetaRef = useRef<HTMLDivElement>(null);
  const monolithRef = useRef<HTMLDivElement>(null);
  const liveTimeRef = useRef<HTMLSpanElement>(null);
  const monolithPrologueRef = useRef<HTMLParagraphElement>(null);
  const monolithTamilRef = useRef<HTMLParagraphElement>(null);
  const decodedMonolithRef = useRef(false);
  const heroPurgeActiveRef = useRef<boolean | null>(null);

  // Live Columbus EDT clock island (PRD §9.1)
  useEffect(() => {
    const el = liveTimeRef.current;
    if (!el) return;
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      el.textContent = `${timeStr} EDT`;
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle direct navigation to content (skipping 420vh hero when navbar brand is clicked)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isSkip =
      window.location.hash === "#flagship-gathering" ||
      window.location.search.includes("skipHero") ||
      sessionStorage.getItem("ts_skip_hero") === "true";

    if (!isSkip && !window.location.hash) {
      window.scrollTo(0, 0);
      const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, opts?: unknown) => void } }).__lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true, force: true });
      }
    }

    if (isSkip) {
      try {
        sessionStorage.removeItem("ts_skip_hero");
      } catch {
        // Ignore storage exceptions
      }

      const jumpToContent = () => {
        const target =
          document.getElementById("flagship-gathering") ||
          document.querySelector<HTMLElement>("[data-editorial-sheet]");
        if (!target) return;

        const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement | number, opts?: unknown) => void } }).__lenis;
        if (lenis) {
          lenis.scrollTo(target, { immediate: true, force: true });
        } else {
          target.scrollIntoView();
        }

        setHeroScrollProgress(1);
        document.body.dataset.heroPassed = "true";
        delete document.body.dataset.heroPurge;
      };

      jumpToContent();
      const t1 = setTimeout(jumpToContent, 80);
      const t2 = setTimeout(jumpToContent, 220);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  // GSAP 3-Act Scroll-Telling Setup (Zero React Re-renders on Scroll)
  useEffect(() => {
    if (staticHero) { setHeroScrollProgress(0); return; }
    gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

    const wrapper = pinnedWrapperRef.current;
    const viewport = pinnedViewportRef.current;
    const kural = actIIKuralRef.current;
    const tamil = kuralTamilRef.current;
    const english = kuralEnglishRef.current;
    const meta = kuralMetaRef.current;
    const monolith = monolithRef.current;

    if (!wrapper || !viewport) return;

    // SplitText word-by-word cascade for Tier 2: English Translation
    let split: SplitText | null = null;
    if (english) {
      split = new SplitText(english, { type: "words" });
    }


    const ctx = gsap.context(() => {
      // 1. Master Pinned Timeline: Pins the 100dvh viewport container while scrubbing Acts I & II (§MASTER DIRECTIVE)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          pin: viewport,
          invalidateOnRefresh: true,
          anticipatePin: 0, // 0 eliminates 1px twitch at start of scroll
          scrub: true, // Direct 1:1 synchronization with Lenis
        },
      });

      // Synchronize 3D scene, frame overlay, and dataset attributes on the scrubbed timeline
      tl.eventCallback("onUpdate", () => {
        const scrubbedP = tl.progress();
        setHeroScrollProgress(scrubbedP);

        // Toggle hero purge dataset attribute (active during Acts I & II up to 0.70)
        const isPurge = scrubbedP < 0.70;
        if (heroPurgeActiveRef.current !== isPurge) {
          heroPurgeActiveRef.current = isPurge;
          if (isPurge) {
            document.body.dataset.heroPurge = "true";
            delete document.body.dataset.heroPassed;
          } else {
            delete document.body.dataset.heroPurge;
            document.body.dataset.heroPassed = "true";
          }
        }

        // Governor render pause & inert focus trap guard
        if (scrubbedP >= 0.95) {
          if (kural) kural.setAttribute("inert", "");
        } else {
          if (kural) kural.removeAttribute("inert");
        }
      });

      // =========================================================================
      // ACT II: 0.45 -> 0.88 Scroll (§PRD 9: KURAL TIERS INSIDE WREATH)
      // 3-Tier Staggered Reveal for Kural 81 centered inside wreath cradle
      // Reading Plateau Hold from 0.70 -> 0.88 before handoff to Courtyard Threshold
      // =========================================================================
      if (kural) {
        tl.fromTo(
          kural,
          { opacity: 0 },
          { opacity: 1, duration: 0.04, ease: "none" },
          0.45
        );
      }

      // Tier 1: Tamil Script (0.47 -> 0.55, slide up + blur 10px -> 0px)
      if (tamil) {
        tl.fromTo(
          tamil,
          { opacity: 0, y: 35, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.08,
            ease: "power2.out",
            onStart: () => {
              soundEngine.playTempleChime();
            },
          },
          0.47
        );
      }

      // Tier 2: English Translation (0.55 -> 0.64, word-by-word cascade)
      if (split && split.words && split.words.length > 0) {
        tl.fromTo(
          split.words,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, stagger: 0.003, duration: 0.08, ease: "power2.out" },
          0.55
        );
      }

      // Tier 3: Metadata / Caption (0.64 -> 0.70)
      if (meta) {
        tl.fromTo(
          meta,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.06, ease: "power2.out" },
          0.64
        );
      }

      // Reading Hold Plateau (0.70 -> 0.88): Generous reading dwell with wreath formed.
      // Exit of Kural at end of Act II (0.88 -> 0.98)
      if (kural) {
        tl.to(
          kural,
          { opacity: 0, y: -20, filter: "blur(6px)", duration: 0.10, ease: "power1.in" },
          0.88
        );
      }

      // Trigger ScrambleText terminal cipher when Courtyard Threshold (#monolith) enters viewport
      if (monolith) {
        ScrollTrigger.create({
          trigger: monolith,
          start: "top 80%",
          once: true,
          onEnter: () => {
            if (!decodedMonolithRef.current) {
              decodedMonolithRef.current = true;
              if (monolithPrologueRef.current) {
                gsap.to(monolithPrologueRef.current, {
                  duration: 0.8,
                  scrambleText: {
                    text: monolithPrologueRef.current.innerText,
                    chars: SANGAM_CIPHER_CHARS,
                    speed: 1.2,
                    revealDelay: 0.1,
                  },
                });
              }
              if (monolithTamilRef.current) {
                gsap.to(monolithTamilRef.current, {
                  duration: 0.8,
                  scrambleText: {
                    text: monolithTamilRef.current.innerText,
                    chars: SANGAM_CIPHER_CHARS,
                    speed: 1.2,
                    revealDelay: 0.1,
                  },
                });
              }
            }
          },
        });
      }
    }, wrapper);

    return () => {
      if (split) split.revert();
      ctx.revert();
      setHeroScrollProgress(0);
      delete document.body.dataset.heroPurge;
      delete document.body.dataset.heroPassed;
    };
  }, [staticHero]);

  return (
    <div className="relative w-full overflow-clip font-body text-left">
      {/* Flagship Event Schema for Search Engine Rich Snippets */}
      <EventJsonLd />

      {/* Semantic SSR Knowledge Entity for AI Bots & Search Engine Crawlers */}
      <header className="sr-only">
        <p className="font-bold">OSU Tamil Sangam · Official Tamil Cultural Student Organization at The Ohio State University</p>
        <p>
          Welcome to OSU Tamil Sangam (ஒஹையோ மாநிலப் பல்கலைக்கழகத் தமிழ்ச் சங்கம்), the official student-led cultural organization serving students, scholars, and alumni at The Ohio State University in Columbus, Ohio.
          Founded in 2021 as a registered student organization with Ohio State Student Activities, Tamil Sangam is dedicated to cultivating an inclusive, welcoming home away from home.
          Membership is 100% free with zero dues, no language requirement, and open to all Buckeyes regardless of background.
          Flagship events include Namma Deepavali, Pongal harvest feasts, South Oval picnics, collegiate dance, and Tamil language workshops.
        </p>
        <nav aria-label="Core Campus Portals">
          <Link href="/events">Tamil Events at Ohio State</Link>
          <Link href="/join">Join OSU Tamil Sangam (Free Membership)</Link>
          <Link href="/about">About Our Mission & Heritage</Link>
          <Link href="/board">Student Executive Board</Link>
          <Link href="/gallery">Campus Photo Gallery & Archives</Link>
          <Link href="/games">Sangam Arcade · Tamil Wordle & Games</Link>
          <Link href="/guide">Student Life & Columbus Dining Guide</Link>
          <Link href="/links">Official Links & GroupMe</Link>
        </nav>
      </header>

      {/* Accessible Skip Link (PRD §7.11) */}
      <a
        href={staticHero ? "#flagship-gathering" : "#monolith"}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0F766E] focus:text-[#FAF5ED] focus:font-space-mono focus:text-xs focus:font-bold focus:outline-none"
      >
        SKIP TO CONTENT &rarr;
      </a>

      {/* 0. Tactile Heritage Sandstone Texture Overlay */}
      <HeritageTextureOverlay variant="sandstone" opacity={0.02} />

      {/* =========================================================================
          ACTS I & II: 260vh PINNED DOM WRAPPER & GSAP TIMELINE (CINEMATIC)
          ========================================================================= */}
      <div
        ref={pinnedWrapperRef}
        data-hero-pinned="home"
        id="act-i-viewport-wrapper"
        className={`relative w-full bg-hero-dusk-home ${staticHero ? "h-dvh" : "h-[260dvh]"}`}
      >
        {/* Pinned 100dvh Viewport Container */}
        <div
          ref={pinnedViewportRef}
          className="relative z-[2] w-full h-[100dvh] overflow-hidden bg-transparent text-white"
        >
          {/* Act I: WebGL Canvas Layer (Digital Kolam + 3D Emblem) */}
          <DigitalKolamHero />

          {/* Act II: Centered Poetic Inscription (Kural 81) in Pure Negative Space (§MASTER DIRECTIVE) */}
          <div
            ref={actIIKuralRef}
            className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center px-4 sm:px-8 text-center"
            style={{ opacity: 0 }}
          >
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center">
              {/* Tier 1: Tamil Inscription (Interactive: Click quote to hear pronunciation) */}
              <div className="pointer-events-auto flex flex-col items-center">
                <blockquote
                  ref={kuralTamilRef}
                  lang="ta"
                  role="button"
                  tabIndex={0}
                  aria-label={`Thirukkural 81: ${kural81Tamil}. ${
                    isSpeakingKural81
                      ? "Playing, click to stop pronunciation."
                      : "Click to hear authentic Tamil pronunciation."
                  }`}
                  aria-pressed={isSpeakingKural81}
                  onClick={() => toggleSpeak(kural81Tamil)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleSpeak(kural81Tamil);
                    }
                  }}
                  title={
                    isSpeakingKural81
                      ? "Click to pause pronunciation · ஒலி வடிவத்தை நிறுத்தவும்"
                      : "Click quote to hear Tamil pronunciation · குறள் 81 ஒலி கேட்க"
                  }
                  className="group cursor-pointer font-noto-serif-tamil text-[clamp(1.15rem,1.65vw,1.55rem)] text-[#FAFAFA] font-medium p-3 sm:p-4 rounded-xl transition-colors duration-200 hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A8]"
                  style={{ letterSpacing: "0px" }}
                >
                  <span className="block sm:whitespace-nowrap leading-[1.8] sm:leading-[1.9]">
                    இருந்தோம்பி இல்வாழ்வ தெல்லாம் விருந்தோம்பி
                  </span>
                  <span className="block sm:whitespace-nowrap mt-3 sm:mt-4 leading-[1.8] sm:leading-[1.9]">
                    வேளாண்மை செய்தற் பொருட்டு.
                  </span>
                </blockquote>
              </div>

              {/* Tier 2: Translation (SplitText word-by-word cascade) */}
              <p
                ref={kuralEnglishRef}
                className="font-space-mono text-xs sm:text-sm text-white/85 max-w-lg mt-6 sm:mt-7 leading-relaxed sm:leading-loose tracking-wide [text-shadow:0_0_6px_#2A1A14,0_0_14px_#2A1A14,0_0_2px_#2A1A14]"
              >
                &ldquo;The entire virtue of establishing a home is to welcome guests with an open heart and extend generosity.&rdquo;
              </p>

              {/* Tier 3: Clean, unboxed monospace line with subtle audio button (§MASTER DIRECTIVE) */}
              <div
                ref={kuralMetaRef}
                className="mt-5 sm:mt-6 flex items-center justify-center gap-2.5 font-space-mono text-[10px] sm:text-[11px] text-[#C79347] tracking-[0.22em] uppercase pointer-events-auto [text-shadow:0_0_6px_#2A1A14,0_0_14px_#2A1A14,0_0_2px_#2A1A14]"
              >
                <span>THIRUKKURAL 81 · விருந்தோம்பல்</span>
                <ThirukkuralAudioButton
                  tamilText={kural81Tamil}
                  label="குறள் 81 ஒலி வடிவம்"
                  tone="gold"
                  size="sm"
                  className="opacity-75 hover:opacity-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ACT III & THE SUNLIT MUTTRAM (COURTYARD): Unified Architectural Sheet Handoff
          Glides seamlessly over the pinned 3D hero with the sacred Threshold Seam ("Vaasal")
          Acts I & II (Hero) -> Act III (Threshold & Manifesto) -> Courtyard Gatherings River
          ========================================================================= */}
      <EditorialSheetHandoff
        id="monolith"
        badge="CAMPUS HEARTH"
        sublabel="COLUMBUS, OH"
        overlapHero={true}
        seam="full"
        surface="sangam-deep"
        overflowClass="overflow-x-clip"
      >
        <div
          ref={monolithRef}
          className="relative w-full min-h-[140vh] sm:min-h-[160vh] flex flex-col justify-between overflow-x-clip"
        >
          {/* Beat 1: The Atmospheric Manifesto (Top 45% of Section) */}
          <div className="relative z-10 w-full max-w-5xl mx-auto pt-36 sm:pt-40 md:pt-44 px-6 sm:px-10 lg:px-12 text-center">
                {/* Architectural Backdrop: Oversized Centered Tamil Glyph (த) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-44 -translate-x-1/2 select-none font-noto-serif-tamil text-[clamp(16rem,36vw,44rem)] font-bold text-[#C79347] opacity-[0.05] leading-none drop-shadow-[0_0_60px_rgba(199,147,71,0.2)] transition-transform duration-700 ease-out"
                >
                  த
                </div>

                {/* Subtle warm radial diya/amber vignette */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-48 -translate-x-1/2 h-[500px] w-[750px] max-w-full -translate-y-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(199,147,71,0.12),rgba(15,118,110,0.06)_45%,transparent_70%)] blur-2xl"
                />

                {/* Bilingual Eyebrow */}
                <div className="relative z-10 flex items-center justify-center gap-2.5">
                  <span className="w-1.5 h-1.5 rotate-45 bg-[#C79347]" aria-hidden="true" />
                  <span className="font-space-mono text-xs sm:text-[13px] text-[#C79347] tracking-[0.24em] uppercase font-semibold">
                    COLUMBUS CHAPTER · EST. 2021
                  </span>
                  <span className="w-1.5 h-1.5 rotate-45 bg-[#C79347]" aria-hidden="true" />
                </div>

                {/* Main Display Headline */}
                <h2 className="relative z-10 mt-4 font-serif text-[clamp(2.1rem,4.5vw,4.25rem)] font-normal text-[#FAF5ED] leading-[1.14] tracking-tight max-w-4xl mx-auto">
                  Where Tamil Heritage Meets Ohio State.
                </h2>

                {/* Tamil Tagline right underneath in muted gold */}
                <p
                  ref={monolithTamilRef}
                  lang="ta"
                  style={{ letterSpacing: 0 }}
                  className="relative z-10 mt-3.5 font-tamil text-xl sm:text-2xl md:text-3xl text-[#C79347] font-normal leading-[1.6] max-w-3xl mx-auto"
                >
                  ஓஹியோ மாநிலத்தில் தமிழ் மரபையும் மாணவர் தோழமையையும் ஒன்றிணைக்கும் கலாச்சாரப் பீடம்.
                </p>

                {/* Scannable Identity Strip: Crisp 2-line welcome summary */}
                <p
                  ref={monolithPrologueRef}
                  className="relative z-10 mt-5 font-body text-sm sm:text-base md:text-lg text-[#CBBBA8] leading-relaxed max-w-2xl mx-auto"
                >
                  The official collegiate student fellowship celebrating Tamil language, living arts, and lifelong community at The Ohio State University in Columbus, Ohio.
                </p>

                {/* Hairline Metadata Strip */}
                <div className="relative z-10 mt-8 pt-6 border-t border-[#C79347]/20 max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-xs sm:text-sm text-[#2BB5A8] tracking-wider uppercase font-medium">
                  <span>100% Free Membership</span>
                  <span className="text-[#C79347]/40" aria-hidden="true">·</span>
                  <span>No Language Requirement</span>
                  <span className="text-[#C79347]/40" aria-hidden="true">·</span>
                  <span>Open to All Majors</span>
                </div>

                {/* Single Primary Action: Emerald Button */}
                <div className="relative z-10 mt-8 flex justify-center">
                  <Link
                    href="/join"
                    onClick={playClick}
                    className="group inline-flex items-center gap-3 px-7 py-3.5 bg-[#0F766E] hover:bg-[#0B5C56] text-[#FAF5ED] font-mono text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full shadow-[0_4px_24px_rgba(15,118,110,0.35)] hover:shadow-[0_8px_32px_rgba(15,118,110,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-[#2BB5A8]/30"
                  >
                    <span>Join the Hearth</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>

              {/* Beat 2: The Living Pillars — Interactive Preview Stage (Middle 40%) */}
              <div className="relative z-10 mt-20 sm:mt-28 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                  {/* Left (7 Cols / 55% width): The 3 Pillars */}
                  <div className="lg:col-span-7 flex flex-col divide-y divide-[#C79347]/20 border-y border-[#C79347]/20">
                    {LIVING_PILLARS.map((pillar, idx) => {
                      const isActive = activePillar === idx;
                      return (
                        <Link
                          key={pillar.id}
                          href={pillar.href}
                          onClick={playClick}
                          onMouseEnter={() => {
                            setActivePillar(idx);
                            audioLayer.playTapeClack();
                          }}
                          onFocus={() => setActivePillar(idx)}
                          className={`group block py-8 sm:py-10 px-4 sm:px-6 transition-[background-color,transform] duration-300 rounded-xl ${
                            isActive ? "bg-[#271A3C]/40" : "hover:bg-[#271A3C]/25"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                            <div className="flex items-start gap-5 transition-transform duration-300 ease-out group-hover:translate-x-3">
                              <span
                                className={`font-space-mono text-sm sm:text-base font-semibold transition-colors duration-300 ${
                                  isActive ? "text-[#2BB5A8]" : "text-[#C79347]"
                                }`}
                              >
                                {pillar.num} ·
                              </span>
                              <div>
                                <div className="flex items-baseline gap-3 flex-wrap">
                                  <h3
                                    className={`font-serif text-2xl sm:text-3xl font-medium tracking-tight transition-colors duration-300 ${
                                      isActive ? "text-[#C79347]" : "text-[#FAF5ED] group-hover:text-[#C79347]"
                                    }`}
                                  >
                                    {pillar.title}
                                  </h3>
                                  <span lang="ta" style={{ letterSpacing: 0 }} className="font-tamil text-sm text-[#C79347]/80">
                                    {pillar.tamilSubtitle}
                                  </span>
                                </div>
                                <p className="mt-2 font-body text-xs sm:text-sm text-[#CBBBA8] leading-relaxed max-w-xl">
                                  {pillar.description}
                                </p>
                              </div>
                            </div>

                            <div className="mt-2 sm:mt-0 flex items-center gap-1.5 font-space-mono text-xs text-[#FAF5ED]/50 group-hover:text-[#2BB5A8] transition-colors shrink-0 self-end sm:self-center">
                              <span className="hidden sm:inline">Explore</span>
                              <span className="text-sm font-mono transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                ↗
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Right (5 Cols / 45% width): 4:5 Portrait Cinematic Preview Frame */}
                  <div className="lg:col-span-5 flex justify-center">
                    <motion.div
                      ref={pillarFrameRef}
                      onPointerMove={onPillarPointerMove}
                      onPointerLeave={onPillarPointerLeave}
                      style={{
                        rotateX: pillarRotateX,
                        rotateY: pillarRotateY,
                        transformPerspective: 900,
                        transformStyle: "preserve-3d",
                      }}
                      className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden bg-[#150D22] border border-[#C79347]/25 shadow-[0_24px_60px_rgba(0,0,0,0.65),0_0_40px_rgba(199,147,71,0.08)] transform-gpu"
                    >
                      {/* Layered Crossfading Images */}
                      {LIVING_PILLARS.map((pillar, idx) => (
                        <div
                          key={pillar.id}
                          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                            activePillar === idx ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                          }`}
                        >
                          <Image
                            src={pillar.image}
                            alt={pillar.imageAlt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 440px"
                            priority={idx === 0}
                          />
                        </div>
                      ))}

                      {/* Soft Vignette Gradients */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1C122B] via-[#1C122B]/35 to-transparent pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-b from-[#1C122B]/40 via-transparent to-transparent pointer-events-none" />

                      {/* Top Active Category Badge */}
                      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1C122B]/85 backdrop-blur-md border border-[#C79347]/30 text-[10px] font-mono tracking-widest uppercase text-[#C79347]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2BB5A8] animate-pulse" />
                        {LIVING_PILLARS[activePillar].badge}
                      </div>

                      {/* Bottom Text in Preview Frame */}
                      <div className="absolute bottom-6 left-6 right-6 z-10 space-y-1">
                        <span
                          lang="ta"
                          style={{ letterSpacing: 0 }}
                          className="font-tamil text-xl sm:text-2xl text-[#C79347] font-medium block drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                        >
                          {LIVING_PILLARS[activePillar].tamilSubtitle}
                        </span>
                        <p className="font-serif text-base sm:text-lg text-[#FAF5ED] font-medium leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                          {LIVING_PILLARS[activePillar].title}
                        </p>
                        <p className="text-xs font-mono text-[#2BB5A8] tracking-wider uppercase pt-1 font-semibold">
                          {LIVING_PILLARS[activePillar].actionLabel}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Beat 3: The Quiet Handoff (Bottom 15%) */}
              <div className="relative z-10 mt-20 sm:mt-28 pb-28 sm:pb-36 flex flex-col items-center justify-center text-center">
                {/* Centered vertical 1px gold gradient hairline fading downward */}
                <div className="w-px h-16 sm:h-20 bg-gradient-to-b from-[#C79347]/80 via-[#C79347]/30 to-transparent" />

                {/* Quiet scroll cue: NEXT GATHERING ↓ */}
                <a
                  href="#flagship-gathering"
                  onClick={(e) => {
                    e.preventDefault();
                    playClick();
                    const el = document.getElementById("flagship-gathering");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="group mt-4 inline-flex flex-col items-center gap-1.5 font-space-mono text-[11px] sm:text-xs text-[#C79347] hover:text-[#2BB5A8] tracking-[0.25em] uppercase font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A8] rounded-md px-4 py-2"
                >
                  <span className="flex items-center gap-2">
                    <span>NEXT GATHERING</span>
                    <span className="transition-transform duration-300 group-hover:translate-y-1">↓</span>
                  </span>
                  <span lang="ta" style={{ letterSpacing: 0 }} className="font-tamil text-[11px] text-[#CBBBA8]/75 group-hover:text-[#2BB5A8]/90 font-normal">
                    அடுத்த நிகழ்வு
                  </span>
                </a>
              </div>
            </div>

        {/* 1. Puranaanuru 192 ribbon: pull-quote (recipe C) between korvai seams */}
        <div id="flagship-gathering" className="scroll-mt-20" />
        <CulturalSection variant="sangam-deep" divider="korvai" aria-labelledby="puranaanuru-title">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 py-14 sm:py-20">
            <h2 id="puranaanuru-title" className="sr-only">Puranaanuru 192</h2>
            <figure className="relative max-w-4xl border-l-2 border-accent-zari pl-6 sm:pl-10">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 left-3 sm:-top-14 sm:left-6 select-none font-serif text-[6rem] sm:text-[8rem] leading-none text-accent-zari/25"
              >
                &ldquo;
              </span>
              <PronounceableQuote
                tamilText="யாதும் ஊரே யாவரும் கேளிர்"
                label="Puranaanuru 192: Yaathum Oore Yaavarum Kaelir"
                tone="gold"
                badgePosition="corner"
              >
                <blockquote className="relative">
                  <p lang="ta" style={{ letterSpacing: 0 }} className="font-tamil text-2xl sm:text-4xl lg:text-5xl font-medium leading-[1.6] text-brand-lavender">
                    யாதும் ஊரே யாவரும் கேளிர்
                  </p>
                  <p className="mt-2 font-serif italic text-xl sm:text-2xl lg:text-3xl leading-snug text-ink-alabaster">
                    &ldquo;To us all towns are home, everyone our kin.&rdquo;
                  </p>
                </blockquote>
              </PronounceableQuote>
              <figcaption className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                <Eyebrow tone="dark">Kaniyan Poongundranar · Puranaanuru 192</Eyebrow>
                <Link
                  href="/about"
                  onClick={playClick}
                  className="inline-flex min-h-12 items-center font-sans text-sm font-semibold text-brand-teal-dark hover:text-brand-teal-hover-dark hover:underline underline-offset-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark rounded-sm"
                >
                  Our story →
                </Link>
              </figcaption>
            </figure>
          </div>
          <KorvaiDivider tone="gold" />
        </CulturalSection>

        {/* 2. Intro + next flagship gathering (sandstone, recipe E) */}
        <NextFlagshipGathering />

        {/* 3. The 3 core pillars (ivory, recipe A) */}
        <SilkHoverPillars />

        {/* 4. Community kinship ledger (sandstone, recipe B) */}
        <CulturalSection variant="sandstone" divider="korvai" aria-labelledby="kinship-title">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-28">
            <h2 id="kinship-title" className="sr-only">Our community in numbers</h2>
            <dl className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 divide-border-warm border-y border-border-warm">
              <div className="relative flex flex-col gap-3 py-8 md:py-10 md:px-8 lg:px-10">
                <motion.span aria-hidden="true" className="absolute left-0 top-10 bottom-10 hidden w-px origin-top bg-accent-bronze/40 md:block" initial={reducedMotion ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
                <dt className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-earth">Buckeyes &amp; Community</dt>
                <dd className="order-first font-serif tabular-nums text-5xl sm:text-6xl font-light text-brand-purple"><span aria-hidden="true"><CountUp to={120} />+</span><span className="sr-only">120+</span></dd>
                <dd className="text-sm text-ink-umber font-sans leading-relaxed max-w-xs">
                  Undergraduate and graduate students from every college, alumni, and friends across Columbus.
                </dd>
              </div>
              <div className="relative flex flex-col gap-3 py-8 md:py-10 md:px-8 lg:px-10">
                <motion.span aria-hidden="true" className="absolute left-0 top-10 bottom-10 hidden w-px origin-top bg-accent-bronze/40 md:block" initial={reducedMotion ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
                <dt className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-earth">Years of Kinship</dt>
                <dd className="order-first font-serif tabular-nums text-5xl sm:text-6xl font-light text-brand-purple"><span aria-hidden="true">0<CountUp to={4} />+</span><span className="sr-only">04+</span></dd>
              </div>
              <div className="relative flex flex-col gap-3 py-8 md:py-10 md:px-8 lg:px-10">
                <motion.span aria-hidden="true" className="absolute left-0 top-10 bottom-10 hidden w-px origin-top bg-accent-bronze/40 md:block" initial={reducedMotion ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
                <dt className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-earth">Zero Dues · Open Hearth</dt>
                <dd className="order-first font-serif tabular-nums text-5xl sm:text-6xl font-light text-brand-teal"><span aria-hidden="true"><CountUp to={100} />%</span><span className="sr-only">100%</span></dd>
                <dd className="text-sm text-ink-umber font-sans leading-relaxed max-w-xs">
                  Membership is completely voluntary and free. No language test. No attendance quotas to participate.
                </dd>
              </div>
            </dl>
          </div>
        </CulturalSection>

        {/* 5. Closer: exactly one route gateway, always last (peacock-deep) */}
        <div className="bg-bg-peacock-deep texture-silk text-ink-alabaster">
          <OrganicRouteGateway
            eyebrow="Student Fellowship & Social Hub"
            tamilEyebrow="இணைவு"
            title="A Warm Hearth on the Banks of the Olentangy"
            tamilTitle="ஓலண்டாஞ்சி நதிக்கரையில் ஒரு பாசமிகு திண்ணை"
            primaryHref="/join"
            primaryLabel="Sign the Free Guestbook"
            secondaryHref="/links"
            secondaryLabel="Open Bio Links & Socials"
          />
        </div>
      </EditorialSheetHandoff>
    </div>
  );
}
