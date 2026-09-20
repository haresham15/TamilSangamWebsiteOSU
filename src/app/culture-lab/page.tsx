"use client";

import React, { useState } from "react";
import { KolamStudio } from "@/components/culture/KolamStudio";
import { SolkattuPads } from "@/components/culture/SolkattuPads";
import { AlphabetConstellation } from "@/components/culture/AlphabetConstellation";
import { KuralViewer } from "@/components/culture/KuralViewer";
import { NameTransliteration } from "@/components/culture/NameTransliteration";
import { PongalBoilOver } from "@/components/culture/PongalBoilOver";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { Sparkles, Music, Grid, BookOpen, PenTool, Flame } from "lucide-react";

export default function CultureLabPage() {
  const { locale } = useLocale();
  const { playWoodClick } = useAudio();

  const [activeToy, setActiveToy] = useState<"kolam" | "solkattu" | "alphabet" | "kural" | "name" | "pongal">("kolam");

  const toys = [
    { id: "kolam" as const, labelEn: "Kolam Studio", labelTa: "கோல அரங்கம்", icon: <PenTool className="w-4 h-4" /> },
    { id: "solkattu" as const, labelEn: "Solkattu Pads", labelTa: "சொற்கட்டு ஒலி", icon: <Music className="w-4 h-4" /> },
    { id: "alphabet" as const, labelEn: "Alphabet Matrix", labelTa: "நெடுங்கணக்கு", icon: <Grid className="w-4 h-4" /> },
    { id: "kural" as const, labelEn: "Thirukkural Daily", labelTa: "திருக்குறள்", icon: <BookOpen className="w-4 h-4" /> },
    { id: "name" as const, labelEn: "Your Name in Tamil", labelTa: "உங்கள் பெயர்", icon: <Sparkles className="w-4 h-4" /> },
    { id: "pongal" as const, labelEn: "Pongal Boil-Over", labelTa: "பொங்கல் விளையாட்டு", icon: <Flame className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
          Cultural Playground & Creative Lab
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight font-serif mb-4">
          {locale === "ta" ? "கலாச்சார அரங்கம் · Culture Lab" : "Sangam Culture Lab"}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {locale === "ta"
            ? "கோலம் வரைதல், தாள அடுக்குகள், தமிழ் நெடுங்கணக்கு, குறள் அறிவு மற்றும் மங்கலப் பொங்கல் விளையாட்டு — அனுபவியுங்கள்."
            : "Six interactive mathematical, musical, linguistic, and celebratory toys rooted in authentic Tamil heritage. Free to explore, share, and enjoy."}
        </p>
      </div>

      {/* Toy Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-12 border-b border-white/10 pb-4">
        {toys.map((toy) => (
          <button
            key={toy.id}
            onClick={() => {
              playWoodClick();
              setActiveToy(toy.id);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border flex items-center gap-2 transition-all shadow-md ${
              activeToy === toy.id
                ? "bg-[var(--accent-tint)] text-black border-transparent shadow-lg scale-105"
                : "glass-panel text-slate-300 border-white/10 hover:border-white/25 hover:text-white"
            }`}
          >
            {toy.icon}
            <span>{locale === "ta" ? toy.labelTa : toy.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Active Toy Display Container */}
      <div className="animate-fadeIn">
        {activeToy === "kolam" && <KolamStudio />}
        {activeToy === "solkattu" && <SolkattuPads />}
        {activeToy === "alphabet" && <AlphabetConstellation />}
        {activeToy === "kural" && <KuralViewer />}
        {activeToy === "name" && <NameTransliteration />}
        {activeToy === "pongal" && <PongalBoilOver />}
      </div>
    </div>
  );
}
