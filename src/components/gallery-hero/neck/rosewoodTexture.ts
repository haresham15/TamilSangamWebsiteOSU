import * as THREE from "three";

/**
 * Generates an organic 2048x512 procedural rosewood grain texture.
 * Uses stretched multi-octave noise along the neck axis (X/U) with pores and wood rings.
 * Base color: #2A1710, Rich streaks: #4A2A1B, subtle golden-amber pores: #6E3B20.
 */
let cachedRosewoodTexture: THREE.CanvasTexture | null = null;

export function getRosewoodTexture(): THREE.CanvasTexture {
  if (cachedRosewoodTexture) return cachedRosewoodTexture;

  if (typeof document === "undefined") {
    // SSR Fallback
    const canvas = {} as HTMLCanvasElement;
    return new THREE.CanvasTexture(canvas);
  }

  const width = 2048;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // 1. Base dark rosewood gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#22120c");
  bgGrad.addColorStop(0.5, "#2a1710");
  bgGrad.addColorStop(1, "#1c0d08");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Procedural wood grain ribbons (stretched along X axis)
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Simple deterministic pseudorandom function
  const rand = (x: number, y: number) => {
    const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return s - Math.floor(s);
  };

  for (let y = 0; y < height; y++) {
    // Layered sine wave grain frequency
    const grainWarp =
      Math.sin(y * 0.08) * 4.0 +
      Math.sin(y * 0.22) * 2.5 +
      Math.sin(y * 0.02) * 12.0;

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Elongated grain coordinate
      const grainU = x * 0.003 + y * 0.04 + grainWarp * 0.08;
      const grainFactor = (Math.sin(grainU * 6.28) + 1.0) * 0.5;

      // Micro pore noise
      const pore = rand(Math.floor(x * 0.25), y) > 0.94 ? 0.35 : 0.0;

      // Base Rosewood: #2A1710 (RGB: 42, 23, 16)
      // Dark Streaks:  #4A2A1B (RGB: 74, 42, 27)
      // Light Pores:   #6E3B20 (RGB: 110, 59, 32)
      const r = 42 + grainFactor * 32 + pore * 36;
      const g = 23 + grainFactor * 19 + pore * 17;
      const b = 16 + grainFactor * 11 + pore * 8;

      data[idx] = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 16;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  cachedRosewoodTexture = texture;
  return texture;
}
