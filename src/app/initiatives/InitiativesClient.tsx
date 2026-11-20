"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { INITIATIVE_PILLARS, ART_FORMS } from "@/data/initiatives";
import { Sparkles, Music, HeartHandshake, Calendar, Users, ArrowRight } from "lucide-react";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";

export function InitiativesClient() {
  const { locale } = useLocale();
  const { playClick, playWoodClick } = useAudio();
  const [selectedPillar, setSelectedPillar] = useState<string>("aatam");

  const activePillar = INITIATIVE_PILLARS.find((p) => p.id === selectedPillar) || INITIATIVE_PILLARS[0];

  return (
    <div className="min-h-screen bg-[#140C20] text-[#F4F0FA]">
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left overflow-hidden">
      {/* Structural Watermark Glyphs */}
      <WatermarkGlyph text="முன்னெடுப்பு" position="top-right" theme="dark" opacity={0.035} />
      <WatermarkGlyph text="கலை" position="center" theme="dark" opacity={0.03} />

      {/* Header */}
      <div className="max-w-3xl mb-16 relative z-10">
        <span className="text-xs font-mono uppercase tracking-widest text-[#A6F0CF] block mb-2 font-semibold">
          CAMPUS FORMS & INITIATIVES
        </span>
        <h1 className="text-4xl sm:text-6xl font-normal text-[#F4F0FA] tracking-tight font-serif mb-4" {...(locale === "ta" ? { lang: "ta" } : {})}>
          {locale === "ta" ? "முன்னெடுப்புகள் & கலைப்பிரிவுகள்" : "Initiatives & Campus Hubs"}
        </h1>
        <p className="text-sm sm:text-base text-[#C4B7D7] leading-relaxed font-body" {...(locale === "ta" ? { lang: "ta" } : {})}>
          {locale === "ta"
            ? "ஆட்டம், பாட்டம், கொண்டாட்டம் என்ற மூன்று தூண்களின் வழியே ஓஹியோ வளாகத்தில் மாணவர்கள் இணைந்து கலைகள், நல்ல உணவு மற்றும் நட்பை முன்னெடுத்துச் செல்கிறோம்."
            : "Anchored by our core community spirit — Aatam (Dance), Paatam (Music), and Kondatam (Celebration) — we welcome students to explore movement, music, food, and inclusive campus fellowship."}
        </p>
      </div>

      {/* 1. The Three Pillars Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 relative z-10">
        {INITIATIVE_PILLARS.map((pillar) => {
          const isSelected = selectedPillar === pillar.id;
          return (
            <button
              key={pillar.id}
              onClick={() => {
                playWoodClick();
                setSelectedPillar(pillar.id);
              }}
              className={`rounded-2xl p-6 text-left border transition-[border-color,background-color,box-shadow,transform] duration-200 cursor-pointer ${
                isSelected
                  ? "border-[#A6F0CF] bg-[#25173B] shadow-[0_8px_30px_rgba(166,240,207,0.12)] -translate-y-0.5"
                  : "border-[rgba(125,96,166,0.25)] bg-[#1A1028] hover:border-[#A6F0CF]/40 hover:bg-[#25173B]/60 text-[#C4B7D7]"
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white mb-4 shadow-sm"
                style={{ backgroundColor: pillar.accentColor }}
              >
                {pillar.id === "aatam" && <Sparkles className="w-5 h-5 text-white" />}
                {pillar.id === "paatam" && <Music className="w-5 h-5 text-white" />}
                {pillar.id === "kondatam" && <HeartHandshake className="w-5 h-5 text-white" />}
              </div>
              <h3 className="text-lg font-serif text-[#F4F0FA] mb-1" {...(locale === "ta" ? { lang: "ta" } : {})}>
                {locale === "ta" ? pillar.titleTa : pillar.titleEn}
              </h3>
              <p className="text-xs text-[#C4B7D7] line-clamp-2" {...(locale === "ta" ? { lang: "ta" } : {})}>
                {locale === "ta" ? pillar.taglineTa : pillar.taglineEn}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Pillar Deep Dive Showcase */}
      <div className="rounded-2xl p-8 sm:p-12 bg-[#1A1028] border border-[rgba(125,96,166,0.35)] shadow-xl mb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 relative overflow-hidden">
        {/* Subtle Courtyard Radial Bloom */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,rgba(166,240,207,0.08),transparent_70%)] pointer-events-none" />

        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-normal text-[#F4F0FA] font-serif tracking-tight" {...(locale === "ta" ? { lang: "ta" } : {})}>
            {locale === "ta" ? activePillar.titleTa : activePillar.titleEn}
          </h2>

          <p className="text-sm sm:text-base text-[#C4B7D7] leading-relaxed" {...(locale === "ta" ? { lang: "ta" } : {})}>
            {locale === "ta" ? activePillar.descriptionTa : activePillar.descriptionEn}
          </p>

          <div className="space-y-3 pt-2 text-xs font-mono text-[#C4B7D7]">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-[#A6F0CF] shrink-0 mt-0.5" />
              <span {...(locale === "ta" ? { lang: "ta" } : {})}>
                <strong className="text-[#F4F0FA]">Rehearsals:</strong> {locale === "ta" ? activePillar.rehearsalScheduleTa : activePillar.rehearsalScheduleEn}
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-[#A6F0CF] shrink-0 mt-0.5" />
              <span {...(locale === "ta" ? { lang: "ta" } : {})}>
                <strong className="text-[#F4F0FA]">Eligibility:</strong> {locale === "ta" ? activePillar.whoCanJoinTa : activePillar.whoCanJoinEn}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href="/join#performer"
              onClick={playClick}
              className="px-6 py-3 rounded-xl bg-[#A6F0CF] text-[#140C20] hover:bg-[#7AE7B5] font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors shadow-sm"
            >
              <span>Audition / Interest Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/gallery"
              onClick={playClick}
              className="px-5 py-3 rounded-xl border border-[rgba(125,96,166,0.35)] bg-[#140C20] text-[#F4F0FA] hover:bg-[#25173B] hover:border-[#A6F0CF]/50 text-xs font-mono uppercase tracking-wider transition-colors inline-flex items-center justify-center"
            >
              View Performance Photos
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 relative h-80 rounded-xl overflow-hidden border border-[rgba(125,96,166,0.25)] bg-[#25173B] shadow-inner">
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
          <span className="text-xs font-mono uppercase tracking-widest text-[#A6F0CF] block mb-2 font-semibold">
            CULTURAL LINEAGE
          </span>
          <h2 className="text-2xl sm:text-4xl font-normal text-[#F4F0FA] font-serif tracking-tight" {...(locale === "ta" ? { lang: "ta" } : {})}>
            {locale === "ta" ? "பாரம்பரிய கலை வடிவங்கள்" : "Traditional Tamil Art Forms"}
          </h2>
          <p className="text-xs sm:text-sm text-[#C4B7D7] mt-2 font-body leading-relaxed">
            Explore the historical origins, rhythmic structures, and energetic expressions of classical and folk arts practiced by our club troupes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {ART_FORMS.map((art) => (
            <div
              key={art.id}
              className="rounded-2xl bg-[#1A1028] overflow-hidden border border-[rgba(125,96,166,0.25)] hover:border-[#A6F0CF]/40 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-[border-color,box-shadow,transform] duration-200 flex flex-col justify-between group"
            >
              <div className="relative h-48 w-full overflow-hidden border-b border-[rgba(125,96,166,0.25)] bg-[#25173B]">
                <Image
                  src={art.imageUrl}
                  alt={art.nameEn}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[11px] font-mono text-[#A6F0CF] uppercase tracking-wider block mb-1 font-semibold">
                    {art.category}
                  </span>
                  <h3 className="text-lg font-serif text-[#F4F0FA] mb-1 group-hover:text-[#A6F0CF] transition-colors" {...(locale === "ta" ? { lang: "ta" } : {})}>
                    {locale === "ta" ? art.nameTa : art.nameEn}
                  </h3>
                  <p className="text-[11px] font-mono text-[#C4B7D7] mb-2" {...(locale === "ta" ? { lang: "ta" } : {})}>
                    <span className="text-[#A6F0CF] font-semibold">Origin:</span> {locale === "ta" ? art.originTa : art.originEn}
                  </p>
                  <p className="text-xs text-[#C4B7D7] leading-relaxed font-body" {...(locale === "ta" ? { lang: "ta" } : {})}>
                    {locale === "ta" ? art.descriptionTa : art.descriptionEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-[rgba(125,96,166,0.25)] text-[11px] font-mono text-[#C4B7D7]">
                  <span className="text-[#F4F0FA] block font-medium">Style:</span>
                  <span {...(locale === "ta" ? { lang: "ta" } : {})}>{locale === "ta" ? art.rhythmOrStyleTa : art.rhythmOrStyleEn}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
