import fs from "fs";
import path from "path";
import sharp from "sharp";

function renderCurvedTextTop(text, cx, cy, radius, startAngleDeg, endAngleDeg, options = {}) {
  const chars = [...text];
  const totalAngle = endAngleDeg - startAngleDeg;
  const step = totalAngle / (chars.length - 1);
  return chars.map((char, i) => {
    const angle = startAngleDeg + i * step;
    return `<text x="0" y="0" transform="translate(${cx}, ${cy}) rotate(${angle.toFixed(2)}) translate(0, ${(-radius).toFixed(2)})" font-family="'Marcellus', 'Georgia', serif" font-size="${options.fontSize || 19}" font-weight="bold" fill="${options.fill || '#FFFDF9'}" text-anchor="middle" dominant-baseline="central">${char}</text>`;
  }).join("\n    ");
}

function renderCurvedTextBottom(text, cx, cy, radius, startAngleDeg, endAngleDeg, options = {}) {
  const chars = [...text];
  const totalAngle = endAngleDeg - startAngleDeg;
  const step = totalAngle / (chars.length - 1);
  return chars.map((char, i) => {
    const angle = startAngleDeg + i * step;
    return `<text x="0" y="0" transform="translate(${cx}, ${cy}) rotate(${angle.toFixed(2)}) translate(0, ${radius.toFixed(2)}) rotate(180)" font-family="'Marcellus', 'Georgia', serif" font-size="${options.fontSize || 17.5}" font-weight="bold" fill="${options.fill || '#A6F0CF'}" text-anchor="middle" dominant-baseline="central">${char}</text>`;
  }).join("\n    ");
}

function createIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const entries = [];
  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset
    entries.push(entry);
    offset += buf.length;
  }
  return Buffer.concat([header, ...entries, ...pngBuffers]);
}

// 1. FULL COLLEGIATE SEAL SVG (for emblem.svg, logo.svg, apple-icon.svg)
const curvedTop = renderCurvedTextTop("THE OHIO STATE UNIVERSITY", 250, 250, 196, -70, 70, { fontSize: 20, fill: "#FFFDF9" });
const curvedBottom = renderCurvedTextBottom("TAMIL SANGAM · EST. 2021", 250, 250, 196, 68, -68, { fontSize: 17.5, fill: "#A6F0CF" });

const fullSealSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <!-- Royal Violet Background Gradients -->
    <radialGradient id="sealCanvasGrad" cx="50%" cy="46%" r="56%">
      <stop offset="0%" stop-color="#3d1d69" />
      <stop offset="60%" stop-color="#241142" />
      <stop offset="100%" stop-color="#140924" />
    </radialGradient>

    <!-- Center Sanctum Radial Glow -->
    <radialGradient id="sanctumGlow" cx="50%" cy="48%" r="48%">
      <stop offset="0%" stop-color="#5a2f8d" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#381a5e" stop-opacity="0.75" />
      <stop offset="100%" stop-color="#180b2b" stop-opacity="0.98" />
    </radialGradient>

    <!-- Metallic Gold Rim Gradient -->
    <linearGradient id="goldRimGleam" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3C4" />
      <stop offset="30%" stop-color="#F5D061" />
      <stop offset="70%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#997316" />
    </linearGradient>

    <!-- Mint Bloom Accent Gradient -->
    <linearGradient id="mintAccentGleam" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4FAF0" />
      <stop offset="50%" stop-color="#A6F0CF" />
      <stop offset="100%" stop-color="#55CCA2" />
    </linearGradient>

    <!-- Soft Elevation Drop Shadow Filter -->
    <filter id="crestShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.65" />
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#A6F0CF" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- 1. BASE OUTER SHIELD & BEVELED MEDALLION RIM -->
  <circle cx="250" cy="250" r="246" fill="url(#sealCanvasGrad)" />
  <circle cx="250" cy="250" r="244" fill="none" stroke="url(#mintAccentGleam)" stroke-width="2.5" opacity="0.95" />
  <circle cx="250" cy="250" r="238" fill="none" stroke="url(#goldRimGleam)" stroke-width="1.5" opacity="0.8" />

  <!-- Collegiate Milling Beads around Outer Track -->
  <g fill="#A6F0CF" opacity="0.7">
    ${Array.from({ length: 48 }).map((_, i) => {
      const angle = (i * 360) / 48 * (Math.PI / 180);
      const r = 232;
      const x = 250 + r * Math.cos(angle);
      const y = 250 + r * Math.sin(angle);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.8" />`;
    }).join("")}
  </g>

  <!-- Inscription Track Inner Boundary Ring -->
  <circle cx="250" cy="250" r="162" fill="none" stroke="url(#mintAccentGleam)" stroke-width="2" opacity="0.85" />
  <circle cx="250" cy="250" r="158" fill="none" stroke="url(#goldRimGleam)" stroke-width="1.2" opacity="0.7" />

  <!-- 2. COLLEGIATE ARCHED INSCRIPTIONS -->
  <g>
    ${curvedTop}
  </g>

  <!-- Flanking Stars (Left and Right) -->
  <g fill="#F5D061">
    <circle cx="58" cy="250" r="3.5" fill="#A6F0CF" />
    <polygon points="58,241 60,247 66,250 60,253 58,259 56,253 50,250 56,247" />
    <circle cx="442" cy="250" r="3.5" fill="#A6F0CF" />
    <polygon points="442,241 444,247 450,250 444,253 442,259 440,253 434,250 440,247" />
  </g>

  <g>
    ${curvedBottom}
  </g>

  <!-- 3. INNER SANCTUM & CALLIGRAPHIC CREST -->
  <circle cx="250" cy="250" r="156" fill="url(#sanctumGlow)" />

  <!-- Subtle Heritage Sunburst Rays -->
  <g stroke="#7D60A6" stroke-width="0.8" opacity="0.3">
    ${Array.from({ length: 32 }).map((_, i) => {
      const angle = (i * 360) / 32 * (Math.PI / 180);
      const r1 = 125;
      const r2 = 154;
      const x1 = 250 + r1 * Math.cos(angle);
      const y1 = 250 + r1 * Math.sin(angle);
      const x2 = 250 + r2 * Math.cos(angle);
      const y2 = 250 + r2 * Math.sin(angle);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`;
    }).join("")}
  </g>

  <!-- Inner Concentric Beaded Halo -->
  <circle cx="250" cy="250" r="124" fill="none" stroke="#A6F0CF" stroke-width="1.2" stroke-dasharray="2, 3" opacity="0.6" />

  <!-- Central Crest Group -->
  <g filter="url(#crestShadow)">
    <!-- Wisdom Flame / Agal Vilakku Top -->
    <g transform="translate(250, 150)">
      <path d="M 0,-18 C -7,-6 -10,0 -8,7 C -6,14 0,16 0,16 C 0,16 6,14 8,7 C 10,0 7,-6 0,-18 Z" fill="url(#mintAccentGleam)" opacity="0.75" />
      <path d="M 0,-13 C -4,-4 -6,1 -5,6 C -3,11 0,12 0,12 C 0,12 3,11 5,6 C 6,1 4,-4 0,-13 Z" fill="url(#goldRimGleam)" />
      <path d="M -16,14 C -12,21 12,21 16,14 C 18,17 12,23 0,23 C -12,23 -18,17 -16,14 Z" fill="url(#goldRimGleam)" />
    </g>

    <!-- Classical Central Tamil Letter "த" (Tha) -->
    <text
      x="250"
      y="288"
      text-anchor="middle"
      font-family="'Mukta Malar', 'Anek Tamil', 'Nirmala UI', 'Latha', 'Noto Sans Tamil', serif"
      font-size="124"
      font-weight="900"
      fill="#FFFDF9"
      stroke="#140924"
      stroke-width="3"
      paint-order="stroke fill"
    >த</text>

    <!-- Stylized Collegiate Lotus Pedestal -->
    <g transform="translate(250, 326)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 0,-8 C -6,4 -10,12 0,20 C 10,12 6,4 0,-8 Z" fill="url(#goldRimGleam)" stroke="#140924" stroke-width="1.2" />
      <path d="M -2,0 C -14,2 -24,12 -12,20 C -4,18 2,12 -2,0 Z" fill="url(#mintAccentGleam)" stroke="#140924" stroke-width="1.2" opacity="0.95" />
      <path d="M 2,0 C 14,2 24,12 12,20 C 4,18 -2,12 2,0 Z" fill="url(#mintAccentGleam)" stroke="#140924" stroke-width="1.2" opacity="0.95" />
      <path d="M -10,8 C -26,10 -36,22 -22,25 C -14,24 -6,18 -10,8 Z" fill="#D4AF37" stroke="#140924" stroke-width="1" opacity="0.85" />
      <path d="M 10,8 C 26,10 36,22 22,25 C 14,24 6,18 10,8 Z" fill="#D4AF37" stroke="#140924" stroke-width="1" opacity="0.85" />
      <path d="M -32,25 Q 0,29 32,25 Q 0,33 -32,25 Z" fill="url(#goldRimGleam)" />
    </g>

    <!-- Subtitle Inscription: தமிழ்ச்சங்கம் -->
    <text
      x="250"
      y="384"
      text-anchor="middle"
      font-family="'Mukta Malar', 'Noto Sans Tamil', 'Latha', sans-serif"
      font-size="14.5"
      font-weight="bold"
      fill="#A6F0CF"
      letter-spacing="2"
      opacity="0.9"
    >தமிழ்ச்சங்கம்</text>
  </g>
</svg>
`;

// 2. DEDICATED FAVICON SVG (optimized for 16x16 - 48x48 tab legibility)
const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <!-- Royal Violet Background Gradient -->
    <radialGradient id="favBg" cx="50%" cy="46%" r="56%">
      <stop offset="0%" stop-color="#442075" />
      <stop offset="65%" stop-color="#22103d" />
      <stop offset="100%" stop-color="#120821" />
    </radialGradient>

    <!-- Metallic Gold Rim Gradient -->
    <linearGradient id="favGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3C4" />
      <stop offset="35%" stop-color="#F5D061" />
      <stop offset="70%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#997316" />
    </linearGradient>

    <!-- Mint Bloom Accent Gradient -->
    <linearGradient id="favMint" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4FAF0" />
      <stop offset="50%" stop-color="#A6F0CF" />
      <stop offset="100%" stop-color="#55CCA2" />
    </linearGradient>

    <!-- Elevation Shadow Filter -->
    <filter id="favShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.75" />
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#A6F0CF" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Base Circle & Outer Rims -->
  <circle cx="250" cy="250" r="242" fill="url(#favBg)" />
  <circle cx="250" cy="250" r="238" fill="none" stroke="url(#favMint)" stroke-width="12" />
  <circle cx="250" cy="250" r="222" fill="none" stroke="url(#favGold)" stroke-width="4" opacity="0.85" />

  <!-- Inner Beaded Accents (16 cardinal beads) -->
  <g fill="#A6F0CF" opacity="0.85">
    ${Array.from({ length: 16 }).map((_, i) => {
      const angle = (i * 360) / 16 * (Math.PI / 180);
      const r = 208;
      const x = 250 + r * Math.cos(angle);
      const y = 250 + r * Math.sin(angle);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" />`;
    }).join("")}
  </g>

  <!-- Sacred Crest: Flame, Classical Letter "த", and Lotus Base -->
  <g filter="url(#favShadow)">
    <!-- Wisdom Flame / Agal Vilakku Top -->
    <g transform="translate(250, 88)">
      <path d="M 0,-36 C -14,-12 -20,0 -16,14 C -12,28 0,32 0,32 C 0,32 12,28 16,14 C 20,0 14,-12 0,-36 Z" fill="url(#favMint)" opacity="0.85" />
      <path d="M 0,-26 C -8,-8 -12,2 -10,12 C -6,22 0,24 0,24 C 0,24 6,22 10,12 C 12,2 8,-8 0,-26 Z" fill="url(#favGold)" />
      <path d="M -32,28 C -24,42 24,42 32,28 C 36,34 24,46 0,46 C -24,46 -36,34 -32,28 Z" fill="url(#favGold)" />
    </g>

    <!-- Classical Tamil Letter "த" (Large, Bold, High Legibility at 16-32px) -->
    <text
      x="250"
      y="315"
      text-anchor="middle"
      font-family="'Mukta Malar', 'Anek Tamil', 'Nirmala UI', 'Latha', 'Noto Sans Tamil', serif"
      font-size="210"
      font-weight="900"
      fill="#FFFDF9"
      stroke="#120821"
      stroke-width="5"
      paint-order="stroke fill"
    >த</text>

    <!-- Stylized Lotus / Kolam Base Pedestal -->
    <g transform="translate(250, 375)">
      <path d="M 0,-16 C -12,8 -20,24 0,40 C 20,24 12,8 0,-16 Z" fill="url(#favGold)" stroke="#120821" stroke-width="2.5" />
      <path d="M -4,0 C -28,4 -48,24 -24,40 C -8,36 4,24 -4,0 Z" fill="url(#favMint)" stroke="#120821" stroke-width="2.5" opacity="0.95" />
      <path d="M -20,16 C -52,20 -72,44 -44,50 C -28,48 -12,36 -20,16 Z" fill="#D4AF37" stroke="#120821" stroke-width="2" opacity="0.85" />
      <path d="M 4,0 C 28,4 48,24 24,40 C 8,36 -4,24 4,0 Z" fill="url(#favMint)" stroke="#120821" stroke-width="2.5" opacity="0.95" />
      <path d="M 20,16 C 52,20 72,44 44,50 C 28,48 12,36 20,16 Z" fill="#D4AF37" stroke="#120821" stroke-width="2" opacity="0.85" />
      <path d="M -64,50 Q 0,58 64,50 Q 0,66 -64,50 Z" fill="url(#favGold)" />
    </g>
  </g>
</svg>
`;

async function main() {
  console.log("Generating Official Collegiate Brand Assets...");

  // Write SVGs
  fs.writeFileSync("public/emblem.svg", fullSealSvg.trim());
  fs.writeFileSync("public/logo.svg", fullSealSvg.trim());
  fs.writeFileSync("src/app/apple-icon.svg", fullSealSvg.trim());
  fs.writeFileSync("src/app/icon.svg", faviconSvg.trim());
  fs.writeFileSync("public/icon.svg", faviconSvg.trim());
  console.log("Written SVGs: emblem.svg, logo.svg, apple-icon.svg, icon.svg");

  // Generate Multi-resolution PNGs
  const [png16, png32, png48, png180, png192, png512] = await Promise.all([
    sharp(Buffer.from(faviconSvg)).resize(16, 16).png().toBuffer(),
    sharp(Buffer.from(faviconSvg)).resize(32, 32).png().toBuffer(),
    sharp(Buffer.from(faviconSvg)).resize(48, 48).png().toBuffer(),
    sharp(Buffer.from(fullSealSvg)).resize(180, 180).png().toBuffer(),
    sharp(Buffer.from(fullSealSvg)).resize(192, 192).png().toBuffer(),
    sharp(Buffer.from(fullSealSvg)).resize(512, 512).png().toBuffer(),
  ]);

  fs.writeFileSync("public/favicon-16.png", png16);
  fs.writeFileSync("public/favicon-32.png", png32);
  fs.writeFileSync("public/favicon-48.png", png48);
  fs.writeFileSync("public/apple-touch-icon.png", png180);
  fs.writeFileSync("public/icon-192.png", png192);
  fs.writeFileSync("public/icon-512.png", png512);

  // Generate multi-resolution ICO file (16, 32, 48)
  const icoBuf = createIco([png16, png32, png48], [16, 32, 48]);
  fs.writeFileSync("public/favicon.ico", icoBuf);
  fs.writeFileSync("src/app/favicon.ico", icoBuf);
  console.log("Created public/favicon.ico and src/app/favicon.ico (Multi-size 16/32/48 ICO) - Bytes:", icoBuf.length);

  console.log("All Official Brand Assets Successfully Generated!");
}

main().catch((err) => {
  console.error("Asset generation failed:", err);
  process.exit(1);
});
