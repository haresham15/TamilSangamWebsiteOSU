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
    accentHex: "#F26BB5",
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
    accentHex: "#C79347",
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
    accentHex: "#C79347",
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
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#C79347]">
          <span className="w-2 h-2 rounded-full bg-[#2BB5A8]" />
          <span>The Buckeye Almanac · பருவகாலத் திருவிழாக்கள்</span>
        </div>
        <h3 className="font-serif text-3xl sm:text-4xl text-[#FAF5ED] font-normal leading-tight">
          Four Seasons of Celebration on Columbus Turf
        </h3>
        <p className="font-sans text-sm sm:text-base text-[#CBBBA8] leading-relaxed">
          Select a season to view how we translate Tamil seasonal harvest rites and cultural galas to Ohio State, and discover how you can co-design our upcoming celebrations.
        </p>
      </div>

      {/* Season Segmented Tab Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 border-b border-[#C79347]/20 pb-4">
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
              className={`p-4 rounded-xl text-left transition-[border-color,background-color,box-shadow] duration-200 border cursor-pointer ${
                isSelected
                  ? "bg-[#1C122B] border-[#2BB5A8] shadow-md shadow-[#2BB5A8]/15"
                  : "bg-[#1C122B] border-transparent hover:border-[#C79347]/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#CBBBA8]">
                  {season.monthRange}
                </span>
                <Icon
                  className="w-4 h-4"
                  style={{ color: isSelected ? season.accentHex : "#CBBBA8" }}
                />
              </div>
              <span className="font-serif text-lg font-medium text-[#FAF5ED] block">
                {season.seasonEn}
              </span>
              <span lang="ta" className="font-tamil text-xs text-[#C79347] block mt-0.5">
                {season.seasonTa}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded Season Dossier Card */}
      <SpotlightCard
        spotlightColor="rgba(43, 181, 168, 0.14)"
        goldColor="rgba(199, 147, 71, 0.1)"
        radius={420}
        className="p-8 sm:p-12 rounded-3xl bg-[#1C122B] border border-[#C79347]/20 shadow-xl space-y-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#C79347]/20 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-[#271A3C] text-[#FAF5ED]">
                {activeSeason.tamilMonth}
              </span>
              <span className="text-xs font-mono text-[#CBBBA8] uppercase tracking-widest">
                {activeSeason.monthRange}
              </span>
            </div>
            <h4 className="font-serif text-3xl sm:text-4xl text-[#FAF5ED] font-normal pt-1">
              {activeSeason.flagshipEvent}
            </h4>
          </div>

          <Link
            href={`/ideas?category=EVENT+IDEA&pillar=kondatam&prompt=${encodeURIComponent(activeSeason.prompt)}`}
            onClick={() => audioLayer.playTapeClack()}
            className="px-6 py-3 bg-[#0F766E] text-[#FAF5ED] font-sans text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#0B5C56] transition-all flex items-center gap-2 w-fit shadow-md cursor-pointer"
          >
            <span>Pitch an Idea for this Season</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-Column Culinary & Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Culinary Highlights */}
          <div className="space-y-4 p-6 rounded-2xl bg-[#1C122B] border border-[#C79347]/20">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#C79347]">
              <Utensils className="w-4 h-4" />
              <span>Seasonal Culinary Traditions</span>
            </div>
            <ul className="space-y-2.5">
              {activeSeason.culinaryTraditions.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-sans text-[#CBBBA8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C79347] shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Activities & Cultural Rites */}
          <div className="space-y-4 p-6 rounded-2xl bg-[#1C122B] border border-[#C79347]/20">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#C79347]">
              <Sparkles className="w-4 h-4" />
              <span>Celebration Elements & Rites</span>
            </div>
            <ul className="space-y-2.5">
              {activeSeason.activities.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-sans text-[#CBBBA8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C79347] shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Vision Narrative */}
        <div className="p-6 rounded-2xl bg-[#25173B]/70 border border-[rgba(125,96,166,0.25)] space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#F4F0FA] block">
            The Living Blueprint Vision:
          </span>
          <p className="font-sans text-sm text-[#C4B7D7] leading-relaxed">
            {activeSeason.blueprintVision}
          </p>
        </div>
      </SpotlightCard>
    </div>
  );
}
