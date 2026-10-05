/**
 * scripts/make-identity-lut.mjs
 * Generates an uncompressed neutral identity 33^3 LUT strip (1089x33 PNG)
 * and a reference 33^3 .cube file for dev & testing.
 * 
 * Rules:
 * - Output strip size: 1089x33 RGBA (size <= 100 KB)
 * - Exact identity mapping: R_out = R, G_out = G, B_out = B
 * - No external dependencies (uses node:zlib and native Buffer)
 */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

function crc32(buf) {
  let table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

export function createPng(width, height, rgbaBuffer) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filter
  ihdr[12] = 0; // no interlace

  const rowBytes = width * 4;
  const scanlines = Buffer.alloc(height * (rowBytes + 1));
  for (let y = 0; y < height; y++) {
    scanlines[y * (rowBytes + 1)] = 0; // filter: None
    rgbaBuffer.copy(scanlines, y * (rowBytes + 1) + 1, y * rowBytes, (y + 1) * rowBytes);
  }

  const idat = chunk("IDAT", zlib.deflateSync(scanlines, { level: 9 }));
  const iend = chunk("IEND", Buffer.alloc(0));
  return Buffer.concat([sig, chunk("IHDR", ihdr), idat, iend]);
}

export function generateIdentityLUT(size = 33) {
  const width = size * size;
  const height = size;
  const raw = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const zSlice = Math.floor(x / size);
      const xLocal = x % size;

      const r = Math.round((xLocal / (size - 1)) * 255);
      const g = Math.round((y / (size - 1)) * 255);
      const b = Math.round((zSlice / (size - 1)) * 255);

      const idx = (y * width + x) * 4;
      raw[idx + 0] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = 255;
    }
  }

  return { width, height, raw, png: createPng(width, height, raw) };
}

export function generateIdentityCube(size = 33) {
  let lines = [
    `# Tamil Sangam OSU - Identity 3D LUT`,
    `TITLE "Identity_33"`,
    `LUT_3D_SIZE ${size}`,
    `DOMAIN_MIN 0.0 0.0 0.0`,
    `DOMAIN_MAX 1.0 1.0 1.0`,
    ``
  ];

  // Standard .cube data order: r fastest, then g, then b
  for (let b = 0; b < size; b++) {
    const bVal = (b / (size - 1)).toFixed(6);
    for (let g = 0; g < size; g++) {
      const gVal = (g / (size - 1)).toFixed(6);
      for (let r = 0; r < size; r++) {
        const rVal = (r / (size - 1)).toFixed(6);
        lines.push(`${rVal} ${gVal} ${bVal}`);
      }
    }
  }

  return lines.join("\n");
}

// Execute if run directly
const outDir = path.resolve(process.cwd(), "public/luts");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const { png } = generateIdentityLUT(33);
const pngPath = path.join(outDir, "heritage-33.png");
fs.writeFileSync(pngPath, png);
console.log(`[make-identity-lut] Written ${pngPath} (${(png.length / 1024).toFixed(1)} KB)`);

const cube = generateIdentityCube(33);
const cubePath = path.join(outDir, "identity-33.cube");
fs.writeFileSync(cubePath, cube);
console.log(`[make-identity-lut] Written ${cubePath} (${(Buffer.byteLength(cube) / 1024).toFixed(1)} KB)`);
