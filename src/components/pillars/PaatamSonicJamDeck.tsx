// src/components/pillars/PaatamSonicJamDeck.tsx
"use client";

import React, { useState } from "react";
import { soundEngine } from "@/lib/soundEngine";
import { audioLayer } from "@/utils/audioLayer";
import { StarBorder, SpotlightCard } from "@/components/ui/react-bits";
import { Music, Disc3, Radio, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SonicEra {
  id: string;
  nameEn: string;
  nameTa: string;
  tagline: string;
  era: string;
  icon: typeof Music;
  highlights: string[];
  blueprintVision: string;
  prompt: string;
}

const SONIC_ERAS: SonicEra[] = [
  {
    id: "raja",
    nameEn: "Ilaiyaraaja Golden Analog",
    nameTa: "இளையராஜா பொற்காலம்",
    tagline: "Lush live strings, acoustic guitar counter-melodies & cassette-era warmth",
    era: "1970s–1990s Analog",
    icon: Disc3,
    highlights: ["Sangeetha Megam", "Thendral Vandhu", "Kanne Kalaimane", "Idhu Oru Pon Maalai"],
    blueprintVision:
      "Arranging acoustic guitar and vocal harmonies for relaxed living-room unplugged sessions in the Ohio Union.",
    prompt: "I'd love to organize an Ilaiyaraaja acoustic unplugged retrospective jam night at Ohio State...",
  },
  {
    id: "rahman",
    nameEn: "A.R. Rahman Modern Soul",
    nameTa: "ஏ.ஆர். ரஹ்மான் காவியங்கள்",
    tagline: "Atmospheric synths, evocative choral arrangements & timeless mid-tempo reverie",
    era: "1990s–Present Cinema",
    icon: Radio,
    highlights: ["Pachai Nirame", "Nenjukkul Peidhidum", "Munbe Vaa", "Vaseegara"],
    blueprintVision:
      "Forming a student choir and multi-instrumental ensemble to perform acoustic medley arrangements at campus banquets.",
    prompt: "I want to organize a multi-vocalist acoustic ensemble covering A.R. Rahman classics for our next gala...",
  },
  {
    id: "fusion",
    nameEn: "Carnatic & Acoustic Folk",
    nameTa: "கர்நாடக · நாட்டுப்புற இணைவு",
    tagline: "Intricate raga gamakas, mridangam fingerwork & acoustic Western guitar rhythm",
    era: "Classical Roots",
    icon: Sparkles,
    highlights: ["Raga Mohanam", "Kapi Jams", "Themmangu Folk", "Bho Shambo Improvisations"],
    blueprintVision:
      "Inviting student classical violinists, flutists, and percussionists to fuse classical ragas with contemporary rhythms.",
    prompt: "I'm a classical/folk instrumentalist looking to form a Carnatic-acoustic fusion project for campus cultural showcases...",
  },
  {
    id: "circles",
    nameEn: "Midnight Oval Acoustic Circles",
    nameTa: "வளாக இசை வட்டம்",
    tagline: "Casual, un-amplified sing-alongs under campus streetlamps and starry Ohio skies",
    era: "Student Traditions",
    icon: Music,
    highlights: ["South Oval Trees", "Thompson Courtyards", "Acoustic Cajón", "Group Harmonies"],
    blueprintVision:
      "Low-barrier acoustic jam sessions where students bring their guitars, ukuleles, cajóns, or voices just to unwind.",
    prompt: "Let's organize monthly informal evening acoustic music circles on the South Oval lawn...",
  },
];

const STRING_LABELS = [
  { note: "Sa (Low)", pitch: "D3", hz: "146.8 Hz" },
  { note: "Pa (Low)", pitch: "A3", hz: "220.3 Hz" },
  { note: "Sa", pitch: "D4", hz: "293.7 Hz" },
  { note: "Ga3", pitch: "F#4", hz: "367.1 Hz" },
  { note: "Pa", pitch: "A4", hz: "440.5 Hz" },
  { note: "Sa (High)", pitch: "D5", hz: "587.3 Hz" },
];

export function PaatamSonicJamDeck() {
  const [activeEra, setActiveEra] = useState<string>("raja");
  const [lastPluckedString, setLastPluckedString] = useState<number | null>(null);

  const handlePluck = (idx: number) => {
    setLastPluckedString(idx);
    soundEngine.playAcousticString(idx, 0.85);
  };

  const handleStrumChord = () => {
    setLastPluckedString(null);
    soundEngine.playVaaranamChord();
  };

  return (
    <div className="w-full space-y-12">
      {/* =========================================================================
          INTERACTIVE RAGA MOHANAM ACOUSTIC STRINGS FRETBOARD
          ========================================================================= */}
      <div className="p-6 sm:p-10 rounded-2xl bg-[#161210] border border-[#D4AF37]/30 text-[#FAF6F0] space-y-8 shadow-2xl relative overflow-hidden">
        {/* Ambient Warm Fret Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_70%)] pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#D4AF37]">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
              <span>Interactive Raga Mohanam Acoustic Deck · வீணை மற்றும் கிட்டார் நரம்புகள்</span>
            </div>
            <h4 className="font-serif text-2xl sm:text-3xl font-normal text-[#FAF6F0]">
              Strum the 6 Strings of Mohanam
            </h4>
          </div>

          <StarBorder
            color="#D4AF37"
            trailColor="#C85A32"
          >
            <button
              type="button"
              onClick={handleStrumChord}
              className="px-5 py-2.5 bg-[#1E1916] text-[#D4AF37] hover:text-[#FAF6F0] text-xs font-mono uppercase tracking-wider font-semibold rounded-full cursor-pointer transition-colors"
            >
              Strum Vaaranam Chord ♪
            </button>
          </StarBorder>
        </div>

        {/* 6 Acoustic Strings Rack */}
        <div className="space-y-3 py-2">
          {STRING_LABELS.map((str, idx) => {
            const isPlaying = lastPluckedString === idx;
            return (
              <div
                key={str.pitch}
                onClick={() => handlePluck(idx)}
                onMouseEnter={() => handlePluck(idx)}
                className="group relative flex items-center gap-4 p-2 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors"
              >
                {/* Note Badge */}
                <div className="w-20 shrink-0 font-mono text-xs flex items-center justify-between text-[#D4AF37]/80 group-hover:text-[#D4AF37]">
                  <span className="font-bold">{str.note}</span>
                  <span className="text-[10px] text-[#FAF6F0]/50">{str.pitch}</span>
                </div>

                {/* Physical Wire String Line */}
                <div className="relative flex-1 h-6 flex items-center">
                  <div
                    className={`w-full transition-all duration-150 ${
                      isPlaying
                        ? "h-[3px] bg-[#F39C12] shadow-[0_0_12px_#F39C12]"
                        : "h-[1.5px] bg-[#D4AF37]/40 group-hover:bg-[#D4AF37] group-hover:h-[2px]"
                    }`}
                  />
                </div>

                {/* Frequency & Pluck Action */}
                <span className="shrink-0 text-[11px] font-mono text-[#FAF6F0]/40 group-hover:text-[#D4AF37] w-16 text-right">
                  {str.hz}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs font-mono text-[#FAF6F0]/60 text-center">
          Tap or sweep across any string to synthesize warm, physically modeled 3-partial acoustics via Web Audio DSP.
        </p>
      </div>

      {/* =========================================================================
          THE FOUR SONIC ERAS
          ========================================================================= */}
      <div className="space-y-6 pt-4">
        <div className="space-y-2">
          <h3 className="font-serif text-3xl sm:text-4xl text-[#161210] font-normal leading-tight">
            The Four Sonic Eras
          </h3>
          <p className="font-sans text-sm sm:text-base text-[#57524C] max-w-2xl">
            From the analog genius of Ilaiyaraaja to midnight campus acoustic jam circles, explore our musical influences and see where you can contribute.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {SONIC_ERAS.map((era) => {
            const isSelected = activeEra === era.id;
            const Icon = era.icon;

            return (
              <SpotlightCard
                key={era.id}
                spotlightColor="rgba(212, 175, 55, 0.14)"
                goldColor="rgba(200, 90, 50, 0.10)"
                radius={380}
                className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#FAF7F2] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10"
                    : "bg-[#FAF8F5] border-[#161210]/10 hover:border-[#D4AF37]/50"
                }`}
                onClick={() => {
                  setActiveEra(era.id);
                  audioLayer.playTapeClack();
                }}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4 border-b border-[#161210]/10 pb-4">
                    <span className="text-[11px] font-mono tracking-widest uppercase font-semibold text-[#8C827A]">
                      {era.era}
                    </span>
                    <Icon className="w-5 h-5 text-[#D4AF37]" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif text-2xl text-[#161210] font-normal">
                      {era.nameEn}
                    </h4>
                    <p lang="ta" className="font-tamil text-base text-[#B85C38] font-medium leading-relaxed">
                      {era.nameTa}
                    </p>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-[#57524C] leading-relaxed">
                    {era.tagline}
                  </p>

                  {/* Representative Track Pills */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C827A] block">
                      Inspirational Anthems:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {era.highlights.map((track) => (
                        <span
                          key={track}
                          className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#F2EAE0] text-[#161210] border border-[#161210]/5"
                        >
                          {track}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Campus Blueprint Box */}
                  <div className="p-3.5 rounded-xl bg-[#F4EFE6]/70 border border-[#161210]/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#161210] block">
                      Campus Blueprint 2026–2027:
                    </span>
                    <p className="text-xs font-sans text-[#57524C] leading-relaxed">
                      {era.blueprintVision}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#161210]/10">
                  <Link
                    href={`/ideas?category=EVENT+IDEA&pillar=paatam&prompt=${encodeURIComponent(era.prompt)}`}
                    onClick={() => audioLayer.playTapeClack()}
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-semibold text-[#B85C38] hover:text-[#161210] transition-colors"
                  >
                    <span>Pitch a Jam Concept</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
