// src/engine/heroScrollStore.ts
/**
 * Direct mutable reference for zero-overhead hot loop access in R3F useFrame (§1).
 * Passing scroll progress through this container completely prevents React re-renders.
 */
export const heroScrollProgress = {
  current: 0,
};

export function setHeroScrollProgress(progress: number) {
  heroScrollProgress.current = progress;
}

/**
 * Hot-loop state for Director HUD real-time diagnostic overrides (§6.1, §6.3).
 * Enables manual scrubbing, dot isolation, and pulse speed tuning without React reconciliation.
 */
export const heroDirectorState = {
  scrubActive: false,
  scrubProgress: 0,
  dotsVisible: true,
  speedMultiplier: 1.0,
};

export function setHeroDirectorScrub(active: boolean, progress?: number) {
  heroDirectorState.scrubActive = active;
  if (typeof progress === "number") {
    heroDirectorState.scrubProgress = Math.max(0, Math.min(1, progress));
  }
}

export function setHeroDirectorDotsVisible(visible: boolean) {
  heroDirectorState.dotsVisible = visible;
}

export function setHeroDirectorSpeed(multiplier: number) {
  heroDirectorState.speedMultiplier = Math.max(0.1, Math.min(5.0, multiplier));
}
