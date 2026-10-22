"use client";

import React, { useRef, useState, useEffect, useActionState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  ArrowDown,
  Check,
  Loader2,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { useTier } from "@/components/providers/TierProvider";
import { HeroScrollStage } from "@/components/canvas/HeroScrollStage";
import { submitSuggestion, SuggestionActionState } from "@/app/actions/suggestion";
import { audioLayer } from "@/utils/audioLayer";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import { KolamSectionRule } from "@/components/ui/KolamSectionRule";
import { registerSystem } from "@/engine/masterTick";
import { Magnet } from "@/components/ui/react-bits";
import { PILLARS_DATA, PillarSlug } from "@/data/pillars";
import { OsuTamilPlaylistGateway } from "@/components/gateways/OsuTamilPlaylistGateway";
import { AramPhilanthropyGateway } from "@/components/gateways/AramPhilanthropyGateway";

function SuggestionsSearchParamsSync({
  onCategory,
  onPrompt,
  onPillar,
}: {
  onCategory: (cat: string) => void;
  onPrompt: (prompt: string) => void;
  onPillar: (pillar: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const rawCat = searchParams.get("category");
    const pillar = searchParams.get("pillar");
    const prompt = searchParams.get("prompt");

    if (rawCat) {
      const normalized = rawCat.toLowerCase().replace(/\+/g, " ");
      if (normalized.includes("event")) {
        onCategory("Event idea");
      } else if (normalized.includes("initiative")) {
        onCategory("New initiative");
      } else if (normalized.includes("feedback")) {
        onCategory("Website feedback");
      } else if (normalized.includes("partner")) {
        onCategory("Partnership");
      }
    }

    if (pillar) {
      onPillar(pillar.toLowerCase());
    }

    if (prompt) {
      onPrompt(prompt);
    }
  }, [searchParams, onCategory, onPrompt, onPillar]);

  return null;
}

// =========================================================================
// CRITICAL & IMMUTABLE: 3D Blueprint Scene Hero
// HERO ANIMATIONS ARE NEVER TOUCHED OR MODIFIED UNDER ANY CIRCUMSTANCES
// =========================================================================
const BlueprintScene3D = dynamic(
  () => import("@/components/suggestions/BlueprintScene3D").then((m) => m.BlueprintScene3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#120D0B] flex flex-col items-center justify-center text-[#FAF7F2] p-8 text-center">
        <div className="font-serif text-3xl sm:text-5xl text-[#FAF7F2] font-normal mb-2">The Blueprint Hearth</div>
        <p lang="ta" className="font-tamil text-base text-[#D4AF37]/80">கருத்துக்களம் · திட்டங்கள்</p>
      </div>
    ),
  }
);

const initialState: SuggestionActionState = {
  success: false,
};

function SubmitSuggestionButton() {
  const { pending } = useFormStatus();

  return (
    <Magnet magnetStrength={2} maxOffset={8}>
      <button
        type="submit"
        disabled={pending}
        className="px-8 py-3.5 bg-[#E5A93C] text-[#1E1B18] font-sans text-sm font-semibold rounded-full hover:bg-[#B85C38] hover:text-[#FAF9F6] transition-all duration-300 flex items-center gap-2.5 shadow-md shadow-stone-900/5 cursor-pointer disabled:opacity-50"
      >
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sharing your idea...</span>
          </>
        ) : (
          <>
            <span>Submit Proposal</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </Magnet>
  );
}

export default function SuggestionsPage() {
  const { locale } = useLocale();
  const { isLiteMode } = useLiteMode();
  const tier = useTier();
  const reducedMotion = useReducedMotion();
  const staticHero = isLiteMode || tier === "C" || !!reducedMotion;

  const formSectionRef = useRef<HTMLDivElement>(null);
  const dispatchCtaRef = useRef<HTMLDivElement>(null);

  const scrollProgress = useRef(0);

  useEffect(() => {
    return registerSystem({
      order: 48,
      step: () => {
        if (!dispatchCtaRef.current) return;
        const p = scrollProgress.current;
        // Fade out cleanly between p = 0.72 and p = 0.80
        const exit = Math.max(0, Math.min(1, (p - 0.72) / 0.08));
        dispatchCtaRef.current.style.opacity = String(1 - exit);
        dispatchCtaRef.current.style.transform = `translate(-50%, ${-16 * exit}px)`;
        dispatchCtaRef.current.style.pointerEvents = exit >= 1 ? "none" : "auto";
      },
    });
  }, []);
  const [selectedCategory, setSelectedCategory] = useState("Event idea");
  const [incomingPillar, setIncomingPillar] = useState<string | null>(null);
  const [pillarPrompt, setPillarPrompt] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [timestamp] = useState<number>(() => (typeof window !== "undefined" ? Date.now() : 0));

  const [state, formAction] = useActionState(submitSuggestion, initialState);
  const newlyDroppedPin = state.success && state.pin ? state.pin : null;

  const playedSoundRef = useRef(false);
  useEffect(() => {
    if (state.success && state.pin && !playedSoundRef.current) {
      playedSoundRef.current = true;
      audioLayer.playTapeClack();
    }
  }, [state.success, state.pin]);

  const scrollToForm = () => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }
  };

  const categories = [
    "Event idea",
    "Website feedback",
    "New initiative",
    "Partnership",
    "Something else",
  ];

  return (
    <div className="relative min-h-screen bg-transparent text-white">
      
      {/* =========================================================================
          CRITICAL / IMMUTABLE: 3D Axonometric Blueprint Pin Scene
          HERO ANIMATIONS ARE NEVER TOUCHED OR MODIFIED UNDER ANY CIRCUMSTANCES
          ========================================================================= */}
      <HeroScrollStage
        id="blueprint-hero"
        progressRef={scrollProgress}
        tone="espresso"
        static={staticHero}
      >
        <div className="absolute inset-0 w-full h-full">
          <BlueprintScene3D
            scrollProgress={scrollProgress}
            isLiteMode={staticHero}
            onSelectPin={(pin) => {
              setSelectedCategory(pin.category);
            }}
            newPin={newlyDroppedPin}
          />
        </div>

        {/* Hero Editorial Header Overlay */}
        <div className="absolute top-28 sm:top-32 left-6 sm:left-12 lg:left-16 z-20 pointer-events-none max-w-xl">
          <h1 className="font-serif text-4xl sm:text-6xl text-[#FAF7F2] font-normal tracking-tight leading-none mb-2">
            The Blueprint Hearth <span className="sr-only">— Propose a Campus Event | OSU Tamil Sangam at The Ohio State University</span>
          </h1>
          <p lang="ta" className="font-tamil text-lg sm:text-xl text-[#D4AF37]/85 leading-relaxed font-medium">
            கருத்துக்களம் · திட்டங்கள்
          </p>
          <p className="font-body text-xs sm:text-sm text-[#FAF7F2]/70 mt-2 max-w-md leading-relaxed hidden sm:block">
            Propose student festivals, language workshops, food nights, and campus collaborations directly to the council.
          </p>
        </div>

        {/* Clean Architectural Bottom Bezel Dispatch Button */}
        <div
          ref={dispatchCtaRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-transform will-change-[transform,opacity]"
        >
          <button
            onClick={scrollToForm}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-[#161210]/90 border border-[#D4AF37]/40 text-[#FAF7F2] font-mono text-xs uppercase tracking-widest hover:border-[#C85A32] hover:bg-[#1E1815] transition-all rounded-full shadow-lg backdrop-blur-md cursor-pointer"
          >
            <span>DISPATCH SUGGESTION</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#D4AF37] animate-bounce" />
          </button>
        </div>
      </HeroScrollStage>

      {/* =========================================================================
          THE THINNAI ANCHOR & THE BLUEPRINT IDEAS TERMINAL
          Strict 12-Column Asymmetric Grid:
          Glides up over the blueprint stage (p = 0.82 -> 1.00)
          ========================================================================= */}
      <EditorialSheetHandoff 
        id="the-ideas-form"
        badge="STUDENT PROPOSALS"
        sublabel="CAMPUS INITIATIVES"
        className="text-[#2A2825]"
      >
        <div ref={formSectionRef} className="w-full">
        <div className="w-full max-w-[1700px] mx-auto px-6 sm:px-10 lg:px-12 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* ===================================================================
                THE ANCHOR (LEFT 4 COLUMNS): THE THINNAI
                Warm Ivory sidebar, soft serif headers, proven track record card
                =================================================================== */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-8 select-none">
              <div className="relative z-10 space-y-4">
                <h2 className="text-4xl sm:text-5xl font-serif font-normal text-[#2A2825] leading-tight">
                  The Ideas Hearth
                </h2>
                <p className="text-sm font-tamil text-[#B85C38] tracking-normal font-medium" lang="ta">
                  {locale === "ta" ? "விருப்பங்கள் & வரைபடம்" : "கருத்துக்களம் · திட்டங்கள்"}
                </p>
                <p className="text-base font-sans text-[#57524C] leading-relaxed">
                  Every festival, language circle, dinner gathering, and dance item began as an idea proposed by a student. Share yours directly with the executive board.
                </p>
              </div>

              {/* Prior Community Initiatives: Compact Architectural Footnote Cards */}
              <div className="relative z-10 pt-4 space-y-3">
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#8C827A] block">
                  Past Proposals Realized
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5DDD0]/80">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-semibold text-[#B85C38]">01</span>
                      <span className="text-xs font-serif font-semibold text-[#2A2825]">Conversational Katral</span>
                    </div>
                    <p className="text-xs font-sans text-[#57524C] leading-relaxed">
                      Bi-weekly sessions exploring everyday spoken Tamil and script fundamentals.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5DDD0]/80">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-semibold text-[#B85C38]">02</span>
                      <span className="text-xs font-serif font-semibold text-[#2A2825]">Spring Cultural Carnival</span>
                    </div>
                    <p className="text-xs font-sans text-[#57524C] leading-relaxed">
                      Inter-collegiate festival co-hosted on the South Oval with partner cultural orgs.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* ===================================================================
                THE FLOW (RIGHT 8 COLUMNS): CONVERSATIONAL PROPOSAL FORM
                Warm, open, conversational inputs inside Warm Parchment Ledger Sheet
                =================================================================== */}
            <main className="lg:col-span-8 bg-[#FAF8F5] border border-[#161210]/10 shadow-[0_12px_40px_rgba(22,18,16,0.04)] rounded-sm p-6 sm:p-10">
              <Suspense fallback={null}>
                <SuggestionsSearchParamsSync
                  onCategory={setSelectedCategory}
                  onPillar={(p) => {
                    setIncomingPillar(p);
                    if (formSectionRef.current) {
                      formSectionRef.current.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  onPrompt={(promptText) => {
                    setPillarPrompt(promptText);
                    setMessage((prev) => prev || promptText);
                  }}
                />
              </Suspense>

              {!state.success ? (
                <form action={formAction} className="space-y-12 py-2">
                  {/* Honeypot & Timestamp Hidden Inputs */}
                  <input type="hidden" name="form_timestamp" value={timestamp} />
                  <div className="hidden" aria-hidden="true">
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                  </div>
                  <input type="hidden" name="category" value={selectedCategory} />

                  {/* Incoming Pillar Context Banner */}
                  {incomingPillar && PILLARS_DATA[incomingPillar as PillarSlug] && (
                    <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#B85C38]/30 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#B85C38] animate-pulse" />
                          <span className="font-semibold text-[#2A2825]">
                            Continuing from Pillar {PILLARS_DATA[incomingPillar as PillarSlug].number}: {PILLARS_DATA[incomingPillar as PillarSlug].titleEn} ({PILLARS_DATA[incomingPillar as PillarSlug].titleTa})
                          </span>
                        </div>
                        <Link
                          href={`/pillars/${incomingPillar}`}
                          className="text-[#B85C38] hover:underline"
                        >
                          View Pillar Blueprint ↗
                        </Link>
                      </div>

                      {pillarPrompt && message !== pillarPrompt && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              audioLayer.playTapeClack();
                              setMessage(pillarPrompt);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-[#B85C38]/10 hover:bg-[#B85C38]/20 text-[#B85C38] border border-[#B85C38]/30 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Insert Pillar Starter Template</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Question 01: Proposal Message */}
                  <div className="space-y-3">
                    <label 
                      htmlFor="terminal-message" 
                      className="block font-sans text-sm font-semibold text-[#2A2825] tracking-wide"
                    >
                      What is your campus proposal or idea? *
                    </label>
                    <p className="text-xs font-sans text-[#8C827A]">
                      Describe what you would love to see happen (e.g., midnight filter coffee sessions, board game night, music jamming).
                    </p>
                    <textarea
                      id="terminal-message"
                      name="message"
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. Host a midnight Tamil filter coffee & study session at Thompson Library during finals..."
                      className="w-full py-3 bg-transparent border-b border-[#E5DDD0] text-[#2A2825] placeholder:text-[#8C827A] font-sans text-base outline-none focus:border-[#B85C38] transition-colors resize-none"
                    />
                  </div>

                  {/* Question 02: Category Selection */}
                  <div className="space-y-3">
                    <span className="block font-sans text-sm font-semibold text-[#2A2825] tracking-wide">
                      Select Proposal Category:
                    </span>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            audioLayer.playTapeClack();
                            setSelectedCategory(cat);
                          }}
                          className={`pb-1 text-xs sm:text-sm font-sans uppercase tracking-widest font-medium transition-all cursor-pointer ${
                            selectedCategory === cat
                              ? "text-[#B85C38] border-b-2 border-[#B85C38]"
                              : "text-[#8C827A] hover:text-[#2A2825] border-b-2 border-transparent"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question 03: Name (Optional) */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="terminal-user-name" 
                      className="block font-sans text-sm font-semibold text-[#2A2825] tracking-wide"
                    >
                      Your Name (Optional)
                    </label>
                    <p className="text-xs font-sans text-[#8C827A]">
                      Leave blank if you prefer to submit your idea anonymously.
                    </p>
                    <input
                      id="terminal-user-name"
                      name="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Brutus Buckeye"
                      className="w-full py-3 bg-transparent border-b border-[#E5DDD0] text-[#2A2825] placeholder:text-[#8C827A] font-sans text-sm outline-none focus:border-[#B85C38] transition-colors"
                    />
                  </div>

                  {/* Question 04: Email (Optional) */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="terminal-user-email" 
                      className="block font-sans text-sm font-semibold text-[#2A2825] tracking-wide"
                    >
                      Your Buckeye Email (Optional)
                    </label>
                    <p className="text-xs font-sans text-[#8C827A]">
                      Only needed if you would like the board to follow up with updates on your suggestion.
                    </p>
                    <input
                      id="terminal-user-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name.#@osu.edu"
                      className="w-full py-3 bg-transparent border-b border-[#E5DDD0] text-[#2A2825] placeholder:text-[#8C827A] font-sans text-sm outline-none focus:border-[#B85C38] transition-colors"
                    />
                  </div>

                  {/* Server Validation Error */}
                  {state.error && (
                    <div className="p-4 border-l-2 border-rose-500 bg-rose-50/50 text-rose-800 font-sans text-xs">
                      {state.error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-[#E5DDD0] flex flex-wrap items-center justify-between gap-4">
                    <SubmitSuggestionButton />

                    <span className="font-sans text-xs text-[#8C827A]">
                      Directly routed to the student executive board
                    </span>
                  </div>

                </form>
              ) : (
                /* Warm Confirmation State - Borderless */
                <div className="py-8 space-y-6 select-none animate-in fade-in duration-500">
                  <div className="inline-flex items-center gap-2 text-[#B85C38] font-mono text-xs font-semibold uppercase tracking-widest">
                    <Check className="w-4 h-4" />
                    <span>Proposal Received · கோரிக்கை ஏற்றுக்கொள்ளப்பட்டது</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-serif font-normal text-[#2A2825] leading-tight">
                    Idea Received by the Executive Board.
                  </h2>

                  <div className="space-y-2.5 font-sans text-sm text-[#57524C] border-t border-b border-[#E5DDD0] py-6 max-w-xl">
                    <div className="flex justify-between">
                      <span className="font-medium text-[#2A2825]">Category:</span>
                      <span className="text-[#B85C38] font-semibold">{selectedCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-[#2A2825]">Next Step:</span>
                      <span className="text-[#2A2825]">Reviewed at our upcoming executive meeting</span>
                    </div>
                  </div>

                  <p className="text-base text-[#57524C] font-sans leading-relaxed max-w-xl">
                    Thank you for helping shape our campus community. We review all student proposals at our regular officer meetings.
                  </p>

                  <div className="pt-4">
                    <MuttramButton href="/board" variant="secondary" size="md">
                      Meet the Executive Board →
                    </MuttramButton>
                  </div>
                </div>
              )}
            </main>

          </div>
        </div>

        <div className="mt-20 sm:mt-28 space-y-16">
          <KolamSectionRule tone="sandstone" />

          {/* Open Community Gateway: The All-OSU Tamil Collective Playlist */}
          <OsuTamilPlaylistGateway variant="light" />

          {/* Open Community Gateway: Aram Philanthropy & Cross-Cultural Service */}
          <AramPhilanthropyGateway variant="light" />
        </div>

        {/* =========================================================================
            WARM ORGANIC ROUTING TO EXECUTIVE LEADERSHIP
            ========================================================================= */}
        <div className="mt-16">
          <OrganicRouteGateway
            primaryHref="/board"
            primaryLabel="Step into Board Roster"
            eyebrow="Community Leadership · அடுத்த வாசல்"
            title="Meet the Executive Board"
            tamilTitle="செயற்குழு உறுப்பினர்களை சந்தியுங்கள்"
            description="Discover the student executive officers who bring these community proposals and campus festivals to life."
          />
        </div>
      </div>
    </EditorialSheetHandoff>
  </div>
);
}
