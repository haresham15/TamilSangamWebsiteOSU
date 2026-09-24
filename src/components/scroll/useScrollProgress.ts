// src/components/scroll/useScrollProgress.ts
/**
 * Single source of truth for pinned scroll progress (0 -> 1).
 * Read directly via ref inside Three.js useFrame without triggering
 * React reconciliation at 60fps.
 */
export interface ScrollProgressStore {
  current: number;
}

export const scrollProgressStore: ScrollProgressStore = {
  current: 0,
};

export function setScrollProgress(val: number): void {
  scrollProgressStore.current = Math.max(0, Math.min(1, val));
}

export function getScrollProgress(): number {
  return scrollProgressStore.current;
}

export function useScrollProgress(): ScrollProgressStore {
  return scrollProgressStore;
}
