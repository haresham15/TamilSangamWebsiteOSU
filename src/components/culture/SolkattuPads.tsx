"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAudio } from "@/context/AudioContext";
import { useLocale } from "@/context/LocaleContext";
import { Play, Pause, RotateCcw, Music } from "lucide-react";

interface SolkattuSyllable {
  key: string;
  syllableEn: string;
  syllableTa: string;
  instrument: string;
  color: string;
}

export const SolkattuPads: React.FC = () => {
  const { playSyllable, playClick } = useAudio();
  const { locale } = useLocale();

  const syllables: SolkattuSyllable[] = [
    { key: "ta", syllableEn: "Tha", syllableTa: "த", instrument: "Mridangam Rim", color: "#f2b705" },
    { key: "ka", syllableEn: "Ka", syllableTa: "க", instrument: "Wood Clack", color: "#d6452f" },
    { key: "di", syllableEn: "Dhi", syllableTa: "தி", instrument: "Mridangam Bass", color: "#0b7a75" },
    { key: "mi", syllableEn: "Mi", syllableTa: "மி", instrument: "Slap Accent", color: "#6b8e4e" },
    { key: "ki", syllableEn: "Ki", syllableTa: "கி", instrument: "Snare Snap", color: "#b5573a" },
    { key: "thom", syllableEn: "Thom", syllableTa: "தொம்", instrument: "Deep Parai Thump", color: "#8b5cf6" },
    { key: "nam", syllableEn: "Nam", syllableTa: "நம்", instrument: "Brass Temple Bell", color: "#eab308" },
  ];

  // 8-step sequencer state
  const stepCount = 8;
  const [bpm, setBpm] = useState<number>(110);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [sequence, setSequence] = useState<(string | null)[]>([
    "ta", "ka", "di", "mi", "ta", "ki", "ta", "thom"
  ]);

  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sequencer loop playback
  useEffect(() => {
    if (!isPlaying) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      return;
    }

    const intervalMs = (60 / bpm / 2) * 1000;

    stepTimerRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % stepCount;
        const note = sequence[next];
        if (note) {
          playSyllable(note);
        }
        return next;
      });
    }, intervalMs);

    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [isPlaying, bpm, sequence, playSyllable]);

  const handlePadTap = (key: string) => {
    playSyllable(key);
  };

  const handleToggleStep = (stepIndex: number, syllableKey: string) => {
    playClick();
    setSequence((prev) => {
      const copy = [...prev];
      copy[stepIndex] = copy[stepIndex] === syllableKey ? null : syllableKey;
      return copy;
    });
  };

  const handleClearSequence = () => {
    playClick();
    setSequence(Array(stepCount).fill(null));
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-[var(--border-strong)] text-left shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {locale === "ta" ? "சொற்கட்டு ஒலி அரங்கம்" : "Solkattu Rhythm Pads"}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#0b7a75] text-white font-semibold">
              Konnakol Synthesizer
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {locale === "ta"
              ? "த, க, தி, மி போன்ற பாரம்பரிய தாளக் குறியீடுகளை வாசித்து 8-படி தாள அடுக்குகளை உருவாக்குங்கள்."
              : "Perform rhythmic percussion syllables (Konnakol) with real-time audio synthesis and an 8-step beat sequencer."}
          </p>
        </div>

        {/* Play / Pause / Clear */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md ${
              isPlaying
                ? "bg-amber-400 text-black shadow-amber-400/20"
                : "bg-[var(--accent-tint)] text-black hover:opacity-90"
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? "Pause Loop" : "Play Loop"}</span>
          </button>
          <button
            onClick={handleClearSequence}
            className="p-2.5 rounded-xl glass-panel border border-white/10 text-slate-300 hover:text-white"
            title="Clear Sequence"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Syllable Drum Pads Grid */}
      <div className="mb-8">
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
          Interactive Pads (Tap to trigger sound)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {syllables.map((s) => (
            <button
              key={s.key}
              onClick={() => handlePadTap(s.key)}
              className="group p-4 rounded-2xl glass-panel border border-white/10 hover:border-white/30 active:scale-95 transition-all text-center flex flex-col items-center justify-center gap-1 shadow-md"
              style={{
                background: `linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.4))`,
              }}
            >
              <span className="text-2xl font-bold text-white font-serif group-hover:scale-110 transition-transform">
                {s.syllableTa}
              </span>
              <span className="text-xs font-semibold text-[var(--accent-tint)] font-mono">
                {s.syllableEn}
              </span>
              <span className="text-[9px] text-slate-400 leading-tight">
                {s.instrument}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 8-Step Sequencer Matrix */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-tint)] flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5" />
            <span>8-Step Rhythm Loop</span>
          </span>

          {/* BPM Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-300">{bpm} BPM</span>
            <input
              type="range"
              min="60"
              max="180"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-24 accent-[var(--accent-tint)] cursor-pointer"
            />
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: stepCount }).map((_, stepIdx) => {
            const activeNote = sequence[stepIdx];
            const isCurrent = isPlaying && currentStep === stepIdx;

            return (
              <div
                key={stepIdx}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center min-h-[64px] transition-all cursor-pointer ${
                  isCurrent
                    ? "border-[var(--accent-tint)] bg-white/20 shadow-lg scale-105"
                    : activeNote
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/5 bg-white/5 text-slate-500 hover:border-white/15"
                }`}
                onClick={() => {
                  // Cycle note on click
                  const nextIndex = activeNote
                    ? (syllables.findIndex((s) => s.key === activeNote) + 1) % syllables.length
                    : 0;
                  handleToggleStep(stepIdx, syllables[nextIndex].key);
                }}
              >
                <span className="text-[10px] font-mono opacity-50 mb-1">
                  0{stepIdx + 1}
                </span>
                <span className="text-sm font-bold font-serif text-[var(--accent-tint)]">
                  {activeNote ? syllables.find((s) => s.key === activeNote)?.syllableTa : "-"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
