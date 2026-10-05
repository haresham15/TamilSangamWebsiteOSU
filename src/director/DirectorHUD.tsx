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
import { Eye, Layers, X, Terminal, Sliders, Activity } from "lucide-react";

export function DirectorHUD() {
  const tier = useTier();
  const {
    open,
    gradeOn,
    wire,
    scanlineActive,
    announcement,
    toggleGrade,
    toggleWire,
    close,
  } = useDirectorStore();

  const [intensity, setIntensity] = useState(0.75);
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
    const cleanup = initDirectorKeys();
    return cleanup;
  }, []);

  // Update telemetry metrics periodically when HUD is open
  useEffect(() => {
    if (!open) return;

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
      if (open) requestAnimationFrame(frameCounter);
    };
    const reqId = requestAnimationFrame(frameCounter);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(reqId);
    };
  }, [open]);

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
          <div className="flex flex-col gap-2 pt-1">
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
          </div>

          {/* §8 ?debug Telemetry Panel */}
          {showTelemetry && (
            <div className="mt-2 pt-2 border-t border-[#00ff41]/20 flex flex-col gap-2 text-[10px] text-neutral-300 bg-black/40 p-2.5 rounded border border-[#00ff41]/10">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="font-semibold text-[#00ff41] flex items-center gap-1">
                  <Sliders className="w-3 h-3" /> Telemetry (?debug)
                </span>
                <span>{fps} FPS</span>
              </div>

              {/* Intensity Slider */}
              <div className="flex items-center justify-between gap-2">
                <span>LUT Intensity:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  className="w-24 accent-[#00ff41]"
                />
                <span className="w-8 text-right font-bold text-[#00ff41]">
                  {(intensity * 100).toFixed(0)}%
                </span>
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
 * Hidden on Tier C (Lite) per Section 7 summary table.
 */
export function DirectorFooterButton() {
  const tier = useTier();
  const toggleOpen = useDirectorStore((s) => s.toggleOpen);

  if (tier === "C") return null;

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
