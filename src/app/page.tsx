"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { DigitalKolamHero } from "@/components/hero/DigitalKolamHero";
import { SilkHoverPillars } from "@/components/home/SilkHoverPillars";
import { FilterKaapiGlyph } from "@/components/ui/KolamIcons";
import { PalagaiButton } from "@/components/ui/PalagaiButton";
import { Magnetic } from "@/components/ui/Magnetic";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";
import { CulturalGlossaryTerm } from "@/components/ui/CulturalGlossaryTerm";
import { HeritageTextureOverlay } from "@/components/ui/HeritageTextureOverlay";
import { setHeroScrollProgress } from "@/engine/heroScrollStore";
import { governor } from "@/engine/governor";
import { EVENTS } from "@/data/events";
import { Calendar, MapPin } from "lucide-react";
import { audioLayer } from "@/utils/audioLayer";
import { SANGAM_CIPHER_CHARS, triggerTerminalDecode } from "@/utils/scrambleTerminal";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

export default function HomePage() {
  const { locale } = useLocale();
  const { playClick } = useAudio();
  const nextEvent = EVENTS[0];

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

  // GSAP 3-Act Scroll-Telling Setup (Zero React Re-renders on Scroll)
  useEffect(() => {
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

    const nav = document.getElementById("global-floating-nav");
    const chatbot = document.getElementById("global-sangam-chatbot");

    const ctx = gsap.context(() => {
      // 1. Master Pinned Timeline: Pins the 100dvh viewport container while scrubbing 300vh (§MASTER DIRECTIVE)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          pin: viewport,
          anticipatePin: 1,
          scrub: 0.6, // PRD §9: scrub 0.6
          onUpdate: (self) => {
            // Hot loop state update without triggering React reconciliation
            setHeroScrollProgress(self.progress);

            // Toggle hero purge dataset attribute (active during Acts I & II up to 0.60)
            if (self.progress < 0.60) {
              document.body.dataset.heroPurge = "true";
              delete document.body.dataset.heroPassed;
            } else {
              delete document.body.dataset.heroPurge;
              document.body.dataset.heroPassed = "true";

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
            if (self.progress >= 0.95) {
              governor.request("home-kolam", 0);
              if (kural) kural.setAttribute("inert", "");
            } else {
              governor.request("home-kolam", Math.abs(self.getVelocity()) > 10 ? 2 : 1);
              if (kural) kural.removeAttribute("inert");
            }
          },
        },
      });

      // =========================================================================
      // CLUTTER ASSASSINATION & PERSISTENT NAV EMERGENCE (§PRD 9 & 10)
      // Hide Navbar and Chatbot throughout Acts I & II (0.00 -> 0.60).
      // Once scrolled past the hero wreath (0.60+), navbar becomes FULLY VISIBLE!
      // =========================================================================
      if (nav) {
        tl.fromTo(
          nav,
          { opacity: 0, pointerEvents: "none" },
          { opacity: 1, pointerEvents: "auto", duration: 0.04, ease: "power2.out" },
          0.60
        );
      }
      if (chatbot) {
        tl.fromTo(
          chatbot,
          { opacity: 0, pointerEvents: "none" },
          { opacity: 1, pointerEvents: "auto", duration: 0.04, ease: "power2.out" },
          0.60
        );
      }

      // =========================================================================
      // ACT II: 0.54 -> 0.66 Scroll (§PRD 9: KURAL TIERS INSIDE WREATH)
      // 3-Tier Staggered Reveal for Kural 81 centered inside wreath cradle
      // =========================================================================
      if (kural) {
        tl.fromTo(
          kural,
          { opacity: 0 },
          { opacity: 1, duration: 0.02, ease: "none" },
          0.53
        );
      }

      // Tier 1: Tamil Script (0.54 -> 0.58, slide up + blur 10px -> 0px)
      if (tamil) {
        tl.fromTo(
          tamil,
          { opacity: 0, y: 35, filter: "blur(10px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.04, ease: "power2.out" },
          0.54
        );
      }

      // Tier 2: English Translation (0.58 -> 0.62, word-by-word cascade)
      if (split && split.words && split.words.length > 0) {
        tl.fromTo(
          split.words,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, stagger: 0.002, duration: 0.04, ease: "power2.out" },
          0.58
        );
      }

      // Tier 3: Metadata / Caption (0.62 -> 0.66)
      if (meta) {
        tl.fromTo(
          meta,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.04, ease: "power2.out" },
          0.62
        );
      }

      // Dwell period (0.66 -> 0.762): Reading pause with wreath formed.
      // Exit of Kural at start of curtain rise (0.74 -> 0.762)
      if (kural) {
        tl.to(
          kural,
          { opacity: 0, y: -20, filter: "blur(6px)", duration: 0.022, ease: "power1.in" },
          0.74
        );
      }

      // =========================================================================
      // ACT III: 0.762 -> 1.00 Scroll ("Curtain Rise", §PRD 9, ACT3_START = 0.762)
      // Monolith slides UP (yPercent: 100 -> 0) naturally covering the WebGL scene
      // =========================================================================
      if (monolith) {
        tl.fromTo(
          monolith,
          { yPercent: 100 },
          { yPercent: 0, duration: 0.238, ease: "none" },
          0.762
        );
      }
    }, wrapper);

    return () => {
      if (split) split.revert();
      ctx.revert();
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden font-body text-left">
      {/* Accessible Skip Link (PRD §7.11) */}
      <a
        href="#monolith"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#FFB84D] focus:text-black focus:font-space-mono focus:text-xs focus:font-bold focus:outline-none"
      >
        SKIP TO CONTENT &rarr;
      </a>

      {/* 0. Tactile Heritage Sandstone Texture Overlay */}
      <HeritageTextureOverlay variant="sandstone" opacity={0.02} />

      {/* =========================================================================
          ACTS I, II & III: 300vh PINNED DOM WRAPPER & GSAP TIMELINE (CINEMATIC)
          ========================================================================= */}
      <div
        ref={pinnedWrapperRef}
        data-hero-pinned="home"
        id="act-i-viewport-wrapper"
        className="relative w-full h-[520dvh]"
      >
        {/* Pinned 100dvh Viewport Container */}
        <div
          ref={pinnedViewportRef}
          className="w-full h-[100dvh] overflow-hidden bg-transparent text-white"
        >
          {/* Act I: WebGL Canvas Layer (Digital Kolam + 3D Emblem) */}
          <DigitalKolamHero />

          {/* Act II: Centered Poetic Inscription (Kural 81) in Pure Negative Space (§MASTER DIRECTIVE) */}
          <div
            ref={actIIKuralRef}
            className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center px-4 sm:px-8 text-center"
            style={{ opacity: 0 }}
          >
            <div className="max-w-3xl mx-auto flex flex-col items-center justify-center translate-y-8 sm:translate-y-12 lg:translate-y-14">
              {/* Tier 1: Tamil Inscription (Strictly 2 Lines, Blur 10px -> 0px, y: 35 -> 0, NO shadow) */}
              <blockquote
                ref={kuralTamilRef}
                lang="ta"
                className="font-noto-serif-tamil text-[clamp(1.35rem,2.4vw,2.25rem)] text-[#FAFAFA] font-medium tracking-wide"
                style={{ letterSpacing: "0.02em" }}
              >
                <span className="block sm:whitespace-nowrap leading-[1.8] sm:leading-[1.9]">
                  இருந்தோம்பி இல்வாழ்வ தெல்லாம் விருந்தோம்பி
                </span>
                <span className="block sm:whitespace-nowrap mt-4 sm:mt-5 leading-[1.8] sm:leading-[1.9]">
                  வேளாண்மை செய்தற் பொருட்டு.
                </span>
              </blockquote>

              {/* Tier 2: Translation (SplitText word-by-word cascade) */}
              <p
                ref={kuralEnglishRef}
                className="font-space-mono text-xs sm:text-sm text-white/80 max-w-xl mt-8 sm:mt-10 leading-relaxed sm:leading-loose tracking-wide"
              >
                &ldquo;The entire virtue of establishing a home is to welcome guests with an open heart and extend generosity.&rdquo;
              </p>

              {/* Tier 3: Clean, unboxed monospace line (§MASTER DIRECTIVE) */}
              <div
                ref={kuralMetaRef}
                className="mt-6 sm:mt-8 font-space-mono text-[10px] sm:text-[11px] text-[#FFB84D]/85 tracking-[0.22em] uppercase"
              >
                THIRUKKURAL 81 // ADHIGAARAM 9
              </div>
            </div>
          </div>

          {/* =========================================================================
              ACT III: THE MONOLITH SPLIT ("CURTAIN RISE" SLIDE-UP AT SCROLL 0.66)
              ========================================================================= */}
          <section
            id="monolith"
            ref={monolithRef}
            className="absolute inset-0 z-20 w-full h-[100dvh] overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-[#050201] border-t border-white/10 text-white"
          >
            {/* Left Column (4 Cols - The Anchor, §PRD 9.1) */}
            <div className="lg:col-span-4 relative p-6 pt-20 sm:p-10 sm:pt-24 lg:p-12 lg:pt-24 xl:p-14 xl:pt-24 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden">
              {/* Absolute Massive Tamil Numeral Watermark: 3% opacity positioned bottom-left clipped */}
              <div
                aria-hidden="true"
                className="absolute -bottom-10 -left-6 text-[clamp(14rem,32vw,36rem)] font-noto-serif-tamil font-bold text-white opacity-[0.03] select-none pointer-events-none leading-none"
              >
                ௦௧
              </div>

              {/* Top Anchor Header */}
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 border border-white/10 px-3 py-1 bg-white/[0.02] font-space-mono text-[10px] tracking-widest text-[#FFB84D] uppercase">
                  <span className="w-1.5 h-1.5 bg-[#FFB84D]" />
                  <span>ACT III // THE ANCHOR</span>
                </div>

                <p
                  ref={monolithTamilRef}
                  lang="ta"
                  style={{ letterSpacing: 0 }}
                  className="font-noto-serif-tamil text-sm sm:text-base text-neutral-400 leading-relaxed pt-2"
                >
                  ஓஹியோ மாநிலத்தில் தமிழ் மரபையும் மாணவர் தோழமையையும் ஒன்றிணைக்கும் கலாச்சாரப் பீடம்.
                </p>
              </div>

              {/* Live Telemetry Lockup at Bottom (PRD §9.1) */}
              <div className="relative z-10 pt-8 mt-auto border-t border-white/10 space-y-2.5 font-space-mono text-[11px] tracking-[0.18em] text-neutral-400">
                <div className="flex items-center justify-between">
                  <span className="text-white/40">COLUMBUS, OHIO</span>
                  <span ref={liveTimeRef} className="text-white font-medium">--:--:-- EDT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40">OLENTANGY RIVER</span>
                  <span className="text-[#55CCA2] font-medium">40.0067° N · 83.0305° W</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40">CHAPTER</span>
                  <span className="text-white font-medium">EST. 2024 · 120+ MEMBERS</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40">COMMUNITY</span>
                  <span className="text-white font-medium">ALL MAJORS WELCOME</span>
                </div>
              </div>
            </div>

            {/* Right Column (8 Cols - The Dossier) */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              {/* Editorial Hook */}
              <div className="p-6 pt-20 sm:p-10 sm:pt-24 lg:p-12 lg:pt-24 xl:p-14 xl:pt-24 border-b border-white/10">
                <span className="font-space-mono text-[10px] text-white/40 tracking-widest uppercase block mb-3">
                  EDITORIAL PROLOGUE
                </span>
                <h3 className="text-[clamp(2rem,3.8vw,3.75rem)] font-display font-medium text-white leading-snug tracking-tight">
                  &ldquo;A hearth on the banks of the Olentangy.&rdquo;
                </h3>
                <p ref={monolithPrologueRef} className="mt-4 text-sm sm:text-base text-neutral-300 font-body leading-relaxed max-w-2xl">
                  Born from the longing for home-cooked meals, late-night filter coffee, and the rhythm of Sangam verses beneath Midwest skies. We bridge ancient Tamil civilization with collegiate celebration, open dance floors, and lifelong kinship.
                </p>
              </div>

              {/* The Three Horizontal Ribbons with Hover Kinematics */}
              <div className="divide-y divide-white/10">
                {/* Ribbon 1: CULTURAL MEMORY */}
                <Link
                  href="/about"
                  onClick={playClick}
                  onMouseEnter={() => {
                    audioLayer.playTapeClack();
                  }}
                  data-cursor="bracket"
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-7 hover:bg-white/[0.03] transition-[transform,color,background-color] duration-300 ease-out"
                >
                  <div className="flex items-start sm:items-center gap-5 transition-transform duration-300 ease-out group-hover:translate-x-3">
                    <span className="font-space-mono text-xs sm:text-sm text-white/40 group-hover:text-[#FFB84D] transition-colors">
                      01 //
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-editorial font-bold text-white group-hover:text-[#FFB84D] transition-colors">
                        CULTURAL MEMORY
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 font-body">
                        Classical Sangam heritage, Tamil literature & living Dravidian architectural traditions.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-2 font-space-mono text-xs text-white/40 group-hover:text-[#FFB84D] transition-colors shrink-0">
                    <span className="hidden sm:inline">EXPLORE ARCHIVE</span>
                    <span className="text-sm font-mono leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </div>
                </Link>

                {/* Ribbon 2: THE BANQUET TABLE */}
                <Link
                  href="/events"
                  onClick={playClick}
                  onMouseEnter={() => {
                    audioLayer.playTapeClack();
                  }}
                  data-cursor="bracket"
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-7 hover:bg-white/[0.03] transition-[transform,color,background-color] duration-300 ease-out"
                >
                  <div className="flex items-start sm:items-center gap-5 transition-transform duration-300 ease-out group-hover:translate-x-3">
                    <span className="font-space-mono text-xs sm:text-sm text-white/40 group-hover:text-[#FFB84D] transition-colors">
                      02 //
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-editorial font-bold text-white group-hover:text-[#FFB84D] transition-colors">
                        THE BANQUET TABLE
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 font-body">
                        Streetside sapad, fresh dosas, frothy degree kaapi & annual Pongal celebrations.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-2 font-space-mono text-xs text-white/40 group-hover:text-[#FFB84D] transition-colors shrink-0">
                    <span className="hidden sm:inline">VIEW GATHERINGS</span>
                    <span className="text-sm font-mono leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </div>
                </Link>

                {/* Ribbon 3: KINSHIP & DIASPORA */}
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
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-7 hover:bg-white/[0.03] transition-[transform,color,background-color] duration-300 ease-out border-b border-white/10 lg:border-b-0"
                >
                  <div className="flex items-start sm:items-center gap-5 transition-transform duration-300 ease-out group-hover:translate-x-3">
                    <span className="font-space-mono text-xs sm:text-sm text-white/40 group-hover:text-[#FFB84D] transition-colors">
                      03 //
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-editorial font-bold text-white group-hover:text-[#FFB84D] transition-colors">
                        KINSHIP & DIASPORA
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 font-body">
                        Student mentorship, Buckeye peer connections & collegiate South Asian solidarity.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-2 font-space-mono text-xs text-white/40 group-hover:text-[#FFB84D] transition-colors shrink-0">
                    <span className="hidden sm:inline">JOIN THE HEARTH</span>
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
          CONTINUED EDITORIAL SECTIONS (WARM IVORY CANVAS)
          ========================================================================= */}
      <div className="relative z-20 w-full bg-[#fffdfa] text-neutral-900">

        {/* The Oolai Chuvadi (Palm Leaf) Manuscript Aspect-Ratio Banner */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-10 -mb-6">
          <div className="oolai-chuvadi relative flex items-center justify-between gap-4 py-3 sm:py-3.5 px-6 sm:px-12 bg-[#fbf5e6] text-[#2c1507] border border-[#B5A642]/45 shadow-[0_4px_20px_rgba(181,166,66,0.12)] hover:border-[#B5A642] hover-glow-kuthuvilakku transition-all duration-300">
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#522909]/20 border border-[#522909]/40 shadow-inner" />
              <div className="w-6 h-[1px] bg-[#B5A642]/40" />
            </div>

            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
              <span
                lang="ta"
                style={{ letterSpacing: 0 }}
                className="text-xs sm:text-sm font-noto-tamil font-bold text-[#4a2307] tracking-normal"
              >
                யாதும் ஊரே யாவரும் கேளீர்
              </span>
              <span className="hidden sm:inline text-[#B5A642]/60">·</span>
              <span className="text-[11px] sm:text-xs font-serif italic text-[#5c310c]">
                &quot;To us, all towns are our own, and all people are our kin.&quot;
              </span>
              <span className="hidden md:inline text-[#B5A642]/60">·</span>
              <div className="hidden md:inline">
                <CulturalGlossaryTerm termKey="yaadhum-oore" className="text-[#87500e] text-[11px] font-mono">
                  Purananuru 192
                </CulturalGlossaryTerm>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <div className="w-6 h-[1px] bg-[#B5A642]/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#522909]/20 border border-[#522909]/40 shadow-inner" />
            </div>
          </div>
        </div>

        {/* Flagship Festival Spotlight */}
        <section className="relative py-20 px-4 sm:px-8 z-10 max-w-6xl mx-auto overflow-hidden">
          <WatermarkGlyph text="திருவிழா" opacity={0.04} align="right" theme="light" />

          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 relative z-10">
            <div>
              <h2
                className="text-[clamp(2rem,4vw+1rem,4.5rem)] font-extrabold text-[#250d38] tracking-tight font-display leading-[1.15]"
                {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}
              >
                {locale === "ta" ? "அடுத்த முக்கிய நிகழ்வு" : "Next Flagship Festival"}
              </h2>
            </div>
            <Link
              href="/events"
              onClick={playClick}
              className="text-xs font-space-mono text-[#4c2472] hover:text-[#11694c] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] transition-colors"
            >
              <span>{locale === "ta" ? "அனைத்து நிகழ்வுகளையும் காண்க →" : "See Every Event →"}</span>
            </Link>
          </div>

          <div className="rounded-none border border-[#B5A642]/40 bg-white p-6 sm:p-10 shadow-[4px_4px_0px_#4c2472] hover:shadow-[0_0_35px_rgba(255,184,77,0.22)] hover:border-[#FFB84D] transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="hidden lg:block absolute left-[58.33%] top-0 bottom-0 w-0 border-r-2 border-dashed border-[#B5A642]/40 pointer-events-none" />
            <div className="hidden lg:block absolute left-[58.33%] -top-3 -translate-x-1/2 w-6 h-6 bg-[#fffdfa] border border-[#B5A642]/40 rotate-45 z-20 pointer-events-none" />
            <div className="hidden lg:block absolute left-[58.33%] -bottom-3 -translate-x-1/2 w-6 h-6 bg-[#fffdfa] border border-[#B5A642]/40 rotate-45 z-20 pointer-events-none" />

            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold">
                <span className="text-[#11694c]">
                  {locale === "ta" ? nextEvent.statusBadgeTa : nextEvent.statusBadgeEn}
                </span>
                <span className="text-[#6b478d]">·</span>
                <span lang="ta" style={{ letterSpacing: 0 }} className="text-[#4c2472]">
                  {nextEvent.tamilDate}
                </span>
                <span className="text-[#6b478d]">·</span>
                <span className="text-slate-600 font-medium">{nextEvent.academicYear}</span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-extrabold text-[#250d38] font-display tracking-tight">
                {locale === "ta" ? nextEvent.titleTa : nextEvent.titleEn}
              </h3>

              <p className="text-sm sm:text-base text-[#250d38] font-medium leading-relaxed font-body">
                {locale === "ta" ? nextEvent.descriptionTa : nextEvent.descriptionEn}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-purple-900 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4c2472]" />
                  <span>
                    {nextEvent.date} · {nextEvent.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#4c2472]" />
                  <span>{nextEvent.location}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <PalagaiButton
                  href={`/events/${nextEvent.slug}`}
                  primaryText={locale === "ta" ? "நிகழ்ச்சி விவரங்கள் & அட்டவணை" : "View Event Details & Schedule"}
                  secondaryText={locale === "ta" ? "View Event Details & Schedule" : "நிகழ்ச்சி விவரங்கள் & அட்டவணை"}
                  variant="gold-foil"
                  className="w-full sm:w-auto justify-center"
                />
              </div>
            </div>

            <div className="lg:col-span-5 relative h-72 sm:h-84 rounded-none border border-[#B5A642]/50 shadow-[4px_4px_0px_#4c2472] overflow-hidden group">
              <Image
                src={nextEvent.posterImage}
                alt={nextEvent.titleEn}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-none"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
            </div>
          </div>
        </section>

        {/* The Four Pillars of OSU Tamil Sangam: Kanchipuram Silk Fluid Hover Reveals */}
        <SilkHoverPillars />

        {/* Photo Vault & Memories Spotlight */}
        <section className="relative py-16 px-4 sm:px-8 z-10 max-w-6xl mx-auto overflow-hidden">
          <WatermarkGlyph text="நினைவுகள்" opacity={0.038} align="left" theme="light" />

          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 relative z-10">
            <div>
              <h2
                className="text-[clamp(2rem,4vw+1rem,4.5rem)] font-extrabold text-[#250d38] tracking-tight font-display leading-[1.15]"
                {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}
              >
                {locale === "ta" ? "நினைவுகள் & புகைப்படத் தொகுப்பு" : "Memories & Photo Archives"}
              </h2>
            </div>
            <Link
              href="/gallery"
              onClick={playClick}
              className="text-xs font-space-mono text-[#4c2472] hover:text-[#11694c] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] transition-colors"
            >
              <span>{locale === "ta" ? "முழு தொகுப்பைக் காண்க →" : "Explore All Photo Archives →"}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <Link
              href="/gallery/berry-cute-picnic"
              onClick={playClick}
              className="rounded-none border border-[#B5A642]/35 bg-white shadow-[4px_4px_0px_#4c2472] hover:shadow-[0_0_35px_rgba(255,184,77,0.25)] hover:border-[#FFB84D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB84D] focus-visible:ring-offset-2 transition-all duration-300 ease-out group flex flex-col justify-between h-full overflow-hidden"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden border-b border-[#B5A642]/35 rounded-none">
                <Image
                  src="https://lh3.googleusercontent.com/pw/AP1GczPlVkHkFW39BMqHGdeuYa0EwT1OOXOGWweSVgrPMbn24CSvrUlwF8CS_x787kPudpRyXEgtSMteYmBp6Zbad4uzMgeqB6LfISOvbS0AO1-qHsPKtEoC=w1200-h800-no"
                  alt="TS A Berry Cute Picnic"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-[#250d38] font-display mb-1 group-hover:text-[#4c2472] transition-colors">
                  TS &quot;A Berry Cute Picnic&quot;
                </h3>
                <p className="text-xs text-[#250d38] font-medium line-clamp-2 leading-relaxed font-body">
                  Fall semester welcome picnic on the South Oval with snacks, card games, and good conversation.
                </p>
              </div>
            </Link>

            <Link
              href="/gallery/streetside-sapad"
              onClick={playClick}
              className="rounded-none border border-[#B5A642]/35 bg-white shadow-[4px_4px_0px_#4c2472] hover:shadow-[0_0_35px_rgba(255,184,77,0.25)] hover:border-[#FFB84D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB84D] focus-visible:ring-offset-2 transition-all duration-300 ease-out group flex flex-col justify-between h-full overflow-hidden"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden border-b border-[#B5A642]/35 rounded-none">
                <Image
                  src="https://lh3.googleusercontent.com/pw/AP1GczPoDEE5ppMuBlStSn71wmY-vnb9sbDehdzKVvxu_QvEJZfJ8hGCig4Bkxoe8Rx8-xpnXzZA02iZ2EZid-qciQ4V85WQKl44j_Ed6YLD25GTunQbulMG=w1200-h800-no"
                  alt="TS Streetside Sapad Event"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-[#250d38] font-display mb-1 group-hover:text-[#4c2472] transition-colors">
                  TS Streetside Sapad Event
                </h3>
                <p className="text-xs text-[#250d38] font-medium line-clamp-2 leading-relaxed font-body">
                  South Indian street food dinner featuring hot kothu parotta, fresh dosas, and filter coffee.
                </p>
              </div>
            </Link>

            <Link
              href="/gallery/namma-jathara"
              onClick={playClick}
              className="rounded-none border border-[#B5A642]/35 bg-white shadow-[4px_4px_0px_#4c2472] hover:shadow-[0_0_35px_rgba(255,184,77,0.25)] hover:border-[#FFB84D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB84D] focus-visible:ring-offset-2 transition-all duration-300 ease-out group flex flex-col justify-between h-full overflow-hidden"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden border-b border-[#B5A642]/35 rounded-none">
                <Image
                  src="https://lh3.googleusercontent.com/pw/AP1GczMckOLKN2caITiN5K1TOGffHjjgJrfgVuOLzMp4vuZ6J7kgf1CQB-PChurpUnPfiexScEG44wZkP-PWanuwwdRE3STuUUNN6LLQoe-ioZJ3MeSMpkCC=w1200-h800-no"
                  alt="TS x TT: Namma Jathara"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-[#250d38] font-display mb-1 group-hover:text-[#4c2472] transition-colors">
                  TS x TT: Namma Jathara
                </h3>
                <p className="text-xs text-[#250d38] font-medium line-clamp-2 leading-relaxed font-body">
                  A spring campus carnival hosted with Telugu Tamasha at OSU featuring outdoor games, music, and food stalls.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* Filter Coffee Intermission Pavilion Box */}
        <section className="relative py-16 px-4 sm:px-6 z-10 max-w-4xl mx-auto text-center overflow-hidden">
          <WatermarkGlyph text="வணக்கம்" opacity={0.045} align="center" theme="light" />

          <div className="p-8 sm:p-12 bg-[#250d38] rounded-none border border-[#B5A642]/50 shadow-[0_0_35px_rgba(255,184,77,0.18)] hover-glow-kuthuvilakku transition-all duration-300 relative overflow-hidden text-white z-10">
            <HeritageTextureOverlay variant="kanjeevaram" opacity={0.038} />

            <div className="flex justify-center mb-4 relative z-10">
              <FilterKaapiGlyph size={32} className="text-[#FFB84D]" />
            </div>

            <h3 className="text-[clamp(2rem,3.5vw+0.5rem,3.5rem)] font-display font-extrabold text-white mb-3 relative z-10 leading-[1.2]">
              {locale === "ta" ? "சூடான ஃபில்டர் காபி இடைவேளை" : "Filter Coffee Intermission"}
            </h3>

            <p className="text-xs sm:text-sm text-purple-200/90 max-w-lg mx-auto mb-6 leading-relaxed font-body relative z-10">
              {locale === "ta" ? (
                <span>
                  ஒரு நிமிடம் நில்லுங்கள், சூடான கும்பகோணம்{" "}
                  <CulturalGlossaryTerm termKey="kaapi" className="text-[#FFB84D]">
                    டிகிரி காபியை
                  </CulturalGlossaryTerm>{" "}
                  ருசியுங்கள். எங்கள் சங்கத்தில் இணைந்து புதிய நண்பர்களை உருவாக்குங்கள்!
                </span>
              ) : (
                <span>
                  Pause for a moment, enjoy the frothy aroma of Kumbakonam degree{" "}
                  <CulturalGlossaryTerm termKey="kaapi" className="text-[#FFB84D]">
                    kaapi
                  </CulturalGlossaryTerm>
                  , and pull up a chair. Connect with the Buckeye Tamil community today.
                </span>
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
              <Magnetic>
                <PalagaiButton
                  href="/join"
                  primaryText={locale === "ta" ? "மாணவர் குழுவில் இணைக" : "Join the Student GroupMe"}
                  secondaryText={locale === "ta" ? "Join the Student GroupMe" : "மாணவர் குழுவில் இணைக"}
                  variant="gold-foil"
                  size="lg"
                />
              </Magnetic>
              <PalagaiButton
                href="/about"
                primaryText={locale === "ta" ? "எங்கள் வரலாறு & நோக்கம்" : "Our Ethos & Constitution"}
                secondaryText={locale === "ta" ? "Our Ethos & Constitution" : "எங்கள் வரலாறு & நோக்கம்"}
                variant="white"
                size="lg"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
