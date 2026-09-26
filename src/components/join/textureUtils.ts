"use client";

import * as THREE from "three";

/**
 * Creates a procedural high-resolution collegiate brick texture
 * with color variation per brick, rough clay grain, and recessed mortar joints.
 */
export function createBrickTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 1. Mortar base
  ctx.fillStyle = "#2c221e";
  ctx.fillRect(0, 0, 512, 512);

  // 2. Brick parameters
  const rows = 16;
  const cols = 8;
  const brickHeight = 512 / rows;
  const brickWidth = 512 / cols;
  const mortar = 4;

  const brickTints = [
    "#6b2318",
    "#591d14",
    "#73271b",
    "#4e1a12",
    "#642117",
    "#561c13",
    "#70251a",
  ];

  for (let r = 0; r < rows; r++) {
    const isStaggered = r % 2 === 1;
    const xOffset = isStaggered ? -brickWidth / 2 : 0;

    for (let c = -1; c <= cols + 1; c++) {
      const bx = c * brickWidth + xOffset + mortar / 2;
      const by = r * brickHeight + mortar / 2;
      const bw = brickWidth - mortar;
      const bh = brickHeight - mortar;

      // Pick pseudo-random color tint
      const tintIndex = (r * 13 + c * 7 + (r ^ c)) % brickTints.length;
      ctx.fillStyle = brickTints[Math.abs(tintIndex)];
      ctx.fillRect(bx, by, bw, bh);

      // Subtle edge bevel shading
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.fillRect(bx, by + bh - 2, bw, 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(bx, by, bw, 2);
    }
  }

  // 3. High-frequency clay surface noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 28;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.7));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.6));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a procedural limestone bump texture with fine chiseled mineral grain.
 */
export function createStoneBumpTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 48;
    const val = Math.min(255, Math.max(0, 128 + noise));
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/**
 * Creates a subtle hammered metal bump texture for the wrought iron gate rails.
 */
export function createIronBumpTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 26;
    const val = Math.min(255, Math.max(0, 128 + noise));
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}
