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
 * - South Indian low hair bun (kondai) with mallipoo contour and loose wisps
 * - Natural feminine forehead, delicate nose bridge, soft lips, rounded chin, graceful jawline
 * - Draped saree shoulder and forearm resting near window sill
 * - Pose A: looking straight forward; Pose B: gentle downward glance (-3.5°)
 */
function drawWomanSilhouette(ctx: CanvasRenderingContext2D, w: number, h: number, pose: SilhouettePose) {
  const isB = pose === "B";
  const tilt = isB ? 0.03 : 0.0;
  const headYOffset = isB ? h * 0.015 : 0;

  // Work in normalized coordinates scaled by w and h (nominally 1024x1024)
  const sx = w / 1024;
  const sy = h / 1024;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();

  // Head center (560, 290)
  const cx = 560 * sx;
  const cy = (290 + headYOffset / sy) * sy;

  // Start at back of neck/nape (595, 430)
  ctx.moveTo(595 * sx, (430 + tilt * 100) * sy);

  // Hair bun (kondai) at nape: center ~ (715, 365, r=58) with mallipoo flower strand contour
  ctx.bezierCurveTo(
    650 * sx, (445 + tilt * 100) * sy,
    720 * sx, (435 + tilt * 80) * sy,
    760 * sx, (390 + tilt * 60) * sy
  );
  // Mallipoo flower bulge on bun
  ctx.bezierCurveTo(
    780 * sx, (365 + tilt * 50) * sy,
    775 * sx, (330 + tilt * 40) * sy,
    740 * sx, (320 + tilt * 30) * sy
  );
  // Transition from bun into crown volume
  ctx.bezierCurveTo(
    710 * sx, (280 + tilt * 20) * sy,
    675 * sx, (210 + tilt * 10) * sy,
    610 * sx, (175 + tilt * 5) * sy
  );

  // Crown of head and forehead dome
  ctx.bezierCurveTo(
    540 * sx, 150 * sy,
    480 * sx, 180 * sy,
    445 * sx, (245 + tilt * 20) * sy
  );

  // Delicate forehead transitioning into nose bridge
  ctx.bezierCurveTo(
    432 * sx, (270 + tilt * 30) * sy,
    428 * sx, (295 + tilt * 40) * sy,
    430 * sx, (308 + tilt * 45) * sy
  );

  // Feminine nose bridge and tip (x=412, y=318)
  ctx.lineTo(412 * sx, (318 + tilt * 50) * sy);
  ctx.lineTo(422 * sx, (332 + tilt * 55) * sy);

  // Philtrum, soft upper and lower lips (x=424, y=348-362)
  ctx.lineTo(418 * sx, (348 + tilt * 60) * sy);
  ctx.lineTo(426 * sx, (356 + tilt * 62) * sy);
  ctx.lineTo(422 * sx, (364 + tilt * 65) * sy);

  // Softly rounded chin (x=432, y=385)
  ctx.bezierCurveTo(
    422 * sx, (375 + tilt * 70) * sy,
    428 * sx, (386 + tilt * 75) * sy,
    436 * sx, (388 + tilt * 75) * sy
  );

  // Graceful jawline sweeping back to throat and collarbone
  ctx.bezierCurveTo(
    470 * sx, (405 + tilt * 80) * sy,
    515 * sx, (420 + tilt * 85) * sy,
    525 * sx, (455 + tilt * 90) * sy
  );

  // Throat down to collarbone and draped saree shoulder
  ctx.bezierCurveTo(
    510 * sx, 490 * sy,
    450 * sx, 530 * sy,
    410 * sx, 580 * sy
  );

  // Saree pallu draped over shoulder and upper arm
  ctx.bezierCurveTo(
    380 * sx, 620 * sy,
    360 * sx, 680 * sy,
    350 * sx, 740 * sy
  );

  // Left forearm angled forward toward window sill
  ctx.bezierCurveTo(
    340 * sx, 790 * sy,
    335 * sx, 860 * sy,
    340 * sx, 950 * sy
  );
  ctx.lineTo(345 * sx, h);

  // Bottom edge flush crop (resting on sill)
  ctx.lineTo(w, h);

  // Back of torso and saree pleats rising to upper back
  ctx.bezierCurveTo(
    880 * sx, 900 * sy,
    820 * sx, 760 * sy,
    760 * sx, 640 * sy
  );
  ctx.bezierCurveTo(
    710 * sx, 540 * sy,
    650 * sx, 470 * sy,
    595 * sx, (430 + tilt * 100) * sy
  );

  ctx.closePath();
  ctx.fill();
}

/**
 * Draw anatomical standing man silhouette facing +x (right towards window).
 * Features:
 * - Natural 3/4 back-and-side profile posture
 * - Layered, collegiate tousled hair volume at crown
 * - Defined brow, straight nose bridge, lips, clean jawline
 * - Structured jacket / popped shirt collar, natural broad shoulder line
 * - Distinct upper-arm and torso contours (NO flat cone or cape!)
 * - Pose A: direct gaze; Pose B: subtle contemplative weight shift
 */
function drawManSilhouette(ctx: CanvasRenderingContext2D, w: number, h: number, pose: SilhouettePose) {
  const isB = pose === "B";
  const tilt = isB ? -0.02 : 0.0;
  const torsoShift = isB ? w * 0.015 : 0;

  const sx = w / 1024;
  const sy = h / 1024;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();

  // Head center (470, 250)
  const hx = 470 * sx + torsoShift;
  const hy = 250 * sy;

  // Start at nape of neck below hair (440, 340)
  ctx.moveTo(hx - 30 * sx, (340 + tilt * 50) * sy);

  // Back of head with natural tousled hair volume
  ctx.bezierCurveTo(
    hx - 110 * sx, (325 + tilt * 40) * sy,
    hx - 135 * sx, (270 + tilt * 20) * sy,
    hx - 120 * sx, (210 + tilt * 10) * sy
  );
  ctx.bezierCurveTo(
    hx - 105 * sx, (150 + tilt * 5) * sy,
    hx - 40 * sx, 120 * sy,
    hx + 30 * sx, (135 + tilt * 5) * sy
  );

  // Crown texture and forehead slope
  ctx.bezierCurveTo(
    hx + 90 * sx, (155 + tilt * 10) * sy,
    hx + 115 * sx, (190 + tilt * 15) * sy,
    hx + 112 * sx, (228 + tilt * 20) * sy
  );

  // Defined masculine brow (x = 582)
  ctx.lineTo((582 * sx + torsoShift), (228 + tilt * 20) * sy);

  // Straight nose bridge and tip (x = 604, y = 268)
  ctx.lineTo((604 * sx + torsoShift), (268 + tilt * 25) * sy);
  ctx.lineTo((592 * sx + torsoShift), (280 + tilt * 28) * sy);

  // Subtle masculine lips (x = 596, y = 295)
  ctx.lineTo((596 * sx + torsoShift), (295 + tilt * 30) * sy);
  ctx.lineTo((588 * sx + torsoShift), (308 + tilt * 32) * sy);

  // Clean jawline (x = 588, y = 335)
  ctx.bezierCurveTo(
    (590 * sx + torsoShift), (322 + tilt * 35) * sy,
    (588 * sx + torsoShift), (335 + tilt * 38) * sy,
    (565 * sx + torsoShift), (348 + tilt * 40) * sy
  );

  // Throat leading into structured popped shirt/jacket collar
  ctx.lineTo((545 * sx + torsoShift), (365 + tilt * 42) * sy);

  // Popped collar front peak (x = 620, y = 390)
  ctx.lineTo((620 * sx + torsoShift), 390 * sy);
  ctx.lineTo((585 * sx + torsoShift), 425 * sy);

  // Front chest / lapel line angled toward window
  ctx.bezierCurveTo(
    (630 * sx + torsoShift), 465 * sy,
    (655 * sx + torsoShift), 540 * sy,
    (670 * sx + torsoShift), 630 * sy
  );
  // Right upper arm and jacket side contour
  ctx.bezierCurveTo(
    (685 * sx + torsoShift), 720 * sy,
    (690 * sx + torsoShift), 830 * sy,
    (695 * sx + torsoShift), h
  );

  // Bottom edge crop
  ctx.lineTo(120 * sx, h);

  // Left hip and jacket hem contour
  ctx.bezierCurveTo(
    140 * sx, 860 * sy,
    160 * sx, 740 * sy,
    180 * sx, 640 * sy
  );

  // Left arm and broad shoulder contour (left shoulder at x = 240, y = 475)
  ctx.bezierCurveTo(
    200 * sx, 560 * sy,
    220 * sx, 495 * sy,
    260 * sx, 465 * sy
  );

  // Back shoulder seam up to rear jacket collar
  ctx.bezierCurveTo(
    320 * sx, 425 * sy,
    380 * sx, 385 * sy,
    hx - 30 * sx, (340 + tilt * 50) * sy
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
