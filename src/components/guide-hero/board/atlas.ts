"use client";

import * as THREE from "three";

/**
 * 50-Glyph Drum Set & String Order (PRD §4.1)
 * Index 0 is space. A flip advances the index by 1 (mod 50).
 */
export const GLYPHS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?!'-&/:+()$";
export const N = GLYPHS.length; // 50

const GLYPH_MAP = new Map<string, number>();
for (let i = 0; i < N; i++) {
  GLYPH_MAP.set(GLYPHS[i], i);
}

/**
 * Maps a single character to its glyph index (0..49).
 * Unmatched characters fall back to space (0).
 */
export function charToGlyph(char: string): number {
  if (!char) return 0;
  const upper = char.toUpperCase();
  return GLYPH_MAP.get(upper) ?? 0;
}

/**
 * Off-Screen Texture Atlas Generator (PRD §4.2)
 * Generates an 8x8 grid (64 cells, first 50 populated) of 128px cells (1024x1024).
 * Monospace glyphs sit centered on the split line with cap-height ≈ 0.62 of the cell.
 */
export let cachedAtlasCanvas: HTMLCanvasElement | null = null;

export async function makeAtlas(family?: string, cell = 128, grid = 8): Promise<THREE.CanvasTexture> {
  const size = cell * grid; // 1024px
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  cachedAtlasCanvas = canvas;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Resolve font family (CSS variables cannot be passed directly into Canvas 2D ctx.font)
  let resolvedFamily = family;
  if (!resolvedFamily && typeof document !== "undefined") {
    const computedVar = getComputedStyle(document.documentElement).getPropertyValue("--font-azeret-mono").trim();
    if (computedVar) {
      resolvedFamily = `${computedVar}, 'Azeret Mono', monospace`;
    }
  }
  if (!resolvedFamily) {
    resolvedFamily = "'Azeret Mono', 'JetBrains Mono', monospace";
  }

  // Await web font if available
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.load(`bold ${cell * 0.7}px ${resolvedFamily}`);
    } catch {
      // Graceful fallback to system monospace
    }
  }

  // Black background (coverage mask: white text on black)
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Calibrate font size so cap height ≈ 0.62 of the cell
  let fontSize = cell * 0.7;
  ctx.font = `bold ${fontSize}px ${resolvedFamily}`;
  let capH = ctx.measureText("H").actualBoundingBoxAscent || fontSize * 0.7;
  fontSize *= (cell * 0.62) / Math.max(1, capH);
  ctx.font = `bold ${fontSize}px ${resolvedFamily}`;
  capH = ctx.measureText("H").actualBoundingBoxAscent || fontSize * 0.7;

  // Render 50 glyphs in 8x8 grid
  for (let i = 0; i < N; i++) {
    const col = i % grid;
    const row = Math.floor(i / grid);
    const centerX = col * cell + cell / 2;
    // Exactly center cap-height on the cell's midline so cut passes through the middle
    const centerY = row * cell + cell / 2 + capH / 2;
    ctx.fillText(GLYPHS[i], centerX, centerY);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace; // Data coverage mask (PRD §4.2)
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
}
