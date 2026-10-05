// src/gl/grade/useGradeLut.ts
"use client";

import { useState, useEffect } from "react";
import * as THREE from "three";
import { LookupTexture } from "postprocessing";
import { gradeConfig } from "./gradeConfig";

let cachedLut: LookupTexture | null = null;
let pendingPromise: Promise<LookupTexture> | null = null;

function loadLutStrip(url: string): Promise<LookupTexture> {
  if (cachedLut) {
    return Promise.resolve(cachedLut);
  }
  if (pendingPromise) {
    return pendingPromise;
  }

  pendingPromise = new Promise<LookupTexture>((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (texture) => {
        try {
          const lut = LookupTexture.from(texture);
          lut.name = "heritage-33";
          cachedLut = lut;
          resolve(lut);
        } catch (err) {
          console.warn("[useGradeLut] Failed to parse 2D strip, falling back to neutral identity:", err);
          const fallback = LookupTexture.createNeutral(gradeConfig.lutSize);
          cachedLut = fallback;
          resolve(fallback);
        }
      },
      undefined,
      (err) => {
        console.warn("[useGradeLut] Failed to load LUT texture file, falling back to neutral identity:", err);
        const fallback = LookupTexture.createNeutral(gradeConfig.lutSize);
        cachedLut = fallback;
        resolve(fallback);
      }
    );
  });

  return pendingPromise;
}

/**
 * useGradeLut hook (§3.3)
 * Asynchronously loads and caches the 33^3 LookupTexture.
 * Returns null during the initial fetch frame, or the resolved LookupTexture.
 */
export function useGradeLut(): LookupTexture | null {
  const [lut, setLut] = useState<LookupTexture | null>(() => cachedLut);

  useEffect(() => {
    if (cachedLut) {
      return;
    }
    let active = true;
    loadLutStrip(gradeConfig.lutPath).then((resolved) => {
      if (active) {
        setLut(resolved);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return lut;
}
