"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { HeroCanvas } from "./HeroCanvas";
import { buildMasterTimeline } from "./timeline";
import { getSharedHeroRefs } from "./props/types";
import { initStrumStateMachine, updateStrumScrollIntent } from "./props/strumStateMachine";

const DebugHUD = dynamic(
  () => import("./debug/HUD").then((m) => m.DebugHUD),
  { ssr: false }
);
import { WashOverlay } from "./fx/WashOverlay";
import { registerTimelineProgressSetter, unregisterTimelineProgressSetter, heroState } from "./state";
import { governor } from "@/engine/governor";
import { useLiteMode } from "@/context/LiteModeContext";
import { useLocale } from "@/context/LocaleContext";
import { ChevronDown } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function GalleryHero() {
  const { locale } = useLocale();
  const { isLiteMode } = useLiteMode();

  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [scrollProgress, setLocalProgress] = useState(0);

  useEffect(() => {
    if (isLiteMode) return;

    const ctx = gsap.context(() => {
      if (!pinWrapperRef.current) return;

      // 1. Build master timeline (§5)
      const tl = buildMasterTimeline(getSharedHeroRefs(), (p) => {
        setLocalProgress(p);
      });
      timelineRef.current = tl;

      // 2. Initialize strum state machine with mid-page refresh guard (§5.3)
      const initialScroll = typeof window !== "undefined" ? window.scrollY : 0;
      initStrumStateMachine(initialScroll / (window.innerHeight * 4));

      // 3. Exactly ONE ScrollTrigger instance owns this hero (§4.1)
      const st = ScrollTrigger.create({
        trigger: pinWrapperRef.current,
        start: "top top",
        end: "+=400%", // 400vh pinned runway
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scrub: 0.6,
        animation: tl,
        onUpdate: (self) => {
          heroState.rawVelocity = self.getVelocity();
          heroState.lastScrollTime = performance.now();

          // Governor request: level 2 on active scroll, level 1 when idle ambient (§4.3)
          governor.request("gallery-hero", Math.abs(self.getVelocity()) > 10 ? 2 : 1);

          // Strum State Machine: first forward scroll detection (§5.3)
          updateStrumScrollIntent(self.progress, self.direction);
        },
      });

      // Ambient frame request while mounted (§4.3)
      governor.request("gallery-hero", 1);

      // 4. Register programmatic progress setter for debug HUD / tests (§9)
      registerTimelineProgressSetter((p) => {
        if (st && st.start !== undefined && st.end !== undefined) {
          const targetY = st.start + p * (st.end - st.start);
          st.scroll(targetY);
          window.scrollTo(0, targetY);
        }
        if (timelineRef.current) {
          timelineRef.current.progress(p);
        }
      });

      if (typeof window !== "undefined") {
        const gh = (window as unknown as { __galleryHero?: { refresh?: () => void } }).__galleryHero;
        if (gh) {
          gh.refresh = () => {
            ScrollTrigger.refresh();
          };
        }
      }

      // Prevent mobile address-bar resize jitter
      ScrollTrigger.config({ ignoreMobileResize: true });
      ScrollTrigger.refresh();
    }, pinWrapperRef);

    return () => {
      governor.request("gallery-hero", 0);
      unregisterTimelineProgressSetter();
      ctx.revert();
    };
  }, [isLiteMode]);

  const handleSkipToGallery = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const vault = document.getElementById("gallery-vault-content");
    if (vault) {
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.scrollTo(vault, { offset: -30, duration: 1.2 });
      } else {
        vault.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div
      ref={pinWrapperRef}
      className="relative w-full h-[100dvh] overflow-hidden bg-transparent select-none"
    >
      {/* 3D WebGL Canvas Layer */}
      <HeroCanvas />

      {/* Solar Whiteout Wash & Anamorphic Flare Overlay (Phase 8 Finale) */}
      <WashOverlay progress={scrollProgress} />

      {/* Accessible DOM Content & Skip Link (§8) */}
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-10">
        {/* Top Header Row with Skip Link */}
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto pt-16 sm:pt-14">
          <a
            href="#gallery-vault-content"
            onClick={handleSkipToGallery}
            className="pointer-events-auto px-3.5 py-1.5 bg-[#170D2B]/90 border border-[#FFB84D]/40 text-[#FFB84D] font-mono text-xs uppercase tracking-wider hover:bg-[#FFB84D] hover:text-[#170D2B] transition-colors focus:ring-2 focus:ring-[#55CCA2] outline-none"
          >
            {locale === "ta" ? "நேரடியாக புகைப்படங்களுக்குச் செல் ↓" : "Skip to Gallery Archive ↓"}
          </a>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-[#FFB84D]/80">
            <span className="w-2 h-2 rounded-full bg-[#55CCA2] animate-pulse" />
            <span>FRETBOARD HIGHWAY · 24-FRET KINEMATICS</span>
          </div>
        </div>

        {/* Center / Lower Cinematic Title Placard
            Smoothly fades as user journeys down the neck */}
        <div
          className="w-full max-w-2xl mx-auto text-center space-y-2.5 transition-opacity duration-300"
          style={{
            opacity: Math.max(0, 1.0 - scrollProgress * 3.5),
            transform: `translateY(-${Math.min(30, scrollProgress * 60)}px)`,
          }}
        >
          <div className="inline-block px-3 py-1 bg-[#170D2B]/80 border border-[#FFB84D]/30 backdrop-blur-sm mb-1">
            <span className="font-mono text-xs text-[#FFB84D] tracking-widest uppercase">
              {locale === "ta" ? "காலத்தின் நரம்புகள்" : "THE CORRIDOR OF MEMORIES"}
            </span>
          </div>

          <h1 className="text-[clamp(2.5rem,5vw+1.5rem,6rem)] font-extrabold font-display text-[#FFF8E7] tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            {locale === "ta" ? "நினைவுகள் · நினைவலைகள்" : "Memories · நினைவுகள்"}
          </h1>

          <p className="text-xs sm:text-sm text-[#F0C98A]/90 font-body max-w-lg mx-auto drop-shadow-md">
            {locale === "ta"
              ? "கிதார் நரம்புகளின் அதிர்வுகளில் சங்கமத்தின் வரலாற்று நிகழ்வுகளை நோக்கி ஒரு பயணம்."
              : "Journey down the 24-fret highway through college, shared triumphs, and the stories that define OSU Tamil Sangam."}
          </p>

          {/* Scroll Cue Indicator */}
          <div className="pt-4 flex flex-col items-center gap-1.5 text-[#FFB84D]/80 animate-bounce">
            <span className="text-[11px] font-mono tracking-widest uppercase">
              {locale === "ta" ? "கீழே உருட்டவும்" : "Scroll to Journey"}
            </span>
            <ChevronDown className="w-4 h-4 text-[#55CCA2]" />
          </div>
        </div>

        {/* Bottom edge gradient blend into DOM gallery */}
        <div
          className="w-full max-w-6xl mx-auto h-8 transition-opacity duration-300 pointer-events-none"
          style={{
            opacity: scrollProgress > 0.85 ? (scrollProgress - 0.85) / 0.15 : 0,
          }}
        />
      </div>

      {/* Developer Telemetry HUD (active on ?debug=1) */}
      <DebugHUD />
    </div>
  );
}
