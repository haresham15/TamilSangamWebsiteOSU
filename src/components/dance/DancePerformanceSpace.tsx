"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Music2, Radio } from "lucide-react";
import { SITE_CONFIG } from "@/data/siteConfig";
import { PathirikaiFormFrame } from "@/components/ui/PathirikaiFormFrame";
import { CulturalSection } from "@/components/ui/CulturalSection";
import { CulturalCard } from "@/components/ui/CulturalCard";
import { EditorialBackgroundCanvas } from "@/components/ui/EditorialBackgroundCanvas";
import { ThresholdSeam } from "@/components/ui/ThresholdSeam";
import { Eyebrow } from "@/components/muttram/Eyebrow";

interface DancePerformanceSpaceProps {
  /** Optional custom Google Form embed URL or iframe source */
  googleFormEmbedUrl?: string;
  /** Optional raw HTML embed snippet for the Google Form */
  googleFormEmbedHtml?: string;
}

export const DEFAULT_DIWALI_FORM_EMBED_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSes22yw_nxw1WnmTWIbgWFXsri0v-P7FB_wqkvI8XxE1epgfA/viewform?embedded=true";
export const DEFAULT_DIWALI_FORM_DIRECT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSes22yw_nxw1WnmTWIbgWFXsri0v-P7FB_wqkvI8XxE1epgfA/viewform";

const PERFORMANCE_TRACKS = [
  {
    title: "Gaana & Kuthu Troupe",
    tamilTitle: "குத்து & கானா நடனம்",
    desc: "Fast-paced, high-energy street-style choreography with raw folk rhythms, whistle breaks, and synchronized steps.",
    tone: "High Energy · Group",
    stripe: "kumkum",
  },
  {
    title: "Cinematic & Hip-Hop Fusion",
    tamilTitle: "திரைப்பட இசை நடனம்",
    desc: "Modern Kollywood tracks blending Tamil melodies with contemporary hip-hop, dynamic formations, and visual storytelling.",
    tone: "Contemporary · Collaborative",
    stripe: "teal",
  },
  {
    title: "Semi-Classical & Folk Fusion",
    tamilTitle: "பாரம்பரிய & கிராமிய நடனம்",
    desc: "Graceful Bharatanatyam elements, Karagattam, and expressive storytelling fused with soul-stirring acoustic and classical arrangements.",
    tone: "Traditional · Expressive",
    stripe: "purple",
  },
  {
    title: "Solo, Duet & Feature Acts",
    tamilTitle: "தனிநபர் & இணை நடனம்",
    desc: "Have a unique routine, duet, or specialized stage performance? Sign up for a dedicated spotlight feature.",
    tone: "Spotlight · Open Format",
    stripe: "zari",
  },
] as const;

const DANCER_FAQ = [
  {
    title: "Experience needed?",
    body: "None! We have beginner-friendly routines alongside advanced segments. If you have rhythm and enthusiasm, we will teach you every step.",
  },
  {
    title: "Rehearsal locations",
    body: "Practices take place at RPAC dance studios and the Ohio Union campus rooms, scheduled primarily on weekday evenings and weekends to accommodate classes.",
  },
  {
    title: "Costumes & music",
    body: "Costume styling, themed props, and high-fidelity audio tracks are coordinated by the Tamil Sangam creative team with zero charges to performers.",
  },
];

const CONTAINER = "mx-auto max-w-7xl px-6 sm:px-10";

export function DancePerformanceSpace({
  googleFormEmbedUrl = DEFAULT_DIWALI_FORM_EMBED_URL,
}: DancePerformanceSpaceProps) {
  const [copiedContact, setCopiedContact] = useState(false);

  const openTabUrl = googleFormEmbedUrl
    ? googleFormEmbedUrl.replace(/[?&]embedded=true/, "")
    : DEFAULT_DIWALI_FORM_DIRECT_URL;

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(SITE_CONFIG.contactEmail);
      setCopiedContact(true);
      setTimeout(() => setCopiedContact(false), 2500);
    }
  };

  return (
    <>
      {/* D · Header: short sangam-deep ribbon */}
      <CulturalSection
        variant="sangam-deep"
        aria-labelledby="dance-title"
        backdrop={<EditorialBackgroundCanvas variant="espresso" />}
        className="pt-28 pb-16 sm:pt-36 sm:pb-20"
      >
        <div className={CONTAINER}>
          <nav aria-label="Breadcrumb" className="mb-8">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal-dark underline-offset-4 transition-colors hover:text-brand-teal-hover-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Return to hearth</span>
            </Link>
          </nav>

          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent-zari/45 bg-gradient-to-r from-accent-kumkum/30 to-accent-zari/15 px-3.5 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-alabaster">
                <Radio className="h-3.5 w-3.5 text-accent-kumkum-dark" aria-hidden="true" />
                <span>Open auditions &amp; registration</span>
              </span>
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-sand">
                OSU Tamil Sangam · 2026-2027
              </span>
            </div>

            <h1
              id="dance-title"
              className="font-serif text-4xl font-normal leading-[1.08] tracking-tight text-ink-alabaster sm:text-6xl"
            >
              Dance Performance Sign-Ups
            </h1>
            <p lang="ta" className="mt-2 font-tamil text-lg leading-[1.6] text-brand-lavender sm:text-xl">
              ஆடல் அரங்கம் · நடனக் குழு பதிவு
            </p>

            <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-ink-sand sm:text-lg">
              Take the stage with OSU Tamil Sangam, Kannada Sangam, and Mallu Society for Diwali 2026 on November 15th! We are organizing collegiate dance troupes and stage showcases at The Ohio State University. Whether you have danced for years or want to try Kuthu for the very first time, all students and friends are welcome — zero dues, zero audition fees, and 100% good energy.
            </p>
          </div>
        </div>
      </CulturalSection>
      <div className="relative" aria-hidden="true">
        <ThresholdSeam surface="ivory" variant="knot" />
      </div>

      {/* I · Performance categories: editorial split */}
      <CulturalSection variant="ivory" aria-labelledby="dance-categories-title" className="py-20 sm:py-28">
        <div className={`${CONTAINER} grid gap-10 md:grid-cols-12`}>
          <div className="self-start md:sticky md:top-28 md:col-span-5">
            <Eyebrow tamil="பிரிவுகள்">Choose your stage</Eyebrow>
            <h2
              id="dance-categories-title"
              className="mt-4 font-serif text-3xl font-normal leading-[1.12] tracking-tight text-ink-earth sm:text-5xl"
            >
              Featured Performance Categories
            </h2>
            <a
              href="#google-form-slot"
              className="mt-6 inline-flex min-h-12 items-center gap-2 font-sans text-sm font-semibold text-brand-teal underline-offset-4 hover:text-brand-teal-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              <span>Select one or multiple in the form below</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 md:col-span-7">
            {PERFORMANCE_TRACKS.map((track) => (
              <CulturalCard key={track.title} as="li" variant="light" topStripe={track.stripe} className="flex flex-col p-6">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-purple">
                    {track.tone}
                  </span>
                  <Music2 className="h-4 w-4 shrink-0 text-accent-bronze" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-xl font-normal text-ink-earth">{track.title}</h3>
                <p lang="ta" className="mt-1 font-tamil text-sm leading-[1.6] text-brand-purple">
                  {track.tamilTitle}
                </p>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink-umber">{track.desc}</p>
              </CulturalCard>
            ))}
          </ul>
        </div>
      </CulturalSection>

      {/* S · The Google Form */}
      <CulturalSection
        variant="sandstone"
        id="google-form-slot"
        aria-labelledby="dance-form-title"
        divider="korvai"
        className="scroll-mt-24 pb-20 sm:pb-28"
      >
        <div className={`${CONTAINER} pt-12 sm:pt-16`}>
          <div className="mb-10 max-w-2xl">
            <Eyebrow>Register</Eyebrow>
            <h2
              id="dance-form-title"
              className="mt-4 font-serif text-3xl font-normal leading-[1.12] tracking-tight text-ink-earth sm:text-5xl"
            >
              Sign-up &amp; performance form
            </h2>
          </div>

          <div className="max-w-4xl">
            <PathirikaiFormFrame
              titleEn="Diwali 2026: TS × MS × KS — Official Sign-Up & Performance Form"
              titleTa="நடனக் குழு பதிவுப் படிவம்"
              formUrl={openTabUrl}
              embedSrc={googleFormEmbedUrl}
              minHeight="820px"
            />
          </div>
        </div>
      </CulturalSection>

      {/* P · Dancer FAQ: ledger on peacock-deep (extra mobile clearance for the bottom bar) */}
      <CulturalSection variant="peacock-deep" aria-labelledby="dance-faq-title" className="pt-20 pb-44 sm:pt-28 sm:pb-28">
        <div className={CONTAINER}>
          <div className="mb-10 max-w-2xl">
            <Eyebrow tone="peacock">Before you audition</Eyebrow>
            <h2
              id="dance-faq-title"
              className="mt-4 font-serif text-3xl font-normal leading-[1.12] tracking-tight text-ink-alabaster sm:text-5xl"
            >
              Dancer FAQ &amp; Rehearsal Guidelines
            </h2>
          </div>

          <ol className="divide-y divide-border-zari-muted border-y border-border-zari-muted">
            {DANCER_FAQ.map((item, i) => (
              <li key={item.title} className="grid gap-2 py-7 md:grid-cols-12 md:gap-8">
                <span aria-hidden="true" className="font-serif text-2xl text-brand-lavender md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif text-xl font-normal text-ink-alabaster md:col-span-4">{item.title}</h3>
                <p className="font-sans text-base leading-relaxed text-ink-sand md:col-span-7">{item.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-sm">
            <span className="text-ink-sand">Questions about routines? Reach out anytime:</span>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex min-h-12 items-center font-semibold text-brand-teal-dark underline-offset-4 hover:text-brand-teal-hover-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
            >
              <span aria-live="polite">{copiedContact ? "Email copied ✓" : SITE_CONFIG.contactEmail}</span>
            </button>
            <Link
              href="/join"
              className="inline-flex min-h-12 items-center gap-1.5 font-semibold text-brand-teal-dark underline-offset-4 hover:text-brand-teal-hover-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
            >
              <span>General membership form</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </CulturalSection>
    </>
  );
}

export default DancePerformanceSpace;
