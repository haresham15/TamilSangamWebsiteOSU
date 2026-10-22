"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { audioLayer } from "@/utils/audioLayer";
import { Loader2 } from "lucide-react";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import { KolamSectionRule } from "@/components/ui/KolamSectionRule";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { GuestbookField } from "@/components/muttram/GuestbookField";
import { SITE_CONFIG } from "@/data/siteConfig";
import { Magnet, StarBorder, SpotlightCard } from "@/components/ui/react-bits";
import styles from "./join.module.css";

// =========================================================================
// CRITICAL & IMMUTABLE: R3F Nanban Hero Canvas
// HERO ANIMATIONS ARE NEVER TOUCHED OR MODIFIED UNDER ANY CIRCUMSTANCES
// =========================================================================
const JoinHeroCanvas = dynamic(
  () => import("@/components/join/JoinHeroCanvas").then((m) => m.JoinHeroCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[70dvh] bg-hero-espresso" aria-hidden="true" />
    ),
  }
);

export default function JoinPage() {
  const { locale } = useLocale();
  const { playClick, playBell } = useAudio();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [major, setMajor] = useState("");
  const [membershipType, setMembershipType] = useState<"general" | "performer" | "committee">("general");
  const [notes, setNotes] = useState("");

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
        setMembershipType(win.__pendingMembershipType as "general" | "performer" | "committee");
      }
    };
    syncState();
    window.addEventListener("guestbook-input-sync", syncState);
    const onMembership = (e: Event) => {
      const t = (e as CustomEvent).detail;
      if (t) setMembershipType(t as "general" | "performer" | "committee");
    };
    window.addEventListener("membership-type-select", onMembership);
    return () => {
      window.removeEventListener("guestbook-input-sync", syncState);
      window.removeEventListener("membership-type-select", onMembership);
    };
  }, []);


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
        
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
          
          {/* Centered Airy Header */}
          <CourtyardHeader
            align="left"
            title={locale === "ta" ? "எங்களுடன் இணையுங்கள்" : "Sign Our Guestbook"}
            tamilTitle={locale !== "ta" ? "இணைவு · நல்வரவு" : undefined}
            description="100% Free · Zero Dues · Open to every Ohio State student and friend regardless of language. Pull up a chair and become part of our campus community."
          />

          <div className={styles.layout}>
          {!submitted ? (
            <form onSubmit={handleSubmit} className={`${styles.form} space-y-16 bg-[#FAF8F5] border border-[#161210]/10 shadow-[0_12px_40px_rgba(22,18,16,0.04)] rounded-sm p-6 sm:p-10`}>
              
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

              {/* Prompt 04: Pathway / Involvement */}
              <div className="space-y-6">
                <div>
                  <span className="text-xl sm:text-2xl font-serif font-normal text-hearth-espresso block">
                    How would you like to participate?
                  </span>
                  <span className="text-sm font-sans text-hearth-espresso/80 block mt-1">
                    Select whichever track feels most exciting to you right now.
                  </span>
                </div>

                <div className="space-y-4 pt-2">
                  {[
                    { id: "general", label: "General Member", desc: "Attend feasts, lawn picnics, and campus socials" },
                    { id: "performer", label: "Dance & Music", desc: "Kuthu & Gaana dance circles, acoustic music jams" },
                    { id: "committee", label: "Working Council", desc: "Festival organizing, media trailers, and catering" },
                  ].map((type) => {
                    const isSelected = membershipType === type.id;
                    return (
                      <SpotlightCard
                        key={type.id}
                        className={`transition-all duration-300 rounded-sm border-l-4 ${
                          isSelected
                            ? "border-hearth-terracotta bg-hearth-sand/40"
                            : "border-hearth-espresso/20 hover:border-hearth-espresso/40 bg-transparent"
                        }`}
                      >
                        <button
                          type="button"
                          data-membership-type={type.id}
                          aria-pressed={isSelected}
                          onClick={() => {
                            audioLayer.playTapeClack();
                            setMembershipType(type.id as typeof membershipType);
                          }}
                          className="w-full text-left py-4 px-6 cursor-pointer"
                        >
                          <span className={`text-xl sm:text-2xl font-serif font-normal block mb-1 ${isSelected ? "text-hearth-terracotta" : "text-hearth-espresso"}`}>
                            {type.label}
                          </span>
                          <p className="text-sm font-sans text-hearth-espresso/80 leading-relaxed">
                            {type.desc}
                          </p>
                        </button>
                      </SpotlightCard>
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
                placeholder="e.g. Vegetarian / Love filter coffee / Looking for dance rehearsal friends!"
              />

              {/* Error Message */}
              {errorMessage && (
                <div role="alert" className="p-4 border-l-2 border-rose-500 text-rose-700 text-sm font-sans font-medium">
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
                You are officially plugged into the Tamil Sangam hearth at Ohio State. We will send you updates on upcoming Oval picnics, festival rehearsal calls, and banquet feasts.
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
            <aside className={styles.pass} aria-label="Live membership pass" data-testid="membership-pass">
              <div className={styles.passHeader}>
                <p className="font-mono text-xs tracking-widest uppercase text-antique-gold">Tamil Sangam · Ohio State</p>
                <h2 className="font-serif text-2xl mt-4">Your membership pass</h2>
                {submitted && <p className="text-xs mt-2 text-emerald-400" role="status">Guestbook signed</p>}
              </div>
              <dl aria-live="polite" aria-atomic="false">
                <dt>Name</dt><dd className={styles.passName}>{name.trim() || "Your name"}</dd>
                <dt>Email</dt><dd>{email.trim() || "Not entered"}</dd>
                <dt>Major / Program</dt><dd>{major.trim() || "Not entered (optional)"}</dd>
                <dt>Participation</dt><dd>{membershipType === "general" ? "General Member" : membershipType === "performer" ? "Dance & Music" : "Working Council"}</dd>
              </dl>
              <p className={styles.passFoot}>{submitted ? "Your membership request has been saved." : "Preview only. Sign the guestbook to submit your membership request."}</p>
            </aside>
          </StarBorder>
          </div>

          <div className="mt-20 sm:mt-28">
            <KolamSectionRule tone="sandstone" />
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
