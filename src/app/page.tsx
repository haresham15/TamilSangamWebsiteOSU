"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useAudio } from "@/context/AudioContext";
import { DigitalKolamHero } from "@/components/hero/DigitalKolamHero";
import { SilkHoverPillars } from "@/components/home/SilkHoverPillars";
import { HeritageTextureOverlay } from "@/components/ui/HeritageTextureOverlay";
import { setHeroScrollProgress, heroScrollProgress } from "@/engine/heroScrollStore";
import { registerSystem } from "@/engine/masterTick";
import { motion, useReducedMotion } from "framer-motion";
import CountUp from "@/components/CountUp";
import { useLiteMode } from "@/context/LiteModeContext";
import { useTier } from "@/components/providers/TierProvider";
import { audioLayer } from "@/utils/audioLayer";
import { SANGAM_CIPHER_CHARS } from "@/utils/scrambleTerminal";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";
import { EventsDepthShowcase } from "@/components/home/EventsDepthShowcase";
import { NextFlagshipGathering } from "@/components/home/NextFlagshipGathering";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";

export default function HomePage() {
  const { playClick } = useAudio();
  const { isLiteMode } = useLiteMode();
  const tier = useTier();
  const reducedMotion = useReducedMotion();
  const staticHero = isLiteMode || tier === "C" || !!reducedMotion;
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
        if (scrubbedP < 0.60) {
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
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.04, ease: "power2.out" },
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
      {/* Accessible Skip Link (PRD §7.11) */}
      <a
        href={staticHero ? "#flagship-gathering" : "#monolith"}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#FFB84D] focus:text-black focus:font-space-mono focus:text-xs focus:font-bold focus:outline-none"
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
              ACT III: THE MONOLITH SPLIT ("CURTAIN RISE" SLIDE-UP AT SCROLL 0.72)
              ========================================================================= */}
          <section
            hidden={staticHero}
            style={staticHero ? { display: "none" } : undefined}
            id="monolith"
            ref={monolithRef}
            className="absolute inset-0 z-20 w-full h-[100dvh] overflow-y-auto lg:overflow-y-auto xl:overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-[#FAF7F2] border-t border-[#161210]/10 text-[#161210]"
          >
            {/* Left Column (4 Cols - The Anchor, §PRD 9.1) */}
            <div className="lg:col-span-4 relative p-6 pt-16 sm:p-8 sm:pt-20 lg:p-8 lg:pt-20 xl:p-12 xl:pt-24 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#161210]/10 overflow-hidden">
              {/* Absolute Massive Tamil Numeral Watermark: 3% opacity positioned bottom-left clipped */}
              <div
                aria-hidden="true"
                className="absolute -bottom-10 -left-6 text-[clamp(14rem,32vw,36rem)] font-noto-serif-tamil font-bold text-[#161210] opacity-[0.04] select-none pointer-events-none leading-none"
              >
                ௦௧
              </div>

              {/* Top Anchor Header */}
              <div className="relative z-10 space-y-3">
                <span className="font-space-mono text-[10px] text-[#C85A32] tracking-widest uppercase block font-semibold">
                  COLUMBUS CHAPTER
                </span>
                <p
                  ref={monolithTamilRef}
                  lang="ta"
                  style={{ letterSpacing: 0 }}
                  className="font-noto-serif-tamil text-base sm:text-lg text-[#2A2825] leading-relaxed"
                >
                  ஓஹியோ மாநிலத்தில் தமிழ் மரபையும் மாணவர் தோழமையையும் ஒன்றிணைக்கும் கலாச்சாரப் பீடம்.
                </p>
              </div>

              {/* Condensed Quiet Telemetry Lockup at Bottom */}
              <div className="relative z-10 pt-4 mt-auto border-t border-[#161210]/10 flex flex-wrap items-center justify-between gap-2 font-space-mono text-[10px] tracking-wider text-[#4A423D]">
                <span>COLUMBUS, OH · 40.0067° N, 83.0305° W</span>
                <span ref={liveTimeRef} className="text-[#161210] font-medium">--:--:-- EDT</span>
              </div>
            </div>

            {/* Right Column (8 Cols - The Dossier) */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              {/* Constitutional Introduction */}
              <div className="p-5 pt-14 sm:p-7 sm:pt-16 lg:p-7 lg:pt-16 xl:p-10 xl:pt-20 border-b border-[#161210]/10">
                <span className="font-space-mono text-[10px] text-[#C85A32] tracking-widest uppercase block mb-1.5 font-semibold">
                  COMMUNITY CHARTER // OHIO STATE
                </span>
                <h3 className="text-[clamp(1.5rem,2.5vw,2.5rem)] font-display font-medium text-[#161210] leading-tight tracking-tight">
                  Tamil Sangam at Ohio State
                </h3>
                <p className="mt-1 text-xs sm:text-sm font-mono text-[#C85A32] tracking-wider uppercase font-semibold">
                  Inclusive Student Cultural Hub · Open Year-Round · No Language Requirement
                </p>
                <p ref={monolithPrologueRef} className="mt-2.5 text-xs sm:text-[14px] text-[#4A423D] font-body leading-relaxed max-w-2xl">
                  Established as an inclusive campus hub, Tamil Sangam at The Ohio State University unites Tamil Buckeyes and students of all cultural backgrounds. Guided by our constitution, we cultivate a welcoming home away from home through conversational language workshops, authentic South Indian cuisine, major campus festivals like Pongal and Diwali, and active peer mentorship.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-5">
                  <Link
                    href="/join"
                    onClick={playClick}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#C85A32] text-[#FAF7F2] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#b04b25] transition-colors ticket-chamfer-tl-br shadow-sm"
                  >
                    Join the Hearth →
                  </Link>
                  <Link
                    href="/events"
                    onClick={playClick}
                    className="font-mono text-xs uppercase tracking-wider text-[#161210] hover:text-[#C85A32] border-b border-[#161210]/20 hover:border-[#C85A32] pb-0.5 transition-colors"
                  >
                    See What&apos;s Coming Up ↗
                  </Link>
                  <Link
                    href="/about"
                    onClick={playClick}
                    className="font-mono text-xs uppercase tracking-wider text-[#4A423D] hover:text-[#C85A32] border-b border-transparent hover:border-[#C85A32] pb-0.5 transition-colors"
                  >
                    Read Constitution ↗
                  </Link>
                </div>
              </div>

              {/* The Three Horizontal Ribbons with Hover Kinematics */}
              <div className="divide-y divide-[#161210]/10">
                {/* Ribbon 1: CULTURAL HERITAGE */}
                <Link
                  href="/about"
                  onClick={playClick}
                  onMouseEnter={() => {
                    audioLayer.playTapeClack();
                  }}
                  data-cursor="bracket"
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 lg:p-4 xl:p-5 hover:bg-[#161210]/[0.03] transition-[transform,color,background-color] duration-300 ease-out"
                >
                  <div className="flex items-start sm:items-center gap-5 transition-transform duration-300 ease-out group-hover:translate-x-3">
                    <span className="font-space-mono text-xs sm:text-sm text-[#C85A32] font-semibold transition-colors">
                      01 //
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-editorial font-bold text-[#161210] group-hover:text-[#C85A32] transition-colors">
                        CULTURAL HERITAGE & LANGUAGE
                      </h4>
                      <p className="text-xs sm:text-sm text-[#4A423D] mt-0.5 font-body">
                        Conversational Tamil workshops, Sangam literature explorations & Dravidian living arts.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-2 font-space-mono text-xs text-[#161210]/60 group-hover:text-[#C85A32] transition-colors shrink-0">
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
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 lg:p-4 xl:p-5 hover:bg-[#161210]/[0.03] transition-[transform,color,background-color] duration-300 ease-out"
                >
                  <div className="flex items-start sm:items-center gap-5 transition-transform duration-300 ease-out group-hover:translate-x-3">
                    <span className="font-space-mono text-xs sm:text-sm text-[#C85A32] font-semibold transition-colors">
                      02 //
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-editorial font-bold text-[#161210] group-hover:text-[#C85A32] transition-colors">
                        FESTIVALS & BANQUET TABLE
                      </h4>
                      <p className="text-xs sm:text-sm text-[#4A423D] mt-0.5 font-body">
                        Authentic South Indian cuisine, streetside sapad & major campus festivals like Diwali and Pongal.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-2 font-space-mono text-xs text-[#161210]/60 group-hover:text-[#C85A32] transition-colors shrink-0">
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
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 lg:p-4 xl:p-5 hover:bg-[#161210]/[0.03] transition-[transform,color,background-color] duration-300 ease-out border-b border-[#161210]/10 lg:border-b-0"
                >
                  <div className="flex items-start sm:items-center gap-5 transition-transform duration-300 ease-out group-hover:translate-x-3">
                    <span className="font-space-mono text-xs sm:text-sm text-[#C85A32] font-semibold transition-colors">
                      03 //
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-editorial font-bold text-[#161210] group-hover:text-[#C85A32] transition-colors">
                        PEER MENTORSHIP & KINSHIP
                      </h4>
                      <p className="text-xs sm:text-sm text-[#4A423D] mt-0.5 font-body">
                        Freshman peer guidance, community volunteering & inclusive South Asian student solidarity.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-2 font-space-mono text-xs text-[#161210]/60 group-hover:text-[#C85A32] transition-colors shrink-0">
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
          Warm Ivory (#FAF7F2), Sunbaked Sand (#F4EFE6), Charcoal Espresso (#2A2825)
          Glides up over the pinned stage (p = 0.88 -> 1.00)
          ========================================================================= */}
      <EditorialSheetHandoff id="flagship-gathering" badge="CAMPUS HEARTH" sublabel="COLUMBUS, OH">

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
            WHAT'S NEXT: DYNAMIC FLAGSHIP EVENT ENGINE & DITHER-VEIL ART INSTALLATION
            ========================================================================= */}
        <NextFlagshipGathering />

        {/* The Pillars: Airy Vertical Sections (Zero Rigid Borders) */}
        <SilkHoverPillars />

        {/* =========================================================================
            MOMENTS ON THE OLENTANGY: REACT BITS DEPTH CAROUSEL & EVENT CHRONICLE
            ========================================================================= */}
        <EventsDepthShowcase />

        {/* =========================================================================
            COMMUNITY KINSHIP PROOF STRIP (Zero Bounding Boxes, 1px Grounding Line)
            ========================================================================= */}
        <section className="py-24 sm:py-32 px-6 sm:px-12 max-w-[1600px] mx-auto">
          <div className="border-t border-b border-[#E5DDD0] py-16 sm:py-24 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 text-left">
            <div className="relative space-y-3">
              <motion.span aria-hidden="true" className="absolute -left-6 top-0 hidden h-full w-px origin-top bg-hearth-terracotta/30 md:block" initial={reducedMotion ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
              <span className="font-serif tabular-nums text-5xl sm:text-6xl font-light text-[#B85C38] block"><span aria-hidden="true"><CountUp to={120} />+</span><span className="sr-only">120+</span></span>
              <span className="font-sans text-xs uppercase tracking-widest text-[#2A2825] block font-semibold">Buckeyes & Community</span>
              <p className="text-sm text-[#57524C] font-sans leading-relaxed">
                Undergraduate and graduate students from every college, alumni, and friends across Columbus.
              </p>
            </div>
            <div className="relative space-y-3">
              <motion.span aria-hidden="true" className="absolute -left-6 top-0 hidden h-full w-px origin-top bg-hearth-terracotta/30 md:block" initial={reducedMotion ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
              <span className="font-serif text-5xl sm:text-6xl font-light text-[#E5A93C] block"><span aria-hidden="true">0<CountUp to={4} />+</span><span className="sr-only">04+</span></span>
              <span className="font-sans text-xs uppercase tracking-widest text-[#2A2825] block font-semibold">Years of Kinship</span>
              <p className="text-sm text-[#57524C] font-sans leading-relaxed">
                Informally founded in 2021; chartered as a recognized student organization at Ohio State in 2024.
              </p>
            </div>
            <div className="relative space-y-3">
              <motion.span aria-hidden="true" className="absolute -left-6 top-0 hidden h-full w-px origin-top bg-hearth-terracotta/30 md:block" initial={reducedMotion ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
              <span className="font-serif text-5xl sm:text-6xl font-light text-[#2A2825] block"><span aria-hidden="true"><CountUp to={100} />%</span><span className="sr-only">100%</span></span>
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
      </EditorialSheetHandoff>
    </div>
  );
}
