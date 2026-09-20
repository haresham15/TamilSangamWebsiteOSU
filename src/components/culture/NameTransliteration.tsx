"use client";

import React, { useState } from "react";
import { transliterateToTamil } from "@/lib/transliteration";
import { useAudio } from "@/context/AudioContext";
import { useLocale } from "@/context/LocaleContext";
import { Sparkles, Copy, Check } from "lucide-react";

export const NameTransliteration: React.FC = () => {
  const { playClick } = useAudio();
  const { locale } = useLocale();

  const [inputName, setInputName] = useState<string>("Haresh");
  const [copied, setCopied] = useState<boolean>(false);

  const tamilName = transliterateToTamil(inputName);

  const sampleNames = ["Haresh", "Ananya", "Siddharth", "Kavya", "Dinesh", "Priya", "Alex", "David", "Maya"];

  const handleCopy = () => {
    playClick();
    navigator.clipboard.writeText(tamilName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-[var(--border-strong)] text-left shadow-2xl">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-[var(--accent-tint)]" />
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {locale === "ta" ? "உங்கள் பெயர் தமிழில்" : "Your Name in Tamil"}
        </h3>
      </div>
      <p className="text-xs sm:text-sm text-slate-300 mb-6">
        {locale === "ta"
          ? "உங்கள் பெயரை ஆங்கிலத்தில் தட்டச்சு செய்யுங்கள்; உடனடியாக அழகான தமிழ் எழுத்துக்களில் பெறுங்கள்."
          : "Type any English name or word to convert it into authentic Tamil script via phonetic transliteration."}
      </p>

      {/* Input Box */}
      <div className="mb-6">
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
          Enter Name in English
        </label>
        <input
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="e.g. Ananya, Chris, Maya..."
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white text-base outline-none focus:border-[var(--accent-tint)] transition-all font-sans"
        />

        {/* Quick Samples */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span className="text-[10px] font-mono text-slate-400 mr-1">Try:</span>
          {sampleNames.map((name) => (
            <button
              key={name}
              onClick={() => {
                playClick();
                setInputName(name);
              }}
              className="px-2.5 py-1 rounded-full text-[11px] font-mono glass-panel border border-white/10 text-slate-300 hover:text-white hover:border-[var(--accent-tint)] transition-all"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Resulting Poster Card */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-br from-[#151a2d] via-[#090b14] to-[#120e24] border border-white/20 text-center shadow-xl mb-6 overflow-hidden">
        {/* Sangam Classical Motif Border */}
        <div className="absolute inset-2 border border-[var(--accent-tint)]/30 rounded-2xl pointer-events-none" />

        <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--accent-tint)] mb-2">
          OSU Tamil Sangam Script Archive
        </p>

        <h4 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-wide my-4 drop-shadow-[0_0_20px_rgba(242,183,5,0.4)]">
          {tamilName || "—"}
        </h4>

        <p className="text-xs font-mono text-slate-400 tracking-wider">
          Phonetic Form: <span className="text-white">{inputName}</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleCopy}
          disabled={!tamilName}
          className="px-4 py-2 rounded-xl glass-panel border border-white/10 text-slate-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied!" : "Copy Tamil Text"}</span>
        </button>
      </div>
    </div>
  );
};
