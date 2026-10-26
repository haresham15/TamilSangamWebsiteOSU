import * as THREE from "three";

interface CachedTexture {
  texture: THREE.DataTexture;
  refCount: number;
}

const textureCache = new Map<string, CachedTexture>();

/**
 * Procedural PBR Texture Factory
 * Generates memoized, reference-counted, power-of-two DataTextures for PBR pipelines.
 * All normal, roughness, and AO maps use LinearSRGBColorSpace.
 */
export const proceduralPbrMaps = {
  /**
   * Generates a 2D brushed metal micro-roughness/normal map.
   * LinearSRGBColorSpace.
   */
  getBrushedMetalNormal(
    key = "brushed-metal-512",
    width = 256,
    height = 256
  ): THREE.DataTexture {
    const cached = textureCache.get(key);
    if (cached) {
      cached.refCount++;
      return cached.texture;
    }

    const size = width * height;
    const data = new Uint8Array(size * 4);

    let seed = 12345;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Generate directional streak noise along X axis
    const noiseRow = new Float32Array(width);
    for (let x = 0; x < width; x++) {
      noiseRow[x] = (rand() - 0.5) * 0.4;
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const microStreak = noiseRow[x] + (rand() - 0.5) * 0.15;

        // Perturb normal along Y axis (tangent to brushed X grooves)
        const nx = 0.5;
        const ny = Math.min(1.0, Math.max(0.0, 0.5 + microStreak * 0.35));
        const nz = 1.0;

        data[idx] = Math.round(nx * 255);
        data[idx + 1] = Math.round(ny * 255);
        data[idx + 2] = Math.round(nz * 255);
        data[idx + 3] = 255;
      }
    }

    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    texture.colorSpace = THREE.LinearSRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    textureCache.set(key, { texture, refCount: 1 });
    return texture;
  },

  /**
   * Generates a fine multi-octave micro-roughness map with min/max roughness clamps.
   * LinearSRGBColorSpace.
   */
  getNoiseRoughness(
    key = "noise-roughness-256",
    width = 256,
    height = 256,
    minRoughness = 0.10,
    maxRoughness = 0.22
  ): THREE.DataTexture {
    const cached = textureCache.get(key);
    if (cached) {
      cached.refCount++;
      return cached.texture;
    }

    const size = width * height;
    const data = new Uint8Array(size * 4);

    let seed = 54321;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let i = 0; i < size; i++) {
      const idx = i * 4;
      const noise = rand();
      const rough = minRoughness + noise * (maxRoughness - minRoughness);
      const val = Math.round(rough * 255);

      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }

    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    texture.colorSpace = THREE.LinearSRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    textureCache.set(key, { texture, refCount: 1 });
    return texture;
  },

  /**
   * Generates a stone / granite chiseled normal map with Sobel edge relief.
   */
  getGraniteNormal(
    key = "granite-normal-256",
    width = 256,
    height = 256
  ): THREE.DataTexture {
    const cached = textureCache.get(key);
    if (cached) {
      cached.refCount++;
      return cached.texture;
    }

    const heightMap = new Float32Array(width * height);
    let seed = 98765;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Multi-frequency cellular / granite noise
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const val = rand() * 0.5 + Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.25;
        heightMap[y * width + x] = val;
      }
    }

    const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const xL = (x - 1 + width) % width;
        const xR = (x + 1) % width;
        const yU = (y - 1 + height) % height;
        const yD = (y + 1) % height;

        const dX = (heightMap[y * width + xR] - heightMap[y * width + xL]) * 2.0;
        const dY = (heightMap[yD * width + x] - heightMap[yU * width + x]) * 2.0;

        const v = new THREE.Vector3(-dX, -dY, 1.0).normalize();
        const idx = (y * width + x) * 4;

        data[idx] = Math.round(((v.x + 1) / 2) * 255);
        data[idx + 1] = Math.round(((v.y + 1) / 2) * 255);
        data[idx + 2] = Math.round(((v.z + 1) / 2) * 255);
        data[idx + 3] = 255;
      }
    }

    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    texture.colorSpace = THREE.LinearSRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    textureCache.set(key, { texture, refCount: 1 });
    return texture;
  },

  /**
   * Reference-counted texture release. Disposes GPU texture when refCount hits 0.
   */
  release(key: string) {
    const cached = textureCache.get(key);
    if (!cached) return;
    cached.refCount--;
    if (cached.refCount <= 0) {
      cached.texture.dispose();
      textureCache.delete(key);
    }
  },

  /**
   * Disposes all cached procedural textures in the factory.
   */
  disposeAll() {
    textureCache.forEach((item) => {
      item.texture.dispose();
    });
    textureCache.clear();
  },
};
