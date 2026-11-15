// src/engine/renderer.ts
import type * as THREE from "three";
import { probeFrame } from "./perfProbe";

/**
 * Master Renderer Registry (§3.1, §4.2)
 * Holds reference to the primary WebGLRenderer and R3F advance() function.
 */

type AdvanceFn = (timestamp: number, runGlobalEffects?: boolean) => void;

let currentGl: THREE.WebGLRenderer | null = null;
let currentAdvance: AdvanceFn | null = null;
let currentClock: THREE.Clock | null = null;
const visibleScenes = new Set<string>();
const rendererListeners = new Set<() => void>();

/** Notifies when the shared renderer registers/unregisters (canvas mounts after LCP). */
export function subscribeRenderer(listener: () => void) {
  rendererListeners.add(listener);
  return () => {
    rendererListeners.delete(listener);
  };
}

export function setSceneVisible(key: string, visible: boolean) {
  if (visible) visibleScenes.add(key);
  else visibleScenes.delete(key);
  if (currentGl) currentGl.domElement.style.visibility = visibleScenes.size ? "visible" : "hidden";
}

export function registerRenderer(gl: THREE.WebGLRenderer, advance: AdvanceFn, clock?: THREE.Clock) {
  currentGl = gl;
  currentAdvance = advance;
  currentClock = clock ?? null;
  gl.domElement.style.visibility = visibleScenes.size ? "visible" : "hidden";
  if (typeof window !== "undefined") {
    (window as unknown as { __r3fRenderer?: THREE.WebGLRenderer }).__r3fRenderer = gl;
  }
  rendererListeners.forEach((l) => l());
}

export function unregisterRenderer() {
  currentGl = null;
  currentAdvance = null;
  currentClock = null;
  if (typeof window !== "undefined") {
    delete (window as unknown as { __r3fRenderer?: THREE.WebGLRenderer }).__r3fRenderer;
  }
  rendererListeners.forEach((l) => l());
}

export function hasVisibleScenes(): boolean {
  return visibleScenes.size > 0;
}

export function getRenderer(): THREE.WebGLRenderer | null {
  return currentGl;
}

export function getRendererClock(): THREE.Clock | null {
  return currentClock;
}

export function rendererAdvance(timestamp: number, runGlobalEffects = true) {
  if (visibleScenes.size === 0 || (typeof document !== "undefined" && document.hidden)) return;
  const advance = currentAdvance;
  if (advance) {
    probeFrame(currentGl, () => advance(timestamp, runGlobalEffects));
  }
}
