"use client";

import React, { useState } from "react";
import { THIRUKKURALS } from "@/data/thirukkural";
import { useAudio } from "@/context/AudioContext";
import { useLocale } from "@/context/LocaleContext";
import { RefreshCw, Copy, Check, BookOpen } from "lucide-react";

export const KuralViewer: React.FC = () => {
  const { playBell, playClick } = useAudio();
  const { locale } = useLocale();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const kural = THIRUKKURALS[currentIndex];

  const handleNextKural = () => {
    playBell(600);
    setCurrentIndex((prev) => (prev + 1) % THIRUKKURALS.length);
  };

  const handleCopy = () => {
    playClick();
    const textToCopy = `${kural.line1}\n${kural.line2}\n\n${kural.translationEn}\n— Thirukkural (${kural.number})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl glass-panel-elevated p-6 sm:p-10 border border-[var(--border-strong)] text-left shadow-2xl relative overflow-hidden">
      {/* Decorative Classical Palm-leaf Watermark */}
      <div className="absolute top-4 right-6 text-7xl font-serif text-white/5 select-none pointer-events-none">
        குறள்
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-[var(--accent-tint)]" />
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {locale === "ta" ? "தினசரி திருக்குறள்" : "Kural of the Day"}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Kural #{kural.number} · {kural.chapterEn} ({kural.chapterTa})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl glass-panel border border-white/10 text-slate-300 hover:text-white transition-all"
            title="Copy Kural"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleNextKural}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-all border border-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Another Kural</span>
          </button>
        </div>
      </div>

      {/* Couplet Typography in Tamil Script */}
      <div className="my-8 text-center sm:text-left space-y-3">
        <p className="text-xl sm:text-2xl font-serif font-bold text-white leading-relaxed tracking-wide">
          {kural.line1}
        </p>
        <p className="text-xl sm:text-2xl font-serif font-bold text-white leading-relaxed tracking-wide">
          {kural.line2}
        </p>
      </div>

      {/* Transliteration */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 text-xs font-mono text-[var(--accent-tint)] space-y-1">
        <p>{kural.transliteration1}</p>
        <p>{kural.transliteration2}</p>
      </div>

      {/* English Translation & Cultural Explanation */}
      <div className="space-y-4 text-xs sm:text-sm text-slate-300">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            English Translation
          </span>
          <p className="italic font-serif leading-relaxed text-slate-200">
            &ldquo;{kural.translationEn}&rdquo;
          </p>
        </div>

        <div className="pt-4 border-t border-white/10">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            {locale === "ta" ? "விளக்கம்" : "Philosophical Context"}
          </span>
          <p className="text-xs text-slate-400 leading-relaxed">
            {locale === "ta" ? kural.explanationTa : kural.explanationEn}
          </p>
        </div>
      </div>
    </div>
  );
};
