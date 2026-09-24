"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { INITIATIVE_PILLARS, ART_FORMS } from "@/data/initiatives";
import { Sparkles, Music, HeartHandshake, Calendar, Users, ArrowRight } from "lucide-react";

export default function InitiativesPage() {
  const { locale } = useLocale();
  const { playClick, playWoodClick } = useAudio();
  const [selectedPillar, setSelectedPillar] = useState<string>("aatam");

  const activePillar = INITIATIVE_PILLARS.find((p) => p.id === selectedPillar) || INITIATIVE_PILLARS[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      {/* Header */}
      <div className="max-w-3xl mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2 font-bold">
          The Ohio State University · Student Expression & Community
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight font-display mb-4">
          {locale === "ta" ? "முன்னெடுப்புகள் & கலைப்பிரிவுகள்" : "Initiatives & Campus Hubs"}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body">
          {locale === "ta"
            ? "ஆட்டம், பாட்டம், கொண்டாட்டம் என்ற மூன்று தூண்களின் வழியே ஓஹியோ வளாகத்தில் மாணவர்கள் இணைந்து கலைகள், நல்ல உணவு மற்றும் நட்பை முன்னெடுத்துச் செல்கிறோம்."
            : "Anchored by our core community spirit — Aatam (Dance), Paatam (Music), and Kondatam (Celebration) — we welcome students to explore movement, music, food, and inclusive campus fellowship."}
        </p>
      </div>

      {/* 1. The Three Pillars Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {INITIATIVE_PILLARS.map((pillar) => {
          const isSelected = selectedPillar === pillar.id;
          return (
            <button
              key={pillar.id}
              onClick={() => {
                playWoodClick();
                setSelectedPillar(pillar.id);
              }}
              className={`box-architectural-dark p-6 text-left border-2 transition-all ${
                isSelected
                  ? "border-[#55CCA2] bg-[#250d38] shadow-[6px_6px_0px_#55CCA2] -translate-y-0.5"
                  : "border-white/10 bg-[#160d26]/80 hover:border-white/25 shadow-[4px_4px_0px_#4c2472] text-slate-300"
              }`}
            >
              <div
                className="w-10 h-10 border-2 border-white/20 flex items-center justify-center text-white mb-4 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
                style={{ backgroundColor: pillar.accentColor }}
              >
                {pillar.id === "aatam" && <Sparkles className="w-5 h-5" />}
                {pillar.id === "paatam" && <Music className="w-5 h-5" />}
                {pillar.id === "kondatam" && <HeartHandshake className="w-5 h-5" />}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {locale === "ta" ? pillar.titleTa : pillar.titleEn}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                {locale === "ta" ? pillar.taglineTa : pillar.taglineEn}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Pillar Deep Dive Showcase */}
      <div className="box-ticket p-8 sm:p-12 bg-[#160d26] border-2 border-[#55CCA2] shadow-[6px_6px_0px_#55CCA2] mb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 border border-white/30"
              style={{ backgroundColor: activePillar.accentColor }}
            />
            <span className="text-xs font-mono uppercase tracking-widest text-[#55CCA2] font-bold">
              Pillar Focus
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white font-serif tracking-tight">
            {locale === "ta" ? activePillar.titleTa : activePillar.titleEn}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {locale === "ta" ? activePillar.descriptionTa : activePillar.descriptionEn}
          </p>

          <div className="space-y-3 pt-2 text-xs font-mono text-slate-300">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-[#55CCA2] shrink-0 mt-0.5" />
              <span>
                <strong>Rehearsals:</strong> {locale === "ta" ? activePillar.rehearsalScheduleTa : activePillar.rehearsalScheduleEn}
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-[#55CCA2] shrink-0 mt-0.5" />
              <span>
                <strong>Eligibility:</strong> {locale === "ta" ? activePillar.whoCanJoinTa : activePillar.whoCanJoinEn}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href="/join#performer"
              onClick={playClick}
              className="btn-sangam-mint px-6 py-3 text-xs uppercase tracking-wider inline-flex items-center gap-2"
            >
              <span>Audition / Interest Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/gallery"
              onClick={playClick}
              className="px-5 py-3 border-2 border-white/20 bg-white/5 text-white text-xs font-mono uppercase tracking-wider hover:bg-white/10 hover:border-[#55CCA2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 active:translate-x-0.5 active:translate-y-0.5 transition-[border-color,background-color,transform] duration-150 inline-flex items-center justify-center"
            >
              View Performance Photos
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 relative h-80 overflow-hidden border-2 border-white/15 shadow-inner">
          <Image
            src={activePillar.imageUrl}
            alt={activePillar.titleEn}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 500px"
          />
        </div>
      </div>

      {/* 2. Traditional Art Forms Explainer Section */}
      <div>
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-[#55CCA2] block mb-2 font-bold">
            Living Heritage
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-serif tracking-tight">
            {locale === "ta" ? "பாரம்பரிய கலை வடிவங்கள்" : "Traditional Tamil Art Forms"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Explore the historical origins, rhythmic structures, and energetic expressions of classical and folk arts practiced by our club troupes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ART_FORMS.map((art) => (
            <div
              key={art.id}
              className="box-ticket bg-[#160d26] overflow-hidden border-2 border-white/15 hover:border-[#55CCA2] shadow-[4px_4px_0px_#4c2472] hover:shadow-[6px_6px_0px_#55CCA2] flex flex-col justify-between transition-all"
            >
              <div className="relative h-48 w-full overflow-hidden border-b-2 border-white/10">
                <Image
                  src={art.imageUrl}
                  alt={art.nameEn}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
                <span className="box-badge-dark absolute top-3 left-3 text-[10px] font-mono bg-black/75 text-[#55CCA2] border border-white/20">
                  {art.category}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 font-display">
                    {locale === "ta" ? art.nameTa : art.nameEn}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 mb-2">
                    <span className="text-[#55CCA2] font-semibold">Origin:</span> {locale === "ta" ? art.originTa : art.originEn}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed font-body">
                    {locale === "ta" ? art.descriptionTa : art.descriptionEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-slate-400">
                  <span className="text-white block font-medium">Style:</span>
                  <span>{locale === "ta" ? art.rhythmOrStyleTa : art.rhythmOrStyleEn}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
