// src/components/gl/planes/registry.ts
import * as THREE from "three";
import { governor } from "@/engine/governor";
import { registerSystem, scroll } from "@/engine/masterTick";

export interface PlaneEntry {
  id: string;
  containerEl: HTMLElement;
  imgEl: HTMLImageElement;
  rect: DOMRectReadOnly;
  src: string;
  radius: number;
  hover: number;
  targetHover: number;
  mouse: [number, number];
  targetMouse: [number, number];
  texture?: THREE.Texture;
  textureBytes: number;
  ready: boolean;
}

// Global active plane store
const planes = new Map<string, PlaneEntry>();
const subscribers = new Set<() => void>();

export const MAX_PLANES_TIER_A = 16;
export const MAX_TEXTURE_BUDGET_BYTES = 80 * 1024 * 1024; // 80 MB (§9.1, §10)

let currentTextureBytes = 0;
let activePlanesSnapshot: PlaneEntry[] = [];

export function getActivePlanes(): PlaneEntry[] {
  return activePlanesSnapshot;
}

if (typeof window !== "undefined") {
  (window as unknown as { __getActivePlanes?: () => PlaneEntry[] }).__getActivePlanes = getActivePlanes;
}

export function subscribePlanes(callback: () => void): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function notifySubscribers() {
  activePlanesSnapshot = Array.from(planes.values());
  subscribers.forEach((cb) => cb());
}

export function registerPlane(entry: PlaneEntry): boolean {
  if (planes.size >= MAX_PLANES_TIER_A) {
    return false; // Cap simultaneous active planes at 16 (§9.1)
  }
  planes.set(entry.id, entry);
  notifySubscribers();
  governor.request("planes", 1);
  return true;
}

export function updatePlaneRect(id: string, rect: DOMRectReadOnly) {
  const p = planes.get(id);
  if (p) {
    p.rect = rect;
    notifySubscribers();
  }
}

export function setPlaneHover(id: string, targetHover: number, targetMouse?: [number, number]) {
  const p = planes.get(id);
  if (p) {
    p.targetHover = targetHover;
    if (targetMouse) {
      p.targetMouse = targetMouse;
    }
    governor.request("planes", 2);
  }
}

export function unregisterPlane(id: string) {
  const p = planes.get(id);
  if (p) {
    if (p.texture) {
      p.texture.dispose();
      currentTextureBytes = Math.max(0, currentTextureBytes - p.textureBytes);
    }
    p.imgEl.style.opacity = "";
    p.containerEl.removeAttribute("data-gl-ready");
    planes.delete(id);
    notifySubscribers();
    if (planes.size === 0) {
      governor.request("planes", 0);
    }
  }
}

export function getTextureMemoryUsage(): number {
  return currentTextureBytes;
}

export function canAllocateTexture(bytes: number): boolean {
  return currentTextureBytes + bytes <= MAX_TEXTURE_BUDGET_BYTES;
}

export function trackTextureAllocated(bytes: number) {
  currentTextureBytes += bytes;
}

// Master tick integration for image plane spring transitions & scroll velocity skew (§9.1)
registerSystem({
  order: 20, // After springs, before camera/view renders
  step: (dt: number) => {
    if (planes.size === 0) return;

    let anyActive = Math.abs(scroll.velocity) > 0.05;

    planes.forEach((p) => {
      // Spring hover (stiffness k=120, damping c=14)
      const diffHover = p.targetHover - p.hover;
      p.hover += diffHover * Math.min(1, dt * 14);

      // Spring mouse
      const diffMx = p.targetMouse[0] - p.mouse[0];
      const diffMy = p.targetMouse[1] - p.mouse[1];
      p.mouse[0] += diffMx * Math.min(1, dt * 12);
      p.mouse[1] += diffMy * Math.min(1, dt * 12);

      if (Math.abs(diffHover) > 0.005 || Math.abs(diffMx) > 0.005 || Math.abs(diffMy) > 0.005) {
        anyActive = true;
      }
    });

    // Governor control: level 2 when active hover/scroll velocity, level 1 when visible & ambient (§4.3)
    governor.request("planes", anyActive ? 2 : 1);
  },
});
