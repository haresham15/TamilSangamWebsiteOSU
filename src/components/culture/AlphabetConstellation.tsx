"use client";

import React, { useState } from "react";
import { VOWELS, CONSONANTS, SPECIAL_LETTER, getCombinedChar } from "@/data/alphabet";
import { useAudio } from "@/context/AudioContext";
import { useLocale } from "@/context/LocaleContext";
import { Volume2 } from "lucide-react";

export const AlphabetConstellation: React.FC = () => {
  const { playBell, playWoodClick } = useAudio();
  const { locale } = useLocale();

  const [selectedVowelIdx, setSelectedVowelIdx] = useState<number>(0);
  const [selectedConsonantIdx, setSelectedConsonantIdx] = useState<number>(0);

  const activeVowel = VOWELS[selectedVowelIdx];
  const activeConsonant = CONSONANTS[selectedConsonantIdx];
  const combinedChar = getCombinedChar(selectedConsonantIdx, selectedVowelIdx);

  const handleSelectVowel = (idx: number) => {
    playWoodClick();
    setSelectedVowelIdx(idx);
  };

  const handleSelectConsonant = (idx: number) => {
    playWoodClick();
    setSelectedConsonantIdx(idx);
  };

  const handleHearSound = () => {
    // Play bell with harmonic corresponding to vowel frequency
    playBell(500 + selectedVowelIdx * 50);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-[var(--border-strong)] text-left shadow-2xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {locale === "ta" ? "தமிழ் நெடுங்கணக்கு அரங்கம்" : "Tamil Alphabet Constellation"}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-500 text-white font-semibold">
              247 Glyphs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {locale === "ta"
              ? "12 உயிர் + 18 மெய் + 1 ஆய்தம் + 216 உயிர்மெய் = 247 எழுத்துக்களின் மாயாஜால சேர்க்கை."
              : "Explore the ancient Tamil syllabary: 12 vowels, 18 consonants, 1 aaytham, and 216 combined forms."}
          </p>
        </div>

        {/* Special Aaytham Feature */}
        <div className="px-3 py-1.5 rounded-xl glass-panel border border-white/10 flex items-center gap-2">
          <span className="text-lg font-serif text-[var(--accent-tint)] font-bold">{SPECIAL_LETTER.char}</span>
          <span className="text-xs text-slate-300 font-mono">{SPECIAL_LETTER.name}</span>
        </div>
      </div>

      {/* Main Interactive Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
        {/* Combined Letter Hero Banner */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-white/5 to-black/60 border border-white/10 text-center flex flex-col items-center justify-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--accent-tint)] mb-3">
            Combined Form (உயிர்மெய்)
          </span>

          <div className="w-36 h-36 rounded-2xl glass-panel border border-white/20 flex items-center justify-center mb-4 shadow-xl">
            <span className="text-7xl font-bold text-white font-serif drop-shadow-[0_0_20px_rgba(242,183,5,0.4)]">
              {combinedChar}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-mono text-slate-400">
              {activeConsonant.char} + {activeVowel.char} =
            </span>
            <span className="text-sm font-mono font-bold text-[var(--accent-tint)]">
              {activeConsonant.transliteration} + {activeVowel.transliteration}
            </span>
          </div>

          <button
            onClick={handleHearSound}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-all border border-white/10"
          >
            <Volume2 className="w-3.5 h-3.5 text-[var(--accent-tint)]" />
            <span>Hear Phonetic Tone</span>
          </button>
        </div>

        {/* Breakdown & Vocabulary Details */}
        <div className="lg:col-span-7 space-y-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-mono text-slate-400">Consonant Category:</span>
              <span className="font-semibold text-white">{activeConsonant.categoryEn}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-mono text-slate-400">Vowel Type:</span>
              <span className="font-semibold text-white">{activeVowel.type.toUpperCase()} Vowel</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-400">International Phonetic Alphabet (IPA):</span>
              <span className="font-mono text-[var(--accent-tint)]">{activeConsonant.ipa} {activeVowel.ipa}</span>
            </div>
          </div>

          {/* Example Words */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Example Consonant Word</p>
              <p className="text-sm font-bold text-white font-serif">{activeConsonant.exampleWord}</p>
            </div>
            <span className="text-xs text-slate-300 italic">{activeConsonant.exampleMeaning}</span>
          </div>
        </div>
      </div>

      {/* Row 1: 12 Vowels (Uyir) */}
      <div className="mb-6">
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
          12 Vowels (உயிர் எழுத்துக்கள்)
        </label>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
          {VOWELS.map((v, i) => (
            <button
              key={v.char}
              onClick={() => handleSelectVowel(i)}
              className={`p-2 rounded-xl text-center border transition-all ${
                selectedVowelIdx === i
                  ? "bg-[var(--accent-tint)] text-black font-bold border-transparent shadow-md"
                  : "glass-panel text-white border-white/10 hover:border-white/25"
              }`}
            >
              <span className="block text-base font-serif">{v.char}</span>
              <span className="block text-[9px] font-mono opacity-70">{v.transliteration}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: 18 Consonants (Mei) */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
          18 Consonants (மெய் எழுத்துக்கள்)
        </label>
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
          {CONSONANTS.map((c, i) => (
            <button
              key={c.char}
              onClick={() => handleSelectConsonant(i)}
              className={`p-2 rounded-xl text-center border transition-all ${
                selectedConsonantIdx === i
                  ? "bg-purple-600 text-white font-bold border-transparent shadow-md"
                  : "glass-panel text-white border-white/10 hover:border-white/25"
              }`}
            >
              <span className="block text-base font-serif">{c.char}</span>
              <span className="block text-[9px] font-mono opacity-70">{c.transliteration}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
