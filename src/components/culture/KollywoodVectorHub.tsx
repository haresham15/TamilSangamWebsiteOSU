"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/context/AudioContext";
import { Sparkles, Clapperboard, Music, Disc3, Film, ArrowRight, Quote } from "lucide-react";
import { KollywoodFilmEmbedding } from "@/app/api/cultural-engine/route";

const DEFAULT_VIBES = [
  "High-energy campus dance & Pongal mass",
  "Suburban train acoustic romance",
  "Snowy mountain yearning & patriotism",
  "Fierce pastoral grit & resistance",
  "Mythic Chola desert expedition",
];

export const KollywoodVectorHub: React.FC = () => {
  const { playWoodClick, playBell } = useAudio();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KollywoodFilmEmbedding[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const handleSearch = async (targetQuery?: string) => {
    const q = (targetQuery !== undefined ? targetQuery : query).trim();
    if (!q) return;

    setLoading(true);
    playWoodClick();

    try {
      const res = await fetch("/api/cultural-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        playBell(440);
      }
    } catch (err) {
      console.error("Vector search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-3xl glass-panel-elevated p-6 sm:p-10 border border-[var(--border-strong)] text-left shadow-2xl relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[var(--color-temple-bronze)]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="max-w-2xl mb-8 relative z-10">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] mb-2">
          <Clapperboard className="w-4 h-4" />
          <span>Sangam Cultural Engine · Vector Embedding Search</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white font-display tracking-tight mb-2">
          Kollywood Counterpart Engine
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Input an emotion, mood, or collegiate vibe. Our vector engine maps your query into high-dimensional Tamil cinema archetypes, iconic scenes, and Rahman / Ilaiyaraaja soundtracks.
        </p>
      </div>

      {/* Input & Action Bar */}
      <div className="relative z-10 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Film className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter an emotion (e.g., 'autumn nostalgia', 'celebratory hostel dance', 'ancestral justice')..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-[var(--accent-tint)] font-body"
            />
          </div>
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-[var(--accent-tint)] text-black font-bold text-xs hover:opacity-95 transition-opacity shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Match Kollywood Vibe</span>
          </button>
        </div>

        {/* Quick Suggested Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-[11px] font-mono text-slate-400">Quick Seeds:</span>
          {DEFAULT_VIBES.map((vibe, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(vibe);
                handleSearch(vibe);
              }}
              className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            >
              {vibe}
            </button>
          ))}
        </div>
      </div>

      {/* Stateful Vector Results Display */}
      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10"
          >
            {results.map((film) => {
              const isSelected = activeCardId === film.id;
              return (
                <motion.div
                  key={film.id}
                  layout
                  onClick={() => {
                    playWoodClick();
                    setActiveCardId(isSelected ? null : film.id);
                  }}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "border-[var(--accent-tint)] bg-white/10 shadow-2xl"
                      : "border-white/10 bg-[var(--surface-raised)] hover:border-white/20"
                  }`}
                  style={{
                    boxShadow: isSelected ? "0 20px 40px -12px oklch(0.68 0.16 85 / 0.25)" : undefined,
                  }}
                >
                  {/* Card Top Pill Lockup */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[var(--accent-tint)] text-black">
                          {Math.round(film.matchScore * 100)}% Similarity
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {film.year} · {film.tinaiLandscape.toUpperCase()}
                        </span>
                      </div>
                      <Disc3 className="w-4 h-4 text-[var(--accent-tint)] animate-spin" style={{ animationDuration: "10s" }} />
                    </div>

                    <h3 className="text-2xl font-bold text-white font-display tracking-tight flex items-baseline gap-2">
                      <span>{film.titleEn}</span>
                      <span className="text-sm font-tamil text-[var(--accent-tint)]">{film.titleTa}</span>
                    </h3>

                    <p className="text-xs font-mono text-slate-400 mb-3">
                      Directed by {film.director} · Music by {film.composer}
                    </p>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {film.emotionalVibe}
                    </p>

                    {/* Dialogue Quote Lockup */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-4 flex items-start gap-2.5">
                      <Quote className="w-4 h-4 text-[var(--accent-tint)] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white font-tamil">{film.quoteTa}</p>
                        <p className="text-[11px] text-slate-300 italic mt-0.5">&ldquo;{film.quoteEn}&rdquo;</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Iconic Scene & Key Track */}
                  <div className="pt-3 border-t border-white/10 space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Music className="w-3.5 h-3.5 text-[var(--accent-tint)] shrink-0" />
                      <span className="truncate">{film.keyTrack}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="truncate">{film.iconicSceneEn}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-tint)] shrink-0 ml-2" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
