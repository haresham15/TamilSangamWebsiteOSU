"use client";

import React, { useState, useEffect } from "react";
import { heroState, setHeroProgress, triggerHeroPluck, triggerHeroAllPlucks } from "../state";

/**
 * Debug HUD (§9)
 * Visible when URL has ?debug=1 or enabled via dev controls.
 * Shows progress, camera S position, fret landmarks, string energies, and interactive pluck controls.
 */
export function DebugHUD() {
  const [active] = useState(() => {
    if (typeof window !== "undefined") {
      const isDebug =
        new URLSearchParams(window.location.search).get("debug") === "1";
      heroState.debugActive = isDebug;
      return isDebug;
    }
    return false;
  });
  const [progress, setProgress] = useState(0);
  const [cameraS, setCameraS] = useState(0);
  const [currentFret, setCurrentFret] = useState(0);
  const [currentEra, setCurrentEra] = useState<1 | 2 | 3>(1);
  const [rawVel, setRawVel] = useState(0);
  const [energies, setEnergies] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setProgress(heroState.progress);
      setCameraS(heroState.cameraS);
      setCurrentFret(heroState.currentFret);
      setCurrentEra(heroState.currentEra);
      setRawVel(heroState.rawVelocity);
      setEnergies([...heroState.stringEnergies]);
    }, 40);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        triggerHeroAllPlucks();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active]);

  if (!active) {
    return null;
  }

  // Landmark note
  let landmarkNote = "";
  if (progress >= 0.325 && progress <= 0.345) {
    landmarkNote = "✦ FRET 5 LANDMARK: ERA 2 BOUNDARY (0.334)";
  } else if (progress >= 0.655 && progress <= 0.675) {
    landmarkNote = "✦ FRET 12 OCTAVE: ERA 3 BOUNDARY (0.667)";
  } else if (progress >= 0.98) {
    landmarkNote = "✦ FRET 24: JOURNEY FINALE (1.000)";
  }

  const drivePct = Math.round((1.0 - Math.exp(-Math.abs(rawVel) / 2500.0)) * 100);
  const stringNames = ["E2", "A2", "D3", "G3", "B3", "e4"];

  return (
    <aside
      aria-label="Fretboard Highway Developer Telemetry"
      className="fixed top-24 right-4 z-50 bg-[#0F0814]/90 border border-[#FFB84D]/50 text-[#F5E6C8] font-mono text-xs p-4 rounded-none shadow-[4px_4px_0px_#4c2472] w-84 space-y-3 pointer-events-auto backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-[#FFB84D]/30 pb-1.5 text-[11px] font-bold text-[#FFB84D]">
        <span>FRETBOARD HIGHWAY · TELEMETRY</span>
        <span className="px-1.5 py-0.5 bg-[#4c2472] text-[#55CCA2] text-[10px]">
          ERA {currentEra}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
        <div className="text-stone-400">Progress:</div>
        <div className="text-right text-[#55CCA2] font-semibold">
          {(progress * 100).toFixed(1)}% ({progress.toFixed(3)})
        </div>

        <div className="text-stone-400">Camera Axis (s):</div>
        <div className="text-right">{cameraS.toFixed(2)} su</div>

        <div className="text-stone-400">Current Fret:</div>
        <div className="text-right font-bold text-[#FFB84D]">
          {currentFret > 0 ? `Fret ${currentFret}` : "Nut (s = 0)"}
        </div>

        <div className="text-stone-400">Scroll Velocity:</div>
        <div className="text-right text-stone-200">
          {Math.round(rawVel)} px/s (Drive: {drivePct}%)
        </div>
      </div>

      {/* String Energy Meters (§3.3, §3.4) */}
      <div className="space-y-1 pt-1.5 border-t border-[#FFB84D]/20">
        <div className="flex justify-between text-[10px] text-stone-400 font-bold">
          <span>6-STRING KINETIC ENERGY</span>
          <span className="text-[#00FF66]">CPU/GPU SYNCD</span>
        </div>
        <div className="grid grid-cols-6 gap-1 pt-0.5">
          {stringNames.map((name, i) => {
            const e = energies[i] || 0;
            return (
              <div key={name} className="flex flex-col items-center">
                <div className="w-full h-10 bg-stone-900 border border-stone-700 relative overflow-hidden flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-[#B87333] to-[#55CCA2] transition-all duration-75"
                    style={{ height: `${Math.min(100, Math.round(e * 100))}%` }}
                  />
                </div>
                <button
                  onClick={() => triggerHeroPluck(i, 0.85)}
                  title={`Pluck ${name}`}
                  className="mt-1 text-[9px] font-mono text-stone-400 hover:text-[#55CCA2] hover:bg-stone-800 w-full text-center py-0.5"
                >
                  {name}
                </button>
              </div>
            );
          })}
        </div>
        <div className="pt-1">
          <button
            onClick={() => triggerHeroAllPlucks()}
            className="w-full py-1 bg-[#4c2472]/60 hover:bg-[#4c2472] border border-[#55CCA2]/60 text-[#55CCA2] text-[10px] font-bold tracking-wider uppercase transition-colors"
          >
            ♫ Strum All Strings (Press &apos;P&apos;)
          </button>
        </div>
      </div>

      {landmarkNote && (
        <div className="text-[10px] text-[#55CCA2] bg-[#162a22] border border-[#55CCA2]/40 px-2 py-1 font-bold animate-pulse">
          {landmarkNote}
        </div>
      )}

      {/* Interactive Telemetry Scrubber Slider */}
      <div className="space-y-1 pt-1 border-t border-[#FFB84D]/20">
        <div className="flex justify-between text-[10px] text-stone-400">
          <label htmlFor="debug-progress-slider">Scrub Position</label>
          <span>p = {progress.toFixed(3)}</span>
        </div>
        <input
          id="debug-progress-slider"
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setHeroProgress(val);
          }}
          className="w-full h-1.5 bg-stone-800 rounded-none appearance-none cursor-pointer accent-[#FFB84D]"
        />
        <div className="flex justify-between text-[9px] text-stone-500 font-mono">
          <button
            onClick={() => setHeroProgress(0)}
            className="hover:text-[#FFB84D]"
          >
            0% (Nut)
          </button>
          <button
            onClick={() => setHeroProgress(0.334)}
            className="hover:text-[#FFB84D]"
          >
            33% (Fret 5)
          </button>
          <button
            onClick={() => setHeroProgress(0.667)}
            className="hover:text-[#FFB84D]"
          >
            67% (Fret 12)
          </button>
          <button
            onClick={() => setHeroProgress(1.0)}
            className="hover:text-[#FFB84D]"
          >
            100% (Fret 24)
          </button>
        </div>
      </div>
    </aside>
  );
}
