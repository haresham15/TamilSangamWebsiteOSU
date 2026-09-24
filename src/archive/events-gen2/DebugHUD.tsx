"use client";

import React, { useSyncExternalStore } from "react";
import { debugStore, DebugState } from "./debugState";
import { Bug, Play, CheckCircle2, XCircle } from "lucide-react";

const subscribeLocation = () => () => {};
const getIsDebugSnapshot = () => {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debug") === "1";
};

export function DebugHUD() {
  const isDebug = useSyncExternalStore(
    subscribeLocation,
    getIsDebugSnapshot,
    () => false
  );

  const state: DebugState = useSyncExternalStore(
    (cb) => debugStore.subscribe(cb),
    () => debugStore.getState(),
    () => debugStore.getState()
  );

  if (!isDebug) return null;

  const textureKeys: (keyof typeof state.textures)[] = [
    "silhouette-hero",
    "crowd-near",
    "crowd-mid",
    "crowd-far",
  ];

  return (
    <aside
      aria-label="Scene Diagnostics"
      className="fixed top-20 right-4 z-50 w-72 bg-[#0C0704]/95 border-2 border-[#B8460E] p-3 text-xs font-mono text-[#FFD37A] shadow-[0_0_20px_rgba(184,70,14,0.4)] backdrop-blur-md select-none pointer-events-auto"
    >
      <header className="flex items-center justify-between pb-2 mb-2 border-b border-[#B8460E]/50">
        <div className="flex items-center gap-1.5 font-bold tracking-wide text-[#FF9A3C]">
          <Bug className="w-3.5 h-3.5" />
          <span>SCENE DEBUG HUD</span>
        </div>
        <span className="text-[10px] bg-[#B8460E]/30 px-1.5 py-0.5 rounded text-[#FFD37A]">
          ?debug=1
        </span>
      </header>

      <section aria-label="Scroll Progress" className="space-y-1.5 mb-3">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-zinc-400">Scroll Progress:</span>
          <span className="font-bold text-[#FFD37A] bg-black/40 px-1.5 py-0.5 rounded border border-[#B8460E]/30">
            {(state.progress * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-[#B8460E]/30">
          <div
            className="h-full bg-gradient-to-r from-[#B8460E] to-[#FFD37A] transition-all duration-75"
            style={{ width: `${Math.min(100, Math.max(0, state.progress * 100))}%` }}
          />
        </div>
      </section>

      <section aria-label="Texture Load States" className="mb-3">
        <h2 className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
          Textures
        </h2>
        <div className="space-y-1 bg-black/40 p-1.5 rounded border border-[#B8460E]/20 text-[11px]">
          {textureKeys.map((k) => {
            const loaded = state.textures[k];
            return (
              <div key={k} className="flex justify-between items-center">
                <span className="text-zinc-300 truncate max-w-[130px]">{k}</span>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    loaded
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-700/50"
                      : "bg-rose-950 text-rose-400 border border-rose-700/50"
                  }`}
                >
                  {loaded ? (
                    <CheckCircle2 className="w-2.5 h-2.5 inline" />
                  ) : (
                    <XCircle className="w-2.5 h-2.5 inline" />
                  )}
                  {loaded ? "TRUE" : "FALSE"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-label="Scene Diagnostics" className="space-y-1 mb-3 text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Crowd Instances:</span>
          <span className="font-bold text-[#FFD37A]">{state.crowdInstances}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Finale Fired:</span>
          <span
            className={`font-bold ${
              state.finaleFired ? "text-emerald-400" : "text-zinc-500"
            }`}
          >
            {state.finaleFired ? "TRUE" : "FALSE"}
          </span>
        </div>
      </section>

      <button
        type="button"
        onClick={() => debugStore.triggerFinale()}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#B8460E] hover:bg-[#FF9A3C] text-black font-bold text-[11px] rounded transition-colors cursor-pointer active:scale-95"
      >
        <Play className="w-3 h-3 fill-black" />
        <span>Test Finale Sequence</span>
      </button>
    </aside>
  );
}
