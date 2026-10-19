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
  const tilt = isB ? 0.03 : 0.0;
  const headYOffset = isB ? h * 0.015 : 0;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();

  // Head and face profile (facing left / -x)
  const headX = w * 0.52;
  const headY = h * 0.22 + headYOffset;

  // Start at back of neck
  ctx.moveTo(headX + w * 0.04, headY + h * 0.12);

  // Hair bun contour at back/occiput
  ctx.bezierCurveTo(
    headX + w * 0.12, headY + h * 0.10,
    headX + w * 0.18, headY + h * 0.02,
    headX + w * 0.15, headY - h * 0.05
  );
  ctx.bezierCurveTo(
    headX + w * 0.12, headY - h * 0.11,
    headX + w * 0.05, headY - h * 0.13,
    headX - w * 0.01, headY - h * 0.11
  );

  // Top of head / crown
  ctx.bezierCurveTo(
    headX - w * 0.07, headY - h * 0.10,
    headX - w * 0.12, headY - h * 0.05,
    headX - w * 0.14, headY - h * 0.01 + tilt * h
  );

  // Forehead to brow
  ctx.bezierCurveTo(
    headX - w * 0.15, headY + h * 0.02 + tilt * h,
    headX - w * 0.16, headY + h * 0.05 + tilt * h,
    headX - w * 0.15, headY + h * 0.07 + tilt * h
  );

  // Nose bridge & tip
  ctx.lineTo(headX - w * 0.18, headY + h * 0.09 + tilt * h);
  ctx.lineTo(headX - w * 0.15, headY + h * 0.105 + tilt * h);

  // Upper & lower lips
  ctx.lineTo(headX - w * 0.16, headY + h * 0.12 + tilt * h);
  ctx.lineTo(headX - w * 0.145, headY + h * 0.13 + tilt * h);

  // Chin and jawline
  ctx.bezierCurveTo(
    headX - w * 0.155, headY + h * 0.15 + tilt * h,
    headX - w * 0.13, headY + h * 0.17 + tilt * h,
    headX - w * 0.08, headY + h * 0.175
  );

  // Throat and collarbone
  ctx.bezierCurveTo(
    headX - w * 0.07, headY + h * 0.20,
    headX - w * 0.09, headY + h * 0.23,
    headX - w * 0.12, headY + h * 0.26
  );

  // Left shoulder & draped saree pallu
  ctx.bezierCurveTo(
    headX - w * 0.22, headY + h * 0.30,
    headX - w * 0.28, headY + h * 0.38,
    headX - w * 0.30, headY + h * 0.46
  );

  // Forearm extending towards window sill
  ctx.bezierCurveTo(
    headX - w * 0.32, headY + h * 0.52,
    headX - w * 0.33, headY + h * 0.57,
    headX - w * 0.32, headY + h * 0.62
  );

  // Hand resting on sill
  ctx.lineTo(headX - w * 0.26, headY + h * 0.64);

  // Under forearm back to lap
  ctx.bezierCurveTo(
    headX - w * 0.22, headY + h * 0.58,
    headX - w * 0.15, headY + h * 0.56,
    headX - w * 0.08, headY + h * 0.60
  );

  // Seated lap / saree pleats down to bench
  ctx.bezierCurveTo(
    headX - w * 0.02, headY + h * 0.64,
    headX + w * 0.04, headY + h * 0.70,
    headX + w * 0.06, headY + h * 0.76
  );
  ctx.lineTo(headX + w * 0.32, headY + h * 0.76);

  // Seated back contour and seat cushion
  ctx.bezierCurveTo(
    headX + w * 0.30, headY + h * 0.65,
    headX + w * 0.26, headY + h * 0.50,
    headX + w * 0.23, headY + h * 0.40
  );

  // Upper back & shoulder curve leading back to neck
  ctx.bezierCurveTo(
    headX + w * 0.20, headY + h * 0.32,
    headX + w * 0.14, headY + h * 0.25,
    headX + w * 0.08, headY + h * 0.18
  );
  ctx.lineTo(headX + w * 0.04, headY + h * 0.12);

  ctx.closePath();
  ctx.fill();
}

/**
 * Draw anatomical standing man silhouette facing +x (right towards window).
 * Features:
 * - 1.75m standing posture, three-quarter profile
 * - Anatomical head, hair contour, jawline
 * - Structured collar & coat shoulder line
 * - Torso angled slightly towards window
 * - Legs in natural standing stance
 * - Pose A: steady gaze towards window
 * - Pose B: subtle shift in head tilt and torso angle
 */
function drawManSilhouette(ctx: CanvasRenderingContext2D, w: number, h: number, pose: SilhouettePose) {
  const isB = pose === "B";
  const tilt = isB ? -0.015 : 0.0;
  const torsoShift = isB ? w * 0.01 : 0;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();

  const headX = w * 0.44 + torsoShift;
  const headY = h * 0.11;

  // Start at back of neck / hair line
  ctx.moveTo(headX - w * 0.04, headY + h * 0.07);

  // Back of head / trimmed hair contour
  ctx.bezierCurveTo(
    headX - w * 0.10, headY + h * 0.05,
    headX - w * 0.12, headY - h * 0.01,
    headX - w * 0.09, headY - h * 0.05
  );

  // Crown of head
  ctx.bezierCurveTo(
    headX - w * 0.06, headY - h * 0.08,
    headX - w * 0.01, headY - h * 0.09,
    headX + w * 0.05, headY - h * 0.07 + tilt * h
  );

  // Forehead to brow (facing right / +x)
  ctx.bezierCurveTo(
    headX + w * 0.09, headY - h * 0.04 + tilt * h,
    headX + w * 0.11, headY - h * 0.01 + tilt * h,
    headX + w * 0.10, headY + h * 0.01 + tilt * h
  );

  // Nose bridge & tip
  ctx.lineTo(headX + w * 0.14, headY + h * 0.03 + tilt * h);
  ctx.lineTo(headX + w * 0.11, headY + h * 0.045 + tilt * h);

  // Lips & chin
  ctx.lineTo(headX + w * 0.12, headY + h * 0.06 + tilt * h);
  ctx.lineTo(headX + w * 0.105, headY + h * 0.07 + tilt * h);
  ctx.bezierCurveTo(
    headX + w * 0.12, headY + h * 0.09 + tilt * h,
    headX + w * 0.10, headY + h * 0.10 + tilt * h,
    headX + w * 0.06, headY + h * 0.105
  );

  // Jawline and throat
  ctx.lineTo(headX + w * 0.03, headY + h * 0.10);
  ctx.bezierCurveTo(
    headX + w * 0.03, headY + h * 0.12,
    headX + w * 0.05, headY + h * 0.13,
    headX + w * 0.08, headY + h * 0.14
  );

  // Coat collar & chest profile (facing window)
  ctx.bezierCurveTo(
    headX + w * 0.15, headY + h * 0.16,
    headX + w * 0.20, headY + h * 0.22,
    headX + w * 0.22, headY + h * 0.29
  );

  // Torso / front of jacket
  ctx.bezierCurveTo(
    headX + w * 0.23, headY + h * 0.35,
    headX + w * 0.21, headY + h * 0.42,
    headX + w * 0.19, headY + h * 0.49
  );

  // Lower jacket hem & front thigh
  ctx.bezierCurveTo(
    headX + w * 0.18, headY + h * 0.54,
    headX + w * 0.17, headY + h * 0.60,
    headX + w * 0.15, headY + h * 0.68
  );

  // Front leg down to shoe
  ctx.bezierCurveTo(
    headX + w * 0.14, headY + h * 0.74,
    headX + w * 0.13, headY + h * 0.81,
    headX + w * 0.11, headY + h * 0.87
  );
  ctx.lineTo(headX + w * 0.14, headY + h * 0.88); // shoe tip
  ctx.lineTo(headX + w * 0.06, headY + h * 0.885); // shoe sole
  ctx.lineTo(headX + w * 0.04, headY + h * 0.86);

  // Inseam between legs
  ctx.bezierCurveTo(
    headX + w * 0.06, headY + h * 0.78,
    headX + w * 0.04, headY + h * 0.70,
    headX + w * 0.01, headY + h * 0.62
  );

  // Rear leg down to heel
  ctx.bezierCurveTo(
    headX - w * 0.02, headY + h * 0.69,
    headX - w * 0.05, headY + h * 0.77,
    headX - w * 0.07, headY + h * 0.85
  );
  ctx.lineTo(headX - w * 0.04, headY + h * 0.875);
  ctx.lineTo(headX - w * 0.11, headY + h * 0.88);
  ctx.lineTo(headX - w * 0.12, headY + h * 0.85);

  // Back of trouser leg & posterior
  ctx.bezierCurveTo(
    headX - w * 0.11, headY + h * 0.76,
    headX - w * 0.09, headY + h * 0.67,
    headX - w * 0.09, headY + h * 0.58
  );

  // Jacket back / spine line
  ctx.bezierCurveTo(
    headX - w * 0.12, headY + h * 0.48,
    headX - w * 0.14, headY + h * 0.38,
    headX - w * 0.15, headY + h * 0.28
  );

  // Coat shoulder blade leading back up to collar/neck
  ctx.bezierCurveTo(
    headX - w * 0.14, headY + h * 0.20,
    headX - w * 0.10, headY + h * 0.13,
    headX - w * 0.04, headY + h * 0.07
  );

  ctx.closePath();
  ctx.fill();
}

const textureCache = new Map<string, THREE.DataTexture>();

/**
 * Generates a 512x512 Euclidean Signed Distance Field DataTexture.
 * Returns null during SSR, and caches textures for the session.
 */
export function getSilhouetteSdfTexture(kind: SilhouetteKind, pose: SilhouettePose): THREE.DataTexture | null {
  if (typeof document === "undefined") return null;

  const cacheKey = `${kind}_${pose}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const size = 512;
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

  const spread = 20.0; // Distance transition band in pixels
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
