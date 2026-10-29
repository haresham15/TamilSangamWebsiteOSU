"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { audioLayer } from "@/utils/audioLayer";
import { Loader2, Sparkles, ArrowDown } from "lucide-react";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import { KolamSectionRule } from "@/components/ui/KolamSectionRule";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { GuestbookField } from "@/components/muttram/GuestbookField";
import { SITE_CONFIG } from "@/data/siteConfig";
import { Magnet, StarBorder } from "@/components/ui/react-bits";
import { GroupMePulseGateways } from "@/components/gateways/GroupMePulseGateways";
import { TechFiresideGateway } from "@/components/gateways/TechFiresideGateway";
import { HeroKolamLoader } from "@/components/ui/HeroKolamLoader";
import styles from "./join.module.css";

// =========================================================================
// CRITICAL & IMMUTABLE: R3F Nanban Hero Canvas
// HERO ANIMATIONS ARE NEVER TOUCHED OR MODIFIED UNDER ANY CIRCUMSTANCES
// =========================================================================
const JoinHeroCanvas = dynamic(
  () => import("@/components/join/JoinHeroCanvas").then((m) => m.JoinHeroCanvas),
  {
    ssr: false,
    loading: () => <HeroKolamLoader route="/join" minHeight="70dvh" />,
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
      const formEl = document.getElementById("membership-form-inputs");
      if (formEl) {
        formEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [searchParams, onSelectTrack, onPillar]);

  return null;
}

export default function JoinPage() {
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
    const formInputs = document.getElementById("membership-form-inputs");
    if (formInputs) {
      formInputs.scrollIntoView({ behavior: "smooth" });
    }
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
      icon: "💃",
    },
    {
      id: "committee" as const,
      label: "I want to build Media/Tech",
      tagline: "Trailers, site engineering, council leadership",
      icon: "🛠️",
    },
    {
      id: "fireside" as const,
      label: "Book a Fireside Coffee Chat",
      tagline: "1-on-1 chats with upperclassmen & alumni mentors",
      icon: "☕",
    },
    {
      id: "general" as const,
      label: "Just come to Events",
      tagline: "Feasts, lawn picnics, Kollywood movie nights",
      icon: "🎉",
    },
  ];

  return (
    <div className="w-full text-left bg-transparent">
      {/* Semantic SSR H1 for Search Engine Crawlers & Screen Readers */}
      <h1 className="sr-only">
        Join OSU Tamil Sangam | Free Membership Guestbook at The Ohio State University
      </h1>

      {/* 1. Cinematic Morning Gates Hero Scene - IMMUTABLE */}
      <div
        id="nanban-gates-hero"
        data-hero-container="true"
        className="w-full relative z-10 bg-transparent"
      >
        <JoinHeroCanvas />
      </div>

      {/* =========================================================================
          THE WELCOMING HEARTH: SUNLIT GUESTBOOK ON WARM IVORY
          Glides up over the morning campus gates (p = 0.84 -> 1.00)
          ========================================================================= */}
      <EditorialSheetHandoff
        id="membership-form"
        badge="STUDENT FELLOWSHIP"
        sublabel="GUESTBOOK REGISTRATION"
        className="text-hearth-espresso"
      >
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-20 sm:py-28">
          
          {/* Centered Airy Header */}
          <CourtyardHeader
            align="left"
            title={locale === "ta" ? "எங்களுடன் இணையுங்கள்" : "Sign Our Guestbook"}
            tamilTitle={locale !== "ta" ? "இணைவு · நல்வரவு" : undefined}
            description="100% Free · Zero Dues · Open to every Ohio State student and friend regardless of language. Pull up a chair and become part of our campus community."
          />

          {/* =========================================================================
              "FIND YOUR FIT" INTERACTIVE ROUTER
              4-Button Quick-Selector Routing Instantly to Form Tracks
              ========================================================================= */}
          <div className="my-10 bg-[#FAF8F5] border border-[#161210]/10 rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(22,18,16,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-hearth-terracotta font-semibold block">
                  Find Your Fit · உங்கள் பாதை
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-hearth-espresso mt-0.5">
                  How would you like to plug into Tamil Sangam?
                </h2>
              </div>
              <span className="font-mono text-xs text-hearth-espresso/60 hidden sm:inline-block">
                Click any track to focus the form ↓
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {fitOptions.map((opt) => {
                const isSelected = membershipType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectTrack(opt.id)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[110px] group ${
                      isSelected
                        ? "bg-[#161210] text-[#FAF6F0] border-[#161210] shadow-md -translate-y-0.5"
                        : "bg-[#F2EAE0]/70 hover:bg-[#F2EAE0] text-hearth-espresso border-[#161210]/10 hover:border-hearth-terracotta/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-2xl">{opt.icon}</span>
                      {isSelected && (
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-white/10 px-2 py-0.5 rounded-full">
                          Active Track
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className={`font-serif text-base font-semibold leading-snug ${isSelected ? "text-[#FAF6F0]" : "text-hearth-espresso group-hover:text-hearth-terracotta transition-colors"}`}>
                        {opt.label}
                      </h3>
                      <p className={`text-[11px] font-sans mt-1 leading-normal ${isSelected ? "text-[#FAF6F0]/80" : "text-hearth-espresso/70"}`}>
                        {opt.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.layout}>
            <Suspense fallback={null}>
              <JoinSearchParamsSync
                onSelectTrack={setMembershipType}
                onPillar={setIncomingPillar}
              />
            </Suspense>

            {!submitted ? (
              <form
                id="membership-form-inputs"
                onSubmit={handleSubmit}
                className={`${styles.form} space-y-12 bg-[#FAF8F5] border border-[#161210]/10 shadow-[0_12px_40px_rgba(22,18,16,0.04)] rounded-2xl p-6 sm:p-10`}
              >
                {incomingPillar && (
                  <div className="p-4 rounded-xl bg-hearth-sand/60 border border-hearth-terracotta/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-hearth-espresso font-medium">
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
                    </div>
                    <Link
                      href={`/pillars/${incomingPillar}`}
                      className="text-hearth-terracotta hover:underline"
                    >
                      View {incomingPillar.toUpperCase()} Pillar ↗
                    </Link>
                  </div>
                )}

                {/* Selected Track Ribbon */}
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-hearth-sand/40 border border-[#161210]/10">
                  <div className="flex items-center gap-2 text-xs font-sans">
                    <Sparkles className="size-4 text-hearth-terracotta shrink-0" />
                    <span className="text-hearth-espresso">
                      Selected track:{" "}
                      <strong className="text-hearth-terracotta font-semibold">
                        {fitOptions.find((o) => o.id === membershipType)?.label}
                      </strong>
                    </span>
                  </div>
                  <a
                    href="#nanban-gates-hero"
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    className="text-[11px] font-mono text-hearth-espresso/70 hover:text-hearth-terracotta underline"
                  >
                    Change Track ↑
                  </a>
                </div>

                {/* Prompt 01: Name */}
                <GuestbookField
                  id="guestbook-name"
                  label="Hi there, what is your name?"
                  sublabel="How should we greet you when you walk in?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Brutus Buckeye"
                  required
                />

                {/* Prompt 02: Email */}
                <GuestbookField
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
                <GuestbookField
                  id="guestbook-major"
                  label="What are you studying at Ohio State?"
                  sublabel="Major, degree program, or college (optional)."
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g. Computer Science, Public Health, Fisher College..."
                />

                {/* Prompt: Buckeye Role Selector (OSU-Wide Community) */}
                <div className="space-y-4">
                  <div>
                    <span className="text-xl sm:text-2xl font-serif font-normal text-hearth-espresso block">
                      What is your role at Ohio State?
                    </span>
                    <span className="text-sm font-sans text-hearth-espresso/80 block mt-1">
                      Tamil Sangam is an OSU-wide community uniting undergraduates, graduate researchers, faculty, and alumni.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-hearth-terracotta bg-hearth-sand/50 shadow-sm"
                              : "border-hearth-espresso/20 hover:border-hearth-espresso/40 bg-transparent"
                          }`}
                        >
                          <span
                            className={`text-base font-serif font-medium block ${
                              isSelected
                                ? "text-hearth-terracotta font-semibold"
                                : "text-hearth-espresso"
                            }`}
                          >
                            {role.label}
                          </span>
                          <p className="text-xs font-sans text-hearth-espresso/70 mt-0.5">
                            {role.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Prompt 04: "Find Your Fit" Track Selector Inside Form */}
                <div className="space-y-4">
                  <div>
                    <span className="text-xl sm:text-2xl font-serif font-normal text-hearth-espresso block">
                      Involvement Track
                    </span>
                    <span className="text-sm font-sans text-hearth-espresso/80 block mt-1">
                      Choose your primary focus (you can always participate in multiple tracks).
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {fitOptions.map((opt) => {
                      const isSelected = membershipType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            audioLayer.playTapeClack();
                            setMembershipType(opt.id);
                          }}
                          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-hearth-terracotta bg-hearth-sand/60 shadow-sm"
                              : "border-hearth-espresso/20 hover:border-hearth-espresso/40 bg-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span>{opt.icon}</span>
                            <span
                              className={`text-base font-serif font-medium ${
                                isSelected
                                  ? "text-hearth-terracotta font-semibold"
                                  : "text-hearth-espresso"
                              }`}
                            >
                              {opt.label}
                            </span>
                          </div>
                          <p className="text-xs font-sans text-hearth-espresso/70">
                            {opt.tagline}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Prompt 05: Notes / Introduction */}
                <GuestbookField
                  id="guestbook-notes"
                  isTextarea
                  rows={3}
                  label="Anything else you'd like to share or ask?"
                  sublabel="Food preferences, dance background, or any questions for the officers (optional)."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Vegetarian / Love Tamil cinema trivia / Looking for dance rehearsal friends!"
                />

                {/* Monthly Sangam Dispatch Opt-In Checkbox */}
                <div className="p-4 rounded-xl border border-hearth-espresso/20 bg-hearth-sand/20 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={monthlyDispatchOptIn}
                      onChange={(e) => setMonthlyDispatchOptIn(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-hearth-espresso/30 text-hearth-terracotta focus:ring-hearth-terracotta"
                    />
                    <div className="text-xs font-sans text-hearth-espresso/90">
                      <span className="font-semibold block text-sm text-hearth-espresso">
                        Send me the Monthly Sangam Dispatch
                      </span>
                      <span className="leading-relaxed block mt-0.5">
                        A concise monthly roundup of Tamil community news, Columbus movie releases, playlist drops, and campus events. Zero spam, unsubscribe anytime.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div
                    role="alert"
                    className="p-4 border-l-2 border-rose-500 text-rose-700 text-sm font-sans font-medium"
                  >
                    {errorMessage}
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-8 border-t border-hearth-espresso/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <Magnet magnetStrength={2} maxOffset={8}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="font-serif text-2xl sm:text-3xl font-normal text-hearth-terracotta hover:text-antique-gold border-b-2 border-hearth-terracotta hover:border-antique-gold pb-1 transition-colors self-start cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2 text-lg">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Signing the guestbook...</span>
                        </span>
                      ) : (
                        <span>Sign the Guestbook ✦</span>
                      )}
                    </button>
                  </Magnet>

                  <p className="text-xs font-sans text-hearth-espresso/80">
                    The Ohio State University · Recognized Student Organization · 100% Free
                  </p>
                </div>
              </form>
            ) : (
              /* Warm Celebration Confirmation (Unboxed) */
              <div className="text-center space-y-6 py-16 max-w-xl mx-auto select-none animate-in fade-in duration-500">
                <span className="font-sans text-xs uppercase tracking-widest text-hearth-terracotta font-semibold block">
                  Guestbook Signed Successfully
                </span>

                <h2 className="text-3xl sm:text-5xl font-serif text-hearth-espresso">
                  Welcome to the Family, {name}!
                </h2>

                <p className="font-tamil text-xl text-hearth-terracotta" lang="ta">
                  வணக்கம் மற்றும் மனமார்ந்த நல்வரவு!
                </p>

                <p className="text-base sm:text-lg text-hearth-espresso/80 font-sans leading-relaxed">
                  You are officially plugged into the Tamil Sangam hearth at Ohio State as a{" "}
                  <strong>{fitOptions.find((o) => o.id === membershipType)?.label}</strong>. We will send you updates on upcoming Oval picnics, rehearsal calls, and banquet feasts.
                </p>

                <div className="pt-8 flex flex-wrap justify-center gap-8 text-sm font-sans">
                  <a
                    href={SITE_CONFIG.groupMeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={playClick}
                    className="font-semibold text-hearth-terracotta border-b-2 border-hearth-terracotta pb-1 hover:text-antique-gold hover:border-antique-gold transition-colors"
                  >
                    Join the Student GroupMe ↗
                  </a>
                  <Link
                    href="/events"
                    onClick={playClick}
                    className="font-medium text-hearth-espresso/80 hover:text-hearth-espresso border-b border-hearth-espresso/20 pb-1 hover:border-hearth-espresso transition-colors"
                  >
                    Explore Upcoming Events →
                  </Link>
                </div>
              </div>
            )}

            <StarBorder className="w-full" color="#D4AF37" trailColor="#C85A32">
              <aside
                className={styles.pass}
                aria-label="Live membership pass"
                data-testid="membership-pass"
              >
                <div className={styles.passHeader}>
                  <p className="font-mono text-xs tracking-widest uppercase text-antique-gold">
                    Tamil Sangam · Ohio State
                  </p>
                  <h2 className="font-serif text-2xl mt-4">Your membership pass</h2>
                  {submitted && (
                    <p className="text-xs mt-2 text-emerald-400" role="status">
                      Guestbook signed
                    </p>
                  )}
                </div>
                <dl aria-live="polite" aria-atomic="false">
                  <dt>Name</dt>
                  <dd className={styles.passName}>{name.trim() || "Your name"}</dd>
                  <dt>Email</dt>
                  <dd>{email.trim() || "Not entered"}</dd>
                  <dt>Major / Program</dt>
                  <dd>{major.trim() || "Not entered (optional)"}</dd>
                  <dt>Participation Track</dt>
                  <dd>{fitOptions.find((o) => o.id === membershipType)?.label}</dd>
                </dl>
                <p className={styles.passFoot}>
                  {submitted
                    ? "Your membership request has been saved."
                    : "Preview only. Sign the guestbook to submit your membership request."}
                </p>
              </aside>
            </StarBorder>
          </div>

          <div className="mt-20 sm:mt-28">
            <KolamSectionRule tone="sandstone" />
          </div>

          {/* Open Community Gateway: Live GroupMe Pulse & Hangouts */}
          <div className="mt-12 sm:mt-16">
            <GroupMePulseGateways variant="light" />
          </div>

          {/* Academic & Industry Bridges: Tech & Career Firesides */}
          <div className="mt-12 sm:mt-16">
            <TechFiresideGateway variant="light" />
          </div>

          {/* Open Hearth Guarantee Notice (Unboxed, 1px Grounding Line) */}
          <div className="mt-16 border-t border-hearth-espresso/20 pt-12 text-center space-y-2 max-w-lg mx-auto">
            <p className="text-sm font-sans text-hearth-espresso/80 leading-relaxed">
              Membership in Tamil Sangam is completely open and free to all Buckeyes, undergraduate or graduate, of any major, language, or heritage.
            </p>
          </div>
        </div>
      </EditorialSheetHandoff>
    </div>
  );
}
