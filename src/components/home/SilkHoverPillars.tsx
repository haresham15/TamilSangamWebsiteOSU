"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { ArrowUpRight } from "lucide-react";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";

interface PillarRow {
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
  posterSrc: string;
}

const PILLAR_ROWS: PillarRow[] = [
  {
    id: "aatam",
    num: "01",
    numTa: "௧",
    nameEn: "Aatam",
    nameTa: "ஆட்டம்",
    subtitleEn: "Dance & Movement",
    subtitleTa: "நடனம்",
    descEn: "High-energy cinematic Kuthu, folk Karagattam, and collaborative open dance circles. Open to every skill level.",
    descTa: "குத்து, நாட்டுப்புறக் கலைகள், மற்றும் கல்லூரி கொண்டாட்ட நடனங்கள்.",
    href: "/events",
    posterSrc: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "paatam",
    num: "02",
    numTa: "௨",
    nameEn: "Paatam",
    nameTa: "பாட்டம்",
    subtitleEn: "Music & Jams",
    subtitleTa: "இசை",
    descEn: "Acoustic student jam circles, beloved Ilaiyaraaja & Rahman anthems, indie chords, and live student sets.",
    descTa: "அக்யூஸ்டிக் கல்லூரிப் பாடல்கள், திரைப்பட இசை, மற்றும் நட்பு நிறைந்த மாலைகள்.",
    href: "/events",
    posterSrc: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "kondatam",
    num: "03",
    numTa: "௩",
    nameEn: "Kondatam",
    nameTa: "கொண்டாட்டம்",
    subtitleEn: "Festive Gatherings",
    subtitleTa: "திருவிழா",
    descEn: "Seasonal feasts, South Oval lawn picnics, Diwali sparkler nights, and Pongal pots simmering on Columbus turf.",
    descTa: "ஓவல் புல்வெளி பிக்னிக், தெருவோரச் சாப்பாடு, தீபாவளி மத்தாப்பு கொண்டாட்டங்கள்.",
    href: "/events",
    posterSrc: "https://lh3.googleusercontent.com/pw/AP1GczPlVkHkFW39BMqHGdeuYa0EwT1OOXOGWweSVgrPMbn24CSvrUlwF8CS_x787kPudpRyXEgtSMteYmBp6Zbad4uzMgeqB6LfISOvbS0AO1-qHsPKtEoC=w1200-h800-no",
  },
  {
    id: "santhippum",
    num: "04",
    numTa: "௪",
    nameEn: "Santhippum",
    nameTa: "சந்திப்பும்",
    subtitleEn: "Kinship & Diaspora",
    subtitleTa: "சமூகம்",
    descEn: "A welcoming porch on campus. Peer mentorship, freshman welcome, and fellowship uniting all Buckeyes.",
    descTa: "ஓஹியோ பல்கலைக்கழகத்தில் அனைத்து மாணவர்களையும் அன்போடு ஒன்றிணைக்கும் குடும்பம்.",
    href: "/join",
    posterSrc: "https://lh3.googleusercontent.com/pw/AP1GczPoDEE5ppMuBlStSn71wmY-vnb9sbDehdzKVvxu_QvEJZfJ8hGCig4Bkxoe8Rx8-xpnXzZA02iZ2EZid-qciQ4V85WQKl44j_Ed6YLD25GTunQbulMG=w1200-h800-no",
  },
  {
    id: "katral",
    num: "05",
    numTa: "௫",
    nameEn: "Katral",
    nameTa: "கற்றல்",
    subtitleEn: "Language & Heritage Learning",
    subtitleTa: "மொழி & அறிவு",
    descEn: "Conversational Tamil workshops, Sangam literary discussions, diaspora seminars, and peer language exchange.",
    descTa: "உரையாடல் தமிழ் பயிற்சி, சங்க இலக்கிய அறிமுகம், வரலாற்று உரைகள்.",
    href: "/about",
    posterSrc: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1400&q=80",
  },
];

export function SilkHoverPillars() {
  const { locale } = useLocale();
  const { playClick, playWoodClick } = useAudio();
  const [activeRow, setActiveRow] = useState<string | null>(null);

  return (
    <section className="relative w-full bg-[#FAF9F6] text-[#2A2825] py-24 sm:py-32 overflow-hidden select-none">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-12">
        {/* Airy Courtyard Section Header */}
        <CourtyardHeader
          eyebrow="Foundational Commitments"
          title={locale === "ta" ? "ஐந்து தூண்கள்" : "The Five Pillars"}
          tamilTitle={locale !== "ta" ? "ஐந்து தூண்கள் · திண்ணை மரபு" : undefined}
          description="Solid stone foundations of our campus community. Each pillar gives every student an open, welcoming home to dance, create, and belong."
        />

        {/* Massive Airy Vertical Sections (No rigid grid borders) */}
        {/* Strict CSS Grid Hanging Indent (Zero Boxes, 1px Grounding Line) */}
        <div className="w-full border-t border-[#E5DDD0]">
          {PILLAR_ROWS.map((pillar) => {
            return (
              <Link
                key={pillar.id}
                href={pillar.href}
                onClick={playClick}
                onMouseEnter={() => {
                  setActiveRow(pillar.id);
                  playWoodClick();
                }}
                onMouseLeave={() => setActiveRow(null)}
                className="group relative block w-full py-12 sm:py-16 border-b border-[#E5DDD0] transition-colors duration-300"
              >
                {/* Content Layout: Strict CSS Grid Hanging Indent */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-baseline">
                  {/* Hanging Numeral (col 1-2) */}
                  <div className="lg:col-span-2">
                    <span className="font-serif text-3xl sm:text-5xl text-[#B85C38] font-light block">
                      {locale === "ta" ? pillar.numTa : pillar.num}
                    </span>
                  </div>

                  {/* Massive Bilingual Pillar Title (col 3-7) */}
                  <div className="lg:col-span-5 space-y-1">
                    <div className="flex items-baseline gap-4 sm:gap-6 flex-wrap">
                      <h3 className="text-4xl sm:text-6xl md:text-7xl font-serif font-normal tracking-tight text-[#2A2825] group-hover:text-[#B85C38] transition-colors duration-300">
                        {pillar.nameEn}
                      </h3>
                      <span
                        lang="ta"
                        style={{ letterSpacing: 0 }}
                        className="text-2xl sm:text-4xl font-serif font-light text-[#2A2825]/40 group-hover:text-[#B85C38]/60 transition-colors duration-300"
                      >
                        {pillar.nameTa}
                      </span>
                    </div>
                    <span className="font-sans text-xs tracking-widest uppercase font-semibold text-[#B85C38] block pt-1">
                      {locale === "ta" ? pillar.subtitleTa : pillar.subtitleEn}
                    </span>
                  </div>

                  {/* Subtitle & Narrative Description (col 8-12) */}
                  <div className="lg:col-span-5 flex items-start justify-between gap-6 pt-2 lg:pt-0">
                    <p className="text-sm sm:text-base font-sans text-[#57524C] leading-relaxed group-hover:text-[#2A2825] transition-colors duration-300">
                      {locale === "ta" ? pillar.descTa : pillar.descEn}
                    </p>

                    <div className="shrink-0 text-[#2A2825] group-hover:text-[#B85C38] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                      <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
