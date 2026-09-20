"use client";

import React, { useState, useEffect } from "react";
import { useLiteMode } from "@/context/LiteModeContext";
import { Film, Check } from "lucide-react";

export type LutFilterPreset = "none" | "harvest-gold" | "warm-sunset" | "midnight-blue" | "vintage-kollywood";

interface CinematicGradeProps {
  currentLut?: LutFilterPreset;
  onLutChange?: (lut: LutFilterPreset) => void;
}

const PRESETS: { id: LutFilterPreset; nameEn: string; nameTa: string; filterStyle: string }[] = [
  { id: "none", nameEn: "Pure (Ungraded)", nameTa: "இயற்கை நிலை", filterStyle: "none" },
  { id: "harvest-gold", nameEn: "Golden Harvest (Pongal)", nameTa: "பொன் அறுவடை", filterStyle: "sepia(0.2) saturate(1.25) contrast(1.08) hue-rotate(-5deg)" },
  { id: "warm-sunset", nameEn: "Warm Sunset (Neithal)", nameTa: "செவ்வானம்", filterStyle: "saturate(1.3) contrast(1.1) brightness(0.96) hue-rotate(-12deg)" },
  { id: "midnight-blue", nameEn: "Midnight Indigo (Kurinji)", nameTa: "யாமத்து நீலம்", filterStyle: "saturate(1.1) contrast(1.15) brightness(0.92) hue-rotate(15deg)" },
  { id: "vintage-kollywood", nameEn: "Vintage Kollywood 35mm", nameTa: "35மிமீ திரையரங்கு", filterStyle: "contrast(1.2) saturate(1.3) sepia(0.15) brightness(0.95)" },
];

export const CinematicGrade: React.FC<CinematicGradeProps> = ({ currentLut = "none", onLutChange }) => {
  const { isLiteMode } = useLiteMode();
  const [activeLut, setActiveLut] = useState<LutFilterPreset>(currentLut);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isLiteMode) return;
    const chosen = PRESETS.find((p) => p.id === activeLut);
    if (chosen && chosen.filterStyle !== "none") {
      document.body.style.filter = chosen.filterStyle;
    } else {
      document.body.style.filter = "none";
    }
    return () => {
      document.body.style.filter = "none";
    };
  }, [activeLut, isLiteMode]);

  if (isLiteMode) return null;

  const handleSelect = (lut: LutFilterPreset) => {
    setActiveLut(lut);
    if (onLutChange) onLutChange(lut);
    setIsOpen(false);
  };

  return (
    <>
      {/* Subtle Noise / Film Grain Texture */}
      <div className="film-grain fixed inset-0 pointer-events-none z-30 opacity-40 mix-blend-overlay" />

      {/* Floating LUT Grade Switcher Pill */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full glass-panel-elevated border border-[var(--border-strong)] text-xs text-white hover:text-[var(--accent-tint)] transition-all shadow-xl"
            title="Cinematic Color Grading (LUTs)"
          >
            <Film className="w-3.5 h-3.5 text-[var(--accent-tint)]" />
            <span className="hidden sm:inline font-medium">Film Grade</span>
            <span className="text-[10px] text-[var(--accent-tint)] font-mono uppercase tracking-wider">
              {activeLut === "none" ? "Pure" : activeLut.split("-")[0]}
            </span>
          </button>

          {isOpen && (
            <div className="absolute bottom-12 right-0 w-60 rounded-2xl glass-panel-elevated p-2 shadow-2xl border border-white/20 z-50 text-left">
              <p className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] px-3 py-1 border-b border-white/10 mb-1">
                Cinematic Color Look (LUTs)
              </p>
              <div className="space-y-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelect(preset.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-all ${
                      activeLut === preset.id
                        ? "bg-white/15 text-white font-medium shadow-inner"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div>
                      <span className="block font-medium">{preset.nameEn}</span>
                      <span className="block text-[10px] text-slate-400">{preset.nameTa}</span>
                    </div>
                    {activeLut === preset.id && <Check className="w-3.5 h-3.5 text-[var(--accent-tint)]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
