import fs from "fs";
import path from "path";
import zlib from "zlib";

// Pure Node.js PNG encoder without external dependencies
function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function writePng(filePath, width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit depth
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = makeChunk("IHDR", ihdrData);

  // Scanlines with filter byte 0 (None)
  const rowLen = width * 4;
  const scanlines = Buffer.alloc(height * (rowLen + 1));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowLen + 1);
    scanlines[rowOffset] = 0; // filter None
    rgbaBuffer.copy(scanlines, rowOffset + 1, y * rowLen, (y + 1) * rowLen);
  }

  const compressed = zlib.deflateSync(scanlines);
  const idat = makeChunk("IDAT", compressed);
  const iend = makeChunk("IEND", Buffer.alloc(0));

  const finalPng = Buffer.concat([signature, ihdr, idat, iend]);
  fs.writeFileSync(filePath, finalPng);
  console.log(`Created: ${filePath} (${width}x${height}, ${finalPng.length} bytes)`);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);
  const crcTarget = Buffer.concat([Buffer.from(type), data]);
  buf.writeUInt32BE(crc32(crcTarget), 8 + len);
  return buf;
}

const outDir = path.resolve("./public/media");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. metal_normal.png (256x256 brushed metal normal map)
{
  const w = 256;
  const h = 256;
  const buf = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      // Brushed streaks along X axis
      const noise = (Math.sin(y * 0.8) * 0.5 + Math.sin(y * 2.3) * 0.3 + (Math.random() - 0.5) * 0.4) * 18;
      buf[idx + 0] = Math.min(255, Math.max(0, Math.floor(128 + noise))); // Normal X
      buf[idx + 1] = 128; // Normal Y
      buf[idx + 2] = 255; // Normal Z (pointing outward)
      buf[idx + 3] = 255; // Alpha
    }
  }
  writePng(path.join(outDir, "metal_normal.png"), w, h, buf);
}

// 2. crowd_alpha.png (256x512 concert crowd dancer silhouette)
{
  const w = 256;
  const h = 512;
  const buf = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      // Normalized coords: x in [-1, 1], y in [0, 1] where 0 is bottom, 1 is top
      const nx = (x - w / 2) / (w / 2);
      const ny = (h - y) / h;

      let isInside = false;
      // Head
      const hDist = Math.hypot(nx, (ny - 0.72) * 1.6);
      if (hDist < 0.16) isInside = true;

      // Torso
      if (ny >= 0.0 && ny <= 0.62) {
        const torsoHalfWidth = 0.28 + (1.0 - ny / 0.62) * 0.15;
        if (Math.abs(nx) < torsoHalfWidth) isInside = true;
      }

      // Shoulders
      if (ny >= 0.52 && ny <= 0.64) {
        const shoulderHalfWidth = 0.48 * (1.0 - (ny - 0.52) / 0.12 * 0.4);
        if (Math.abs(nx) < shoulderHalfWidth) isInside = true;
      }

      // Left Raised Victory Arm
      const leftArmDist = Math.hypot(nx - (-0.38 - (ny - 0.55) * 0.45), 0);
      if (ny >= 0.55 && ny <= 0.95 && leftArmDist < 0.085) isInside = true;

      // Right Raised Victory Arm
      const rightArmDist = Math.hypot(nx - (0.38 + (ny - 0.55) * 0.45), 0);
      if (ny >= 0.55 && ny <= 0.95 && rightArmDist < 0.085) isInside = true;

      const val = isInside ? 255 : 0;
      buf[idx + 0] = val;
      buf[idx + 1] = val;
      buf[idx + 2] = val;
      buf[idx + 3] = val;
    }
  }
  writePng(path.join(outDir, "crowd_alpha.png"), w, h, buf);
}

// 3. gun_flare.png (256x256 radial warm gold muzzle flare)
{
  const w = 256;
  const h = 256;
  const buf = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const dx = (x - w / 2) / (w / 2);
      const dy = (y - h / 2) / (h / 2);
      const dist = Math.hypot(dx, dy);

      if (dist < 1.0) {
        // High central brilliance with soft falloff
        const glow = Math.pow(Math.max(0, 1.0 - dist), 2.2);
        buf[idx + 0] = 255; // Red
        buf[idx + 1] = Math.floor(180 + 75 * (1.0 - dist)); // Green (warm gold/amber)
        buf[idx + 2] = Math.floor(40 * (1.0 - dist)); // Blue
        buf[idx + 3] = Math.floor(glow * 255); // Alpha
      } else {
        buf[idx + 0] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
      }
    }
  }
  writePng(path.join(outDir, "gun_flare.png"), w, h, buf);
}

// 4. vijay_torso.png (512x640 Leo Torso Silhouette)
{
  const w = 512;
  const h = 640;
  const buf = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const nx = (x - w / 2) / (w / 2);
      const ny = (h - y) / h; // 0 at bottom, 1 at top

      let isInside = false;

      // Head & Hair
      const headDist = Math.hypot(nx, (ny - 0.88) * 1.5);
      if (headDist < 0.11) isInside = true;

      // Neck & Collar
      if (ny >= 0.78 && ny <= 0.84 && Math.abs(nx) < 0.09) isInside = true;

      // Torso & Flared Coat
      if (ny >= 0.38 && ny <= 0.80) {
        const coatWidth = 0.22 + (0.80 - ny) * 0.25;
        if (Math.abs(nx) < coatWidth) isInside = true;
      }

      // Legs
      if (ny >= 0.0 && ny <= 0.38) {
        const legLeft = Math.abs(nx - (-0.14)) < 0.08;
        const legRight = Math.abs(nx - 0.14) < 0.08;
        if (legLeft || legRight) isInside = true;
      }

      // Left Victory Arm (extended upward and to the left)
      if (ny >= 0.60 && ny <= 0.96) {
        const armX = -0.18 - (ny - 0.60) * 0.7;
        if (Math.hypot(nx - armX, 0) < 0.075) isInside = true;
      }

      if (isInside) {
        buf[idx + 0] = 12; // Rich silhouette near-black
        buf[idx + 1] = 8;
        buf[idx + 2] = 16;
        buf[idx + 3] = 255;
      } else {
        buf[idx + 0] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
      }
    }
  }
  writePng(path.join(outDir, "vijay_torso.png"), w, h, buf);
}

// 5. vijay_arm.png (256x512 Leo Right Arm with Revolver Silhouette)
{
  const w = 256;
  const h = 512;
  const buf = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const nx = (x - w * 0.35) / (w * 0.5); // shoulder joint near bottom-left
      const ny = (h - y) / h; // 0 at bottom, 1 at top

      let isInside = false;

      // Arm stretching upward and tilting slightly outward
      if (ny >= 0.05 && ny <= 0.72) {
        const armX = 0.0 + ny * 0.55;
        if (Math.hypot(nx - armX, 0) < 0.15) isInside = true;
      }

      // Hand & Revolver at top
      if (ny >= 0.70 && ny <= 0.95) {
        const gunX = 0.40;
        if (Math.hypot(nx - gunX, (ny - 0.82) * 1.5) < 0.16) isInside = true;
        // Revolver barrel pointing straight up
        if (ny >= 0.80 && ny <= 0.98 && Math.abs(nx - 0.42) < 0.05) isInside = true;
      }

      if (isInside) {
        buf[idx + 0] = 12;
        buf[idx + 1] = 8;
        buf[idx + 2] = 16;
        buf[idx + 3] = 255;
      } else {
        buf[idx + 0] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
      }
    }
  }
  writePng(path.join(outDir, "vijay_arm.png"), w, h, buf);
}

console.log("All media assets successfully generated!");
