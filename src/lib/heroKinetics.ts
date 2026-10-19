/**
 * src/lib/heroKinetics.ts
 * High-performance, zero-allocation kinetic physics helper for AWWWARDS SOTD hero choreography.
 * Calculates critically damped scroll progress, scroll velocity inertia, and pointer parallax.
 */
import * as THREE from "three";
import { useState } from "react";

export interface HeroKineticsState {
  rawProgress: number;
  smoothProgress: number;
  smoothVelocity: number;
  smoothPointerX: number;
  smoothPointerY: number;
  velocityPitch: number;
  velocityBank: number;
}

export interface HeroKineticsTracker {
  update: (rawProgress: number, pointer?: { x: number; y: number }, delta?: number) => HeroKineticsState;
  getState: () => HeroKineticsState;
  reset: (initialProgress?: number) => void;
}

/**
 * Creates a zero-allocation kinetic tracker instance for use inside useFrame or master animation loops.
 * @param progressLambda Smoothing lambda for scroll progress (default 7.5)
 * @param velocityLambda Smoothing lambda for velocity dissipation (default 5.0)
 * @param pointerLambda Smoothing lambda for cursor parallax (default 4.0)
 */
export function createHeroKineticsTracker(
  progressLambda = 7.5,
  velocityLambda = 5.0,
  pointerLambda = 4.0
): HeroKineticsTracker {
  let rawP = 0;
  let smoothP = 0;
  let smoothVel = 0;
  let smoothPtrX = 0;
  let smoothPtrY = 0;
  let vPitch = 0;
  let vBank = 0;

  const state: HeroKineticsState = {
    rawProgress: 0,
    smoothProgress: 0,
    smoothVelocity: 0,
    smoothPointerX: 0,
    smoothPointerY: 0,
    velocityPitch: 0,
    velocityBank: 0,
  };

  return {
    update(rawProgress: number, pointer?: { x: number; y: number }, delta = 0.016) {
      const dt = Math.min(delta, 0.05);
      rawP = rawProgress;

      const prevSmooth = smoothP;
      smoothP = THREE.MathUtils.damp(smoothP, rawP, progressLambda, dt);

      // Instantaneous normalized scroll velocity (-1.5 to +1.5)
      const instVel = THREE.MathUtils.clamp((smoothP - prevSmooth) / Math.max(dt, 0.001), -1.5, 1.5);
      smoothVel = THREE.MathUtils.damp(smoothVel, instVel, velocityLambda, dt);

      // Pointer parallax damping
      if (pointer) {
        smoothPtrX = THREE.MathUtils.damp(smoothPtrX, pointer.x, pointerLambda, dt);
        smoothPtrY = THREE.MathUtils.damp(smoothPtrY, pointer.y, pointerLambda, dt);
      }

      vPitch = smoothVel * 0.04;
      vBank = smoothVel * 0.045;

      state.rawProgress = rawP;
      state.smoothProgress = smoothP;
      state.smoothVelocity = smoothVel;
      state.smoothPointerX = smoothPtrX;
      state.smoothPointerY = smoothPtrY;
      state.velocityPitch = vPitch;
      state.velocityBank = vBank;

      return state;
    },
    getState() {
      return state;
    },
    reset(initialProgress = 0) {
      rawP = initialProgress;
      smoothP = initialProgress;
      smoothVel = 0;
      smoothPtrX = 0;
      smoothPtrY = 0;
      vPitch = 0;
      vBank = 0;
      state.rawProgress = initialProgress;
      state.smoothProgress = initialProgress;
      state.smoothVelocity = 0;
      state.smoothPointerX = 0;
      state.smoothPointerY = 0;
      state.velocityPitch = 0;
      state.velocityBank = 0;
    },
  };
}

/**
 * React hook wrapper providing a persistent zero-allocation kinetics tracker.
 */
export function useHeroKinetics(initialProgress = 0, progressLambda = 7.5, velocityLambda = 5.0) {
  const [tracker] = useState(() => {
    const instance = createHeroKineticsTracker(progressLambda, velocityLambda);
    instance.reset(initialProgress);
    return instance;
  });
  return tracker;
}
