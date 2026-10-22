// src/components/pillars/AatamMovementStudio.tsx
"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SpotlightCard } from "@/components/ui/react-bits";
import { audioLayer } from "@/utils/audioLayer";
import { Sparkles, Music, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

interface MovementCard {
  id: string;
  tagTa: string;
  tagEn: string;
  titleTa: string;
  titleEn: string;
  icon: typeof Music;
  bpm: string;
  rhythmNote: string;
  description: string;
  upcomingIntegration: string;
  prompt: string;
}

const MOVEMENTS: MovementCard[] = [
  {
    id: "kuthu",
    tagTa: "திரைப்படக் குத்து",
    tagEn: "Cinematic Kuthu & Gaana",
    titleTa: "குத்து & கானா துடிப்பு",
    titleEn: "High-Energy Kuthu & Street Gaana",
    icon: Music,
    bpm: "135–148 BPM",
    rhythmNote: "Thavil · Dappankuthu Snare · Street Horns",
    description:
      "Unapologetic, high-octane group choreography designed for flagship campus stages. Fast footwork, expressive face gestures, and iconic cinematic hook-steps.",
    upcomingIntegration:
      "We are holding open, zero-prior-experience choreography workshops at the RPAC before Kollywood Kollai and Diwali Gala.",
    prompt: "I want to propose or help choreograph an energetic Kuthu / Gaana dance set for the upcoming cultural showcase...",
  },
  {
    id: "folk",
    tagTa: "பாரம்பரிய நாட்டுப்புறம்",
    tagEn: "Folk Roots: Karagattam & Parai",
    titleTa: "கரகாட்டம் · ஒயிலாட்டம் · பறை",
    titleEn: "Folk Roots: Karagattam, Oyil & Parai",
    icon: Sparkles,
    bpm: "110–128 BPM",
    rhythmNote: "Parai Isai · Salangai Bells · Traditional Thalam",
    description:
      "Grounded in centuries-old Tamil village celebrations. Karagattam balance, rhythmic Oyilattam scarf footwork, and thunderous live Parai street percussion.",
    upcomingIntegration:
      "We want to introduce authentic folk dance workshops and live street-drumming elements to our spring campus showcase.",
    prompt: "I'd love to organize a traditional Tamil folk dance or live Parai drumming demonstration for an upcoming gathering...",
  },
  {
    id: "cypher",
    tagTa: "திறந்த நடன வட்டம்",
    tagEn: "Open Cypher & Lawn Socials",
    titleTa: "புல்வெளி நடன வட்டம்",
    titleEn: "Spontaneous Lawn Cyphers",
    icon: Users,
    bpm: "Any Tempo",
    rhythmNote: "Bluetooth Speaker · Spontaneous Cheers · Zero Pressure",
    description:
      "No auditions, no stage stress, no rehearsal schedules. Just a Bluetooth speaker on the South Oval grass, circled friends, and stepping into the ring.",
    upcomingIntegration:
      "A permanent feature of our outdoor South Oval Berry Picnics, tailgate meetups, and post-banquet dance floors.",
    prompt: "Let's organize an informal lawn cypher and freestyle circle at our next South Oval outdoor hangout...",
  },
];

export function AatamMovementStudio() {
  const [activeCard, setActiveCard] = useState<string>("kuthu");
  const reducedMotion = useReducedMotion();

  const handleCardClick = (id: string) => {
    setActiveCard(id);
    audioLayer.playSubBassThud();
  };

  return (
    <div className="w-full space-y-10">
      {/* Studio Eyebrow & Description */}
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#C85A32]">
          <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-pulse" />
          <span>Interactive Choreography Studio · நடனக் களங்கள்</span>
        </div>
        <h3 className="font-serif text-3xl sm:text-4xl text-[#161210] font-normal leading-tight">
          The Three Movement Archetypes
        </h3>
        <p className="font-sans text-sm sm:text-base text-[#57524C] leading-relaxed">
          Hover or tap any movement form to explore its rhythm profile, performance context, and how you can lead or participate in it for upcoming campus events.
        </p>
      </div>

      {/* 3-Column Interactive Triptych */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {MOVEMENTS.map((movement) => {
          const isSelected = activeCard === movement.id;
          const Icon = movement.icon;

          return (
            <motion.div
              key={movement.id}
              whileHover={reducedMotion ? {} : { y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
              <SpotlightCard
                spotlightColor="rgba(200, 90, 50, 0.16)"
                goldColor="rgba(212, 175, 55, 0.12)"
                radius={360}
                className={`h-full cursor-pointer transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between border ${
                  isSelected
                    ? "bg-[#FAF7F2] border-[#C85A32] shadow-xl shadow-[#C85A32]/10"
                    : "bg-[#FAF8F5] border-[#161210]/10 hover:border-[#C85A32]/40 shadow-sm"
                }`}
                onClick={() => handleCardClick(movement.id)}
              >
                <div className="space-y-6">
                  {/* Top Badge & Metric */}
                  <div className="flex items-center justify-between gap-4 border-b border-[#161210]/10 pb-4">
                    <span className="text-[11px] font-mono tracking-widest uppercase font-semibold text-[#C85A32]">
                      {movement.bpm}
                    </span>
                    <span
                      lang="ta"
                      className="text-xs font-tamil text-[#8C827A] font-medium"
                      style={{ letterSpacing: 0 }}
                    >
                      {movement.tagTa}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32] mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-serif text-2xl text-[#161210] font-normal leading-snug">
                      {movement.titleEn}
                    </h4>
                    <p lang="ta" className="font-tamil text-base text-[#C85A32] font-medium leading-relaxed">
                      {movement.titleTa}
                    </p>
                  </div>

                  {/* Rhythm Sonic Bar */}
                  <div className="p-3 rounded-lg bg-[#F2EAE0]/60 border border-[#161210]/5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#8C827A]">
                      <span>Sonic Texture</span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[#C85A32]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] animate-ping" />
                          <span>Active Beat</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono font-medium text-[#161210]">
                      {movement.rhythmNote}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="font-sans text-xs sm:text-sm text-[#57524C] leading-relaxed">
                    {movement.description}
                  </p>

                  {/* Living Blueprint Integration Box */}
                  <div className="pt-4 border-t border-[#161210]/10 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#161210] block">
                      Campus Blueprint 2026–2027:
                    </span>
                    <p className="text-xs font-sans text-[#57524C] leading-relaxed">
                      {movement.upcomingIntegration}
                    </p>
                  </div>
                </div>

                {/* Bottom Pitch Link */}
                <div className="pt-6 mt-6 border-t border-[#161210]/10">
                  <Link
                    href={`/ideas?category=EVENT+IDEA&pillar=aatam&prompt=${encodeURIComponent(movement.prompt)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      audioLayer.playTapeClack();
                    }}
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-semibold text-[#C85A32] hover:text-[#9A3C1E] transition-colors"
                  >
                    <span>Pitch This Movement</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
