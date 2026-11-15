// src/gl/grade/useGradeLut.ts
"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

/**
 * Loads a 2D LUT strip (scripts/make-heritage-lut.mjs layout: width = size², height = size,
 * x = b·size + r, y = g) into a Data3DTexture sampled in display (sRGB-encoded) space.
 * No colour-space conversion: the strip already stores display values.
 */

const cache = new Map<string, Promise<THREE.Data3DTexture>>();
const resolved = new Map<string, THREE.Data3DTexture>();

export function createIdentityLut(size: number): THREE.Data3DTexture {
  const data = new Uint8Array(size * size * size * 4);
  for (let b = 0; b < size; b++)
    for (let g = 0; g < size; g++)
      for (let r = 0; r < size; r++) {
        const i = (r + g * size + b * size * size) * 4;
        data[i] = Math.round((r / (size - 1)) * 255);
        data[i + 1] = Math.round((g / (size - 1)) * 255);
        data[i + 2] = Math.round((b / (size - 1)) * 255);
        data[i + 3] = 255;
      }
  return finishLut(data, size, "identity");
}

/** Pure strip → 3D reorder, exported for tests. */
export function stripToVolume(strip: Uint8ClampedArray | Uint8Array, size: number): Uint8Array {
  const width = size * size;
  const out = new Uint8Array(size * size * size * 4);
  for (let b = 0; b < size; b++)
    for (let g = 0; g < size; g++)
      for (let r = 0; r < size; r++) {
        const src = (g * width + b * size + r) * 4;
        const dst = (r + g * size + b * size * size) * 4;
        out[dst] = strip[src];
        out[dst + 1] = strip[src + 1];
        out[dst + 2] = strip[src + 2];
        out[dst + 3] = 255;
      }
  return out;
}

function finishLut(data: Uint8Array, size: number, name: string) {
  const tex = new THREE.Data3DTexture(data, size, size, size);
  tex.name = name;
  tex.format = THREE.RGBAFormat;
  tex.type = THREE.UnsignedByteType;
  tex.colorSpace = THREE.NoColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = tex.wrapR = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = false;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  return tex;
}

async function loadStrip(url: string, size: number): Promise<THREE.Data3DTexture> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bitmap = await createImageBitmap(await res.blob(), {
      colorSpaceConversion: "none",
      premultiplyAlpha: "none",
    });
    if (bitmap.width !== size * size || bitmap.height !== size) {
      throw new Error(`unexpected strip ${bitmap.width}×${bitmap.height} for size ${size}`);
    }
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("2D context unavailable");
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return finishLut(stripToVolume(data, size), size, url);
  } catch (err) {
    console.warn("[useGradeLut] LUT load failed, using identity:", err);
    return createIdentityLut(size);
  }
}

export function loadGradeLut(url: string, size: number): Promise<THREE.Data3DTexture> {
  const key = `${url}#${size}`;
  let pending = cache.get(key);
  if (!pending) {
    pending = loadStrip(url, size).then((tex) => {
      resolved.set(key, tex);
      return tex;
    });
    cache.set(key, pending);
  }
  return pending;
}

/** Returns the LUT once loaded (null on the first frames). Shared across heroes; never disposed. */
export function useGradeLut(url: string, size: number, enabled = true): THREE.Data3DTexture | null {
  const key = `${url}#${size}`;
  const [lut, setLut] = useState<THREE.Data3DTexture | null>(() => resolved.get(key) ?? null);

  useEffect(() => {
    if (!enabled || resolved.has(key)) return;
    let active = true;
    loadGradeLut(url, size).then((tex) => {
      if (active) setLut(tex);
    });
    return () => {
      active = false;
    };
  }, [enabled, key, url, size]);

  return enabled ? (lut ?? resolved.get(key) ?? null) : null;
}
