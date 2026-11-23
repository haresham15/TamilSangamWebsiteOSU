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
  HeartHandshake,
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
import { CulturalSection } from "@/components/ui/CulturalSection";
import { CulturalCard } from "@/components/ui/CulturalCard";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { registerSystem } from "@/engine/masterTick";
import { Magnet } from "@/components/ui/react-bits";
import { PILLARS_DATA, PillarSlug } from "@/data/pillars";
import { OsuTamilPlaylistGateway } from "@/components/gateways/OsuTamilPlaylistGateway";
import { HeroKolamLoader } from "@/components/ui/HeroKolamLoader";

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
    loading: () => <HeroKolamLoader route="/suggestions" minHeight="100%" />,
  }
);

const initialState: SuggestionActionState = {
  success: false,
};

function SubmitSuggestionButton() {
  const { pending } = useFormStatus();

  return (
    <Magnet magnetStrength={2} maxOffset={8}>
      <MuttramButton type="submit" variant="primary" disabled={pending}>
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sharing your idea...
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            Submit proposal
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </MuttramButton>
    </Magnet>
  );
}

// White inputs with a teal focus ring (ivory band).
const FIELD_CLASS =
  "w-full min-h-12 rounded-xl border border-border-warm bg-surface-card-light px-4 py-3 font-sans text-base text-ink-earth placeholder:text-ink-umber/60 shadow-[0_2px_10px_rgba(91,44,134,0.05)] outline-none transition-colors focus-visible:border-brand-teal focus-visible:ring-2 focus-visible:ring-brand-teal/40";

// Aram philanthropy pillars: this page is their single home (removed from /about to avoid duplication).
const ARAM_PILLARS = [
  {
    titleEn: "Columbus Food Pantry Drives",
    titleTa: "உணவுப் பகிர்வு & அறப்பணி",
    desc: "Channeling student community drives into Columbus food banks and campus pantry pantries to support food security.",
  },
  {
    titleEn: "Cross-Cultural Student Coalitions",
    titleTa: "பல்கலாச்சார மாணவர் கூட்டணி",
    desc: "Co-hosting joint mixers, game exchanges, and shared advocacy alongside non-Indian student organizations across OSU.",
  },
  {
    titleEn: "Sustainable Gathering Ethics",
    titleTa: "சுற்றுச்சூழல் பாதுகாப்பு",
    desc: "Phasing out disposable single-use plastic decor to invest in wholesome food and compostable campus gatherings.",
  },
];

export function SuggestionsClient() {
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
        // Y only: the -translate-x-1/2 class already centres it (Tailwind v4 uses the `translate`
        // property, which stacks with `transform`; a second -50% pushed it off-screen on mobile).
        dispatchCtaRef.current.style.transform = `translateY(${-16 * exit}px)`;
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
          <h1 className="font-serif text-4xl sm:text-6xl text-[#F4F0FA] font-normal tracking-tight leading-none mb-2">
            The Blueprint Hearth <span className="sr-only">— Propose a Campus Event | OSU Tamil Sangam at The Ohio State University</span>
          </h1>
          <p lang="ta" className="font-tamil text-lg sm:text-xl text-[#C79347] leading-relaxed font-medium">
            கருத்துக்களம் · திட்டங்கள்
          </p>
          <p className="font-body text-xs sm:text-sm text-[#C4B7D7] mt-2 max-w-md leading-relaxed hidden sm:block">
            Propose student festivals, language workshops, food nights, and campus collaborations directly to the council.
          </p>
        </div>

        {/* Clean Architectural Bottom Bezel Dispatch Button */}
        <div
          ref={dispatchCtaRef}
          className="absolute bottom-28 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-transform will-change-[transform,opacity]"
        >
          <button
            type="button"
            onClick={scrollToForm}
            className="flex items-center gap-2.5 whitespace-nowrap min-h-12 px-6 py-2.5 rounded-full border border-accent-zari bg-bg-sangam-deep/70 text-accent-zari font-sans text-xs font-semibold uppercase tracking-[0.14em] shadow-lg backdrop-blur-md transition-colors hover:bg-accent-zari/10 hover:text-ink-alabaster focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sangam-deep cursor-pointer"
          >
            <span>Dispatch suggestion</span>
            <ArrowDown className="w-3.5 h-3.5 motion-safe:animate-bounce" aria-hidden="true" />
          </button>
        </div>
      </HeroScrollStage>

      {/* =========================================================================
          I · THE IDEAS HEARTH: proposal form (editorial split on ivory)
          Glides up over the blueprint stage (p = 0.82 -> 1.00)
          ========================================================================= */}
      <EditorialSheetHandoff
        id="the-ideas-form"
        badge="STUDENT PROPOSALS"
        sublabel="CAMPUS INITIATIVES"
        surface="ivory"
        className="text-ink-earth"
        overflowClass="overflow-x-clip"
      >
        <div ref={formSectionRef} className="w-full scroll-mt-20">
          <section aria-labelledby="ideas-hearth-title" className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
            <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 lg:gap-16">
              {/* Header column */}
              <div className="space-y-8 self-start md:sticky md:top-28 md:col-span-5">
                <div className="space-y-4">
                  <Eyebrow>Student proposals</Eyebrow>
                  <h2
                    id="ideas-hearth-title"
                    className="font-serif text-4xl font-normal leading-[1.08] tracking-tight text-ink-earth sm:text-5xl"
                  >
                    The Ideas Hearth
                  </h2>
                  <p className="font-tamil text-lg leading-[1.6] text-brand-purple" lang="ta">
                    {locale === "ta" ? "விருப்பங்கள் & வரைபடம்" : "கருத்துக்களம் · திட்டங்கள்"}
                  </p>
                  <p className="max-w-md font-sans text-base leading-relaxed text-ink-umber">
                    Every festival, language circle, dinner gathering, and dance item began as an idea proposed by a student. Share yours directly with the executive board.
                  </p>
                </div>

                {/* Past proposals realized: ledger rows, not boxes */}
                <div>
                  <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-umber">
                    Past proposals realized
                  </h3>
                  <ol className="max-w-md divide-y divide-border-warm border-y border-border-warm">
                    <li className="grid grid-cols-[2.5rem_1fr] gap-x-2 py-4">
                      <span aria-hidden="true" className="font-serif text-lg text-brand-purple">01</span>
                      <div>
                        <p className="font-serif text-lg text-ink-earth">Conversational Katral</p>
                        <p className="mt-1 font-sans text-sm leading-relaxed text-ink-umber">
                          Bi-weekly sessions exploring everyday spoken Tamil and script fundamentals.
                        </p>
                      </div>
                    </li>
                    <li className="grid grid-cols-[2.5rem_1fr] gap-x-2 py-4">
                      <span aria-hidden="true" className="font-serif text-lg text-brand-purple">02</span>
                      <div>
                        <p className="font-serif text-lg text-ink-earth">Spring Cultural Carnival</p>
                        <p className="mt-1 font-sans text-sm leading-relaxed text-ink-umber">
                          Inter-collegiate festival co-hosted on the South Oval with partner cultural orgs.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Form column */}
              <div className="text-ink-earth md:col-span-7">
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
                  <form action={formAction} className="space-y-10">
                    {/* Honeypot & Timestamp Hidden Inputs */}
                    <input type="hidden" name="form_timestamp" value={timestamp} />
                    <div className="hidden" aria-hidden="true">
                      <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                    </div>
                    <input type="hidden" name="category" value={selectedCategory} />

                    {/* Incoming Pillar Context Banner */}
                    {incomingPillar && PILLARS_DATA[incomingPillar as PillarSlug] && (
                      <div className="space-y-3 border-l-[3px] border-l-brand-purple bg-brand-purple-soft px-4 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 font-sans text-sm">
                          <div className="flex items-center gap-2">
                            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-brand-teal" />
                            <span className="font-semibold text-ink-earth">
                              Continuing from Pillar {PILLARS_DATA[incomingPillar as PillarSlug].number}: {PILLARS_DATA[incomingPillar as PillarSlug].titleEn} (<span lang="ta">{PILLARS_DATA[incomingPillar as PillarSlug].titleTa}</span>)
                            </span>
                          </div>
                          <Link
                            href={`/pillars/${incomingPillar}`}
                            className="inline-flex min-h-12 items-center font-semibold text-brand-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                          >
                            View Pillar Blueprint ↗
                          </Link>
                        </div>

                        {pillarPrompt && message !== pillarPrompt && (
                          <button
                            type="button"
                            onClick={() => {
                              audioLayer.playTapeClack();
                              setMessage(pillarPrompt);
                            }}
                            className="inline-flex min-h-12 items-center gap-1.5 rounded-full border border-brand-teal/40 bg-brand-teal-soft px-4 font-sans text-sm font-medium text-brand-teal transition-colors hover:border-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                          >
                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Insert Pillar Starter Template</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Question 01: Proposal Message */}
                    <div className="space-y-2">
                      <label htmlFor="terminal-message" className="block font-sans text-sm font-semibold text-ink-earth">
                        What is your campus proposal or idea? *
                      </label>
                      <p id="terminal-message-hint" className="font-sans text-sm text-ink-umber">
                        Describe what you would love to see happen (e.g., midnight filter coffee sessions, board game night, music jamming).
                      </p>
                      <textarea
                        id="terminal-message"
                        name="message"
                        required
                        rows={5}
                        aria-describedby="terminal-message-hint"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="e.g. Host a midnight Tamil filter coffee & study session at Thompson Library during finals..."
                        className={`${FIELD_CLASS} resize-y`}
                      />
                    </div>

                    {/* Question 02: Category Selection */}
                    <fieldset className="space-y-3">
                      <legend className="block font-sans text-sm font-semibold text-ink-earth">
                        Proposal category
                      </legend>
                      <div className="flex flex-wrap gap-2.5">
                        {categories.map((cat) => {
                          const active = selectedCategory === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              aria-pressed={active}
                              onClick={() => {
                                audioLayer.playTapeClack();
                                setSelectedCategory(cat);
                              }}
                              className={`inline-flex min-h-12 items-center rounded-full border px-5 font-sans text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-ivory ${
                                active
                                  ? "border-brand-purple bg-brand-purple-soft font-semibold text-brand-purple"
                                  : "border-border-warm bg-surface-card-light text-ink-umber hover:border-brand-purple/50 hover:text-ink-earth"
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
                      {/* Question 03: Name (Optional) */}
                      <div className="space-y-2">
                        <label htmlFor="terminal-user-name" className="block font-sans text-sm font-semibold text-ink-earth">
                          Your Name (Optional)
                        </label>
                        <p id="terminal-user-name-hint" className="font-sans text-sm text-ink-umber">
                          Leave blank to submit anonymously.
                        </p>
                        <input
                          id="terminal-user-name"
                          name="name"
                          type="text"
                          aria-describedby="terminal-user-name-hint"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Brutus Buckeye"
                          className={FIELD_CLASS}
                        />
                      </div>

                      {/* Question 04: Email (Optional) */}
                      <div className="space-y-2">
                        <label htmlFor="terminal-user-email" className="block font-sans text-sm font-semibold text-ink-earth">
                          Your Buckeye Email (Optional)
                        </label>
                        <p id="terminal-user-email-hint" className="font-sans text-sm text-ink-umber">
                          Only if you&apos;d like the board to follow up.
                        </p>
                        <input
                          id="terminal-user-email"
                          name="email"
                          type="email"
                          aria-describedby="terminal-user-email-hint"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name.#@osu.edu"
                          className={FIELD_CLASS}
                        />
                      </div>
                    </div>

                    {/* Server Validation Error */}
                    {state.error && (
                      <div role="alert" className="border-l-2 border-accent-kumkum bg-accent-kumkum/5 px-4 py-3 font-sans text-sm text-ink-earth">
                        {state.error}
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border-warm pt-6">
                      <SubmitSuggestionButton />
                      <span className="font-sans text-sm text-ink-umber">
                        Directly routed to the student executive board
                      </span>
                    </div>
                  </form>
                ) : (
                  /* Warm Confirmation State - Borderless */
                  <div role="status" className="space-y-6 py-4 animate-in fade-in duration-500">
                    <Eyebrow tamil="கோரிக்கை ஏற்றுக்கொள்ளப்பட்டது">
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-brand-teal" aria-hidden="true" />
                        Proposal received
                      </span>
                    </Eyebrow>

                    <h2 className="font-serif text-3xl font-normal leading-tight text-ink-earth sm:text-5xl">
                      Idea Received by the Executive Board.
                    </h2>

                    <dl className="max-w-xl space-y-2.5 border-y border-border-warm py-6 font-sans text-sm text-ink-umber">
                      <div className="flex justify-between gap-4">
                        <dt className="font-medium text-ink-earth">Category:</dt>
                        <dd className="font-semibold text-brand-purple">{selectedCategory}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="font-medium text-ink-earth">Next Step:</dt>
                        <dd className="text-right text-ink-earth">Reviewed at our upcoming executive meeting</dd>
                      </div>
                    </dl>

                    <p className="max-w-xl font-sans text-base leading-relaxed text-ink-umber">
                      Thank you for helping shape our campus community. We review all student proposals at our regular officer meetings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* P · The All-OSU Tamil playlist: peacock jewel band */}
          <OsuTamilPlaylistGateway variant="light" bleed />

          {/* S · Aram philanthropy & cross-campus service */}
          <CulturalSection variant="sandstone" aria-labelledby="aram-heading" className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6 sm:px-10">
              <div className="grid gap-6 md:grid-cols-12 md:gap-10">
                <div className="space-y-4 md:col-span-8">
                  <Eyebrow tamil="அறம் · விருந்தோம்பல்">Campus impact</Eyebrow>
                  <h2
                    id="aram-heading"
                    className="font-serif text-3xl font-normal leading-[1.12] tracking-tight text-ink-earth sm:text-5xl"
                  >
                    Tamil Hospitality in Action: Philanthropy &amp; Cross-Campus Service
                  </h2>
                  <p lang="ta" className="font-tamil text-lg leading-[1.6] text-brand-purple">
                    அறமும் விருந்தோம்பலும்: கல்லூரி சமூக நலப் பங்களிப்பு
                  </p>
                </div>
                <p className="self-end font-sans text-base leading-relaxed text-ink-umber md:col-span-4">
                  In Tamil culture, <em>Virunthombal</em> (hospitality) and <em>Aram</em> (ethical giving) mean using what we have to uplift the wider community. Instead of spending budget on heavy plastic decorations, we prioritize better food and are opening gateways to partner with Columbus charities, campus food drives, and non-Indian student organizations across Ohio State.
                </p>
              </div>

              <ul className="mt-12 grid gap-5 md:grid-cols-3">
                {ARAM_PILLARS.map((pillar, i) => (
                  <CulturalCard key={pillar.titleEn} as="li" variant="light" className="p-6">
                    <span aria-hidden="true" className="font-serif text-2xl text-brand-purple">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-serif text-xl font-normal leading-snug text-ink-earth">{pillar.titleEn}</h3>
                    <p lang="ta" className="mt-1 font-tamil text-sm leading-[1.6] text-brand-purple">
                      {pillar.titleTa}
                    </p>
                    <p className="mt-3 font-sans text-sm leading-relaxed text-ink-umber">{pillar.desc}</p>
                  </CulturalCard>
                ))}
              </ul>

              <div className="mt-10 flex flex-col items-start gap-4 border-t border-accent-bronze/30 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-sans text-sm font-medium text-ink-umber">
                  Open call for co-founding leads &amp; student partners
                </p>
                <MuttramButton
                  href="/ideas?category=PARTNERSHIP&prompt=Philanthropy+or+Cross-Org+Collab"
                  variant="primary"
                  icon={<HeartHandshake className="h-4 w-4" aria-hidden="true" />}
                >
                  Partner with us / pitch a collab
                </MuttramButton>
              </div>
            </div>
          </CulturalSection>

          {/* D · Closer: the one OrganicRouteGateway, last */}
          <div className="bg-bg-peacock-deep pb-24 sm:pb-0">
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
