"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MapPin,
  ArrowDown,
  Mail,
  Compass,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { SuggestionForm } from "@/components/suggestions/SuggestionForm";
import { HeroGradientTransition } from "@/components/ui/HeroGradientTransition";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";
import type { BlueprintPin } from "@/components/suggestions/BlueprintSVG";
import { OFFICIAL_DISCLAIMER, CONTACT_EMAIL } from "@/lib/constants";

import { governor } from "@/engine/governor";

const BlueprintScene3D = dynamic(
  () => import("@/components/suggestions/BlueprintScene3D").then((m) => m.BlueprintScene3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#0F050A] flex flex-col items-center justify-center text-[#FFB84D] font-mono text-xs gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 animate-spin text-[#55CCA2]" />
          <span className="tracking-widest uppercase">
            CALIBRATING 3D AXONOMETRIC BLUEPRINT MATRIX...
          </span>
        </div>
      </div>
    ),
  }
);

export default function SuggestionsPage() {
  const { locale } = useLocale();
  const { isLiteMode } = useLiteMode();

  const containerRef = useRef<HTMLDivElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("Event idea");
  const [activePin, setActivePin] = useState<BlueprintPin | null>(null);
  const [newlyDroppedPin, setNewlyDroppedPin] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  // Register GSAP ScrollTrigger for the 3D Blueprint reveal sequence
  useEffect(() => {
    if (isLiteMode) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!containerRef.current) return;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=2200",
        pin: true,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          governor.request("ideas-blueprint", Math.abs(self.getVelocity()) > 10 ? 2 : 1);
        },
      });

      // Refresh ScrollTrigger and update Lenis limit for pin spacer
      ScrollTrigger.refresh();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.resize();
      }
    }, containerRef);

    return () => {
      ctx.revert();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.resize();
      }
    };
  }, [isLiteMode]);


  const handleSelectPin = (pin: BlueprintPin) => {
    setActivePin(pin);
    setSelectedCategory(pin.category);
  };

  const scrollToForm = () => {
    if (typeof window !== "undefined" && window.__lenis) {
      window.__lenis.scrollTo(formSectionRef.current || "+=2400", {
        offset: -40,
        duration: 1.2,
      });
      return;
    }
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-[#f8f6f0] selection:bg-[#FFB84D] selection:text-[#150914] overflow-hidden">
      {/* Structural Blueprint Watermark Glyphs */}
      <WatermarkGlyph text="வரைபடம்" position="top-right" theme="dark" opacity={0.035} />
      <WatermarkGlyph text="கருத்து" position="center" theme="dark" opacity={0.03} />

      {/* 1. Sticky Hero Container with 3D Blueprint Extrusion */}
      <section
        ref={containerRef}
        className={`relative w-full ${
          isLiteMode ? "min-h-auto pt-28 pb-16" : "h-[100dvh]"
        } overflow-hidden flex flex-col justify-between select-none bg-transparent`}
        style={{ minHeight: "100dvh" }}
      >
        {/* Background 3D Canvas / 2D SVG Fallback */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <BlueprintScene3D
            scrollProgress={scrollProgress}
            isLiteMode={isLiteMode}
            newPin={newlyDroppedPin}
            onSelectPin={handleSelectPin}
            className="w-full h-full"
          />
        </div>

        {/* Screen Reader Accessible Blueprint Landmarks */}
        <div className="sr-only">
          <h2>Interactive Ohio Stadium Blueprint Landmarks</h2>
          <p>Explore ideas and initiatives anchored at authentic Ohio Stadium architectural zones:</p>
          <ul>
            <li>
              <strong>50-Yard Line (The Turf):</strong> Campus events, athletic competitions, and outdoor lawn socials.
            </li>
            <li>
              <strong>North Rotunda (Heritage Dome):</strong> Classical Tamil architecture, cultural exhibits, and arts showcase.
            </li>
            <li>
              <strong>West Press Box (Executive Tower):</strong> Organizational leadership, campus initiatives, and student advocacy.
            </li>
          </ul>
        </div>

        {/* Bottom overlay gradient blending agent */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#0F050A] via-[#0F050A]/80 to-transparent pointer-events-none z-10" />

        {/* Top Subtle Floating HUD: One Singular Cinematic Metaphor Title Placard
            Smoothly fades as user scrolls so focus stays 100% on the rising stadium wireframe */}
        <div
          className="relative z-20 w-full max-w-xl mx-auto px-4 pt-24 sm:pt-20 flex justify-center pointer-events-auto transition-opacity duration-200"
          style={{
            opacity: Math.max(0, 1 - scrollProgress * 3.2),
            transform: `translateY(-${Math.min(24, scrollProgress * 50)}px)`,
            pointerEvents: scrollProgress > 0.15 ? "none" : "auto",
          }}
        >
          <div className="ticket-chamfer-tl-br relative w-full bg-[#150914]/90 border border-[#FFB84D]/40 px-5 py-3.5 sm:px-6 sm:py-4 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-center space-y-1.5 hover:glow-sodium transition-all">

            {/* Cinematic Metaphor Title */}
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-display text-[#f8f6f0] tracking-tight leading-snug">
              {locale === "ta" ? "ஓஹியோவில் நம் சமூகம் படைப்போம்" : "Building Our Community at Ohio State"}
            </h1>

            {/* Metaphor Subtitle */}
            <p className="text-xs text-slate-300 font-body leading-relaxed max-w-md mx-auto">
              {locale === "ta"
                ? "ஒரு வரைபடம் போல, உங்கள் கருத்துக்களாலேயே நம் சமூகம் உருவாகிறது."
                : "Just as an iconic structure rises line by line, our community is built by your voices and ideas."}
            </p>
          </div>
        </div>

        {/* Active Pin Callout Card Overlay (if a pin is clicked or active) */}
        {activePin && (
          <div className="relative z-30 max-w-md mx-auto my-auto px-4 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="ticket-chamfer-tr-bl relative bg-[#150914]/95 border-2 border-[#FFB84D] p-5 shadow-[6px_6px_0px_#8B5A2B] backdrop-blur-lg hover:glow-sodium transition-all">

              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#4A2038]">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#FFB84D]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{locale === "ta" ? activePin.labelTa : activePin.labelEn}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePin(null)}
                  className="text-slate-400 hover:text-white text-xs font-mono px-2 py-0.5"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 font-body leading-relaxed mb-4">
                {locale === "ta" ? activePin.questionTa : activePin.questionEn}
              </p>
              <button
                type="button"
                onClick={scrollToForm}
                className="ticket-chamfer-tl-br w-full py-2 bg-[#FFB84D] hover:bg-[#ffc978] text-[#150914] font-mono text-xs font-bold uppercase tracking-wider transition-colors hover:glow-sodium"
              >
                Draft Suggestion for this Location →
              </button>
            </div>
          </div>
        )}

        {/* Bottom Jump-to-Form Trigger */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-8 flex items-center justify-end pointer-events-auto">
          <button
            type="button"
            onClick={scrollToForm}
            className="ticket-chamfer-tl-br ml-auto mb-16 sm:mb-0 inline-flex items-center gap-2 px-4 py-2 bg-[#150914]/95 hover:bg-[#241021] border-2 border-[#FFB84D] text-[#FFB84D] text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-xl transition-all cursor-pointer shadow-[4px_4px_0px_#8B5A2B] hover:glow-sodium"
          >
            <span>Jump to Suggestion Box</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </button>
        </div>
      </section>

      {/* Color Gradient Transition from 3D Blueprint (#0F050A) to Form Section (#0F050A) */}
      <HeroGradientTransition variant="suggestions" className="-mt-32 relative z-20" />

      {/* 2. Interactive Suggestion Box Section */}
      <section
        ref={formSectionRef}
        className="relative z-20 w-full min-h-screen bg-[#0F050A] py-20"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-12">
          {/* Editorial Explainer Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="ticket-chamfer-tl-br relative p-6 bg-[#150914] border border-[#4A2038] hover:border-[#FFB84D]/40 space-y-2 shadow-[4px_4px_0px_#0F050A] hover:glow-sodium transition-all">
            <div className="w-8 h-8 bg-[#FFB84D]/20 border border-[#FFB84D] text-[#FFB84D] flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <h4 className="text-base font-bold font-display text-white">
              {locale === "ta" ? "மாணவர் வழிகாட்டல்" : "Student-Led Vision"}
            </h4>
            <p className="text-xs text-slate-300 font-body leading-relaxed">
              Every initiative, festival, dance choreography, and guest lecture originates from student ideas.
            </p>
          </div>

          <div className="ticket-chamfer-tl-br relative p-6 bg-[#150914] border border-[#4A2038] hover:border-[#FFB84D]/40 space-y-2 shadow-[4px_4px_0px_#0F050A] hover:glow-sodium transition-all">
            <div className="w-8 h-8 bg-[#FFB84D]/20 border border-[#FFB84D] text-[#FFB84D] flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <h4 className="text-base font-bold font-display text-white">
              {locale === "ta" ? "நேரடி மின்னஞ்சல்" : "Direct Dispatch"}
            </h4>
            <p className="text-xs text-slate-300 font-body leading-relaxed">
              Your submission routes directly to{" "}
              <span className="font-mono text-[#FFB84D]">{CONTACT_EMAIL}</span> and is discussed at our weekly executive meeting.
            </p>
          </div>

          <div className="ticket-chamfer-tl-br relative p-6 bg-[#150914] border border-[#4A2038] hover:border-[#FFB84D]/40 space-y-2 shadow-[4px_4px_0px_#0F050A] hover:glow-sodium transition-all">
            <div className="w-8 h-8 bg-[#8B5A2B]/25 border border-[#8B5A2B] text-[#FFB84D] flex items-center justify-center font-mono font-bold text-xs">
              03
            </div>
            <h4 className="text-base font-bold font-display text-white">
              {locale === "ta" ? "அநாமதேய சுதந்திரம்" : "Anonymous or Credited"}
            </h4>
            <p className="text-xs text-slate-300 font-body leading-relaxed">
              Submit completely anonymously or leave your BuckeyeMail if you would like to collaborate or receive follow-up.
            </p>
          </div>
        </div>

        {/* Suggestion Form Container */}
        <SuggestionForm
          initialCategory={selectedCategory}
          onSuccessPin={(pin) => {
            setNewlyDroppedPin(pin);
            // Optionally scroll up smoothly to show the pin drop in 3D scene
            if (window.scrollY > 400) {
              window.scrollTo({ top: 120, behavior: "smooth" });
            }
          }}
        />

        {/* Official Governance & University Entity Disclaimer */}
        <div className="ticket-chamfer-tl-br relative p-6 sm:p-8 bg-[#150914] border border-[#4A2038] hover:border-white/20 space-y-3 transition-colors">
          <h4 className="text-sm font-bold text-white font-display">
            University Disclosure
          </h4>

          <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed">
            {OFFICIAL_DISCLAIMER}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400 border-t border-[#3D1B2E]">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#FFB84D]" />
              <span>Contact: {CONTACT_EMAIL}</span>
            </span>
            <Link
              href="/about"
              className="text-[#FFB84D] hover:underline"
            >
              Learn about our constitution & mission →
            </Link>
          </div>
        </div>
      </div>
    </section>
  </div>
);
}
