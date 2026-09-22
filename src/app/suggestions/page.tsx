"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Compass,
  Sparkles,
  MapPin,
  ArrowDown,
  Layers,
  Lightbulb,
  Info,
  ShieldCheck,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { BlueprintScene3D } from "@/components/suggestions/BlueprintScene3D";
import { SuggestionForm } from "@/components/suggestions/SuggestionForm";
import { BlueprintPin, BLUEPRINT_PINS } from "@/components/suggestions/BlueprintSVG";
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
        scrub: 1.0,
        anticipatePin: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [isLiteMode]);

  // Stage labeling based on scroll reveal progression of Ohio Stadium
  const getStageInfo = (p: number) => {
    if (p < 0.25) {
      return {
        step: "01",
        titleEn: "Blueprint Ground Plan",
        titleTa: "தரைத்தள வரைபடம்",
        descEn: "Flat architectural drafting of Ohio Stadium's horseshoe perimeter and field on the ground plane.",
      };
    } else if (p < 0.55) {
      return {
        step: "02",
        titleEn: "Lower Bowl & 84 Arcade Arches",
        titleTa: "கீழ் அரங்கம் & வளைவுகள்",
        descEn: "Stepped A/B seating decks and the iconic double-tiered Roman arches construct upward.",
      };
    } else if (p < 0.8) {
      return {
        step: "03",
        titleEn: "Cantilever Trusses & C-Deck",
        titleTa: "மேல் அரங்கம் & உத்திரங்கள்",
        descEn: "Cantilevered steel lattice trusses and upper C-deck rise into the air.",
      };
    } else {
      return {
        step: "04",
        titleEn: "North Rotunda & Towers",
        titleTa: "வடக்கு ரோட்டுண்டா & கோபுரம்",
        descEn: "The monumental North Rotunda entrance, twin pylons, and press tower reach full elevation.",
      };
    }
  };

  const currentStage = getStageInfo(scrollProgress);

  const handleSelectPin = (pin: BlueprintPin) => {
    setActivePin(pin);
    setSelectedCategory(pin.category);
  };

  const scrollToForm = () => {
    if (typeof window !== "undefined" && (window as any).__lenis) {
      (window as any).__lenis.scrollTo(formSectionRef.current || "+=2400", {
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
    <div className="relative min-h-screen bg-[#0a0e22] text-[#f8f6f0] selection:bg-[#FFC526] selection:text-[#12183c]">
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

        {/* Top Floating HUD: Title & Stage Progress */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-24 sm:pt-28 flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
          {/* Header Title Lockup */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#12183c]/90 border border-[#55CCA2] text-[#55CCA2] text-[11px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-[3px_3px_0px_#55CCA2]">
              <Sparkles className="w-3.5 h-3.5 text-[#55CCA2]" />
              <span>Architectural Blueprint · Ohio Stadium ("The Shoe")</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              {locale === "ta" ? "ஓஹியோ அரங்கம் · வரைபட எழுச்சி" : "The Shoe Blueprint Reveal"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-body max-w-md drop-shadow">
              {locale === "ta"
                ? "கீழே உருளுக: ஓஹியோ அரங்கத்தின் வளைவுகளும் மாடங்களும் தரையிலிருந்து முப்பரிமாணக் கோடுகளாய் எழுகின்றன."
                : "Scroll to watch Ohio Stadium's iconic horseshoe arches, cantilever decks, and North Rotunda construct in real-time lines from the blueprint floor."}
            </p>
          </div>

          {/* Stage Progress Monitor HUD */}
          {!isLiteMode && (
            <div className="flex items-center gap-4 bg-[#12183c]/90 border-2 border-[#415682] px-4 py-2.5 backdrop-blur-md shadow-[4px_4px_0px_#0a0e22]">
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#FFC526] uppercase tracking-widest block font-bold">
                  Stage {currentStage.step} of 04
                </span>
                <span className="text-xs font-display font-bold text-white block">
                  {locale === "ta" ? currentStage.titleTa : currentStage.titleEn}
                </span>
              </div>
              <div className="w-24 sm:w-32 h-2 bg-slate-800 rounded-none overflow-hidden border border-[#55CCA2]/50">
                <div
                  className="h-full bg-gradient-to-r from-[#55CCA2] via-[#FFD875] to-[#FFC526] transition-all duration-200"
                  style={{ width: `${(scrollProgress * 100).toFixed(0)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Active Pin Callout Card Overlay (if a pin is clicked or active) */}
        {activePin && (
          <div className="relative z-30 max-w-md mx-auto my-auto px-4 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#12183c]/95 border-2 border-[#FFC526] p-5 shadow-[6px_6px_0px_#FFC526] backdrop-blur-lg">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2d3b66]">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#FFC526]">
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
                className="w-full py-2 bg-[#55CCA2] hover:bg-[#6be4b8] text-[#12183c] font-mono text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Draft Suggestion for this Location →
              </button>
            </div>
          </div>
        )}

        {/* Bottom Scroll Indicator & Jump-to-Form Trigger */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-8 flex items-center justify-between pointer-events-auto">
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <Layers className="w-4 h-4 text-[#55CCA2]" />
            <span>Interactive 3D Scene · Click Pins to Inspect</span>
          </div>

          <button
            type="button"
            onClick={scrollToForm}
            className="ml-auto mb-16 sm:mb-0 inline-flex items-center gap-2 px-4 py-2 bg-[#12183c]/90 hover:bg-[#1a2550] border border-[#FFC526] text-[#FFC526] text-xs font-mono uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer shadow-[3px_3px_0px_#FFC526]"
          >
            <span>Jump to Suggestion Box</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </button>
        </div>
      </section>

      {/* 2. Interactive Suggestion Box Section */}
      <section
        ref={formSectionRef}
        className="relative z-20 py-20 px-4 sm:px-8 max-w-5xl mx-auto space-y-12"
      >
        {/* Editorial Explainer Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#0f1536] border-2 border-[#2d3b66] space-y-2 shadow-[4px_4px_0px_#12183c]">
            <div className="w-8 h-8 bg-[#55CCA2]/20 border border-[#55CCA2] text-[#55CCA2] flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <h4 className="text-base font-bold font-display text-white">
              {locale === "ta" ? "மாணவர் வழிகாட்டல்" : "Student-Led Vision"}
            </h4>
            <p className="text-xs text-slate-300 font-body leading-relaxed">
              Every initiative, festival, dance choreography, and guest lecture originates from student ideas.
            </p>
          </div>

          <div className="p-6 bg-[#0f1536] border-2 border-[#2d3b66] space-y-2 shadow-[4px_4px_0px_#12183c]">
            <div className="w-8 h-8 bg-[#FFC526]/20 border border-[#FFC526] text-[#FFC526] flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <h4 className="text-base font-bold font-display text-white">
              {locale === "ta" ? "நேரடி மின்னஞ்சல்" : "Direct Dispatch"}
            </h4>
            <p className="text-xs text-slate-300 font-body leading-relaxed">
              Your submission routes directly to{" "}
              <span className="font-mono text-[#FFC526]">{CONTACT_EMAIL}</span> and is discussed at our weekly executive meeting.
            </p>
          </div>

          <div className="p-6 bg-[#0f1536] border-2 border-[#2d3b66] space-y-2 shadow-[4px_4px_0px_#12183c]">
            <div className="w-8 h-8 bg-sky-500/20 border border-sky-400 text-sky-400 flex items-center justify-center font-mono font-bold text-xs">
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
        <div className="p-6 sm:p-8 bg-[#0a0e24] border-2 border-[#2d3b66] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#FFC526] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#FFC526]" />
            <span>Official University Disclosure</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed">
            {OFFICIAL_DISCLAIMER}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400 border-t border-[#1e2954]">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#55CCA2]" />
              <span>Contact: {CONTACT_EMAIL}</span>
            </span>
            <Link
              href="/about"
              className="text-[#55CCA2] hover:underline"
            >
              Learn about our constitution & mission →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
