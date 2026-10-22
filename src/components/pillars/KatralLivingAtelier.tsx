// src/components/pillars/KatralLivingAtelier.tsx
"use client";

import React, { useState } from "react";
import { SpotlightCard } from "@/components/ui/react-bits";
import { soundEngine } from "@/lib/soundEngine";
import { Volume2, BookOpen, PenTool, Sparkles, ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";

interface PhraseCard {
  id: string;
  tamil: string;
  transliteration: string;
  literal: string;
  context: string;
  tag: string;
  audioText: string;
}

const PHRASES: PhraseCard[] = [
  {
    id: "vanakkam",
    tamil: "வணக்கம் நண்பா",
    transliteration: "Vanakkam Nanba",
    literal: "Greetings / Respects, Friend",
    context: "The universal warm opening. Use it when walking into an OSU Tamil Sangam dinner or meeting a new face on the South Oval.",
    tag: "Everyday Welcome",
    audioText: "வணக்கம் நண்பா",
  },
  {
    id: "saaptingala",
    tamil: "சாப்பிட்டீங்களா?",
    transliteration: "Saaptingala?",
    literal: "Have you eaten?",
    context: "In Tamil culture, asking if someone has eaten is the deepest shorthand for 'I care about your wellbeing.' Expected at every banquet.",
    tag: "Hearth Care",
    audioText: "சாப்பிட்டீங்களா",
  },
  {
    id: "eppadi",
    tamil: "எப்படி இருக்கீங்க?",
    transliteration: "Eppadi Irukkeenga?",
    literal: "How are you doing?",
    context: "Respectful, friendly inquiry for friends, visiting alumni, and faculty. A graceful conversational bridge.",
    tag: "Social Connection",
    audioText: "எப்படி இருக்கீங்க",
  },
  {
    id: "nandri",
    tamil: "மிக்க நன்றி",
    transliteration: "Mikka Nandri",
    literal: "Heartfelt Thanks / Deep Gratitude",
    context: "Used to thank student volunteers, event organizers, culinary chefs, and performers after an evening gathering.",
    tag: "Gratitude",
    audioText: "மிக்க நன்றி",
  },
  {
    id: "yaadhum",
    tamil: "யாதும் ஊரே யாவரும் கேளிர்",
    transliteration: "Yaadhum Oore Yaavarum Kelir",
    literal: "To us all towns are our homeland, and all people our kin.",
    context: "Written by Kaniyan Pungundranar in Purananuru 192 (circa 6th century BCE). The timeless universalist bedrock of our organization.",
    tag: "Sangam Ethos",
    audioText: "யாதும் ஊரே யாவரும் கேளிர்",
  },
  {
    id: "virundhombal",
    tamil: "விருந்தோம்பல்",
    transliteration: "Virundhombal",
    literal: "The sacred art of hosting and hospitality",
    context: "Refers to the ancient tenet that a guest is never a stranger, but an honored presence to be fed, sheltered, and cherished.",
    tag: "Diaspora Tradition",
    audioText: "விருந்தோம்பல்",
  },
];

interface WorkshopTrack {
  id: string;
  titleTa: string;
  titleEn: string;
  focus: string;
  timeframe: string;
  icon: typeof BookOpen;
  description: string;
  prompt: string;
}

const WORKSHOP_TRACKS: WorkshopTrack[] = [
  {
    id: "survival-tamil",
    titleTa: "எளிய பேச்சுத் தமிழ் வட்டம்",
    titleEn: "Conversational 'Survival Tamil' Labs",
    focus: "Spoken Icebreakers · Pronunciation · Casual Chat",
    timeframe: "20-Minute Pre-Banquet Circles",
    icon: MessageCircle,
    description:
      "A completely judgment-free space designed for both non-Tamil speakers and diaspora students who understand Tamil at home but feel hesitant to speak.",
    prompt: "I'd love to facilitate a casual 20-minute conversational Tamil icebreaker circle before our next campus dinner...",
  },
  {
    id: "calligraphy",
    titleTa: "உயிர்-மெய் எழுத்தோவியம்",
    titleEn: "Tamil Calligraphy & Typography Studios",
    focus: "Script Art · 247 Letters · Commemorative Cards",
    timeframe: "Mid-Semester Art Evenings",
    icon: PenTool,
    description:
      "Explore the rounded, fluid geometry of the Tamil script with brush pens, parchment, and custom digital lettering. Learn to ink your name in Tamil.",
    prompt: "I want to propose an artistic Tamil calligraphy and script-lettering studio night with brush pens and parchment...",
  },
  {
    id: "cinema-poetry",
    titleTa: "திரைப் பாடல் & இலக்கிய நயம்",
    titleEn: "Cinema Lyric & Classical Poetry Salons",
    focus: "Kannadasan to AR Rahman · Metaphor Analysis",
    timeframe: "Library Discussion Rooms",
    icon: Sparkles,
    description:
      "Unpack the poetry, double entendres, and philosophical depth behind legendary film songs and classical Sangam verses over hot tea.",
    prompt: "Let's organize a 45-minute lyric and poetry salon breaking down iconic Tamil cinematic songs and their Sangam roots...",
  },
];

export function KatralLivingAtelier() {
  const [activePhraseId, setActivePhraseId] = useState<string>("vanakkam");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePronounce = (phrase: PhraseCard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActivePhraseId(phrase.id);
    setPlayingId(phrase.id);

    // Audio chime feedback (Katral raga frequency)
    soundEngine.playPillarHover(4);

    // Web Speech API synthesis attempt
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(phrase.audioText);
        utterance.lang = "ta-IN";
        utterance.rate = 0.85;
        const voices = window.speechSynthesis.getVoices();
        const tamilVoice = voices.find((v) => v.lang.startsWith("ta"));
        if (tamilVoice) utterance.voice = tamilVoice;
        utterance.onend = () => setPlayingId(null);
        utterance.onerror = () => setPlayingId(null);
        window.speechSynthesis.speak(utterance);
      } catch {
        setTimeout(() => setPlayingId(null), 1000);
      }
    } else {
      setTimeout(() => setPlayingId(null), 1000);
    }
  };

  return (
    <div className="w-full space-y-12">
      {/* Atelier Eyebrow & Intro */}
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#B5A642]">
          <span className="w-2 h-2 rounded-full bg-[#B5A642] animate-pulse" />
          <span>The Living Atelier · கற்றல் அரங்கம்</span>
        </div>
        <h3 className="font-serif text-3xl sm:text-4xl text-[#161210] font-normal leading-tight">
          Conversational Tamil & Heritage Deck
        </h3>
        <p className="font-sans text-sm sm:text-base text-[#57524C] leading-relaxed">
          Tap any card to hear pronunciation, discover its cultural resonance, and practice before your next Tamil Sangam event. Zero experience required.
        </p>
      </div>

      {/* 6-Card Interactive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PHRASES.map((phrase) => {
          const isSelected = activePhraseId === phrase.id;
          const isAudioPlaying = playingId === phrase.id;

          return (
            <SpotlightCard
              key={phrase.id}
              className={`p-6 sm:p-7 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                isSelected
                  ? "bg-[#161210] text-[#FAF6F0] border-[#B5A642]/60 shadow-xl"
                  : "bg-[#FAF6F0] text-[#161210] border-[#EADCC9] hover:border-[#B5A642]/40 hover:bg-[#F2EAE0]"
              }`}
              spotlightColor={isSelected ? "rgba(181, 166, 66, 0.25)" : "rgba(200, 90, 50, 0.12)"}
              onClick={() => handlePronounce(phrase)}
            >
              <div className="space-y-4">
                {/* Header Tag & Audio Button */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isSelected
                        ? "bg-[#B5A642]/20 text-[#D4AF37] border-[#B5A642]/40"
                        : "bg-[#161210]/5 text-[#57524C] border-[#161210]/10"
                    }`}
                  >
                    {phrase.tag}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handlePronounce(phrase, e)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isSelected
                        ? "bg-[#FAF6F0]/10 hover:bg-[#FAF6F0]/20 text-[#FAF6F0]"
                        : "bg-[#161210]/5 hover:bg-[#161210]/10 text-[#161210]"
                    } ${isAudioPlaying ? "scale-110 ring-2 ring-[#B5A642]" : ""}`}
                    aria-label={`Listen to ${phrase.transliteration} pronunciation`}
                    title="Listen to audio pronunciation"
                  >
                    <Volume2 className={`w-4 h-4 ${isAudioPlaying ? "animate-pulse text-[#D4AF37]" : ""}`} />
                  </button>
                </div>

                {/* Tamil Script Title (No positive tracking) */}
                <div className="space-y-1">
                  <p
                    lang="ta"
                    className={`font-serif text-2xl sm:text-3xl font-semibold leading-relaxed tracking-normal ${
                      isSelected ? "text-[#FAF6F0]" : "text-[#161210]"
                    }`}
                    style={{ letterSpacing: 0 }}
                  >
                    {phrase.tamil}
                  </p>
                  <p
                    className={`font-mono text-sm tracking-wide ${
                      isSelected ? "text-[#D4AF37]" : "text-[#C85A32]"
                    }`}
                  >
                    {phrase.transliteration}
                  </p>
                </div>

                {/* Literal Meaning */}
                <div
                  className={`text-xs font-mono py-1 px-2.5 rounded border inline-block ${
                    isSelected
                      ? "bg-[#FAF6F0]/5 text-[#FAF6F0]/80 border-[#FAF6F0]/10"
                      : "bg-[#161210]/5 text-[#57524C] border-[#161210]/10"
                  }`}
                >
                  &ldquo;{phrase.literal}&rdquo;
                </div>

                {/* Cultural Context */}
                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isSelected ? "text-[#FAF6F0]/70" : "text-[#57524C]"
                  }`}
                >
                  {phrase.context}
                </p>
              </div>

              {/* Bottom Hint */}
              <div className="pt-4 border-t border-current/10 mt-4 flex items-center justify-between text-[11px] font-mono">
                <span className={isSelected ? "text-[#FAF6F0]/60" : "text-[#57524C]"}>
                  {isSelected ? "Active in memory" : "Tap to pronounce"}
                </span>
                <span className={isSelected ? "text-[#D4AF37]" : "text-[#C85A32]"}>
                  {isAudioPlaying ? "Voicing..." : "Audio Ready ↗"}
                </span>
              </div>
            </SpotlightCard>
          );
        })}
      </div>

      {/* 3-Track Future Workshop Roadmap */}
      <div className="mt-14 pt-10 border-t border-[#EADCC9] space-y-6">
        <div className="space-y-2">
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-[#B5A642]">
            Future Campus Workshops · எதிர்கால பட்டறைகள்
          </div>
          <h4 className="font-serif text-2xl sm:text-3xl text-[#161210] font-normal">
            Three Workshop Tracks We Are Launching in 2026–2027
          </h4>
          <p className="font-sans text-sm text-[#57524C] max-w-2xl">
            These initiatives are designed to be led by students. If you have an idea for a session, you can submit it directly to the board.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WORKSHOP_TRACKS.map((track) => {
            const Icon = track.icon;
            return (
              <div
                key={track.id}
                className="bg-[#FAF6F0] p-6 rounded-2xl border border-[#EADCC9] space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#B5A642]/10 border border-[#B5A642]/30 flex items-center justify-center text-[#B5A642]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-[#B5A642] uppercase tracking-wider block">
                      {track.timeframe}
                    </span>
                    <h5 className="font-serif text-lg text-[#161210] font-medium leading-snug">
                      {track.titleEn}
                    </h5>
                    <p
                      lang="ta"
                      className="text-xs text-[#57524C] font-serif leading-relaxed"
                      style={{ letterSpacing: 0 }}
                    >
                      {track.titleTa}
                    </p>
                  </div>
                  <p className="text-xs text-[#57524C] leading-relaxed">
                    {track.description}
                  </p>
                </div>

                <Link
                  href={`/ideas?category=NEW+INITIATIVE&pillar=katral&prompt=${encodeURIComponent(
                    track.prompt
                  )}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#C85A32] hover:text-[#161210] transition-colors pt-3 border-t border-[#EADCC9]"
                >
                  <span>Propose this workshop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
