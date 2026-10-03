import fs from "fs";
import path from "path";
import zlib from "zlib";

// Minimal pure Node.js PNG encoder using zlib
function encodePNG(width, height, rgbaBuffer) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth: 8
  ihdr.writeUInt8(6, 9); // color type: 6 (RGBA)
  ihdr.writeUInt8(0, 10); // compression: 0 (deflate)
  ihdr.writeUInt8(0, 11); // filter: 0
  ihdr.writeUInt8(0, 12); // interlace: 0

  function createChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, "ascii");
    data.copy(buf, 8);
    // CRC32 calculation
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let srcOffset = 0;
  let dstOffset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[dstOffset++] = 0; // Filter None
    rgbaBuffer.copy(scanlines, dstOffset, srcOffset, srcOffset + width * 4);
    dstOffset += width * 4;
    srcOffset += width * 4;
  }

  const compressed = zlib.deflateSync(scanlines, { level: 9 });
  const ihdrChunk = createChunk("IHDR", ihdr);
  const idatChunk = createChunk("IDAT", compressed);
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Standard CRC32 table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

// Deterministic Pseudo-random Noise Generator
function pseudoRandom(x, y, seed = 1337) {
  let h = seed + x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
}

function smoothNoise(x, y, scale, seed = 1337) {
  const sx = x / scale;
  const sy = y / scale;
  const ix = Math.floor(sx);
  const iy = Math.floor(sy);
  const fx = sx - ix;
  const fy = sy - iy;

  const wx = fx * fx * (3 - 2 * fx);
  const wy = fy * fy * (3 - 2 * fy);

  const n00 = pseudoRandom(ix, iy, seed);
  const n10 = pseudoRandom(ix + 1, iy, seed);
  const n01 = pseudoRandom(ix, iy + 1, seed);
  const n11 = pseudoRandom(ix + 1, iy + 1, seed);

  const top = n00 * (1 - wx) + n10 * wx;
  const bot = n01 * (1 - wx) + n11 * wx;
  return top * (1 - wy) + bot * wy;
}

// Output directory
const OUT_DIR = path.resolve("public/textures/join");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const SIZE = 512; // 512 for fast load & mobile efficiency, crisp detail

console.log("Generating PBR Textures in", OUT_DIR);

// 1. Limestone Diffuse (#E8E4D9: 232, 228, 217)
{
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;
      const grain = (pseudoRandom(x, y, 42) - 0.5) * 16;
      const sediment = (smoothNoise(x, y, 64, 101) - 0.5) * 14;
      const r = Math.min(255, Math.max(0, 232 + grain + sediment));
      const g = Math.min(255, Math.max(0, 228 + grain + sediment));
      const b = Math.min(255, Math.max(0, 217 + grain * 0.8 + sediment));
      buf[idx] = Math.round(r);
      buf[idx + 1] = Math.round(g);
      buf[idx + 2] = Math.round(b);
      buf[idx + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, "limestone_diffuse.png"), encodePNG(SIZE, SIZE, buf));
  console.log("Created limestone_diffuse.png");
}

// 2. Limestone Normal (Chiseled grain)
{
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;
      const nR = smoothNoise(x + 1, y, 8, 42) - smoothNoise(x - 1, y, 8, 42);
      const nU = smoothNoise(x, y + 1, 8, 42) - smoothNoise(x, y - 1, 8, 42);
      const nx = Math.min(255, Math.max(0, Math.round(128 + nR * 128)));
      const ny = Math.min(255, Math.max(0, Math.round(128 + nU * 128)));
      buf[idx] = nx;
      buf[idx + 1] = ny;
      buf[idx + 2] = 240;
      buf[idx + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, "limestone_normal.png"), encodePNG(SIZE, SIZE, buf));
  console.log("Created limestone_normal.png");
}

// 3. Limestone Roughness (~0.90 -> 230/255)
{
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;
      const grain = (pseudoRandom(x, y, 99) - 0.5) * 18;
      const val = Math.min(255, Math.max(0, Math.round(230 + grain)));
      buf[idx] = val;
      buf[idx + 1] = val;
      buf[idx + 2] = val;
      buf[idx + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, "limestone_roughness.png"), encodePNG(SIZE, SIZE, buf));
  console.log("Created limestone_roughness.png");
}

// 4. Cobblestone Pavers Diffuse (#D8D2C4: warm natural campus limestone pavers)
{
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  const paverW = 32;
  const paverH = 16;
  const mortar = 2;

  // Natural collegiate stone tints
  const stoneTints = [
    [218, 212, 198],
    [224, 218, 204],
    [212, 206, 192],
    [220, 214, 200],
    [216, 210, 196],
  ];

  for (let y = 0; y < SIZE; y++) {
    const row = Math.floor(y / paverH);
    const rowOffset = (row % 2) * (paverW / 2);
    const py = y % paverH;

    for (let x = 0; x < SIZE; x++) {
      const col = Math.floor((x + rowOffset) / paverW);
      const px = (x + rowOffset) % paverW;
      const idx = (y * SIZE + x) * 4;

      const isMortar = px < mortar || py < mortar;

      let r, g, b;
      if (isMortar) {
        // Recessed sand/lime mortar
        r = 175;
        g = 168;
        b = 156;
      } else {
        // Paver stone with slight per-paver variation
        const tint = stoneTints[Math.abs((row * 17 + col * 31) % stoneTints.length)];
        r = tint[0];
        g = tint[1];
        b = tint[2];

        // Subtle edge bevel
        if (px === mortar || py === mortar) {
          r = Math.min(255, r + 10);
          g = Math.min(255, g + 10);
          b = Math.min(255, b + 10);
        } else if (px === paverW - 1 || py === paverH - 1) {
          r = Math.max(0, r - 12);
          g = Math.max(0, g - 12);
          b = Math.max(0, b - 12);
        }
      }

      // High-frequency fine mineral grain
      const grain = (pseudoRandom(x, y, 77) - 0.5) * 10;
      buf[idx] = Math.min(255, Math.max(0, Math.round(r + grain)));
      buf[idx + 1] = Math.min(255, Math.max(0, Math.round(g + grain)));
      buf[idx + 2] = Math.min(255, Math.max(0, Math.round(b + grain)));
      buf[idx + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, "cobblestone_diffuse.png"), encodePNG(SIZE, SIZE, buf));
  console.log("Created refined cobblestone_diffuse.png");
}

// 5. Cobblestone Roughness: base ~0.90 (230) + subtle morning dew glints (0.42 -> 107)
{
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;
      // High-frequency morning dew condensation glints
      const dew = smoothNoise(x, y, 48, 555);
      let rough = 230;
      if (dew > 0.68) {
        // Subtle morning condensation specular glint
        const t = Math.min(1, (dew - 0.68) / 0.18);
        rough = Math.round(230 * (1 - t) + 107 * t);
      }
      const grain = (pseudoRandom(x, y, 88) - 0.5) * 8;
      buf[idx] = Math.min(255, Math.max(0, Math.round(rough + grain)));
      buf[idx + 1] = Math.min(255, Math.max(0, Math.round(rough + grain)));
      buf[idx + 2] = Math.min(255, Math.max(0, Math.round(rough + grain)));
      buf[idx + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, "cobblestone_roughness.png"), encodePNG(SIZE, SIZE, buf));
  console.log("Created refined cobblestone_roughness.png");
}

console.log("All PBR textures generated successfully.");
