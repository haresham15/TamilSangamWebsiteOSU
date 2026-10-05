/**
 * scripts/cube-to-strip.mjs
 * Converts a 33^3 (or N^3) .cube file into an (N*N)xN PNG strip for web delivery.
 * 
 * Usage:
 *   node scripts/cube-to-strip.mjs <input.cube> [output.png]
 */

import fs from "node:fs";
import path from "node:path";
import { createPng } from "./make-identity-lut.mjs";

const inputPath = process.argv[2] || path.resolve(process.cwd(), "public/luts/identity-33.cube");
const outputPath = process.argv[3] || path.resolve(process.cwd(), "public/luts/heritage-33.png");

if (!fs.existsSync(inputPath)) {
  console.error(`Input file does not exist: ${inputPath}`);
  process.exit(1);
}

const content = fs.readFileSync(inputPath, "utf-8");
const sizeMatch = content.match(/LUT_3D_SIZE\s+(\d+)/);
if (!sizeMatch) {
  console.error("Missing LUT_3D_SIZE in .cube file");
  process.exit(1);
}

const size = parseInt(sizeMatch[1], 10);
const lines = content.split(/\r?\n/);
const dataLines = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("TITLE") || trimmed.startsWith("LUT_") || trimmed.startsWith("DOMAIN_")) {
    continue;
  }
  const parts = trimmed.split(/\s+/).map(Number);
  if (parts.length >= 3 && !isNaN(parts[0])) {
    dataLines.push(parts);
  }
}

if (dataLines.length !== size * size * size) {
  console.error(`Expected ${size * size * size} data points, found ${dataLines.length}`);
  process.exit(1);
}

const width = size * size;
const height = size;
const raw = Buffer.alloc(width * height * 4);

// Standard .cube has r cycling fastest, then g, then b:
// index in cube = r + g * size + b * size * size
for (let b = 0; b < size; b++) {
  for (let g = 0; g < size; g++) {
    for (let r = 0; r < size; r++) {
      const cubeIdx = r + g * size + b * size * size;
      const [rVal, gVal, bVal] = dataLines[cubeIdx];

      // In 2D strip: x = r + b * size, y = g
      const stripX = r + b * size;
      const stripY = g;
      const rawIdx = (stripY * width + stripX) * 4;

      raw[rawIdx + 0] = Math.round(Math.min(1, Math.max(0, rVal)) * 255);
      raw[rawIdx + 1] = Math.round(Math.min(1, Math.max(0, gVal)) * 255);
      raw[rawIdx + 2] = Math.round(Math.min(1, Math.max(0, bVal)) * 255);
      raw[rawIdx + 3] = 255;
    }
  }
}

const png = createPng(width, height, raw);
fs.writeFileSync(outputPath, png);
console.log(`[cube-to-strip] Converted ${inputPath} -> ${outputPath} (${(png.length / 1024).toFixed(1)} KB)`);
