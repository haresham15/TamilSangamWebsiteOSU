"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { audioLayer } from "@/utils/audioLayer";
import { Loader2, Sparkles, Music2, Code2, Coffee, CalendarHeart, ArrowUpRight } from "lucide-react";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import { CulturalSection } from "@/components/ui/CulturalSection";
import { CulturalCard } from "@/components/ui/CulturalCard";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { SITE_CONFIG } from "@/data/siteConfig";
import { GroupMePulseGateways } from "@/components/gateways/GroupMePulseGateways";
import { TechFiresideGateway } from "@/components/gateways/TechFiresideGateway";
import { HeroKolamLoader } from "@/components/ui/HeroKolamLoader";

/** Scrolls an element into view, jumping instantly when the visitor prefers reduced motion. */
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

const FIELD_INPUT =
  "mt-3 block w-full min-h-12 rounded-xl border border-border-warm bg-surface-card-light px-4 py-3 font-sans text-lg text-ink-earth placeholder:text-ink-umber/70 transition-colors focus:outline-none focus-visible:border-brand-teal focus-visible:ring-2 focus-visible:ring-brand-teal/40";

interface JoinFieldProps {
  id: string;
  label: string;
  sublabel?: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  isTextarea?: boolean;
  rows?: number;
}

/**
 * Light guestbook field for the ivory form card. GuestbookField (muttram) is styled for dark
 * surfaces only, so the light-surface variant lives here.
 */
function JoinField({ id, label, sublabel, type = "text", value, placeholder, onChange, required = false, isTextarea = false, rows = 3 }: JoinFieldProps) {
  const hintId = sublabel ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block font-serif text-xl font-normal text-ink-earth sm:text-2xl">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1.5 text-brand-purple">
            *
          </span>
        )}
      </label>
      {sublabel && (
        <p id={hintId} className="mt-1 font-sans text-sm leading-relaxed text-ink-umber">
          {sublabel}
        </p>
      )}
      {isTextarea ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-describedby={hintId}
          aria-required={required || undefined}
          className={`${FIELD_INPUT} resize-none leading-relaxed`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-describedby={hintId}
          aria-required={required || undefined}
          className={FIELD_INPUT}
        />
      )}
    </div>
  );
}

const CHOICE_BASE =
  "w-full min-h-12 rounded-xl border p-4 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal";
const CHOICE_ON = "border-brand-purple/40 border-l-[3px] border-l-brand-purple bg-brand-purple-soft";
const CHOICE_OFF = "border-border-warm bg-surface-card-light hover:border-brand-purple/40";

// =========================================================================
// R3F Nanban Hero Canvas (src/components/join/)
// Reworked in the hero-quality art pass; change it through src/components/join and scripts/hero-qa.
// =========================================================================
const JoinHeroCanvas = dynamic(
  () => import("@/components/join/JoinHeroCanvas").then((m) => m.JoinHeroCanvas),
  {
    ssr: false,
    loading: () => <HeroKolamLoader route="/join" minHeight="100dvh" />,
  }
);

function JoinSearchParamsSync({
  onSelectTrack,
  onPillar,
}: {
  onSelectTrack: (track: "general" | "performer" | "committee" | "fireside") => void;
  onPillar: (pillar: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const track = searchParams.get("track");
    const pillar = searchParams.get("pillar");

    if (track) {
      if (track === "dance-music" || track === "performer" || track === "dance") {
        onSelectTrack("performer");
      } else if (track === "council" || track === "committee" || track === "tech") {
        onSelectTrack("committee");
      } else if (track === "fireside" || track === "mentorship" || track === "coffee") {
        onSelectTrack("fireside");
      } else if (track === "general" || track === "events") {
        onSelectTrack("general");
      }
    }

    if (pillar) {
      onPillar(pillar);
      scrollToId("membership-form-inputs");
    }
  }, [searchParams, onSelectTrack, onPillar]);

  return null;
}

export function JoinClient() {
  const { locale } = useLocale();
  const { playClick, playBell } = useAudio();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [major, setMajor] = useState("");
  const [membershipType, setMembershipType] = useState<"general" | "performer" | "committee" | "fireside">("general");
  const [buckeyeRole, setBuckeyeRole] = useState("Undergraduate");
  const [monthlyDispatchOptIn, setMonthlyDispatchOptIn] = useState(true);
  const [notes, setNotes] = useState("");
  const [incomingPillar, setIncomingPillar] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Sync inputs or pathway selections made before hydration
  useEffect(() => {
    const syncState = () => {
      const win = typeof window !== "undefined" ? (window as unknown as Record<string, string | undefined>) : undefined;
      const n = win?.__pendingGuestbookName || (document.getElementById("guestbook-name") as HTMLInputElement | null)?.value;
      if (n) setName((prev) => prev || n);
      const e = win?.__pendingGuestbookEmail || (document.getElementById("guestbook-email") as HTMLInputElement | null)?.value;
      if (e) setEmail((prev) => prev || e);
      const m = win?.__pendingGuestbookMajor || (document.getElementById("guestbook-major") as HTMLInputElement | null)?.value;
      if (m) setMajor((prev) => prev || m);
      if (win?.__pendingMembershipType) {
        setMembershipType(win.__pendingMembershipType as "general" | "performer" | "committee" | "fireside");
      }
    };
    syncState();
    window.addEventListener("guestbook-input-sync", syncState);
    const onMembership = (e: Event) => {
      const t = (e as CustomEvent).detail;
      if (t) setMembershipType(t as "general" | "performer" | "committee" | "fireside");
    };
    window.addEventListener("membership-type-select", onMembership);
    return () => {
      window.removeEventListener("guestbook-input-sync", syncState);
      window.removeEventListener("membership-type-select", onMembership);
    };
  }, []);

  const handleSelectTrack = (track: "general" | "performer" | "committee" | "fireside") => {
    audioLayer.playTapeClack();
    setMembershipType(track);
    scrollToId("membership-form-inputs");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address (e.g. buckeye.1@osu.edu).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    playClick();

    try {
      const res = await fetch("/api/members/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          major: major.trim(),
          membershipType,
          buckeyeRole,
          monthlyDispatchOptIn,
          notes: notes.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok || result.success !== true) {
        throw new Error(result.error || "Unable to save your membership request. Please try again.");
      }

      playBell(880);
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to save your membership request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fitOptions = [
    {
      id: "performer" as const,
      label: "I want to Dance/Perform",
      tagline: "Kuthu & Gaana troupes, acoustic music jams",
      icon: Music2,
    },
    {
      id: "committee" as const,
      label: "I want to build Media/Tech",
      tagline: "Trailers, site engineering, council leadership",
      icon: Code2,
    },
    {
      id: "fireside" as const,
      label: "Book a Fireside Coffee Chat",
      tagline: "1-on-1 chats with upperclassmen & alumni mentors",
      icon: Coffee,
    },
    {
      id: "general" as const,
      label: "Just come to Events",
      tagline: "Feasts, lawn picnics, Kollywood movie nights",
      icon: CalendarHeart,
    },
  ];

  const selectedTrackLabel = fitOptions.find((o) => o.id === membershipType)?.label;
  const chapterStatus = locale === "ta" ? SITE_CONFIG.chapterStatusTa : SITE_CONFIG.chapterStatusEn;

  return (
    <div className="w-full text-left bg-transparent">
      {/* 1. Cinematic Morning Gates Hero Scene - IMMUTABLE */}
      <div
        id="nanban-gates-hero"
        data-hero-container="true"
        className="w-full min-h-[100dvh] relative z-10 bg-transparent"
      >
        <JoinHeroCanvas />
      </div>

      {/* =========================================================================
          BAND 1 · SANDSTONE: GUESTBOOK HEADER + "FIND YOUR FIT" TRACK ROUTER
          Glides up over the morning campus gates (p = 0.84 -> 1.00)
          ========================================================================= */}
      <EditorialSheetHandoff
        id="membership-form"
        badge="STUDENT FELLOWSHIP"
        sublabel="GUESTBOOK REGISTRATION"
        surface="sandstone"
        overflowClass="overflow-x-clip"
      >
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 py-20 sm:py-28">
          <CourtyardHeader
            align="left"
            titleId="join-heading"
            title={locale === "ta" ? "எங்களுடன் இணையுங்கள்" : "Sign Our Guestbook"}
            tamilTitle={locale !== "ta" ? "இணைவு · நல்வரவு" : undefined}
            description="100% Free · Zero Dues · Open to every Ohio State student and friend regardless of language. Pull up a chair and become part of our campus community."
          />

          <div id="find-your-fit" className="scroll-mt-28">
            <div className="flex flex-col gap-2 border-b border-border-warm pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <Eyebrow tamil="உங்கள் பாதை">Find Your Fit</Eyebrow>
                <h3 className="font-serif text-2xl font-normal text-ink-earth sm:text-3xl">
                  How would you like to plug into Tamil Sangam?
                </h3>
              </div>
              <p className="hidden font-sans text-sm text-ink-umber sm:block">
                Click any track to focus the form ↓
              </p>
            </div>

            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {fitOptions.map((opt) => {
                const isSelected = membershipType === opt.id;
                return (
                  <CulturalCard
                    key={opt.id}
                    as="li"
                    variant="light"
                    className={isSelected ? "border-brand-purple! shadow-[0_10px_30px_rgba(91,44,134,0.14)]" : ""}
                  >
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => handleSelectTrack(opt.id)}
                      className="group flex h-full min-h-[132px] w-full cursor-pointer flex-col justify-between gap-4 rounded-2xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-teal"
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="rounded-lg bg-brand-purple-soft p-2 text-brand-purple">
                          <opt.icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        {isSelected && (
                          <span className="rounded-full bg-brand-teal-soft px-2.5 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-teal">
                            Active track
                          </span>
                        )}
                      </span>
                      <span className="block">
                        <span className="block font-serif text-lg font-semibold leading-snug text-ink-earth transition-colors group-hover:text-brand-purple">
                          {opt.label}
                        </span>
                        <span className="mt-1 block font-sans text-sm leading-normal text-ink-umber">
                          {opt.tagline}
                        </span>
                      </span>
                    </button>
                  </CulturalCard>
                );
              })}
            </ul>
          </div>
        </div>
      </EditorialSheetHandoff>

      {/* =========================================================================
          BAND 2 · IVORY: GUESTBOOK FORM + LIVE MEMBERSHIP PASS (Recipe A split)
          ========================================================================= */}
      <CulturalSection variant="ivory" divider="korvai" aria-labelledby="join-form-heading">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-28">
          <Suspense fallback={null}>
            <JoinSearchParamsSync
              onSelectTrack={setMembershipType}
              onPillar={setIncomingPillar}
            />
          </Suspense>

          <div className="grid gap-10 md:grid-cols-12">
            <div className="min-w-0 md:col-span-7">
              {!submitted ? (
                <CulturalCard variant="parchment" className="p-6 sm:p-10">
                  <form
                    id="membership-form-inputs"
                    onSubmit={handleSubmit}
                    className="scroll-mt-28 space-y-12"
                  >
                    <div className="space-y-2">
                      <Eyebrow>Student Fellowship</Eyebrow>
                      <h2 id="join-form-heading" className="font-serif text-3xl font-normal tracking-tight text-ink-earth sm:text-4xl">
                        Guestbook registration
                      </h2>
                    </div>

                    {incomingPillar && (
                      <div className="flex flex-wrap items-center justify-between gap-3 border-l-[3px] border-l-brand-purple bg-brand-purple-soft px-4 py-3 font-sans text-sm text-ink-earth">
                        <span className="font-medium">
                          Continuing from Pillar: Pre-selected{" "}
                          {membershipType === "performer"
                            ? "Dance & Music"
                            : membershipType === "committee"
                            ? "Media / Tech Council"
                            : membershipType === "fireside"
                            ? "Fireside & Mentorship"
                            : "General Member"}{" "}
                          Track
                        </span>
                        <Link
                          href={`/pillars/${incomingPillar}`}
                          className="inline-flex min-h-12 items-center font-semibold text-brand-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                        >
                          View {incomingPillar.toUpperCase()} Pillar ↗
                        </Link>
                      </div>
                    )}

                    {/* Performer Dance Form Gateway */}
                    {membershipType === "performer" && (
                      <div className="flex flex-col justify-between gap-4 border-l-[3px] border-l-brand-purple pl-4 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-3">
                          <Music2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-purple" aria-hidden="true" />
                          <div>
                            <span className="block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-purple">
                              Dance Troupe &amp; Stage Performance Sign-Ups
                            </span>
                            <p className="mt-1 font-serif text-base text-ink-earth">
                              Looking to join Kuthu, Gaana, or fusion choreography?
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <MuttramButton
                            href="/dance"
                            variant="secondary"
                            icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
                          >
                            Dance Form Space
                          </MuttramButton>
                        </div>
                      </div>
                    )}

                    {/* Selected Track Ribbon */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-warm pb-4">
                      <p className="flex items-center gap-2 font-sans text-sm text-ink-earth">
                        <Sparkles className="size-4 shrink-0 text-brand-purple" aria-hidden="true" />
                        <span>
                          Selected track:{" "}
                          <strong className="font-semibold text-brand-purple">{selectedTrackLabel}</strong>
                        </span>
                      </p>
                      <a
                        href="#find-your-fit"
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToId("find-your-fit");
                        }}
                        className="inline-flex min-h-12 items-center font-sans text-sm font-medium text-brand-teal underline underline-offset-4 hover:text-brand-teal-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                      >
                        Change Track ↑
                      </a>
                    </div>

                    {/* Prompt 01: Name */}
                    <JoinField
                      id="guestbook-name"
                      label="Hi there, what is your name?"
                      sublabel="How should we greet you when you walk in?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Brutus Buckeye"
                      required
                    />

                    {/* Prompt 02: Email */}
                    <JoinField
                      id="guestbook-email"
                      type="email"
                      label="What's the best email to reach you?"
                      sublabel="We'll send you invitations to lawn picnics, banquets, and meetups."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="buckeye.1@osu.edu"
                      required
                    />

                    {/* Prompt 03: Major / Program */}
                    <JoinField
                      id="guestbook-major"
                      label="What are you studying at Ohio State?"
                      sublabel="Major, degree program, or college (optional)."
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="e.g. Computer Science, Public Health, Fisher College..."
                    />

                    {/* Prompt: Buckeye Role Selector (OSU-Wide Community) */}
                    <fieldset className="space-y-4">
                      <legend className="block">
                        <span className="block font-serif text-xl font-normal text-ink-earth sm:text-2xl">
                          What is your role at Ohio State?
                        </span>
                        <span className="mt-1 block font-sans text-sm leading-relaxed text-ink-umber">
                          Tamil Sangam is an OSU-wide community uniting undergraduates, graduate researchers, faculty, and alumni.
                        </span>
                      </legend>

                      <div className="grid grid-cols-1 gap-3 pt-1 lg:grid-cols-2">
                        {[
                          {
                            id: "Undergraduate",
                            label: "Undergraduate Student",
                            desc: "First-year, transfer, or upperclassman",
                          },
                          {
                            id: "Master's / PhD Graduate Student",
                            label: "Master's / PhD Student",
                            desc: "Graduate studies, researchers, & TAs",
                          },
                          {
                            id: "OSU Faculty / Researcher / Staff",
                            label: "Faculty / Staff / Postdoc",
                            desc: "Professors, clinicians, & university staff",
                          },
                          {
                            id: "Alumni & Community",
                            label: "Alumni & Community",
                            desc: "Columbus residents & Buckeye alumni",
                          },
                        ].map((role) => {
                          const isSelected = buckeyeRole === role.id;
                          return (
                            <button
                              key={role.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => {
                                audioLayer.playTapeClack();
                                setBuckeyeRole(role.id);
                              }}
                              className={`${CHOICE_BASE} ${isSelected ? CHOICE_ON : CHOICE_OFF}`}
                            >
                              <span className={`block font-serif text-base ${isSelected ? "font-semibold text-brand-purple" : "font-medium text-ink-earth"}`}>
                                {role.label}
                              </span>
                              <span className="mt-0.5 block font-sans text-sm text-ink-umber">{role.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    {/* Prompt 04: Involvement Track Selector Inside Form */}
                    <fieldset className="space-y-4">
                      <legend className="block">
                        <span className="block font-serif text-xl font-normal text-ink-earth sm:text-2xl">
                          Involvement Track
                        </span>
                        <span className="mt-1 block font-sans text-sm leading-relaxed text-ink-umber">
                          Choose your primary focus (you can always participate in multiple tracks).
                        </span>
                      </legend>

                      <div className="grid grid-cols-1 gap-3 pt-1 lg:grid-cols-2">
                        {fitOptions.map((opt) => {
                          const isSelected = membershipType === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => {
                                audioLayer.playTapeClack();
                                setMembershipType(opt.id);
                              }}
                              className={`${CHOICE_BASE} ${isSelected ? CHOICE_ON : CHOICE_OFF}`}
                            >
                              <span className="mb-1 flex items-center gap-2">
                                <opt.icon className={`h-4 w-4 ${isSelected ? "text-brand-purple" : "text-ink-umber"}`} aria-hidden="true" />
                                <span className={`font-serif text-base ${isSelected ? "font-semibold text-brand-purple" : "font-medium text-ink-earth"}`}>
                                  {opt.label}
                                </span>
                              </span>
                              <span className="block font-sans text-sm text-ink-umber">{opt.tagline}</span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    {/* Prompt 05: Notes / Introduction */}
                    <JoinField
                      id="guestbook-notes"
                      isTextarea
                      rows={3}
                      label="Anything else you'd like to share or ask?"
                      sublabel="Food preferences, dance background, or any questions for the officers (optional)."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Vegetarian / Love Tamil cinema trivia / Looking for dance rehearsal friends!"
                    />

                    {/* Monthly Sangam Dispatch Opt-In */}
                    <label className="flex cursor-pointer items-start gap-3 border-t border-border-warm pt-6">
                      <input
                        type="checkbox"
                        checked={monthlyDispatchOptIn}
                        onChange={(e) => setMonthlyDispatchOptIn(e.target.checked)}
                        className="mt-1 size-5 shrink-0 cursor-pointer rounded border-border-warm accent-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                      />
                      <span className="font-sans">
                        <span className="block text-base font-semibold text-ink-earth">
                          Send me the Monthly Sangam Dispatch
                        </span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-ink-umber">
                          A concise monthly roundup of Tamil community news, Columbus movie releases, playlist drops, and campus events. Zero spam, unsubscribe anytime.
                        </span>
                      </span>
                    </label>

                    {/* Error Message */}
                    {errorMessage && (
                      <div
                        role="alert"
                        className="border-l-[3px] border-l-accent-kumkum pl-4 font-sans text-sm font-medium text-accent-kumkum"
                      >
                        {errorMessage}
                      </div>
                    )}

                    {/* Submit Action + open-hearth footnote */}
                    <div className="flex flex-col gap-6 border-t border-border-warm pt-8 sm:flex-row sm:items-center sm:justify-between">
                      <MuttramButton type="submit" size="lg" disabled={isSubmitting} className="shrink-0">
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                            <span>Signing the guestbook...</span>
                          </span>
                        ) : (
                          "Sign the Guestbook"
                        )}
                      </MuttramButton>

                      <p className="max-w-sm font-sans text-sm leading-relaxed text-ink-umber">
                        Membership in Tamil Sangam is completely open and free to all Buckeyes, undergraduate or graduate, of any major, language, or heritage.
                      </p>
                    </div>
                  </form>
                </CulturalCard>
              ) : (
                /* Warm Celebration Confirmation (Unboxed) */
                <div className="space-y-6 py-8 animate-in fade-in duration-500">
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">
                    Guestbook Signed Successfully
                  </p>

                  <h2 id="join-form-heading" className="font-serif text-3xl text-ink-earth sm:text-5xl">
                    Welcome to the Family, {name}!
                  </h2>

                  <p className="font-tamil text-xl leading-[1.6] text-brand-purple" lang="ta">
                    வணக்கம் மற்றும் மனமார்ந்த நல்வரவு!
                  </p>

                  <p className="max-w-xl font-sans text-base leading-relaxed text-ink-umber sm:text-lg">
                    You are officially plugged into the Tamil Sangam hearth at Ohio State as a{" "}
                    <strong className="text-ink-earth">{selectedTrackLabel}</strong>. We will send you updates on upcoming Oval picnics, rehearsal calls, and banquet feasts.
                  </p>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <MuttramButton
                      href={SITE_CONFIG.groupMeUrl}
                      external
                      onClick={playClick}
                      icon={<ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
                    >
                      Join the Student GroupMe
                    </MuttramButton>
                    <MuttramButton href="/events" variant="secondary" onClick={playClick}>
                      Explore Upcoming Events →
                    </MuttramButton>
                  </div>
                </div>
              )}
            </div>

            {/* Live membership pass: a collectible pathirikai keepsake */}
            <div className="min-w-0 self-start md:sticky md:top-28 md:col-span-5">
              <CulturalCard
                as="aside"
                variant="pathirikai"
                aria-label="Live membership pass"
                data-testid="membership-pass"
                className="p-6 sm:p-8"
              >
                <div className="border-b border-border-zari-muted pb-6">
                  <Eyebrow tone="dark">Tamil Sangam · Ohio State</Eyebrow>
                  <h2 className="mt-4 font-serif text-2xl text-ink-alabaster">Your membership pass</h2>
                  {submitted && (
                    <p className="mt-2 font-sans text-sm text-brand-teal-dark" role="status">
                      Guestbook signed
                    </p>
                  )}
                </div>
                <dl aria-live="polite" aria-atomic="false" className="font-sans">
                  <dt className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-accent-zari">Name</dt>
                  <dd className="mt-1.5 break-words font-serif text-3xl leading-snug text-ink-alabaster sm:text-4xl">
                    {name.trim() || "Your name"}
                  </dd>
                  <dt className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-accent-zari">Email</dt>
                  <dd className="mt-1.5 break-words leading-relaxed text-ink-alabaster">{email.trim() || "Not entered"}</dd>
                  <dt className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-accent-zari">Major / Program</dt>
                  <dd className="mt-1.5 break-words leading-relaxed text-ink-alabaster">{major.trim() || "Not entered (optional)"}</dd>
                  <dt className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-accent-zari">Participation Track</dt>
                  <dd className="mt-1.5 break-words leading-relaxed text-ink-alabaster">{selectedTrackLabel}</dd>
                </dl>
                <p className="mt-8 border-t border-border-zari-muted pt-6 font-sans text-xs leading-relaxed text-ink-sand">
                  {submitted
                    ? "Your membership request has been saved."
                    : "Preview only. Sign the guestbook to submit your membership request."}
                </p>
              </CulturalCard>
            </div>
          </div>
        </div>
      </CulturalSection>

      {/* =========================================================================
          BAND 3 · SANGAM-DEEP: GROUPME PULSE (Recipe D jewel band)
          ========================================================================= */}
      <GroupMePulseGateways />

      {/* Academic & Industry Bridges: Tech & Career Firesides (placement owned by the main session) */}
      <div className="bg-bg-ivory">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-16 sm:py-20">
          <div>
            <TechFiresideGateway variant="light" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          CLOSER · PEACOCK-DEEP: OSU RECOGNITION ANCHOR (no OrganicRouteGateway on /join)
          ========================================================================= */}
      <CulturalSection variant="peacock-deep" divider="korvai" aria-labelledby="join-recognition-heading">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-10 py-20 sm:py-28 md:grid-cols-12 md:items-end">
          <div className="space-y-3 md:col-span-7">
            <Eyebrow tone="peacock">Recognized Student Organization</Eyebrow>
            <h2 id="join-recognition-heading" className="font-serif text-3xl font-normal leading-[1.12] tracking-tight text-ink-alabaster sm:text-4xl">
              {SITE_CONFIG.universityAffiliationEn}
            </h2>
            <p lang="ta" className="font-tamil text-lg leading-[1.6] text-ink-sand">
              {SITE_CONFIG.officialNameTa}
            </p>
          </div>
          <div className="space-y-4 border-l-2 border-accent-zari/50 pl-6 md:col-span-5">
            <p lang={locale === "ta" ? "ta" : undefined} className={`text-base text-ink-sand ${locale === "ta" ? "font-tamil leading-[1.6]" : "font-sans leading-relaxed"}`}>
              {chapterStatus}
            </p>
            <a
              href={SITE_CONFIG.constitutionPdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-1.5 rounded font-sans text-sm font-medium text-brand-teal-dark underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
            >
              <span>Constitution (2026–2027)</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </CulturalSection>
    </div>
  );
}
