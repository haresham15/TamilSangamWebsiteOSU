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
import { getNextFlagshipEvent } from "@/data/events";
import { SITE_CONFIG } from "@/data/siteConfig";
import { Calendar, MapPin } from "lucide-react";
import { audioLayer } from "@/utils/audioLayer";
import { SANGAM_CIPHER_CHARS, triggerTerminalDecode } from "@/utils/scrambleTerminal";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { OrganicPhotoCollage } from "@/components/muttram/OrganicPhotoCollage";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";

const COLLAGE_PHOTOS = [
  {
    href: "/gallery/berry-cute-picnic",
    imageSrc:
      "https://lh3.googleusercontent.com/pw/AP1GczPlVkHkFW39BMqHGdeuYa0EwT1OOXOGWweSVgrPMbn24CSvrUlwF8CS_x787kPudpRyXEgtSMteYmBp6Zbad4uzMgeqB6LfISOvbS0AO1-qHsPKtEoC=w1200-h800-no",
    alt: "A Berry Cute Picnic",
    title: "A Berry Cute Picnic",
    subtitle: "South Oval Lawn",
    description:
      "Lawn blankets on the Oval with fresh strawberries, card games, and fellowship.",
    tag: "Picnic & Fellowship",
  },
  {
    href: "/gallery/streetside-sapad",
    imageSrc:
      "https://lh3.googleusercontent.com/pw/AP1GczPoDEE5ppMuBlStSn71wmY-vnb9sbDehdzKVvxu_QvEJZfJ8hGCig4Bkxoe8Rx8-xpnXzZA02iZ2EZid-qciQ4V85WQKl44j_Ed6YLD25GTunQbulMG=w1200-h800-no",
    alt: "Streetside Sapad",
    title: "Streetside Sapad (தெருவோர சாப்பாடு)",
    subtitle: "Banquet Feast",
    description:
      "Hot sizzling kothu parotta, fresh dosas, and authentic filter coffee.",
    tag: "Food & Feasts",
  },
  {
    href: "/gallery/namma-jathara",
    imageSrc:
      "https://lh3.googleusercontent.com/pw/AP1GczMckOLKN2caITiN5K1TOGffHjjgJrfgVuOLzMp4vuZ6J7kgf1CQB-PChurpUnPfiexScEG44wZkP-PWanuwwdRE3STuUUNN6LLQoe-ioZJ3MeSMpkCC=w1200-h800-no",
    alt: "Namma Jathara",
    title: "Namma Jathara (with Telugu Tamasha)",
    subtitle: "Campus Alliance",
    description:
      "Joint spring campus carnival uniting 200+ students for games, dance, and music.",
    tag: "Spring Carnival",
  },
];

export default function HomePage() {
  const { locale } = useLocale();
  const { playClick } = useAudio();
  const nextEvent = getNextFlagshipEvent();

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
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center">
              {/* Tier 1: Tamil Inscription (Strictly 2 Lines, Blur 10px -> 0px, y: 35 -> 0, NO shadow) */}
              <blockquote
                ref={kuralTamilRef}
                lang="ta"
                className="font-noto-serif-tamil text-[clamp(1.15rem,1.65vw,1.55rem)] text-[#FAFAFA] font-medium"
                style={{ letterSpacing: "0px" }}
              >
                <span className="block sm:whitespace-nowrap leading-[1.8] sm:leading-[1.9]">
                  இருந்தோம்பி இல்வாழ்வ தெல்லாம் விருந்தோம்பி
                </span>
                <span className="block sm:whitespace-nowrap mt-3 sm:mt-4 leading-[1.8] sm:leading-[1.9]">
                  வேளாண்மை செய்தற் பொருட்டு.
                </span>
              </blockquote>

              {/* Tier 2: Translation (SplitText word-by-word cascade) */}
              <p
                ref={kuralEnglishRef}
                className="font-space-mono text-xs sm:text-sm text-white/80 max-w-lg mt-6 sm:mt-7 leading-relaxed sm:leading-loose tracking-wide"
              >
                &ldquo;The entire virtue of establishing a home is to welcome guests with an open heart and extend generosity.&rdquo;
              </p>

              {/* Tier 3: Clean, unboxed monospace line (§MASTER DIRECTIVE) */}
              <div
                ref={kuralMetaRef}
                className="mt-5 sm:mt-6 font-space-mono text-[10px] sm:text-[11px] text-[#FFB84D]/85 tracking-[0.22em] uppercase"
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
                  <span className="text-white font-medium">EST. 2021 · 120+ MEMBERS</span>
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
                <p className="mt-2 text-xs sm:text-sm font-mono text-[#55CCA2] tracking-wider uppercase font-semibold">
                  A student-run cultural community at Ohio State for Tamil students and friends of every background · No Tamil required
                </p>
                <p ref={monolithPrologueRef} className="mt-4 text-sm sm:text-base text-neutral-300 font-body leading-relaxed max-w-2xl">
                  Born from the longing for home-cooked meals, late-night filter coffee, and the rhythm of Sangam verses beneath Midwest skies. We bridge ancient Tamil civilization with collegiate celebration, open dance floors, and lifelong kinship.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/join"
                    onClick={playClick}
                    className="px-4 py-2 bg-[#FFB84D] text-[#1a0a00] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#ffc56e] transition-colors ticket-chamfer-tl-br"
                  >
                    Join the Hearth →
                  </Link>
                  <Link
                    href="/events"
                    onClick={playClick}
                    className="px-4 py-2 border border-white/20 text-white font-mono text-xs uppercase tracking-wider hover:border-[#55CCA2] hover:text-[#55CCA2] transition-colors"
                  >
                    See What&apos;s Coming Up ↗
                  </Link>
                </div>
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
          THE SUNLIT MUTTRAM (COURTYARD) ARCHITECTURE
          Warm Ivory (#FAF9F6), Sunbaked Sand (#F4EFE6), Charcoal Espresso (#2A2825)
          ========================================================================= */}
      <div className="relative z-20 w-full bg-[#FAF9F6] text-[#2A2825]">

        {/* Puranaanuru 192 Sunlit Wisdom Banner */}
        <div className="bg-[#F4EFE6] py-6 px-6 text-center select-none">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 font-sans text-xs text-[#57524C]">
            <span lang="ta" style={{ letterSpacing: 0 }} className="text-base font-serif font-bold text-[#B85C38]">
              யாதும் ஊரே யாவரும் கேளிர்
            </span>
            <span className="hidden sm:inline text-[#B85C38]/40">·</span>
            <span className="font-serif italic text-base text-[#2A2825]">
              &ldquo;To us all towns are home, everyone our kin.&rdquo;
            </span>
            <span className="hidden md:inline text-[#B85C38]/40">·</span>
            <span className="text-[#B85C38] tracking-widest uppercase text-[11px] font-semibold">
              Kaniyan Poongundranar · Puranaanuru 192
            </span>
          </div>
        </div>

        {/* =========================================================================
            WHAT'S NEXT: SUNLIT FLAGSHIP SPOTLIGHT
            ========================================================================= */}
        <section className="relative w-full py-24 sm:py-32 px-6 sm:px-12 max-w-[1600px] mx-auto">
          <CourtyardHeader
            eyebrow="Upcoming Gathering"
            title={locale === "ta" ? "அடுத்த முக்கிய சங்கமம்" : "Next Flagship Gathering"}
            tamilTitle={locale !== "ta" ? "அடுத்த முக்கிய சங்கமம்" : undefined}
            description="Our calendar brings together authentic food, live performance, and fellowship beneath Columbus skies. Open to every Buckeye regardless of language or background."
          />

          {nextEvent ? (
            <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center border-b border-[#E5DDD0] pb-24 sm:pb-32">
              {/* Photo Side - Sharp Physical Print */}
              <div className="lg:col-span-6 relative aspect-[16/10] lg:aspect-[4/3] w-full overflow-hidden bg-[#F4EFE6] shadow-2xl shadow-stone-900/10 border border-stone-300/40">
                <Image
                  src={nextEvent.posterImage}
                  alt={nextEvent.titleEn}
                  fill
                  className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                  priority
                />
              </div>

              {/* Information Side - Naked on Global Background */}
              <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-sans font-semibold text-[#B85C38] uppercase tracking-widest">
                    <span>{nextEvent.date}</span>
                    <span className="text-stone-400">·</span>
                    <span>{nextEvent.time}</span>
                    <span className="text-stone-400">·</span>
                    <span>{nextEvent.location}</span>
                  </div>

                  <h3 className="text-3xl sm:text-5xl md:text-6xl font-serif font-normal text-[#2A2825] leading-tight">
                    {locale === "ta" ? nextEvent.titleTa : nextEvent.titleEn}
                  </h3>

                  <p className="text-base sm:text-lg font-sans text-[#57524C] leading-relaxed pt-2 max-w-xl">
                    {locale === "ta" ? nextEvent.descriptionTa : nextEvent.descriptionEn}
                  </p>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-6 text-sm font-sans">
                  <Link
                    href={`/events/${nextEvent.slug}`}
                    onClick={playClick}
                    className="font-semibold text-[#B85C38] border-b-2 border-[#B85C38] pb-1 hover:border-[#E5A93C] hover:text-[#E5A93C] transition-colors cursor-pointer"
                  >
                    {locale === "ta" ? "விவரங்கள் & பதிவு ↗" : "View Gathering Details ↗"}
                  </Link>
                  <Link
                    href="/events"
                    onClick={playClick}
                    className="font-medium text-[#57524C] hover:text-[#2A2825] border-b border-[#2A2825]/20 pb-1 hover:border-[#2A2825] transition-colors cursor-pointer"
                  >
                    {locale === "ta" ? "முழு நாட்காட்டி →" : "Full Calendar →"}
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-b border-[#E5DDD0] py-16 text-center max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-sans font-semibold text-[#B85C38] tracking-widest uppercase block">
                2026–2027 Academic Year
              </span>
              <h3 className="text-3xl sm:text-4xl font-serif text-[#2A2825]">
                Next Gathering Announced Soon
              </h3>
              <p className="text-base font-sans text-[#57524C] leading-relaxed">
                Our fall and spring schedules are currently being reserved with the Ohio Union. Join the student GroupMe to hear dates the minute they drop.
              </p>
              <div className="pt-4">
                <a
                  href={SITE_CONFIG.groupMeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClick}
                  className="inline-flex font-semibold text-[#B85C38] border-b-2 border-[#B85C38] pb-1 hover:text-[#E5A93C] hover:border-[#E5A93C] transition-colors"
                >
                  Join the Student GroupMe ↗
                </a>
              </div>
            </div>
          )}
        </section>

        {/* The Pillars: Airy Vertical Sections (Zero Rigid Borders) */}
        <SilkHoverPillars />

        {/* =========================================================================
            MOMENTS ON THE OLENTANGY: ORGANIC SUNLIT COLLAGE
            ========================================================================= */}
        <section className="relative w-full py-24 sm:py-32 px-6 sm:px-12 max-w-[1600px] mx-auto overflow-hidden select-none">
          <CourtyardHeader
            eyebrow="Physical Archives · 35mm Memories"
            title={locale === "ta" ? "கல்லூரி நினைவுகள்" : "Moments On The Olentangy"}
            tamilTitle={locale !== "ta" ? "கல்லூரி நினைவுகள்" : undefined}
            description="Lawn blankets on the South Oval with fresh strawberries, sizzling kothu parotta, and collaborative campus festivals loosely scattered on a sunlit table."
            action={
              <Link
                href="/gallery"
                onClick={playClick}
                className="font-semibold text-sm font-sans text-[#B85C38] border-b-2 border-[#B85C38] pb-1 hover:border-[#E5A93C] hover:text-[#E5A93C] transition-colors cursor-pointer"
              >
                Enter The Canvas →
              </Link>
            }
          />

          {/* Organic Asymmetrical Overlapping Photo Collage */}
          <OrganicPhotoCollage photos={COLLAGE_PHOTOS} onPhotoClick={playClick} />
        </section>

        {/* =========================================================================
            COMMUNITY KINSHIP PROOF STRIP (Zero Bounding Boxes, 1px Grounding Line)
            ========================================================================= */}
        <section className="py-24 sm:py-32 px-6 sm:px-12 max-w-[1600px] mx-auto">
          <div className="border-t border-b border-[#E5DDD0] py-16 sm:py-24 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 text-left">
            <div className="space-y-3">
              <span className="font-serif text-5xl sm:text-6xl font-light text-[#B85C38] block">120+</span>
              <span className="font-sans text-xs uppercase tracking-widest text-[#2A2825] block font-semibold">Buckeyes & Community</span>
              <p className="text-sm text-[#57524C] font-sans leading-relaxed">
                Undergraduate and graduate students from every college, alumni, and friends across Columbus.
              </p>
            </div>
            <div className="space-y-3">
              <span className="font-serif text-5xl sm:text-6xl font-light text-[#E5A93C] block">04+</span>
              <span className="font-sans text-xs uppercase tracking-widest text-[#2A2825] block font-semibold">Years of Kinship</span>
              <p className="text-sm text-[#57524C] font-sans leading-relaxed">
                Informally founded in 2021; chartered as a recognized student organization at Ohio State in 2024.
              </p>
            </div>
            <div className="space-y-3">
              <span className="font-serif text-5xl sm:text-6xl font-light text-[#2A2825] block">100%</span>
              <span className="font-sans text-xs uppercase tracking-widest text-[#2A2825] block font-semibold">Zero Dues · Open Hearth</span>
              <p className="text-sm text-[#57524C] font-sans leading-relaxed">
                Membership is completely voluntary and free. No language test. No attendance quotas to participate.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            INVITING GATEWAY: STEP INTO THE GATHERINGS (Organic Screen-Spanning Route)
            ========================================================================= */}
        <OrganicRouteGateway
          eyebrow="Join Our Next Gathering"
          tamilEyebrow="அடுத்த வாசல்"
          title="A Warm Hearth on the Banks of the Olentangy"
          tamilTitle="ஓலண்டாஞ்சி நதிக்கரையில் ஒரு பாசமிகு திண்ணை"
          description="Whether you crave authentic home-cooked flavors, want to dance, or simply want to find friendly faces on campus, there is always a seat for you."
          primaryHref="/events"
          primaryLabel="See All Gatherings"
          secondaryHref="/join"
          secondaryLabel="Sign the Guestbook"
        />
      </div>
    </div>
  );
}
