"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MapPin,
  ArrowDown,
  Layers,
  Mail,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { BlueprintScene3D } from "@/components/suggestions/BlueprintScene3D";
import { SuggestionForm } from "@/components/suggestions/SuggestionForm";
import { HeroGradientTransition } from "@/components/ui/HeroGradientTransition";
import type { BlueprintPin } from "@/components/suggestions/BlueprintSVG";
import { OFFICIAL_DISCLAIMER, CONTACT_EMAIL } from "@/lib/constants";

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
    <div className="relative min-h-screen bg-[#0F050A] text-[#f8f6f0] selection:bg-[#FFB84D] selection:text-[#150914]">
      {/* 1. Sticky Hero Container with 3D Blueprint Extrusion */}
      <section
        ref={containerRef}
        className={`relative w-full ${
          isLiteMode ? "min-h-auto pt-28 pb-16" : "h-[100dvh]"
        } overflow-hidden flex flex-col justify-between select-none`}
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
          <div className="w-full bg-[#150914]/85 border border-[#4A2038]/70 px-5 py-3.5 sm:px-6 sm:py-4 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-center space-y-1.5">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#241021]/90 border border-[#FFB84D]/60 text-[#FFB84D] text-[10px] font-mono font-bold uppercase tracking-wider mx-auto">
              <span className="w-1.5 h-1.5 rounded-none bg-[#FFB84D] animate-pulse" />
              <span>{locale === "ta" ? "சமூக வரைபடம் · ஓஹியோ தமிழ்ச் சங்கம்" : "Community Blueprint · OSU Tamil Sangam"}</span>
            </div>

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
            <div className="bg-[#150914]/95 border-2 border-[#FFB84D] p-5 shadow-[6px_6px_0px_#8B5A2B] backdrop-blur-lg">
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
                className="w-full py-2 bg-[#FFB84D] hover:bg-[#ffc978] text-[#150914] font-mono text-xs font-bold uppercase tracking-wider transition-colors"
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
            className="ml-auto mb-16 sm:mb-0 inline-flex items-center gap-2 px-4 py-2 bg-[#150914]/95 hover:bg-[#241021] border-2 border-[#FFB84D] text-[#FFB84D] text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-xl transition-all cursor-pointer shadow-[4px_4px_0px_#8B5A2B]"
          >
            <span>Jump to Suggestion Box</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </button>
        </div>
      </section>

      {/* Color Gradient Transition from 3D Blueprint (#0F050A) to Form Section (#0F050A) */}
      <HeroGradientTransition variant="suggestions" className="-mt-14 sm:-mt-20 z-10" />

      {/* 2. Interactive Suggestion Box Section */}
      <section
        ref={formSectionRef}
        className="relative z-20 py-20 px-4 sm:px-8 max-w-5xl mx-auto space-y-12"
      >
        {/* Editorial Explainer Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#150914] border-2 border-[#4A2038] space-y-2 shadow-[4px_4px_0px_#0F050A]">
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

          <div className="p-6 bg-[#150914] border-2 border-[#4A2038] space-y-2 shadow-[4px_4px_0px_#0F050A]">
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

          <div className="p-6 bg-[#150914] border-2 border-[#4A2038] space-y-2 shadow-[4px_4px_0px_#0F050A]">
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
        <div className="p-6 sm:p-8 bg-[#150914] border-2 border-[#4A2038] space-y-3">
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
      </section>
    </div>
  );
}
