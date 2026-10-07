"use client";

import React, { useState, useEffect, useRef } from "react";
import { cachedAtlasCanvas } from "./atlas";

/**
 * AtlasDebugOverlay (PRD §4.2, Phase 2 Gate requirement)
 * Displays the active 8x8 off-screen texture atlas (1024x1024) with red split lines
 * across all cells, confirming cap-height alignment across the split line.
 */
export function AtlasDebugOverlay() {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open || !canvasRef.current || !cachedAtlasCanvas) return;
    const dest = canvasRef.current;
    const ctx = dest.getContext("2d");
    if (!ctx) return;

    dest.width = 512;
    dest.height = 512;
    // Copy atlas to display canvas
    ctx.drawImage(cachedAtlasCanvas, 0, 0, 512, 512);

    // Overlay grid boundaries and horizontal split line (midline) in bright red
    const cell = 512 / 8; // 64px per cell
    ctx.lineWidth = 1;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        // Cell boundary
        ctx.strokeStyle = "rgba(70, 180, 255, 0.25)";
        ctx.strokeRect(c * cell, r * cell, cell, cell);

        // Cell Midline / Hinge Split
        ctx.strokeStyle = "rgba(255, 60, 60, 0.85)";
        ctx.beginPath();
        ctx.moveTo(c * cell, r * cell + cell / 2);
        ctx.lineTo((c + 1) * cell, r * cell + cell / 2);
        ctx.stroke();
      }
    }
  }, [open]);

  return (
    <div className="absolute top-20 right-4 z-30 pointer-events-auto">
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Hide Atlas Debug" : "Show Atlas Debug"}
        aria-expanded={open}
        className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider uppercase border border-[#55CCA2]/40 bg-[#0c0d10]/85 text-[#55CCA2] hover:bg-[#55CCA2]/20 hover:border-[#55CCA2] transition-all rounded shadow-md backdrop-blur"
      >
        {open ? "✕ HIDE ATLAS" : "⚙ ATLAS DEBUG"}
      </button>

      {open && (
        <div className="absolute top-8 right-0 p-3 bg-[#0a0a0c]/95 border border-[#333] shadow-2xl rounded-lg z-40 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[11px] font-mono text-[#eee] font-bold">
              1024×1024 ATLAS (8×8 GRID)
            </span>
            <span className="text-[10px] font-mono text-[#ff4d4d]">
              RED = SPLIT LINE
            </span>
          </div>
          <canvas
            ref={canvasRef}
            className="w-[320px] h-[320px] bg-black border border-[#222] rounded shadow-inner"
          />
          <p className="mt-2 text-[9px] font-mono text-[#888] max-w-[320px] leading-tight">
            50-glyph drum set. Cap-height centered on midline so cut passes cleanly through glyph waist.
          </p>
        </div>
      )}
    </div>
  );
}
export default AtlasDebugOverlay;
