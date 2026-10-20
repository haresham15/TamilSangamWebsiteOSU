"use client";

import * as THREE from "three";

export type SilhouetteKind = "woman" | "man";
export type SilhouettePose = "A" | "B";

/**
 * 1D Euclidean Distance Transform with parabolic envelope (Felzenszwalb & Huttenlocher).
 * Runs in strict O(N) linear time.
 */
function edt1d(f: Float32Array, n: number, d: Float32Array, v: Int32Array, z: Float32Array) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;

  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }

  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) {
      k++;
    }
    const dx = q - v[k];
    d[q] = dx * dx + f[v[k]];
  }
}

/**
 * 2D Euclidean Distance Transform.
 */
function edt2d(grid: Float32Array, width: number, height: number): Float32Array {
  const maxDim = Math.max(width, height);
  const f = new Float32Array(maxDim);
  const d = new Float32Array(maxDim);
  const v = new Int32Array(maxDim);
  const z = new Float32Array(maxDim + 1);

  const temp = new Float32Array(width * height);
  const out = new Float32Array(width * height);

  // Column pass
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      f[y] = grid[y * width + x];
    }
    edt1d(f, height, d, v, z);
    for (let y = 0; y < height; y++) {
      temp[y * width + x] = d[y];
    }
  }

  // Row pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      f[x] = temp[y * width + x];
    }
    edt1d(f, width, d, v, z);
    for (let x = 0; x < width; x++) {
      out[y * width + x] = Math.sqrt(d[x]);
    }
  }

  return out;
}

/**
 * Draw anatomical seated woman silhouette facing -x (left towards window).
 * Features:
 * - Seated profile posture
 * - Soft contoured hair bun at back of head
 * - Forehead, nose, lips, jawline tapering into neck
 * - Draped saree shoulder line flowing over arm
 * - Forearms resting near the window sill
 * - Pose A: looking straight forward
 * - Pose B: subtle downward glance (-4 degrees)
 */
function drawWomanSilhouette(ctx: CanvasRenderingContext2D, w: number, h: number, pose: SilhouettePose) {
  const isB = pose === "B";
  const tilt = isB ? 0.025 : 0.0;
  const headYOffset = isB ? h * 0.012 : 0;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();

  // Anatomical Head & Hair-Bun Portrait in Left Profile (-x)
  // Cropped naturally at the lower sill (y = h)
  const headX = w * 0.56;
  const headY = h * 0.28 + headYOffset;

  // Start at back of neck/nape
  ctx.moveTo(headX + w * 0.05, headY + h * 0.16);

  // Hair bun contour at back/occiput (graceful round chignon)
  ctx.bezierCurveTo(
    headX + w * 0.16, headY + h * 0.14,
    headX + w * 0.24, headY + h * 0.04,
    headX + w * 0.20, headY - h * 0.06
  );
  ctx.bezierCurveTo(
    headX + w * 0.16, headY - h * 0.14,
    headX + w * 0.06, headY - h * 0.16,
    headX - w * 0.02, headY - h * 0.13
  );

  // Crown of head & hairline
  ctx.bezierCurveTo(
    headX - w * 0.10, headY - h * 0.12,
    headX - w * 0.16, headY - h * 0.06,
    headX - w * 0.18, headY - h * 0.01 + tilt * h
  );

  // Forehead to brow (left-facing)
  ctx.bezierCurveTo(
    headX - w * 0.20, headY + h * 0.03 + tilt * h,
    headX - w * 0.21, headY + h * 0.07 + tilt * h,
    headX - w * 0.20, headY + h * 0.09 + tilt * h
  );

  // Nose bridge & delicate tip
  ctx.lineTo(headX - w * 0.24, headY + h * 0.12 + tilt * h);
  ctx.lineTo(headX - w * 0.20, headY + h * 0.14 + tilt * h);

  // Upper & lower lips
  ctx.lineTo(headX - w * 0.215, headY + h * 0.16 + tilt * h);
  ctx.lineTo(headX - w * 0.195, headY + h * 0.175 + tilt * h);

  // Chin and jawline
  ctx.bezierCurveTo(
    headX - w * 0.21, headY + h * 0.20 + tilt * h,
    headX - w * 0.17, headY + h * 0.23 + tilt * h,
    headX - w * 0.10, headY + h * 0.235
  );

  // Elegant throat into collarbone
  ctx.bezierCurveTo(
    headX - w * 0.09, headY + h * 0.27,
    headX - w * 0.12, headY + h * 0.31,
    headX - w * 0.16, headY + h * 0.35
  );

  // Left shoulder & draped saree pallu flowing toward window
  ctx.bezierCurveTo(
    headX - w * 0.28, headY + h * 0.40,
    headX - w * 0.36, headY + h * 0.48,
    headX - w * 0.40, headY + h * 0.58
  );

  // Forearm extending and resting gracefully along bottom window sill (y -> h)
  ctx.bezierCurveTo(
    headX - w * 0.43, headY + h * 0.65,
    headX - w * 0.44, headY + h * 0.70,
    headX - w * 0.42, h
  );

  // Bottom edge flush crop (resting on sill)
  ctx.lineTo(w, h);

  // Upper back & shoulder contour rising to nape
  ctx.bezierCurveTo(
    headX + w * 0.35, headY + h * 0.55,
    headX + w * 0.25, headY + h * 0.38,
    headX + w * 0.18, headY + h * 0.26
  );
  ctx.bezierCurveTo(
    headX + w * 0.14, headY + h * 0.21,
    headX + w * 0.09, headY + h * 0.18,
    headX + w * 0.05, headY + h * 0.16
  );

  ctx.closePath();
  ctx.fill();
}

function drawManSilhouette(ctx: CanvasRenderingContext2D, w: number, h: number, pose: SilhouettePose) {
  const isB = pose === "B";
  const tilt = isB ? -0.018 : 0.0;
  const torsoShift = isB ? w * 0.015 : 0;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();

  // Three-Quarter Back/Side Profile Bust (Head, collar, overcoat shoulders)
  // Facing towards window (+x), cropped cleanly across the bottom
  const headX = w * 0.42 + torsoShift;
  const headY = h * 0.22;

  // Start at back of neck / hair contour
  ctx.moveTo(headX - w * 0.06, headY + h * 0.10);

  // Back of head / collegiate tousled hair texture
  ctx.bezierCurveTo(
    headX - w * 0.14, headY + h * 0.07,
    headX - w * 0.17, headY - h * 0.02,
    headX - w * 0.13, headY - h * 0.08
  );
  ctx.bezierCurveTo(
    headX - w * 0.09, headY - h * 0.13,
    headX - w * 0.02, headY - h * 0.15,
    headX + w * 0.06, headY - h * 0.12 + tilt * h
  );

  // Hair peak & brow ridge
  ctx.bezierCurveTo(
    headX + w * 0.12, headY - h * 0.08 + tilt * h,
    headX + w * 0.15, headY - h * 0.03 + tilt * h,
    headX + w * 0.14, headY + h * 0.01 + tilt * h
  );

  // Clean nose profile
  ctx.lineTo(headX + w * 0.19, headY + h * 0.04 + tilt * h);
  ctx.lineTo(headX + w * 0.15, headY + h * 0.06 + tilt * h);

  // Lips & structured masculine jawline
  ctx.lineTo(headX + w * 0.16, headY + h * 0.08 + tilt * h);
  ctx.lineTo(headX + w * 0.14, headY + h * 0.095 + tilt * h);
  ctx.bezierCurveTo(
    headX + w * 0.15, headY + h * 0.12 + tilt * h,
    headX + w * 0.12, headY + h * 0.14 + tilt * h,
    headX + w * 0.07, headY + h * 0.15
  );

  // Neck leading into sharp structured coat collar
  ctx.lineTo(headX + w * 0.05, headY + h * 0.17);
  // Turned-up coat collar peak
  ctx.lineTo(headX + w * 0.18, headY + h * 0.20);
  ctx.lineTo(headX + w * 0.13, headY + h * 0.24);

  // Broad overcoat chest & lapel line facing the train window
  ctx.bezierCurveTo(
    headX + w * 0.24, headY + h * 0.32,
    headX + w * 0.32, headY + h * 0.44,
    headX + w * 0.38, headY + h * 0.58
  );
  ctx.bezierCurveTo(
    headX + w * 0.42, headY + h * 0.70,
    headX + w * 0.44, headY + h * 0.85,
    headX + w * 0.45, h
  );

  // Clean bottom edge crop
  ctx.lineTo(0, h);

  // Left broad coat shoulder & back contour
  ctx.lineTo(0, headY + h * 0.65);
  ctx.bezierCurveTo(
    headX - w * 0.32, headY + h * 0.55,
    headX - w * 0.26, headY + h * 0.40,
    headX - w * 0.20, headY + h * 0.28
  );

  // Up to coat collar back & neck
  ctx.bezierCurveTo(
    headX - w * 0.18, headY + h * 0.20,
    headX - w * 0.12, headY + h * 0.15,
    headX - w * 0.06, headY + h * 0.10
  );

  ctx.closePath();
  ctx.fill();
}

const textureCache = new Map<string, THREE.DataTexture>();

/**
 * Generates a 1024x1024 Euclidean Signed Distance Field DataTexture.
 * Returns null during SSR, and caches textures for the session.
 */
export function getSilhouetteSdfTexture(kind: SilhouetteKind, pose: SilhouettePose): THREE.DataTexture | null {
  if (typeof document === "undefined") return null;

  const cacheKey = `${kind}_${pose}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);

  if (kind === "woman") {
    drawWomanSilhouette(ctx, size, size, pose);
  } else {
    drawManSilhouette(ctx, size, size, pose);
  }

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  const totalPixels = size * size;
  const gridOutside = new Float32Array(totalPixels);
  const gridInside = new Float32Array(totalPixels);

  for (let i = 0; i < totalPixels; i++) {
    const isInside = data[i * 4] > 128;
    gridOutside[i] = isInside ? 1e6 : 0;
    gridInside[i] = isInside ? 0 : 1e6;
  }

  const distToOutside = edt2d(gridOutside, size, size);
  const distToInside = edt2d(gridInside, size, size);

  const spread = 28.0; // Distance transition band in pixels
  const sdfPixels = new Uint8Array(totalPixels);

  // Invert Y: Canvas row 0 is top (head), but Three.js UV v=0 is bottom
  for (let py = 0; py < size; py++) {
    const srcY = size - 1 - py;
    for (let px = 0; px < size; px++) {
      const srcIdx = srcY * size + px;
      const dstIdx = py * size + px;
      const sd = distToOutside[srcIdx] - distToInside[srcIdx];
      const normalized = Math.min(1, Math.max(0, 0.5 + sd / (2 * spread)));
      sdfPixels[dstIdx] = Math.round(normalized * 255);
    }
  }

  const texture = new THREE.DataTexture(sdfPixels, size, size, THREE.RedFormat);
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}
