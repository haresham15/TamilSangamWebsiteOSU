"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
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
import { setHeroScrollProgress, heroScrollProgress } from "@/engine/heroScrollStore";
import { registerSystem } from "@/engine/masterTick";
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
import { KolamSectionRule } from "@/components/ui/KolamSectionRule";
import { EventJsonLd } from "@/components/seo/JsonLd";
import { useTamilSpeech } from "@/lib/tamilSpeech";
import { ThirukkuralAudioButton } from "@/components/ui/PronounceableQuote";

export default function HomePage() {
  const { playClick } = useAudio();
  const { isLiteMode } = useLiteMode();
  const tier = useTier();
  const reducedMotion = useReducedMotion();
  const staticHero = isLiteMode || tier === "C" || !!reducedMotion;
  const { isSpeaking, toggleSpeak } = useTamilSpeech();
  const kural81Tamil = "இருந்தோம்பி இல்வாழ்வ தெல்லாம் விருந்தோம்பி வேளாண்மை செய்தற் பொருட்டு.";
  const isSpeakingKural81 = isSpeaking(kural81Tamil);
  useEffect(() => registerSystem({ order: 60, step: () => {
    if (monolithRef.current) {
      const hidden = staticHero || heroScrollProgress.current < 0.66;
      monolithRef.current.inert = hidden;
      monolithRef.current.setAttribute("aria-hidden", String(hidden));
    }
  } }), [staticHero]);

  const pinnedWrapperRef = useRef<HTMLDivElement>(null);
  const pinnedViewportRef = useRef<HTMLDivElement>(null);
  const actIIKuralRef = useRef<HTMLDivElement>(null);
  const kuralTamilRef = useRef<HTMLQuoteElement>(null);
  const kuralEnglishRef = useRef<HTMLParagraphElement>(null);
  const kuralMetaRef = useRef<HTMLDivElement>(null);
  const monolithRef = useRef<HTMLElement>(null);
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
      // 1. Master Pinned Timeline: Pins the 100dvh viewport container while scrubbing 300vh (§MASTER DIRECTIVE)
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

        // Toggle hero purge dataset attribute (active during Acts I & II up to 0.60)
        const isPurge = scrubbedP < 0.60;
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
        if (!isPurge) {

          // Terminal Boot Sequence (GSAP ScrambleText) on Act III Monolith
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
        }

        // Governor render pause & inert focus trap guard
        if (scrubbedP >= 0.95) {
          if (kural) kural.setAttribute("inert", "");
        } else {
          if (kural) kural.removeAttribute("inert");
        }
      });


      // =========================================================================
      // ACT II: 0.52 -> 0.70 Scroll (§PRD 9: KURAL TIERS INSIDE WREATH)
      // 3-Tier Staggered Reveal for Kural 81 centered inside wreath cradle
      // Reading Plateau Hold from 0.64 -> 0.70 before curtain rise
      // =========================================================================
      if (kural) {
        tl.fromTo(
          kural,
          { opacity: 0 },
          { opacity: 1, duration: 0.02, ease: "none" },
          0.52
        );
      }

      // Tier 1: Tamil Script (0.53 -> 0.57, slide up + blur 10px -> 0px)
      if (tamil) {
        tl.fromTo(
          tamil,
          { opacity: 0, y: 35, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.04,
            ease: "power2.out",
            onStart: () => {
              soundEngine.playTempleChime();
            },
          },
          0.53
        );
      }

      // Tier 2: English Translation (0.57 -> 0.61, word-by-word cascade)
      if (split && split.words && split.words.length > 0) {
        tl.fromTo(
          split.words,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, stagger: 0.002, duration: 0.04, ease: "power2.out" },
          0.57
        );
      }

      // Tier 3: Metadata / Caption (0.61 -> 0.64)
      if (meta) {
        tl.fromTo(
          meta,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.03, ease: "power2.out" },
          0.61
        );
      }

      // Reading Hold Plateau (0.64 -> 0.70): Generous reading dwell with wreath formed.
      // Exit of Kural at start of curtain rise (0.70 -> 0.73)
      if (kural) {
        tl.to(
          kural,
          { opacity: 0, y: -20, filter: "blur(6px)", duration: 0.03, ease: "power1.in" },
          0.70
        );
      }

      // =========================================================================
      // ACT III: 0.72 -> 0.80 Scroll ("Curtain Rise", slides up and settles)
      // Monolith slides UP (yPercent: 100 -> 0) naturally covering the WebGL scene
      // and stays resting and visible through 0.80 -> 1.00
      // =========================================================================
      if (monolith) {
        tl.fromTo(
          monolith,
          { yPercent: 100 },
          { yPercent: 0, duration: 0.08, ease: "power2.out" },
          0.72
        );
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
        <h1>OSU Tamil Sangam · Official Tamil Cultural Student Organization at The Ohio State University</h1>
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
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#A6F0CF] focus:text-[#140C20] focus:font-space-mono focus:text-xs focus:font-bold focus:outline-none"
      >
        SKIP TO CONTENT &rarr;
      </a>

      {/* 0. Tactile Heritage Sandstone Texture Overlay */}
      <HeritageTextureOverlay variant="sandstone" opacity={0.02} />

      {/* =========================================================================
          ACTS I, II & III: 420vh PINNED DOM WRAPPER & GSAP TIMELINE (CINEMATIC)
          ========================================================================= */}
      <div
        ref={pinnedWrapperRef}
        data-hero-pinned="home"
        id="act-i-viewport-wrapper"
        className={`relative w-full bg-hero-espresso ${staticHero ? "h-dvh" : "h-[420dvh]"}`}
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
                  className="group cursor-pointer font-noto-serif-tamil text-[clamp(1.15rem,1.65vw,1.55rem)] text-[#FAFAFA] font-medium p-3 sm:p-4 rounded-xl transition-all duration-300 hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4FD6E0]"
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
                className="font-space-mono text-xs sm:text-sm text-white/80 max-w-lg mt-6 sm:mt-7 leading-relaxed sm:leading-loose tracking-wide"
              >
                &ldquo;The entire virtue of establishing a home is to welcome guests with an open heart and extend generosity.&rdquo;
              </p>

              {/* Tier 3: Clean, unboxed monospace line with subtle audio button (§MASTER DIRECTIVE) */}
              <div
                ref={kuralMetaRef}
                className="mt-5 sm:mt-6 flex items-center justify-center gap-2.5 font-space-mono text-[10px] sm:text-[11px] text-[#A6F0CF]/85 tracking-[0.22em] uppercase pointer-events-auto"
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

          {/* =========================================================================
              ACT III: THE MONOLITH SPLIT ("CURTAIN RISE" SLIDE-UP AT SCROLL 0.72)
              ========================================================================= */}
          <section
            hidden={staticHero}
            style={staticHero ? { display: "none" } : undefined}
            id="monolith"
            ref={monolithRef}
            className="absolute inset-0 z-20 w-full h-[100dvh] overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-[#140C20] border-t border-[rgba(125,96,166,0.25)] text-[#F4F0FA]"
          >
            {/* Left Column (4 Cols - The Anchor, §PRD 9.1) */}
            <div className="lg:col-span-4 relative p-6 pt-16 sm:p-8 sm:pt-20 lg:p-8 lg:pt-20 xl:p-12 xl:pt-24 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[rgba(125,96,166,0.25)] overflow-hidden">
              {/* Absolute Massive Tamil Numeral Watermark: glowing mint accent */}
              <div
                aria-hidden="true"
                className="absolute -bottom-10 -left-6 text-[clamp(14rem,32vw,36rem)] font-noto-serif-tamil font-bold text-[#A6F0CF] opacity-[0.09] select-none pointer-events-none leading-none drop-shadow-[0_0_35px_rgba(166,240,207,0.25)]"
              >
                ௦௧
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(166,240,207,0.08),transparent_65%)] pointer-events-none" aria-hidden="true" />

              {/* Top Anchor Header */}
              <div className="relative z-10 space-y-3">
                <span className="font-space-mono text-[10px] text-[#A6F0CF] tracking-widest uppercase block font-semibold">
                  COLUMBUS CHAPTER
                </span>
                <p
                  ref={monolithTamilRef}
                  lang="ta"
                  style={{ letterSpacing: 0 }}
                  className="font-noto-serif-tamil text-base sm:text-lg text-[#F4F0FA] leading-relaxed"
                >
                  ஓஹியோ மாநிலத்தில் தமிழ் மரபையும் மாணவர் தோழமையையும் ஒன்றிணைக்கும் கலாச்சாரப் பீடம்.
                </p>
              </div>
            </div>

            {/* Right Column (8 Cols - The Dossier) */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              {/* Constitutional Introduction */}
              <div className="p-5 pt-14 sm:p-7 sm:pt-16 lg:p-7 lg:pt-16 xl:p-10 xl:pt-20 border-b border-[rgba(125,96,166,0.25)]">
                <span className="font-space-mono text-[10px] text-[#A6F0CF] tracking-widest uppercase block mb-1.5 font-semibold">
                  COMMUNITY CHARTER · OHIO STATE
                </span>
                <h1 className="text-[clamp(1.5rem,2.5vw,2.5rem)] font-display font-medium text-[#F4F0FA] leading-tight tracking-tight">
                  Tamil Sangam at Ohio State
                </h1>
                <p className="mt-1 text-xs sm:text-sm font-mono text-[#A6F0CF] tracking-wider uppercase font-medium">
                  Open Year-Round · No Language Requirement
                </p>
                <p ref={monolithPrologueRef} className="mt-2.5 text-xs sm:text-[14px] text-[#C4B7D7] font-body leading-relaxed max-w-2xl">
                  OSU Tamil Sangam is the official collegiate student organization celebrating Tamil heritage, language, and community at The Ohio State University in Columbus, Ohio. Founded in 2021 as a registered student organization, we welcome all students with 100% free membership, zero dues, authentic cultural feasts, collegiate dance, and semester gatherings.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-5">
                  <Link
                    href="/join"
                    onClick={playClick}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#A6F0CF] text-[#140C20] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#7AE7B5] transition-colors ticket-chamfer-tl-br shadow-sm"
                  >
                    Join the Hearth →
                  </Link>
                  <Link
                    href="/events"
                    onClick={playClick}
                    className="font-mono text-xs uppercase tracking-wider text-[#F4F0FA] hover:text-[#A6F0CF] border-b border-[rgba(125,96,166,0.25)] hover:border-[#A6F0CF] pb-0.5 transition-colors"
                  >
                    Campus Events ↗
                  </Link>
                  <Link
                    href="/about"
                    onClick={playClick}
                    className="font-mono text-xs uppercase tracking-wider text-[#C4B7D7] hover:text-[#A6F0CF] border-b border-transparent hover:border-[#A6F0CF] pb-0.5 transition-colors"
                  >
                    About Us ↗
                  </Link>
                  <Link
                    href="/board"
                    onClick={playClick}
                    className="font-mono text-xs uppercase tracking-wider text-[#C4B7D7] hover:text-[#A6F0CF] border-b border-transparent hover:border-[#A6F0CF] pb-0.5 transition-colors"
                  >
                    Executive Board ↗
                  </Link>
                  <Link
                    href="/gallery"
                    onClick={playClick}
                    className="font-mono text-xs uppercase tracking-wider text-[#C4B7D7] hover:text-[#A6F0CF] border-b border-transparent hover:border-[#A6F0CF] pb-0.5 transition-colors"
                  >
                    Photo Archive ↗
                  </Link>
                </div>
              </div>

              {/* The Three Horizontal Ribbons with Hover Kinematics */}
              <div className="divide-y divide-[rgba(125,96,166,0.25)]">
                {/* Ribbon 1: CULTURAL HERITAGE */}
                <Link
                  href="/about"
                  onClick={playClick}
                  onMouseEnter={() => {
                    audioLayer.playTapeClack();
                  }}
                  data-cursor="bracket"
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 lg:p-4 xl:p-5 hover:bg-[#140C20]/[0.03] transition-[transform,color,background-color] duration-300 ease-out"
                >
                  <div className="flex items-start sm:items-center gap-5 transition-transform duration-300 ease-out group-hover:translate-x-3">
                    <span className="font-space-mono text-xs sm:text-sm text-[#A6F0CF] font-semibold transition-colors">
                      01 ·
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-editorial font-bold text-[#F4F0FA] group-hover:text-[#A6F0CF] transition-colors">
                        CULTURAL HERITAGE & LANGUAGE
                      </h4>
                      <p className="text-xs sm:text-sm text-[#C4B7D7] mt-0.5 font-body">
                        Conversational Tamil workshops, Sangam literature explorations & Dravidian living arts.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-2 font-space-mono text-xs text-[#F4F0FA]/60 group-hover:text-[#A6F0CF] transition-colors shrink-0">
                    <span className="hidden sm:inline">EXPLORE ARCHIVE</span>
                    <span className="text-sm font-mono leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </div>
                </Link>

                {/* Ribbon 2: THE BANQUET TABLE & FESTIVALS */}
                <Link
                  href="/events"
                  onClick={playClick}
                  onMouseEnter={() => {
                    audioLayer.playTapeClack();
                  }}
                  data-cursor="bracket"
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 lg:p-4 xl:p-5 hover:bg-[#140C20]/[0.03] transition-[transform,color,background-color] duration-300 ease-out"
                >
                  <div className="flex items-start sm:items-center gap-5 transition-transform duration-300 ease-out group-hover:translate-x-3">
                    <span className="font-space-mono text-xs sm:text-sm text-[#A6F0CF] font-semibold transition-colors">
                      02 ·
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-editorial font-bold text-[#F4F0FA] group-hover:text-[#A6F0CF] transition-colors">
                        FESTIVALS & BANQUET TABLE
                      </h4>
                      <p className="text-xs sm:text-sm text-[#C4B7D7] mt-0.5 font-body">
                        Authentic South Indian cuisine, streetside sapad & major campus festivals like Diwali and Pongal.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-2 font-space-mono text-xs text-[#F4F0FA]/60 group-hover:text-[#A6F0CF] transition-colors shrink-0">
                    <span className="hidden sm:inline">VIEW GATHERINGS</span>
                    <span className="text-sm font-mono leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </div>
                </Link>

                {/* Ribbon 3: PEER MENTORSHIP & KINSHIP */}
                <Link
                  href="/join"
                  onClick={playClick}
                  onMouseEnter={() => {
                    audioLayer.playTapeClack();
                  }}
                  onPointerDown={() => {
                    audioLayer.playSubBassThud();
                  }}
                  data-cursor="bracket"
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 lg:p-4 xl:p-5 hover:bg-[#140C20]/[0.03] transition-[transform,color,background-color] duration-300 ease-out border-b border-[rgba(125,96,166,0.25)] lg:border-b-0"
                >
                  <div className="flex items-start sm:items-center gap-5 transition-transform duration-300 ease-out group-hover:translate-x-3">
                    <span className="font-space-mono text-xs sm:text-sm text-[#A6F0CF] font-semibold transition-colors">
                      03 ·
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-editorial font-bold text-[#F4F0FA] group-hover:text-[#A6F0CF] transition-colors">
                        PEER MENTORSHIP & KINSHIP
                      </h4>
                      <p className="text-xs sm:text-sm text-[#C4B7D7] mt-0.5 font-body">
                        Freshman peer guidance, community volunteering & inclusive South Asian student solidarity.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-2 font-space-mono text-xs text-[#F4F0FA]/60 group-hover:text-[#A6F0CF] transition-colors shrink-0">
                    <span className="hidden sm:inline">JOIN THE COMMUNITY</span>
                    <span className="text-sm font-mono leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* =========================================================================
          THE SUNLIT MUTTRAM (COURTYARD) ARCHITECTURE
          Royal Violet (#140C20), Raised Surface (#25173B), Off-White (#F4F0FA)
          Glides up over the pinned stage (p = 0.88 -> 1.00)
          ========================================================================= */}
      <EditorialSheetHandoff id="flagship-gathering" badge="CAMPUS HEARTH" sublabel="COLUMBUS, OH" overlapHero={false}>

        {/* Puranaanuru 192 Sunlit Wisdom Banner */}
        <div className="relative bg-[#25173B] border-y border-[#A6F0CF]/25 py-6 px-6 text-center select-none overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(166,240,207,0.12),transparent_70%)]" aria-hidden="true" />
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 font-sans text-xs text-[#C4B7D7]">
            <span lang="ta" style={{ letterSpacing: 0 }} className="text-base font-serif font-bold text-[#A6F0CF]">
              யாதும் ஊரே யாவரும் கேளிர்
            </span>
            <span className="hidden sm:inline text-[#A6F0CF]/40">·</span>
            <span className="font-serif italic text-base text-[#F4F0FA]">
              &ldquo;To us all towns are home, everyone our kin.&rdquo;
            </span>
            <span className="hidden md:inline text-[#A6F0CF]/40">·</span>
            <span className="text-[#A6F0CF] tracking-widest uppercase text-[11px] font-semibold">
              Kaniyan Poongundranar · Puranaanuru 192
            </span>
          </div>
        </div>

        <KolamSectionRule tone="sandstone" />

        {/* 1. Quick-Action Command Strip: Immediate visibility into upcoming gathering & actions */}
        <div className="relative bg-[#140C20] border-b border-[#A6F0CF]/30 py-3.5 px-6 bg-[radial-gradient(ellipse_at_top,rgba(166,240,207,0.06),transparent_80%)]">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A6F0CF] animate-pulse" />
              <span className="font-semibold text-[#F4F0FA] uppercase tracking-wider">
                Upcoming Flagship Gathering
              </span>
              <span className="hidden sm:inline text-[#C4B7D7]">·</span>
              <span className="hidden sm:inline text-[#C4B7D7]">
                Free Admission · All Buckeyes Welcome
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/events"
                onClick={playClick}
                className="font-semibold text-[#A6F0CF] hover:text-[#F4F0FA] transition-colors border-b border-[#A6F0CF] pb-0.5"
              >
                View Event Schedule →
              </Link>
              <span className="text-[#C4B7D7]">|</span>
              <Link
                href="/join"
                onClick={playClick}
                className="font-semibold text-[#F4F0FA] hover:text-[#A6F0CF] transition-colors"
              >
                Sign Guestbook →
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FEATURED NEXT EVENT: DYNAMIC FLAGSHIP EVENT ENGINE
            ========================================================================= */}
        <NextFlagshipGathering />

        <KolamSectionRule tone="light" />

        {/* 2. The 3 Core Pillars: Clean 3-Column Layout */}
        <SilkHoverPillars />

        <KolamSectionRule tone="sandstone" />

        {/* 3. Direct Join / Involvement CTA: Streamlined Entry to /join and /links */}
        <OrganicRouteGateway
          eyebrow="Student Fellowship & Social Hub"
          tamilEyebrow="இணைவு"
          title="A Warm Hearth on the Banks of the Olentangy"
          tamilTitle="ஓலண்டாஞ்சி நதிக்கரையில் ஒரு பாசமிகு திண்ணை"
          description="Whether you crave authentic home-cooked flavors, want to dance, or simply want to find friendly faces on campus, our community is 100% free with zero dues."
          primaryHref="/join"
          primaryLabel="Sign the Free Guestbook"
          secondaryHref="/links"
          secondaryLabel="Open Bio Links & Socials"
        />

        <KolamSectionRule tone="light" />

        {/* =========================================================================
            COMMUNITY KINSHIP PROOF STRIP (Zero Bounding Boxes, 1px Grounding Line)
            ========================================================================= */}
        <section className="py-24 sm:py-32 px-6 sm:px-12 max-w-[1600px] mx-auto">
          <div className="border-t border-b border-[rgba(125,96,166,0.25)] py-16 sm:py-24 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 text-left">
            <div className="relative space-y-3">
              <motion.span aria-hidden="true" className="absolute -left-6 top-0 hidden h-full w-px origin-top bg-[#A6F0CF]/30 md:block" initial={reducedMotion ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
              <span className="font-serif tabular-nums text-5xl sm:text-6xl font-light text-[#A6F0CF] block"><span aria-hidden="true"><CountUp to={120} />+</span><span className="sr-only">120+</span></span>
              <span className="font-sans text-xs uppercase tracking-widest text-[#F4F0FA] block font-semibold">Buckeyes & Community</span>
              <p className="text-sm text-[#C4B7D7] font-sans leading-relaxed">
                Undergraduate and graduate students from every college, alumni, and friends across Columbus.
              </p>
            </div>
            <div className="relative space-y-3">
              <motion.span aria-hidden="true" className="absolute -left-6 top-0 hidden h-full w-px origin-top bg-[#A6F0CF]/30 md:block" initial={reducedMotion ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
              <span className="font-serif text-5xl sm:text-6xl font-light text-[#A6F0CF] block"><span aria-hidden="true">0<CountUp to={4} />+</span><span className="sr-only">04+</span></span>
              <span className="font-sans text-xs uppercase tracking-widest text-[#F4F0FA] block font-semibold">Years of Kinship</span>
              <p className="text-sm text-[#C4B7D7] font-sans leading-relaxed">
                Informally founded in 2021; chartered as a recognized student organization at Ohio State in 2024.
              </p>
            </div>
            <div className="relative space-y-3">
              <motion.span aria-hidden="true" className="absolute -left-6 top-0 hidden h-full w-px origin-top bg-[#A6F0CF]/30 md:block" initial={reducedMotion ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
              <span className="font-serif text-5xl sm:text-6xl font-light text-[#F4F0FA] block"><span aria-hidden="true"><CountUp to={100} />%</span><span className="sr-only">100%</span></span>
              <span className="font-sans text-xs uppercase tracking-widest text-[#F4F0FA] block font-semibold">Zero Dues · Open Hearth</span>
              <p className="text-sm text-[#C4B7D7] font-sans leading-relaxed">
                Membership is completely voluntary and free. No language test. No attendance quotas to participate.
              </p>
            </div>
          </div>
        </section>
      </EditorialSheetHandoff>
    </div>
  );
}
