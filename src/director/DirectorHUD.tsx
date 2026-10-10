// src/director/DirectorHUD.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useDirectorStore } from "./directorStore";
import { initDirectorKeys } from "./keys";
import { useTier } from "@/components/providers/TierProvider";
import { audio } from "@/audio/AudioController";
import { heroState } from "@/components/gallery-hero/state";
import { getCameraSpeed } from "@/components/gallery-hero/neck/fretMath";
import { defaultRamp } from "@/gallery/ramp";
import { getRenderer } from "@/engine/renderer";
import { heroScrollProgress } from "@/engine/heroScrollStore";
import { Eye, Layers, X, Terminal, Sliders, Activity, Compass } from "lucide-react";

/**
 * Checks whether Director Viewport should be active.
 * - Always available in dev (`process.env.NODE_ENV !== 'production'`)
 * - In production: hidden completely unless explicitly enabled via URL param (?director=1 or ?debug=1) or localStorage
 */
export function isDirectorEnabled(): boolean {
  if (typeof window === "undefined") {
    return process.env.NODE_ENV !== "production";
  }
  if (process.env.NODE_ENV !== "production") return true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("director") || params.has("debug")) return true;
    if (localStorage.getItem("sangam_director") === "true") return true;
  } catch {}
  return false;
}

export function DirectorHUD() {
  const tier = useTier();
  const [enabled, setEnabled] = useState(false);

  const {
    open,
    gradeOn,
    wire,
    lutIntensity,
    scanlineActive,
    announcement,
    heroScrubActive,
    heroScrubProgress,
    heroDotsVisible,
    heroSpeed,
    toggleGrade,
    toggleWire,
    setLutIntensity,
    toggleHeroScrub,
    setHeroScrubProgress,
    toggleHeroDots,
    setHeroSpeed,
    close,
  } = useDirectorStore();

  useEffect(() => {
    setEnabled(isDirectorEnabled());
  }, []);

  const [showTelemetry, setShowTelemetry] = useState(() => {
    return typeof window !== "undefined" && window.location.search.includes("debug");
  });
  const [fps, setFps] = useState(60);
  const [drawCalls, setDrawCalls] = useState(0);
  const [triangles, setTriangles] = useState(0);
  const [audioMetrics, setAudioMetrics] = useState({
    state: "uninstantiated",
    activeVoices: 0,
    baseLatency: 0,
  });

  useEffect(() => {
    if (!enabled) return;
    const cleanup = initDirectorKeys();
    return cleanup;
  }, [enabled]);

  // Update telemetry metrics periodically when HUD is open
  useEffect(() => {
    if (!open || !enabled) return;

    let frames = 0;
    let lastTime = performance.now();

    const interval = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTime;
      setFps(Math.round((frames * 1000) / (delta || 1)));
      frames = 0;
      lastTime = now;

      const gl = getRenderer();
      if (gl) {
        setDrawCalls(gl.info.render.calls);
        setTriangles(gl.info.render.triangles);
      }

      const a = audio.getMetrics();
      setAudioMetrics({
        state: a.state,
        activeVoices: a.activeVoices,
        baseLatency: Math.round(a.baseLatency * 1000 * 10) / 10,
      });
    }, 300);

    const frameCounter = () => {
      frames++;
      if (open && enabled) requestAnimationFrame(frameCounter);
    };
    const reqId = requestAnimationFrame(frameCounter);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(reqId);
    };
  }, [open, enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* 1. Polite Live Region for WCAG Announcements (§6.1) */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* 2. 250ms DOM Scanline Mask over Canvas (§6.3) */}
      {scanlineActive && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-200"
          style={{
            background:
              "repeating-linear-gradient(0deg, rgba(0, 255, 65, 0.15) 0px, rgba(0, 255, 65, 0.15) 2px, transparent 2px, transparent 4px), radial-gradient(circle, transparent 40%, rgba(0, 255, 65, 0.25) 100%)",
            animation: "pulse 0.25s ease-out forwards",
          }}
        />
      )}

      {/* 3. The Monospace Director HUD Window */}
      {open && (
        <aside
          aria-label="Director Diagnostic Viewport"
          className="fixed bottom-6 right-6 z-[9998] p-4 bg-[#0a0f0d]/95 border border-[#00ff41]/50 rounded-lg shadow-[0_0_30px_rgba(0,255,65,0.2)] backdrop-blur-md font-mono text-xs text-[#00ff41] flex flex-col gap-3 min-w-[300px] animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#00ff41]/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-ping" />
              <Terminal className="w-4 h-4 text-[#00ff41]" />
              <span className="font-bold tracking-wider text-[11px] text-white">
                DIRECTOR VIEWPORT
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#00ff41]/20 text-[#00ff41] border border-[#00ff41]/30">
                TIER {tier}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowTelemetry((v) => !v)}
                title="Toggle Telemetry (?debug)"
                className={`p-1 rounded text-[#00ff41]/70 hover:text-white transition-colors ${showTelemetry ? "bg-[#00ff41]/30" : "hover:bg-[#00ff41]/20"}`}
              >
                <Activity className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={close}
                aria-label="Close Director Viewport (Escape)"
                className="p-1 hover:bg-[#00ff41]/20 rounded text-[#00ff41]/70 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-col gap-2.5 pt-1">
            {/* Color Grade Toggle (C) - No-op on Tier B (§7) */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Color Pass:</span>
              {tier === "B" ? (
                <span className="text-[10px] text-neutral-500 italic">No-op on Tier B</span>
              ) : (
                <button
                  type="button"
                  onClick={toggleGrade}
                  aria-pressed={gradeOn}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all border ${
                    gradeOn
                      ? "bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                      : "bg-neutral-800/80 border-neutral-600 text-neutral-300"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>{gradeOn ? "GRADED" : "RAW"}</span>
                  <kbd className="ml-1 px-1 py-0.2 bg-black/60 rounded text-[9px] text-[#00ff41]/80 border border-[#00ff41]/30">
                    C
                  </kbd>
                </button>
              )}
            </div>

            {/* LUT Intensity Slider (Directly accessible when GRADED) */}
            {tier !== "B" && gradeOn && (
              <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded bg-black/50 border border-[#00ff41]/20">
                <span className="text-[10px] text-neutral-300 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-[#00ff41]" />
                  LUT Mix:
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  aria-label="LUT Color Grade Intensity"
                  value={lutIntensity}
                  onChange={(e) => setLutIntensity(parseFloat(e.target.value))}
                  className="w-24 accent-[#00ff41] cursor-pointer"
                />
                <span className="w-8 text-right font-bold text-[10px] text-[#00ff41]">
                  {(lutIntensity * 100).toFixed(0)}%
                </span>
              </div>
            )}

            {/* Wireframe Toggle (W) */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Mesh Mode:</span>
              <button
                type="button"
                onClick={toggleWire}
                aria-pressed={wire}
                className={`px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all border ${
                  wire
                    ? "bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                    : "bg-neutral-800/80 border-neutral-600 text-neutral-300"
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>{wire ? "WIRE" : "SOLID"}</span>
                <kbd className="ml-1 px-1 py-0.2 bg-black/60 rounded text-[9px] text-[#00ff41]/80 border border-[#00ff41]/30">
                  W
                </kbd>
              </button>
            </div>

            {/* HERO KOLAM KINEMATICS & TUNING (§MASTER DIRECTIVE) */}
            <div className="pt-2 border-t border-[#00ff41]/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-[#00ff41] font-bold flex items-center gap-1">
                  <Compass className="w-3 h-3 text-[#00ff41]" /> Hero Kolam
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    (heroScrubActive ? heroScrubProgress : heroScrollProgress.current) < 0.16
                      ? "bg-amber-500/20 text-[#FFB84D] border border-[#FFB84D]/40"
                      : (heroScrubActive ? heroScrubProgress : heroScrollProgress.current) <= 0.50
                      ? "bg-emerald-500/20 text-[#55CCA2] border border-[#55CCA2]/40"
                      : "bg-purple-500/20 text-[#A78BFA] border border-[#A78BFA]/40"
                  }`}
                >
                  {(heroScrubActive ? heroScrubProgress : heroScrollProgress.current) < 0.16
                    ? "ACT I: SIKKU"
                    : (heroScrubActive ? heroScrubProgress : heroScrollProgress.current) <= 0.50
                    ? "ACT II: WREATH"
                    : "ACT III: MONOLITH"}
                </span>
              </div>

              {/* Scrub Override */}
              <div className="flex flex-col gap-1.5 p-2 rounded bg-black/50 border border-[#00ff41]/20">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-neutral-300">Kinematic Scrub:</span>
                  <button
                    type="button"
                    onClick={toggleHeroScrub}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                      heroScrubActive
                        ? "bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41]"
                        : "bg-neutral-800 border-neutral-700 text-neutral-400"
                    }`}
                  >
                    {heroScrubActive ? "LOCKED" : "LIVE SCROLL"}
                  </button>
                </div>

                {heroScrubActive && (
                  <div className="flex flex-col gap-1 pt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#00ff41] font-mono">
                        p = {heroScrubProgress.toFixed(3)}
                      </span>
                      <span className="text-neutral-400">
                        {Math.round(heroScrubProgress * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.005"
                      aria-label="Hero Scroll Progress Scrub"
                      value={heroScrubProgress}
                      onChange={(e) => setHeroScrubProgress(parseFloat(e.target.value))}
                      className="w-full accent-[#00ff41] cursor-pointer"
                    />

                    {/* Quick Jump Buttons */}
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setHeroScrubProgress(0.0)}
                        className="px-1 py-0.5 text-[8px] bg-neutral-800 hover:bg-[#00ff41]/20 border border-neutral-700 hover:border-[#00ff41]/50 text-neutral-300 rounded text-center transition-colors"
                      >
                        0.0 Act I
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroScrubProgress(0.20)}
                        className="px-1 py-0.5 text-[8px] bg-neutral-800 hover:bg-[#00ff41]/20 border border-neutral-700 hover:border-[#00ff41]/50 text-neutral-300 rounded text-center transition-colors"
                      >
                        0.2 Sever
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroScrubProgress(0.40)}
                        className="px-1 py-0.5 text-[8px] bg-neutral-800 hover:bg-[#00ff41]/20 border border-neutral-700 hover:border-[#00ff41]/50 text-neutral-300 rounded text-center transition-colors"
                      >
                        0.4 Wreath
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroScrubProgress(0.70)}
                        className="px-1 py-0.5 text-[8px] bg-neutral-800 hover:bg-[#00ff41]/20 border border-neutral-700 hover:border-[#00ff41]/50 text-neutral-300 rounded text-center transition-colors"
                      >
                        0.7 Monolith
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pulli Dots & Pulse Speed */}
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-neutral-400">Pulli Dots:</span>
                <button
                  type="button"
                  onClick={toggleHeroDots}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                    heroDotsVisible
                      ? "bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41]"
                      : "bg-neutral-800 border-neutral-700 text-neutral-400"
                  }`}
                >
                  {heroDotsVisible ? "VISIBLE" : "HIDDEN"}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-black/40 border border-[#00ff41]/20 text-[10px]">
                <span className="text-neutral-300">Pulse Speed:</span>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  aria-label="Travelling Pulse Wave Speed"
                  value={heroSpeed}
                  onChange={(e) => setHeroSpeed(parseFloat(e.target.value))}
                  className="w-20 accent-[#00ff41] cursor-pointer"
                />
                <span className="w-7 text-right font-bold text-[9px] text-[#00ff41]">
                  {heroSpeed.toFixed(1)}x
                </span>
              </div>
            </div>
          </div>

          {/* §8 ?debug Telemetry Panel */}
          {showTelemetry && (
            <div className="mt-2 pt-2 border-t border-[#00ff41]/20 flex flex-col gap-2 text-[10px] text-neutral-300 bg-black/40 p-2.5 rounded border border-[#00ff41]/10">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="font-semibold text-[#00ff41] flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Telemetry (?debug)
                </span>
                <span>{fps} FPS</span>
              </div>

              {/* Kinematic Ramp Telemetry */}
              <div className="flex items-center justify-between text-neutral-400">
                <span>Ramp Solver Peak P:</span>
                <span className="text-[#00ff41] font-bold">{defaultRamp.P.toFixed(3)}x</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Current Velocity:</span>
                <span className="text-[#00ff41]">
                  {getCameraSpeed(heroState.progress).toFixed(3)}x
                </span>
              </div>

              {/* Audio Telemetry */}
              <div className="flex items-center justify-between text-neutral-400">
                <span>Web Audio:</span>
                <span className={audioMetrics.state === "running" ? "text-[#00ff41]" : "text-amber-400"}>
                  {audioMetrics.state} ({audioMetrics.activeVoices}/24 v, {audioMetrics.baseLatency}ms)
                </span>
              </div>

              {/* Three.js GPU Memory */}
              <div className="flex items-center justify-between text-neutral-400">
                <span>GPU Render:</span>
                <span>
                  {drawCalls} calls · {(triangles / 1000).toFixed(1)}k tris
                </span>
              </div>
            </div>
          )}

          {/* Footer hints */}
          <div className="pt-2 border-t border-[#00ff41]/20 flex items-center justify-between text-[10px] text-neutral-400">
            <span>Shift+D toggle</span>
            <kbd className="text-[9px] text-[#00ff41]/70">ESC to exit</kbd>
          </div>
        </aside>
      )}
    </>
  );
}

/**
 * Accessible Footer Button to deliberately open Director's Viewport (§6.1, §7)
 * Hidden completely in production for regular users.
 * Hidden on Tier C (Lite) per Section 7 summary table.
 */
export function DirectorFooterButton() {
  const [enabled, setEnabled] = useState(false);
  const tier = useTier();
  const toggleOpen = useDirectorStore((s) => s.toggleOpen);

  useEffect(() => {
    setEnabled(isDirectorEnabled());
  }, []);

  if (!enabled || tier === "C") return null;

  return (
    <button
      type="button"
      onClick={toggleOpen}
      aria-label="Open Director's Cut Diagnostics (Shift+D)"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 hover:bg-[#00ff41]/10 border border-[#00ff41]/30 hover:border-[#00ff41]/60 text-[11px] font-mono text-[#00ff41]/80 hover:text-[#00ff41] transition-all cursor-pointer"
    >
      <Terminal className="w-3 h-3 text-[#00ff41]" />
      <span>Director&apos;s Cut</span>
      <kbd className="hidden sm:inline-block px-1 py-0.2 bg-black/70 rounded text-[9px] border border-[#00ff41]/30 text-[#00ff41]/60">
        Shift+D
      </kbd>
    </button>
  );
}

export default DirectorHUD;
