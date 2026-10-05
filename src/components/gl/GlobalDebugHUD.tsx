"use client";

import React, { useState, useEffect } from "react";
import { governor, GovernorLevel } from "@/engine/governor";
import { getRenderer } from "@/engine/renderer";
import { useTier } from "@/components/providers/TierProvider";
import { getActivePlanes, getTextureMemoryUsage } from "@/components/gl/planes/registry";
import { scroll } from "@/engine/masterTick";

export function GlobalDebugHUD() {
  const tier = useTier();
  const [visible, setVisible] = useState(false);
  const [fps, setFps] = useState(60);
  const [govLevel, setGovLevel] = useState<GovernorLevel>(0);
  const [asks, setAsks] = useState<Record<string, GovernorLevel>>({});
  const [planesCount, setPlanesCount] = useState(0);
  const [texMemMb, setTexMemMb] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [scrollVel, setScrollVel] = useState(0);
  const [glInfo, setGlInfo] = useState<{
    calls: number;
    triangles: number;
    geometries: number;
    textures: number;
  }>({
    calls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
  });

  // Read debug param after mount to avoid SSR mismatch
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("debug") === "1" || p.get("debug") === "true" || p.has("debug")) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;

    let frameCount = 0;
    let lastFpsTime = performance.now();

    const interval = setInterval(() => {
      // Calculate FPS
      const now = performance.now();
      frameCount++;
      if (now - lastFpsTime >= 500) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsTime)));
        frameCount = 0;
        lastFpsTime = now;
      }

      // Governor metrics
      setGovLevel(governor.level());
      setAsks({ ...governor.getAsks() });

      // Planes metrics
      const activePlanes = getActivePlanes();
      setPlanesCount(activePlanes.length);
      setTexMemMb(Number((getTextureMemoryUsage() / (1024 * 1024)).toFixed(2)));

      // Scroll metrics
      setScrollY(Math.round(scroll.y));
      setScrollVel(Math.round(scroll.velocity));

      // Three.js renderer metrics
      const gl = getRenderer();
      if (gl) {
        setGlInfo({
          calls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
          geometries: gl.info.memory.geometries,
          textures: gl.info.memory.textures,
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  const govLevelColor =
    govLevel === 2
      ? "text-emerald-400 bg-emerald-950/60 border-emerald-500/40"
      : govLevel === 1
      ? "text-amber-400 bg-amber-950/60 border-amber-500/40"
      : "text-rose-400 bg-rose-950/60 border-rose-500/40";

  return (
    <aside
      aria-label="One Canvas One Clock Global Telemetry HUD"
      className="fixed bottom-4 left-4 z-[9999] bg-stone-950/90 border border-stone-700/80 text-stone-200 font-mono text-[11px] p-3 rounded-md shadow-2xl backdrop-blur-md w-72 pointer-events-auto select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-1.5 mb-2">
        <span className="font-bold text-[#FFB84D] tracking-wide text-xs">
          ONE CANVAS · CLOCK HUD
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-semibold">
          TIER {tier}
        </span>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="bg-stone-900/80 p-1.5 rounded border border-stone-800">
          <div className="text-[10px] text-stone-400">FRAME RATE</div>
          <div className="text-base font-bold text-emerald-400">{fps} <span className="text-[10px] text-stone-400">FPS</span></div>
        </div>

        <div className={`p-1.5 rounded border ${govLevelColor}`}>
          <div className="text-[10px] opacity-80">GOVERNOR</div>
          <div className="text-base font-bold">
            LVL {govLevel} <span className="text-[10px] opacity-80">({govLevel === 2 ? "60hz" : govLevel === 1 ? "30hz" : "IDLE"})</span>
          </div>
        </div>
      </div>

      {/* WebGL Metrics */}
      <div className="border-t border-stone-800/80 pt-1.5 space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="text-stone-400">Draw Calls:</span>
          <span className="text-[#FFB84D] font-medium">{glInfo.calls}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Triangles:</span>
          <span className="text-stone-300 font-medium">{glInfo.triangles.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">GPU Textures / Geo:</span>
          <span className="text-stone-300">{glInfo.textures} / {glInfo.geometries}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">DOM Planes / Mem:</span>
          <span className="text-cyan-400">{planesCount} / {texMemMb} MB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Scroll Y / Vel:</span>
          <span className="text-stone-300">{scrollY}px / {scrollVel}px/s</span>
        </div>
      </div>

      {/* Active Governor Asks */}
      <div className="border-t border-stone-800/80 pt-1.5 mt-2">
        <div className="text-[10px] text-stone-400 mb-1 flex justify-between">
          <span>ACTIVE REQUESTS:</span>
          <span>{Object.keys(asks).length}</span>
        </div>
        {Object.keys(asks).length === 0 ? (
          <div className="text-[10px] text-stone-500 italic">No active requests (GPU idling)</div>
        ) : (
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
            {Object.entries(asks).map(([key, lvl]) => (
              <span
                key={key}
                className="text-[9px] px-1 py-0.5 rounded bg-stone-900 border border-stone-700/60 text-stone-300"
              >
                {key}: <b className={lvl === 2 ? "text-emerald-400" : "text-amber-400"}>L{lvl}</b>
              </span>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
