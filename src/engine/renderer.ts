// src/engine/renderer.ts
import type * as THREE from "three";

/**
 * Master Renderer Registry (§3.1, §4.2)
 * Holds reference to the primary WebGLRenderer and R3F advance() function.
 */

type AdvanceFn = (timestamp: number, runGlobalEffects?: boolean) => void;

let currentGl: THREE.WebGLRenderer | null = null;
let currentAdvance: AdvanceFn | null = null;
let currentClock: THREE.Clock | null = null;

export function registerRenderer(gl: THREE.WebGLRenderer, advance: AdvanceFn, clock?: THREE.Clock) {
  currentGl = gl;
  currentAdvance = advance;
  currentClock = clock ?? null;
  if (typeof window !== "undefined") {
    (window as unknown as { __r3fRenderer?: THREE.WebGLRenderer }).__r3fRenderer = gl;
  }
}

export function unregisterRenderer() {
  currentGl = null;
  currentAdvance = null;
  currentClock = null;
  if (typeof window !== "undefined") {
    delete (window as unknown as { __r3fRenderer?: THREE.WebGLRenderer }).__r3fRenderer;
  }
}

export function getRenderer(): THREE.WebGLRenderer | null {
  return currentGl;
}

export function getRendererClock(): THREE.Clock | null {
  return currentClock;
}

export function rendererAdvance(timestamp: number, runGlobalEffects = true) {
  if (currentAdvance) {
    currentAdvance(timestamp, runGlobalEffects);
  }
}
