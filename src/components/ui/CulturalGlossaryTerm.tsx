"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Volume2 } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

export interface CulturalTermData {
  term: string;
  tamil: string;
  phonetic: string;
  category: "Philosophy" | "Arts" | "Tradition" | "Literature" | "Culinary" | "Architecture";
  definitionEn: string;
  definitionTa: string;
  significance: string;
}

export const CULTURAL_GLOSSARY: Record<string, CulturalTermData> = {
  sangam: {
    term: "Sangam",
    tamil: "சங்கம்",
    phonetic: "/sʌŋ-ɡʌm/",
    category: "Philosophy",
    definitionEn: "An assembly, fellowship, or cultural academy where thinkers, poets, and friends gather as equals.",
    definitionTa: "புலவர்களும் நண்பர்களும் சமத்துவமாக ஒன்றுகூடும் அவை அல்லது தோழமை.",
    significance: "Inspired by the ancient Sangam assemblies of Madurai that preserved classical Dravidian heritage.",
  },
  aatam: {
    term: "Aatam",
    tamil: "ஆட்டம்",
    phonetic: "/ɑː-tʌm/",
    category: "Arts",
    definitionEn: "Rhythmic movement, folk dance, cinematic Kuthu, and classical dance celebrating life.",
    definitionTa: "கொண்டாட்ட நடனம், நாட்டுப்புறக் கலை, மற்றும் சினிமா ஆடல்.",
    significance: "The physical heartbeat of Tamil celebration across village festivals and modern stages.",
  },
  paatam: {
    term: "Paatam",
    tamil: "பாட்டம்",
    phonetic: "/pɑː-tʌm/",
    category: "Arts",
    definitionEn: "Melodic song, acoustic jamming, poetry, and singing timeless cinema and folk tracks.",
    definitionTa: "இனிமையான பாடல், நேரடி இசை, மற்றும் கல்லூரித் தோழமையின் ராகங்கள்.",
    significance: "From classical Carnatic scales to Ilaiyaraaja and A.R. Rahman anthems.",
  },
  kondatam: {
    term: "Kondatam",
    tamil: "கொண்டாட்டம்",
    phonetic: "/kɒn-dɑː-tʌm/",
    category: "Tradition",
    definitionEn: "Exuberant communal celebration, festive picnics, sparklers, and joyful gatherings.",
    definitionTa: "மகிழ்ச்சி நிறைந்த திருவிழா, புல்வெளி சந்திப்பு, மற்றும் கொண்டாட்டம்.",
    significance: "The spirit that turns ordinary campus days into unforgettable family memories.",
  },
  santhippum: {
    term: "Santhippum",
    tamil: "சந்திப்பும்",
    phonetic: "/sʌn-ðɪ-pʊm/",
    category: "Tradition",
    definitionEn: "A welcoming meeting place and fellowship where newcomers find a home away from home.",
    definitionTa: "நட்புப் பரிமாற்றம், வழிகாட்டல், மற்றும் அன்பான வரவேற்பு.",
    significance: "Bridging freshmen with upperclassmen and connecting all friends of Tamil culture.",
  },
  ainthinai: {
    term: "Ainthinai",
    tamil: "ஐந்திணை",
    phonetic: "/aɪn-θɪ-naɪ/",
    category: "Philosophy",
    definitionEn: "The five classical Sangam poetic landscapes—Kurinji, Mullai, Marutham, Neithal, and Paalai.",
    definitionTa: "பண்டைய தமிழ் இலக்கியத்தின் ஐந்து நிலப்பரப்புகள் (குறிஞ்சி, முல்லை, மருதம், நெய்தல், பாலை).",
    significance: "Each landscape symbolizes an ecological biome and a psychological state of human emotion.",
  },
  kuthuvilakku: {
    term: "Kuthuvilakku",
    tamil: "குத்துவிளக்கு",
    phonetic: "/kʊ-θʊ-vɪ-lʌ-kʊ/",
    category: "Tradition",
    definitionEn: "An ornate traditional bronze oil lamp lit to inaugurate auspicious events with warm ambient light.",
    definitionTa: "மங்கல நிகழ்வுகளைத் தொடங்கும் பாரம்பரிய பித்தளை விளக்கு.",
    significance: "Symbolizes dispelling darkness, radiating wisdom, and welcoming positive energy.",
  },
  kolam: {
    term: "Kolam",
    tamil: "கோலம்",
    phonetic: "/koʊ-lʌm/",
    category: "Arts",
    definitionEn: "Sacred mathematical threshold art drawn with rice flour at dawn to welcome guests and nourish birds.",
    definitionTa: "வாசல் படியில் அரிசி மாவில் வரையப்படும் தெய்வீக வடிவியல் கலை.",
    significance: "A daily ritual combining sacred geometry, hospitality, and ecological harmony.",
  },
  parai: {
    term: "Parai",
    tamil: "பறை",
    phonetic: "/pʌ-raɪ/",
    category: "Arts",
    definitionEn: "One of the oldest percussion instruments in human history; a frame drum of resonance and dignity.",
    definitionTa: "தமிழர்களின் ஆதி இசைக்கருவி; பெருமிதத்தின் முழக்கம்.",
    significance: "Ancient communicator of village proclamations and powerful rhythm of cultural liberation.",
  },
  kuthu: {
    term: "Kuthu",
    tamil: "குத்து",
    phonetic: "/kʊ-θʊ/",
    category: "Arts",
    definitionEn: "High-octane South Indian folk beat and street dance characterized by thunderous percussion.",
    definitionTa: "துள்ளலான தெருவோரக் கூத்து மற்றும் தாள நடனம்.",
    significance: "Spontaneous collective joy that fills college plazas and festive celebrations.",
  },
  gopuram: {
    term: "Gopuram",
    tamil: "கோபுரம்",
    phonetic: "/ɡoʊ-pʊ-rʌm/",
    category: "Architecture",
    definitionEn: "Monumental tiered entrance gateway tower of Dravidian architecture crowned with stone kalasams.",
    definitionTa: "திராவிடக் கட்டிடக்கலையின் பிரமாண்ட நுழைவாயில் கோபுரம்.",
    significance: "Reaching toward the cosmos, serving as visual landmarks across Tamil Nadu.",
  },
  "yaadhum-oore": {
    term: "Yaadhum Oore",
    tamil: "யாதும் ஊரே",
    phonetic: "/jɑː-ðʊm uː-reɪ/",
    category: "Philosophy",
    definitionEn: "'To us all towns are our own, and everyone is our kin' — Kaniyan Pungundranar (Purananuru 192).",
    definitionTa: "யாதும் ஊரே யாவரும் கேளீர் — கணியன் பூங்குன்றனாரின் உலகப் பொதுமைத் தத்துவம்.",
    significance: "2,500-year-old Sangam philosophy embodying universal brotherhood and radical hospitality.",
  },
  kaapi: {
    term: "Kaapi",
    tamil: "காபி",
    phonetic: "/kɑː-pi/",
    category: "Culinary",
    definitionEn: "Authentic South Indian filter coffee brewed with chicory and frothed back and forth in a brass dabarah.",
    definitionTa: "பித்தளை தவராவில் நுரை பொங்க ஆற்றிப் பருகப்படும் கும்பகோணம் டிகிரி ஃபில்டர் காபி.",
    significance: "The social elixir of morning conversations, debates, and warm hospitality.",
  },
};

interface CulturalGlossaryTermProps {
  termKey: keyof typeof CULTURAL_GLOSSARY;
  children?: React.ReactNode;
  className?: string;
  theme?: "light" | "dark";
  position?: "top" | "bottom";
}

/**
 * CulturalGlossaryTerm (Interactive Learning Cue)
 * Implements directive #5: Seamless Bilingual Integration.
 * When hovering over culturally specific terms, a sleek, glassmorphic card smoothly
 * fades in, providing the phonetic pronunciation, Tamil script, and poetic definition.
 */
export function CulturalGlossaryTerm({
  termKey,
  children,
  className = "",
  theme = "dark",
  position = "top",
}: CulturalGlossaryTermProps) {
  const data = CULTURAL_GLOSSARY[termKey];
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const { playWoodClick, playBell } = useAudio();

  // If term not found, render fallback
  if (!data) {
    return <span className={className}>{children}</span>;
  }

  const handleOpen = () => {
    playWoodClick();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handlePlayPronunciation = (e: React.MouseEvent) => {
    e.stopPropagation();
    playBell(587.33); // D5 chime
  };

  return (
    <span
      ref={containerRef}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={handleClose}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      className={`group/term relative inline-block cursor-help border-b border-dashed border-[#D4AF37]/80 hover:border-[#FFB84D] hover:text-[#FFB84D] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FFB84D] transition-colors ${className}`}
    >
      <span className="font-semibold">{children || data.term}</span>

      {/* Diegetic Amber Indicator Dot */}
      <span className="inline-block w-1 h-1 rounded-full bg-[#FFB84D] ml-0.5 align-top opacity-70 group-hover/term:opacity-100 group-hover/term:scale-125 transition-all" />

      {/* Floating Glassmorphic Cultural Discovery Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.span
            initial={{ opacity: 0, y: position === "top" ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === "top" ? 4 : -4, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute left-1/2 -translate-x-1/2 z-50 w-72 sm:w-80 pointer-events-auto text-left block ${
              position === "top" ? "bottom-full mb-2.5" : "top-full mt-2.5"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Pointer Caret when position is bottom */}
            {position === "bottom" && (
              <span className="block w-3 h-3 bg-[#1c1008] border-l border-t border-[#D4AF37]/50 rotate-45 mx-auto -mb-1.5 shadow-md relative z-10" />
            )}

            <span className="block p-4 rounded-xl bg-[#1c1008]/96 backdrop-blur-xl border border-[#D4AF37]/50 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_30px_rgba(255,184,77,0.2)] text-[#faf5ed] font-body relative overflow-hidden">
              {/* Subtle Kuthuvilakku Amber Glow Spill */}
              <span className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-[#FFB84D]/15 blur-2xl pointer-events-none" />

              {/* Header: Term, Tamil Script, & Category */}
              <span className="flex items-start justify-between gap-2 border-b border-[#D4AF37]/20 pb-2.5 mb-2.5">
                <span>
                  <span className="block text-base font-bold font-display text-white leading-tight">
                    {data.term}
                  </span>
                  <span className="block text-xs font-tamil font-semibold text-[#FFB84D] mt-0.5">
                    {data.tamil} · <span className="font-mono text-[11px] text-amber-200/80">{data.phonetic}</span>
                  </span>
                </span>

                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFD700] shrink-0">
                  {data.category}
                </span>
              </span>

              {/* Core Definition */}
              <span className="block text-xs text-slate-200 leading-relaxed mb-2 font-body">
                {data.definitionEn}
              </span>

              <span className="block text-[11px] text-amber-100/75 leading-relaxed font-tamil mb-2.5 border-t border-white/5 pt-1.5">
                {data.definitionTa}
              </span>

              {/* Cultural Significance Footer */}
              <span className="flex items-center gap-1.5 text-[10px] text-amber-300/90 font-mono border-t border-[#D4AF37]/20 pt-2">
                <Sparkles className="w-3 h-3 text-[#FFB84D] shrink-0" />
                <span className="line-clamp-2">{data.significance}</span>
              </span>
            </span>

            {/* Downward Pointer Caret with Filigree Tint */}
            {position === "top" && (
              <span className="block w-3 h-3 bg-[#1c1008] border-r border-b border-[#D4AF37]/50 rotate-45 mx-auto -mt-1.5 shadow-md relative z-10" />
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
