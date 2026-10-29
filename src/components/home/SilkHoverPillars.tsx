"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { soundEngine } from "@/lib/soundEngine";
import { audioLayer } from "@/utils/audioLayer";
import { ArrowUpRight, Sparkles, HeartHandshake, Compass } from "lucide-react";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";

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
    accent: "#C85A32",
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
    accent: "#D4AF37",
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
    accent: "#55CCA2",
    icon: Compass,
  },
];

export function SilkHoverPillars() {
  const { locale } = useLocale();
  const { playClick } = useAudio();
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);

  return (
    <section
      id="three-pillars"
      className="scroll-mt-24 relative w-full bg-[#161210] text-[#FAF6F0] py-20 sm:py-28 overflow-hidden select-none border-y border-[#D4AF37]/20 shadow-[inset_0_20px_50px_rgba(0,0,0,0.5)]"
    >
      {/* Fallback anchor target for backwards compatibility */}
      <span id="five-pillars" className="sr-only" aria-hidden="true" />

      {/* Ambient brass corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_bottom_right,rgba(200,90,50,0.08),transparent_70%)] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 sm:px-12 relative z-10">
        {/* Courtyard Section Header in Espresso Tone */}
        <CourtyardHeader
          dark
          eyebrow="Foundational Commitments"
          title={locale === "ta" ? "மூன்று தூண்கள்" : "The 3 Core Pillars"}
          tamilTitle={locale !== "ta" ? "மூன்று தூண்கள் · திண்ணை மரபு" : undefined}
          description="Solid stone foundations of our campus community. Each pillar gives every student an open, welcoming home to dance, create, and belong."
        />

        {/* Balanced 3-Column Desktop Grid */}
        <div className="w-full mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {THREE_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            const isHovered = hoveredPillar === pillar.id;

            return (
              <Link
                key={pillar.id}
                href={pillar.href}
                onClick={playClick}
                onMouseEnter={() => {
                  setHoveredPillar(pillar.id);
                  audioLayer.playSilkSwish(0.35);
                  soundEngine.playPillarHover(idx);
                }}
                onMouseLeave={() => setHoveredPillar(null)}
                className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-xl bg-[#1F1A17] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 hover:bg-[#26201C] transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
              >
                {/* Top Lockup: Numeral & Icon */}
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-[#FAF6F0]/10 mb-6">
                    <span className="font-serif text-3xl sm:text-4xl text-[#D4AF37] font-light group-hover:text-[#F39C12] transition-colors">
                      {locale === "ta" ? pillar.numTa : pillar.num}
                    </span>
                    <span
                      className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors"
                      style={{ color: pillar.accent }}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                  </div>

                  {/* Title & Tamil subtitle */}
                  <div className="space-y-1 mb-4">
                    <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#FAF6F0] group-hover:text-[#F39C12] transition-colors">
                      {pillar.nameEn}
                    </h3>
                    <p lang="ta" className="text-sm font-serif text-[#D4AF37]/80">
                      {pillar.nameTa}
                    </p>
                    <span className="font-sans text-[11px] tracking-widest uppercase font-semibold text-[#FAF6F0]/60 block pt-1">
                      {locale === "ta" ? pillar.subtitleTa : pillar.subtitleEn}
                    </span>
                  </div>

                  {/* Body description */}
                  <p className="text-sm font-sans text-[#E8DEC8]/80 leading-relaxed group-hover:text-[#FAF6F0] transition-colors">
                    {locale === "ta" ? pillar.descTa : pillar.descEn}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-8 mt-6 border-t border-[#FAF6F0]/10 flex items-center justify-between text-xs font-mono text-[#D4AF37]/80 group-hover:text-[#FAF6F0] transition-colors">
                  <span className="uppercase tracking-wider">Explore Pillar</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
