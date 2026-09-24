"use client";

import * as THREE from "three";
import { debugStore, TextureStatus } from "./debugState";

let cachedCheckerTexture: THREE.CanvasTexture | null = null;

/**
 * Creates a bright magenta (#FF00FF) / black 8x8 checkerboard texture.
 * Ensures any asset loading failure renders visibly broken rather than silently black.
 */
export function getMagentaCheckerTexture(): THREE.CanvasTexture {
  if (cachedCheckerTexture) return cachedCheckerTexture;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const numChecks = 8;
    const checkSize = size / numChecks;
    for (let y = 0; y < numChecks; y++) {
      for (let x = 0; x < numChecks; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? "#FF00FF" : "#1A001A";
        ctx.fillRect(x * checkSize, y * checkSize, checkSize, checkSize);
      }
    }
    // Draw diagonal cross alert
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, size, size);
  }

  cachedCheckerTexture = new THREE.CanvasTexture(canvas);
  cachedCheckerTexture.colorSpace = THREE.SRGBColorSpace;
  cachedCheckerTexture.magFilter = THREE.NearestFilter;
  cachedCheckerTexture.minFilter = THREE.NearestFilter;
  cachedCheckerTexture.wrapS = THREE.RepeatWrapping;
  cachedCheckerTexture.wrapT = THREE.RepeatWrapping;
  return cachedCheckerTexture;
}

/**
 * Safely loads a texture, updating the DebugStore and swapping to magenta checker if it fails.
 */
export function loadTextureWithFallback(
  path: string,
  key: keyof TextureStatus,
  onLoaded?: (tex: THREE.Texture) => void
): THREE.Texture {
  if (typeof window === "undefined") {
    return new THREE.Texture();
  }

  const loader = new THREE.TextureLoader();
  const fallback = getMagentaCheckerTexture();

  // Create an initial texture that gets populated when loaded
  const texture = loader.load(
    path,
    (loadedTex) => {
      loadedTex.colorSpace = THREE.SRGBColorSpace;
      debugStore.setTextureLoaded(key, true);
      onLoaded?.(loadedTex);
    },
    undefined,
    (err) => {
      console.error(`[TextureLoader] Failed to load "${path}" for [${key}]. Fallback to magenta checker.`, err);
      debugStore.setTextureLoaded(key, false);
      // Copy image data from fallback checker
      (texture as unknown as { image: HTMLCanvasElement }).image = fallback.image;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.needsUpdate = true;
    }
  );

  return texture;
}
