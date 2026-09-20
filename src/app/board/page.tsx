"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CURRENT_BOARD, ALUMNI_YEARS, BoardMember } from "@/data/board";
import { HolographicCard } from "@/components/3d/HolographicCard";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { ArrowUpRight } from "lucide-react";

export default function BoardPage() {
  const { locale } = useLocale();
  const { playClick, playWoodClick } = useAudio();

  const [activeTab, setActiveTab] = useState<"current" | "liquid" | "alumni">("current");
  const [hoveredMember, setHoveredMember] = useState<BoardMember>(CURRENT_BOARD[0]);
  const [activeModalCard, setActiveModalCard] = useState<BoardMember | null>(null);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
          Mullai (முல்லை) · Forest, Evening Lamplight & Leaders
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight font-serif mb-4">
          {locale === "ta" ? "நிர்வாகக் குழு & முன்னாள் மாணவர்கள்" : "Executive Board & Alumni"}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {locale === "ta"
            ? "3D ஹோலோகிராஃபிக் அட்டை வடிவம், பெயர் நகர்வுப் பட்டியல் (Liquid Roster), மற்றும் முன்னாள் மாணவர்களின் இதழ்த் தொகுப்பு."
            : "Meet the student officers directing our initiatives. Interactive 3D trading cards, the editorial Liquid Roster, and historical alumni archive volumes."}
        </p>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 mb-12 border-b border-white/10 pb-4">
        {[
          { id: "current" as const, label: "3D Trading Cards (ஹோலோகிராம்)" },
          { id: "liquid" as const, label: "Liquid Roster (பெயர் அரங்கம்)" },
          { id: "alumni" as const, label: "Alumni Magazine Issues (இதழ்கள்)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playWoodClick();
              setActiveTab(tab.id);
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              activeTab === tab.id
                ? "bg-[var(--accent-tint)] text-black border-transparent shadow-md"
                : "glass-panel text-slate-300 border-white/10 hover:border-white/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. 3D Holographic Trading Cards Grid */}
      {activeTab === "current" && (
        <div>
          <div className="text-center mb-8">
            <p className="text-xs font-mono text-slate-400">
              💡 Hover to tilt card foil reflection; Click to flip for bio and favorites.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CURRENT_BOARD.map((member) => (
              <div key={member.id} className="flex justify-center">
                <HolographicCard member={member} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Signature Moment 7: Liquid Roster (Editorial Typography Hover Swap) */}
      {activeTab === "liquid" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[500px]">
          {/* Left Column: Oversized Typography Names List */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
              Hover name to swap center portrait
            </span>
            {CURRENT_BOARD.map((member) => {
              const isHovered = hoveredMember.id === member.id;
              return (
                <div
                  key={member.id}
                  onMouseEnter={() => {
                    playClick();
                    setHoveredMember(member);
                  }}
                  onClick={() => setActiveModalCard(member)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                    isHovered
                      ? "bg-white/10 border-[var(--accent-tint)] scale-[1.02]"
                      : "border-transparent hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
                        {member.nameEn}
                      </h3>
                      <p className="text-xs text-[var(--accent-tint)] font-mono">
                        {member.nameTa} · {member.roleEn} ({member.roleTa})
                      </p>
                    </div>
                    <ArrowUpRight className={`w-5 h-5 transition-opacity ${isHovered ? "opacity-100 text-[var(--accent-tint)]" : "opacity-30"}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Morphed Portrait Display */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm h-96 rounded-3xl overflow-hidden border border-white/20 glass-panel-elevated shadow-2xl p-4 flex flex-col justify-between">
              <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-inner">
                <Image
                  src={hoveredMember.photoUrl}
                  alt={hoveredMember.nameEn}
                  fill
                  className="object-cover transition-all duration-500"
                  sizes="(max-width: 640px) 100vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <div>
                    <span className="text-2xl font-serif font-bold text-white block">
                      {hoveredMember.nameTa}
                    </span>
                    <span className="text-xs text-[var(--accent-tint)] font-mono">
                      {hoveredMember.hometown}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs font-mono text-slate-300">
                <span>{hoveredMember.major}</span>
                <span className="text-[var(--accent-tint)]">{hoveredMember.year}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Alumni Boards As Magazine "Issues" */}
      {activeTab === "alumni" && (
        <div className="space-y-12">
          {ALUMNI_YEARS.map((vol) => (
            <div
              key={vol.volume}
              className="rounded-3xl glass-panel-elevated p-8 sm:p-12 border border-white/10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-5 relative h-72 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                <Image
                  src={vol.coverImage}
                  alt={vol.volume}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 500px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <span className="text-2xl font-serif font-bold text-white">
                    {vol.volume}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)]">
                  Archive Issue · {vol.academicYear}
                </span>

                <h3 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                  {locale === "ta" ? vol.themeTa : vol.themeEn}
                </h3>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Executive Highlights
                  </p>
                  <ul className="space-y-1 text-xs sm:text-sm text-slate-300 list-disc list-inside">
                    {(locale === "ta" ? vol.highlightsTa : vol.highlightsEn).map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs font-mono text-slate-400 uppercase mb-2">Executive Officers</p>
                  <div className="flex flex-wrap gap-2">
                    {vol.members.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl glass-panel text-xs text-white font-medium border border-white/10"
                      >
                        {m.nameEn} ({m.roleEn})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Trading Card if clicked from Liquid Roster */}
      {activeModalCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative">
            <button
              onClick={() => setActiveModalCard(null)}
              className="absolute -top-10 right-0 text-white font-mono text-xs hover:underline"
            >
              ✕ Close
            </button>
            <HolographicCard member={activeModalCard} />
          </div>
        </div>
      )}
    </div>
  );
}
