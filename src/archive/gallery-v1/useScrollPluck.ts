"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGalleryHeroStore } from "@/store/galleryHeroStore";

interface ScrollPluckConfig {
  velocityToAmplitude?: number;
  maxAmplitude?: number;
  dampingLambda?: number;
}

const DEFAULT_CONFIG: Required<ScrollPluckConfig> = {
  velocityToAmplitude: 0.045,
  maxAmplitude: 0.26,
  dampingLambda: 6.0,
};

/**
 * §8: Scroll-Velocity Binding (Corrected)
 * - Smooths raw Lenis instantaneous velocity via lerp (0.15 factor).
 * - Computes target amplitude bounded by maxAmplitude.
 * - Uses THREE.MathUtils.damp for frame-rate independent exponential decay.
 * - Synchronizes with galleryHeroStore for HUD diagnostics and event dispatch.
 */
export function useScrollPluck(config: ScrollPluckConfig = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const smoothedVelocity = useRef(0);
  const currentAmplitude = useRef(0);
  const lastScrollY = useRef(0);

  useFrame((_, delta) => {
    // 1. Acquire scroll velocity (Lenis preferred, with scrollY fallback)
    let rawVelocity = 0;
    if (typeof window !== "undefined") {
      if (window.__lenis) {
        rawVelocity = window.__lenis.velocity;
      } else {
        const curY = window.scrollY;
        const dt = Math.max(0.001, delta);
        rawVelocity = ((curY - lastScrollY.current) / dt) * 0.01;
        lastScrollY.current = curY;
      }
    }

    // 2. Smooth raw velocity to eliminate frame-to-frame derivative jitter
    smoothedVelocity.current = THREE.MathUtils.lerp(
      smoothedVelocity.current,
      rawVelocity,
      0.15
    );

    // 3. Compute target amplitude from smoothed velocity
    const targetAmplitude = Math.min(
      Math.abs(smoothedVelocity.current) * cfg.velocityToAmplitude,
      cfg.maxAmplitude
    );

    // 4. Exponential frame-rate independent damping toward target (§8)
    currentAmplitude.current = THREE.MathUtils.damp(
      currentAmplitude.current,
      targetAmplitude,
      cfg.dampingLambda,
      delta
    );

    // 5. Update state in store for HUD & reactive components
    const store = useGalleryHeroStore.getState();
    store.setSmoothedVelocity(smoothedVelocity.current);
    store.setCurrentAmplitude(currentAmplitude.current);
    store.setIsPlucking(currentAmplitude.current > 0.08);
  });

  return currentAmplitude;
}
