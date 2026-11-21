"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { soundEngine } from "@/lib/soundEngine";
import { audioLayer } from "@/utils/audioLayer";
import { ArrowUpRight, Sparkles, HeartHandshake, Compass } from "lucide-react";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { CulturalSection } from "@/components/ui/CulturalSection";

interface PillarItem {
  id: string;
  num: string;
  numTa: string;
  nameEn: string;
  nameTa: string;
  subtitleEn: string;
  subtitleTa: string;
  descEn: string;
  descTa: string;
  href: string;
  /** Token text-color class for the pillar glyph. */
  accent: string;
  icon: typeof Sparkles;
}

const THREE_PILLARS: PillarItem[] = [
  {
    id: "culture-arts",
    num: "01",
    numTa: "௧",
    nameEn: "Culture & Arts",
    nameTa: "கலை & பண்பாடு",
    subtitleEn: "Heritage, Music & Movement",
    subtitleTa: "மரபு, இசை & நடனம்",
    descEn:
      "Conversational Tamil workshops, student acoustic jam circles, living Sangam poetry, and high-energy cinematic & folk dance sets.",
    descTa:
      "உரையாடல் தமிழ், அக்யூஸ்டிக் கல்லூரிப் பாடல்கள், திரைப்பட இசை மற்றும் மேடை நடனங்கள்.",
    href: "/pillars/culture-arts",
    accent: "text-brand-purple",
    icon: Sparkles,
  },
  {
    id: "community-brotherhood",
    num: "02",
    numTa: "௨",
    nameEn: "Community & Brotherhood",
    nameTa: "தோழமை & சமூகம்",
    subtitleEn: "Campus Family & Banquets",
    subtitleTa: "மாணவர் தோழமை & திருவிழா",
    descEn:
      "South Oval lawn picnics, authentic festive banquets, Kahoot trivia showdowns, and a warm welcoming porch for every Buckeye on campus.",
    descTa:
      "ஓவல் புல்வெளி பிக்னிக், விளையாட்டு இரவுகள், சுவையான பிரியாணி விருந்து மற்றும் மாறாத நட்பு.",
    href: "/pillars/community-brotherhood",
    accent: "text-brand-teal",
    icon: HeartHandshake,
  },
  {
    id: "impact-innovation",
    num: "03",
    numTa: "௩",
    nameEn: "Impact & Innovation",
    nameTa: "முன்னேற்றம் & தலைமை",
    subtitleEn: "Mentorship & Leadership",
    subtitleTa: "வழிகாட்டல் & அறப்பணி",
    descEn:
      "Connecting Buckeyes with graduate researchers, faculty, and industry professionals through tech firesides, career advice, and community service.",
    descTa:
      "தொழில்நுட்பக் கலந்துரையாடல், ஆராய்ச்சி வழிகாட்டல், தொழில்முறைப் பயிலரங்கம் மற்றும் சமூகத் தொண்டு.",
    href: "/pillars/impact-innovation",
    accent: "text-accent-bronze",
    icon: Compass,
  },
];

export function SilkHoverPillars() {
  const { locale } = useLocale();
  const { playClick } = useAudio();

  return (
    <CulturalSection
      id="three-pillars"
      variant="ivory"
      divider="korvai"
      aria-labelledby="three-pillars-title"
      className="scroll-mt-24"
    >
      {/* Fallback anchor target for backwards compatibility */}
      <span id="five-pillars" className="sr-only" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-28 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5 md:sticky md:top-28 self-start">
          <CourtyardHeader
            eyebrow="Foundational Commitments"
            title={locale === "ta" ? "மூன்று தூண்கள்" : "The 3 Core Pillars"}
            tamilTitle={locale !== "ta" ? "மூன்று தூண்கள் · திண்ணை மரபு" : undefined}
            description="Solid stone foundations of our campus community. Each pillar gives every student an open, welcoming home to dance, create, and belong."
            titleId="three-pillars-title"
          />
        </div>

        <ol className="md:col-span-7 border-t border-border-warm">
          {THREE_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;

            return (
              <li key={pillar.id} className="border-b border-border-warm">
                <Link
                  href={pillar.href}
                  onClick={playClick}
                  onMouseEnter={() => {
                    audioLayer.playSilkSwish(0.35);
                    soundEngine.playPillarHover(idx);
                  }}
                  className="group grid grid-cols-[auto_1fr] gap-x-6 sm:gap-x-8 py-8 sm:py-10 pl-3 pr-2 border-l-[3px] border-l-transparent hover:border-l-brand-purple hover:bg-brand-purple-soft/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-ivory"
                >
                  <span
                    className="font-serif text-4xl sm:text-5xl font-light leading-none text-brand-purple tabular-nums"
                    {...(locale === "ta" ? { lang: "ta" } : {})}
                  >
                    {locale === "ta" ? pillar.numTa : pillar.num}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-2xl sm:text-3xl font-serif font-normal text-ink-earth group-hover:text-brand-teal transition-colors">
                          {pillar.nameEn}
                        </h3>
                        <p lang="ta" style={{ letterSpacing: 0 }} className="font-tamil text-base leading-[1.6] text-brand-purple">
                          {pillar.nameTa}
                        </p>
                      </div>
                      <Icon aria-hidden="true" className={`mt-1 h-5 w-5 shrink-0 ${pillar.accent}`} />
                    </div>

                    {locale === "ta" ? (
                      <span lang="ta" style={{ letterSpacing: 0 }} className="mt-2 block font-tamil text-sm leading-[1.6] text-ink-umber">
                        {pillar.subtitleTa}
                      </span>
                    ) : (
                      <span className="mt-2 block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-umber">
                        {pillar.subtitleEn}
                      </span>
                    )}

                    <p
                      className={`mt-3 max-w-xl text-sm sm:text-base font-sans text-ink-umber ${locale === "ta" ? "font-tamil leading-[1.7]" : "leading-relaxed"}`}
                      {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}
                    >
                      {locale === "ta" ? pillar.descTa : pillar.descEn}
                    </p>

                    <span className="mt-4 inline-flex min-h-12 items-center gap-1.5 font-sans text-sm font-semibold text-brand-teal group-hover:text-brand-teal-hover group-hover:underline underline-offset-[6px]">
                      Explore pillar
                      <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </CulturalSection>
  );
}
