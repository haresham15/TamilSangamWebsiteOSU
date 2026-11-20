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
    accent: "#5B2C86",
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
    accent: "#0F766E",
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
    accent: "#C79347",
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
      className="scroll-mt-24 relative w-full bg-transparent text-[#261A14] py-20 sm:py-28 overflow-hidden select-none"
    >
      {/* Fallback anchor target for backwards compatibility */}
      <span id="five-pillars" className="sr-only" aria-hidden="true" />

      {/* Ambient warm gold and temple sandstone glows */}
      <div className="absolute -top-24 left-1/4 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(199,147,71,0.06),transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(15,118,110,0.05),transparent_70%)] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 sm:px-12 relative z-10">
        {/* Courtyard Section Header on Light Ivory Canvas */}
        <CourtyardHeader
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
                className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-2xl bg-[#FFFFFF] border border-[#DFD1BE] hover:border-[#0F766E] hover:shadow-[0_12px_36px_rgba(15,118,110,0.08)] transition-[border-color,box-shadow,transform] duration-200 shadow-xs focus-visible:outline-2 focus-visible:outline-[#0F766E]"
              >
                {/* Top Lockup: Numeral & Icon */}
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-[#DFD1BE] mb-6">
                    <span className="font-serif text-3xl sm:text-4xl text-[#9A6B3E] font-light group-hover:text-[#0F766E] transition-colors">
                      {locale === "ta" ? pillar.numTa : pillar.num}
                    </span>
                    <span
                      className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#DFD1BE] group-hover:bg-[#E1F3F1] transition-colors"
                      style={{ color: pillar.accent }}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                  </div>

                  {/* Title & Tamil subtitle */}
                  <div className="space-y-1 mb-4">
                    <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#261A14] group-hover:text-[#0F766E] transition-colors">
                      {pillar.nameEn}
                    </h3>
                    <p lang="ta" className="text-sm font-serif text-[#5B2C86] font-medium">
                      {pillar.nameTa}
                    </p>
                    <span className="font-sans text-[11px] tracking-widest uppercase font-semibold text-[#5E4C40] block pt-1">
                      {locale === "ta" ? pillar.subtitleTa : pillar.subtitleEn}
                    </span>
                  </div>

                  {/* Body description */}
                  <p className="text-sm font-sans text-[#5E4C40] leading-relaxed group-hover:text-[#261A14] transition-colors">
                    {locale === "ta" ? pillar.descTa : pillar.descEn}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-8 mt-6 border-t border-[#DFD1BE] flex items-center justify-between text-xs font-mono text-[#0F766E] group-hover:text-[#0B5C56] transition-colors">
                  <span className="uppercase tracking-wider font-semibold">Explore Pillar</span>
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
