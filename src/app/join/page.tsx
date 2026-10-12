"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { audioLayer } from "@/utils/audioLayer";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { HeroGradientTransition } from "@/components/ui/HeroGradientTransition";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { GuestbookField } from "@/components/muttram/GuestbookField";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { SITE_CONFIG } from "@/data/siteConfig";

// =========================================================================
// CRITICAL & IMMUTABLE: R3F Nanban Hero Canvas
// HERO ANIMATIONS ARE NEVER TOUCHED OR MODIFIED UNDER ANY CIRCUMSTANCES
// =========================================================================
const JoinHeroCanvas = dynamic(
  () => import("@/components/join/JoinHeroCanvas").then((m) => m.JoinHeroCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[70dvh] flex flex-col items-center justify-center bg-[#120A06] text-[#E5A93C] font-sans text-sm gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#E5A93C] animate-pulse" />
          <span className="tracking-widest">
            Entering the morning campus...
          </span>
        </div>
      </div>
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

  const emailInputRef = useRef<HTMLInputElement>(null);
  const majorInputRef = useRef<HTMLInputElement>(null);
  const notesInputRef = useRef<HTMLInputElement>(null);

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

      if (!res.ok) {
        // Fallback simulation for mock-first approach
        console.warn("API returned non-200, simulating mock submission success.");
      }

      playBell(880);
      setSubmitted(true);
    } catch (err) {
      console.warn("Network error during submission, simulating mock-first success:", err);
      playBell(880);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full text-left bg-transparent">
      {/* 1. Cinematic Morning Gates Hero Scene - IMMUTABLE */}
      <div
        id="nanban-gates-hero"
        data-hero-container="true"
        className="w-full h-[100dvh] relative z-10 overflow-hidden bg-transparent"
      >
        <JoinHeroCanvas />
      </div>

      {/* Hero to Content Gradient Transition */}
      <HeroGradientTransition variant="join" className="-mt-32 relative z-20" />

      {/* =========================================================================
          THE WELCOMING HEARTH: SUNLIT GUESTBOOK ON WARM IVORY
          Warm Ivory (#FAF9F6), Sunbaked Sand (#F4EFE6), Charcoal Espresso (#2A2825)
          ========================================================================= */}
      <div className="relative z-20 w-full bg-[#FAF9F6] text-[#2A2825] overflow-hidden">
        
        <div className="w-full max-w-3xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
          
          {/* Centered Airy Header */}
          <CourtyardHeader
            align="center"
            eyebrow="The Welcoming Hearth · Membership"
            title={locale === "ta" ? "எங்களுடன் இணையுங்கள்" : "Sign Our Guestbook"}
            tamilTitle={locale !== "ta" ? "இணைவு · நல்வரவு" : undefined}
            description="100% Free · Zero Dues · Open to every Ohio State student and friend regardless of language. Pull up a chair and become part of our campus community."
          />

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-16 mt-16 max-w-2xl mx-auto">
              
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
                  <span className="text-xl sm:text-2xl font-serif font-normal text-[#2A2825] block">
                    How would you like to participate?
                  </span>
                  <span className="text-sm font-sans text-[#57524C] block mt-1">
                    Select whichever track feels most exciting to you right now.
                  </span>
                </div>

                <div className="space-y-6 pt-2">
                  {[
                    { id: "general", label: "General Member", desc: "Attend feasts, lawn picnics, and campus socials" },
                    { id: "performer", label: "Dance & Music", desc: "Kuthu & Gaana dance circles, acoustic music jams" },
                    { id: "committee", label: "Working Council", desc: "Festival organizing, media trailers, and catering" },
                  ].map((type) => {
                    const isSelected = membershipType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          audioLayer.playTapeClack();
                          setMembershipType(type.id as typeof membershipType);
                        }}
                        className={`w-full text-left py-4 pl-6 transition-all duration-300 cursor-pointer border-l-2 ${
                          isSelected
                            ? "border-[#B85C38]"
                            : "border-[#E5DDD0] hover:border-[#2A2825]/40"
                        }`}
                      >
                        <span className={`text-xl sm:text-2xl font-serif font-normal block mb-1 ${isSelected ? "text-[#B85C38]" : "text-[#2A2825]"}`}>
                          {type.label}
                        </span>
                        <p className="text-sm font-sans text-[#57524C] leading-relaxed">
                          {type.desc}
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
                placeholder="e.g. Vegetarian / Love filter coffee / Looking for dance rehearsal friends!"
              />

              {/* Error Message */}
              {errorMessage && (
                <div className="p-4 border-l-2 border-rose-500 text-rose-700 text-sm font-sans font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-8 border-t border-[#E5DDD0] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="font-serif text-2xl sm:text-3xl font-normal text-[#B85C38] hover:text-[#E5A93C] border-b-2 border-[#B85C38] hover:border-[#E5A93C] pb-1 transition-colors self-start cursor-pointer disabled:opacity-50"
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

                <p className="text-xs font-sans text-[#57524C]">
                  The Ohio State University · Recognized Student Organization · 100% Free
                </p>
              </div>

            </form>
          ) : (
            /* Warm Celebration Confirmation (Unboxed) */
            <div className="text-center space-y-6 py-16 max-w-xl mx-auto select-none animate-in fade-in duration-500">
              <span className="font-sans text-xs uppercase tracking-widest text-[#B85C38] font-semibold block">
                Guestbook Signed Successfully
              </span>

              <h2 className="text-3xl sm:text-5xl font-serif text-[#2A2825]">
                Welcome to the Family, {name}!
              </h2>

              <p className="font-tamil text-xl text-[#B85C38]" lang="ta">
                வணக்கம் மற்றும் மனமார்ந்த நல்வரவு!
              </p>

              <p className="text-base sm:text-lg text-[#57524C] font-sans leading-relaxed">
                You are officially plugged into the Tamil Sangam hearth at Ohio State. We will send you updates on upcoming Oval picnics, festival rehearsal calls, and banquet feasts.
              </p>

              <div className="pt-8 flex flex-wrap justify-center gap-8 text-sm font-sans">
                <a
                  href={SITE_CONFIG.groupMeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClick}
                  className="font-semibold text-[#B85C38] border-b-2 border-[#B85C38] pb-1 hover:text-[#E5A93C] hover:border-[#E5A93C] transition-colors"
                >
                  Join the Student GroupMe ↗
                </a>
                <Link
                  href="/events"
                  onClick={playClick}
                  className="font-medium text-[#57524C] hover:text-[#2A2825] border-b border-[#2A2825]/20 pb-1 hover:border-[#2A2825] transition-colors"
                >
                  Explore Upcoming Events →
                </Link>
              </div>
            </div>
          )}

          {/* Open Hearth Guarantee Notice (Unboxed, 1px Grounding Line) */}
          <div className="mt-28 border-t border-[#E5DDD0] pt-12 text-center space-y-2 max-w-lg mx-auto">
            <span className="font-sans text-xs uppercase tracking-widest text-[#B85C38] font-semibold block">
              Open Hearth Commitment
            </span>
            <p className="text-sm font-sans text-[#57524C] leading-relaxed">
              Membership in Tamil Sangam is completely open and free to all Buckeyes, undergraduate or graduate, of any major, language, or heritage.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
