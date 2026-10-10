/**
 * scripts/make-heritage-lut.mjs
 * Generates the authentic 33^3 Heritage Color Grade LUT strip (1089x33 PNG)
 * and corresponding reference .cube file for Tamil Sangam OSU.
 * 
 * Cinematic Dravidian Heritage Look:
 * 1. Warm golden highlights (Kanchipuram silk / brass deepam lantern glow).
 * 2. Royal temple velvet shadows (subtle Dravidian temple plum / indigo undertone).
 * 3. Rich filmic S-curve contrast curve in the midtones (Kodak Vision3 warmth).
 * 4. Saturation enrichment on jewel tones (temple gold, peacock emerald, sari scarlet).
 * 5. Clean white highlights and pure black floor preservation.
 */

import fs from "node:fs";
import path from "node:path";
import { createPng } from "./make-identity-lut.mjs";

function clamp(v, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Transforms an input (r, g, b) in [0, 1] into the Heritage Color Grade.
 */
export function applyHeritageGrade(r, g, b) {
  // 1. Calculate luminance (Rec.709)
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // 2. Filmic S-curve tone curve for rich cinematic contrast
  // Boost contrast around midtones while keeping smooth toe and shoulder
  const sCurve = (x) => {
    const s = smoothstep(0.0, 1.0, x);
    return x * 0.45 + s * 0.55;
  };

  let rGraded = sCurve(r);
  let gGraded = sCurve(g);
  let bGraded = sCurve(b);

  // 3. Warm Golden Highlight Tint (amber/gold radiance in upper-mids & highlights)
  // Glows especially on bright particles, reflections, and brass elements
  const highlightWeight = Math.pow(clamp(luma, 0, 1), 1.6);
  rGraded += 0.14 * highlightWeight;
  gGraded += 0.07 * highlightWeight;
  bGraded -= 0.08 * highlightWeight;

  // 4. Temple Velvet Shadows (Madurai plum / temple stone indigo tint in deep shadows)
  const shadowWeight = Math.pow(1.0 - clamp(luma, 0, 1), 2.2);
  rGraded += 0.05 * shadowWeight;
  gGraded -= 0.02 * shadowWeight;
  bGraded += 0.07 * shadowWeight;

  // 5. Jewel-Tone Saturation Boost
  // Enrich warm golds, reds, and peacock greens while preserving neutrals
  const gradedLuma = 0.2126 * rGraded + 0.7152 * gGraded + 0.0722 * bGraded;
  const satFactor = 1.25; // 25% saturation boost for vibrant festival silk
  rGraded = gradedLuma + (rGraded - gradedLuma) * satFactor;
  gGraded = gradedLuma + (gGraded - gradedLuma) * satFactor;
  bGraded = gradedLuma + (bGraded - gradedLuma) * satFactor;

  // 6. Anchor pure black and pure white
  const blackFade = smoothstep(0.0, 0.08, luma);
  rGraded = rGraded * blackFade + (r * 0.3) * (1 - blackFade);
  gGraded = gGraded * blackFade + (g * 0.3) * (1 - blackFade);
  bGraded = bGraded * blackFade + (b * 0.3) * (1 - blackFade);

  return [clamp(rGraded), clamp(gGraded), clamp(bGraded)];
}

export function generateHeritageLUT(size = 33) {
  const width = size * size;
  const height = size;
  const raw = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const zSlice = Math.floor(x / size);
      const xLocal = x % size;

      const rIn = xLocal / (size - 1);
      const gIn = y / (size - 1);
      const bIn = zSlice / (size - 1);

      const [rOut, gOut, bOut] = applyHeritageGrade(rIn, gIn, bIn);

      const idx = (y * width + x) * 4;
      raw[idx + 0] = Math.round(rOut * 255);
      raw[idx + 1] = Math.round(gOut * 255);
      raw[idx + 2] = Math.round(bOut * 255);
      raw[idx + 3] = 255;
    }
  }

  return { width, height, raw, png: createPng(width, height, raw) };
}

export function generateHeritageCube(size = 33) {
  let lines = [
    `# Tamil Sangam OSU - Heritage 3D LUT (Cinematic Dravidian Silk Look)`,
    `TITLE "Heritage_33"`,
    `LUT_3D_SIZE ${size}`,
    `DOMAIN_MIN 0.0 0.0 0.0`,
    `DOMAIN_MAX 1.0 1.0 1.0`,
    ``,
  ];

  // Standard .cube data order: r fastest, then g, then b
  for (let b = 0; b < size; b++) {
    const bIn = b / (size - 1);
    for (let g = 0; g < size; g++) {
      const gIn = g / (size - 1);
      for (let r = 0; r < size; r++) {
        const rIn = r / (size - 1);
        const [rOut, gOut, bOut] = applyHeritageGrade(rIn, gIn, bIn);
        lines.push(`${rOut.toFixed(6)} ${gOut.toFixed(6)} ${bOut.toFixed(6)}`);
      }
    }
  }

  return lines.join("\n");
}

// Generate files in public/luts
const outDir = path.resolve(process.cwd(), "public/luts");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const { png } = generateHeritageLUT(33);
const pngPath = path.join(outDir, "heritage-33.png");
fs.writeFileSync(pngPath, png);
console.log(`[make-heritage-lut] Written ${pngPath} (${(png.length / 1024).toFixed(1)} KB)`);

const cube = generateHeritageCube(33);
const cubePath = path.join(outDir, "heritage-33.cube");
fs.writeFileSync(cubePath, cube);
console.log(`[make-heritage-lut] Written ${cubePath} (${(Buffer.byteLength(cube) / 1024).toFixed(1)} KB)`);
