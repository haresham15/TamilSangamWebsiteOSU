// src/components/pillars/KondatamSeasonAlmanac.tsx
"use client";

import React, { useState } from "react";
import { SpotlightCard } from "@/components/ui/react-bits";
import { audioLayer } from "@/utils/audioLayer";
import { Utensils, Sparkles, Sun, Flame, Leaf, CloudSun, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SeasonGathering {
  id: string;
  seasonEn: string;
  seasonTa: string;
  monthRange: string;
  tamilMonth: string;
  flagshipEvent: string;
  icon: typeof Sun;
  tone: string;
  accentHex: string;
  culinaryTraditions: string[];
  activities: string[];
  blueprintVision: string;
  prompt: string;
}

const SEASONS: SeasonGathering[] = [
  {
    id: "autumn",
    seasonEn: "Autumn Welcome",
    seasonTa: "இலையுதிர் வரவேற்பு",
    monthRange: "SEPTEMBER – OCTOBER",
    tamilMonth: "புரட்டாசி · ஐப்பசி",
    flagshipEvent: "South Oval Berry Picnic & Kollywood Kollai",
    icon: Leaf,
    tone: "Terracotta & Russet Leaves",
    accentHex: "#C85A32",
    culinaryTraditions: ["Fresh Berries & Mint Lemonade", "Samosa Chat Counters", "South Indian Savory Mixture"],
    activities: ["Giant Lawn Uno Tournaments", "Acoustic Sing-alongs", "Halloween Cinema Costume Night"],
    blueprintVision:
      "Welcoming new Buckeyes and transfers onto the South Oval grass with picnic blankets, lawn games, and casual fellowship before midterms.",
    prompt: "I'd love to organize an outdoor lawn picnic, board games tournament, or autumn social on the South Oval...",
  },
  {
    id: "diwali",
    seasonEn: "Festival of Lights",
    seasonTa: "தீபாவளி & கார்த்திகை",
    monthRange: "NOVEMBER – DECEMBER",
    tamilMonth: "கார்த்திகை · மார்கழி",
    flagshipEvent: "Diwali Sparkler Evening & Winter Banquet",
    icon: Flame,
    tone: "Warm Gold & Candlelight Amber",
    accentHex: "#D4AF37",
    culinaryTraditions: ["Warm Gulab Jamun", "Mysore Pak & Murukku", "Indian Chai & Spiced Refreshments"],
    activities: ["Outdoor Cold-Night Sparkler Circles", "Traditional Silk Attire Showcase", "Semester Finals Relief Hangouts"],
    blueprintVision:
      "Creating a radiant, warm sanctuary in the freezing Columbus winter where students gather in festive veshtis and sarees for home-cooked food.",
    prompt: "I want to help organize traditional decor, lighting, or catering for our winter Diwali celebration...",
  },
  {
    id: "pongal",
    seasonEn: "Thai Pongal Harvest Banquet",
    seasonTa: "தைப் பொங்கல் அறுவடை",
    monthRange: "JANUARY – FEBRUARY",
    tamilMonth: "தை மாதம்",
    flagshipEvent: "Streetside Sapad & Pongal Gathering",
    icon: Utensils,
    tone: "Turmeric Gold & Clay Terracotta",
    accentHex: "#E5A93C",
    culinaryTraditions: ["Sweet Sakkarai Pongal with Cashews", "Crispy Medu Vadai", "Hot South Indian Festive Meals"],
    activities: ["Live Kolam Floor Art Competitions", "Traditional Sugarcane Cracking", "Folk Parai Drumming & Village Roots"],
    blueprintVision:
      "Bringing authentic Tamil agricultural harvest gratitude to the Midwest, complete with festive traditions, cultural games, and shared meals.",
    prompt: "I want to propose food items or traditional cultural activities for our Thai Pongal harvest celebration...",
  },
  {
    id: "spring",
    seasonEn: "Chithirai Spring Carnival",
    seasonTa: "சித்திரை வசந்தத் திருவிழா",
    monthRange: "MARCH – APRIL",
    tamilMonth: "பங்குனி · சித்திரை",
    flagshipEvent: "Namma Jathara Inter-Collegiate Carnival",
    icon: CloudSun,
    tone: "Verdant Mint & Blossom Coral",
    accentHex: "#55CCA2",
    culinaryTraditions: ["Fresh Mango Kulfi & Cold Drinks", "Hot Biryani & Samosas", "Indian Street Snacks"],
    activities: ["Inter-Collegiate Tug-of-War (கயிறு இழுத்தல்)", "Open-Air Cultural Stage Performances", "Spring Senior Farewell Walk"],
    blueprintVision:
      "Our largest co-hosted outdoor cultural carnival uniting South Asian organizations on the RPAC Plaza under the warm April sun.",
    prompt: "I want to pitch a performance set, booth, or game tournament for the Namma Jathara spring carnival...",
  },
];

export function KondatamSeasonAlmanac() {
  const [selectedSeason, setSelectedSeason] = useState<string>("autumn");

  const activeSeason = SEASONS.find((s) => s.id === selectedSeason) || SEASONS[0];

  return (
    <div className="w-full space-y-10">
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#E5A93C]">
          <span className="w-2 h-2 rounded-full bg-[#E5A93C] animate-pulse" />
          <span>The Buckeye Almanac · பருவகாலத் திருவிழாக்கள்</span>
        </div>
        <h3 className="font-serif text-3xl sm:text-4xl text-[#161210] font-normal leading-tight">
          Four Seasons of Celebration on Columbus Turf
        </h3>
        <p className="font-sans text-sm sm:text-base text-[#57524C] leading-relaxed">
          Select a season to view how we translate Tamil seasonal harvest rites and cultural galas to Ohio State, and discover how you can co-design our upcoming celebrations.
        </p>
      </div>

      {/* Season Segmented Tab Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 border-b border-[#161210]/15 pb-4">
        {SEASONS.map((season) => {
          const isSelected = selectedSeason === season.id;
          const Icon = season.icon;
          return (
            <button
              key={season.id}
              onClick={() => {
                setSelectedSeason(season.id);
                audioLayer.playTapeClack();
              }}
              className={`p-4 rounded-xl text-left transition-all duration-300 border cursor-pointer ${
                isSelected
                  ? "bg-[#FAF7F2] border-[#E5A93C] shadow-md shadow-[#E5A93C]/10"
                  : "bg-[#FAF8F5] border-transparent hover:border-[#161210]/10"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#8C827A]">
                  {season.monthRange}
                </span>
                <Icon
                  className="w-4 h-4"
                  style={{ color: isSelected ? season.accentHex : "#8C827A" }}
                />
              </div>
              <span className="font-serif text-lg font-medium text-[#161210] block">
                {season.seasonEn}
              </span>
              <span lang="ta" className="font-tamil text-xs text-[#B85C38] block mt-0.5">
                {season.seasonTa}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded Season Dossier Card */}
      <SpotlightCard
        spotlightColor="rgba(229, 169, 60, 0.14)"
        goldColor="rgba(200, 90, 50, 0.08)"
        radius={420}
        className="p-8 sm:p-12 rounded-3xl bg-[#FAF8F5] border border-[#161210]/15 shadow-xl space-y-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#161210]/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-[#F2EAE0] text-[#161210]">
                {activeSeason.tamilMonth}
              </span>
              <span className="text-xs font-mono text-[#8C827A] uppercase tracking-widest">
                {activeSeason.monthRange}
              </span>
            </div>
            <h4 className="font-serif text-3xl sm:text-4xl text-[#161210] font-normal pt-1">
              {activeSeason.flagshipEvent}
            </h4>
          </div>

          <Link
            href={`/ideas?category=EVENT+IDEA&pillar=kondatam&prompt=${encodeURIComponent(activeSeason.prompt)}`}
            onClick={() => audioLayer.playTapeClack()}
            className="px-6 py-3 bg-[#E5A93C] text-[#1E1B18] font-sans text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#B85C38] hover:text-[#FAF9F6] transition-all flex items-center gap-2 w-fit shadow-md cursor-pointer"
          >
            <span>Pitch an Idea for this Season</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-Column Culinary & Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Culinary Highlights */}
          <div className="space-y-4 p-6 rounded-2xl bg-[#FAF7F2] border border-[#161210]/5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#B85C38]">
              <Utensils className="w-4 h-4" />
              <span>Seasonal Culinary Traditions</span>
            </div>
            <ul className="space-y-2.5">
              {activeSeason.culinaryTraditions.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-sans text-[#57524C]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B85C38] shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Activities & Cultural Rites */}
          <div className="space-y-4 p-6 rounded-2xl bg-[#FAF7F2] border border-[#161210]/5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#D4AF37]">
              <Sparkles className="w-4 h-4" />
              <span>Celebration Elements & Rites</span>
            </div>
            <ul className="space-y-2.5">
              {activeSeason.activities.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-sans text-[#57524C]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Vision Narrative */}
        <div className="p-6 rounded-2xl bg-[#F4EFE6]/70 border border-[#161210]/5 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#161210] block">
            The Living Blueprint Vision:
          </span>
          <p className="font-sans text-sm text-[#57524C] leading-relaxed">
            {activeSeason.blueprintVision}
          </p>
        </div>
      </SpotlightCard>
    </div>
  );
}
