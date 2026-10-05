// src/engine/bootStore.ts
import { create } from "zustand";

interface BootState {
  isBootActive: boolean;
  progress: number;
  readyScenes: Set<string>;
  activeSceneId: string | null;
  compileTimes: Record<string, number>;
  setBootActive: (active: boolean) => void;
  updateProgress: (p: number) => void;
  setActiveSceneId: (id: string | null) => void;
  markReady: (sceneId: string, compileDurationMs?: number) => void;
  isSceneReady: (sceneId: string) => boolean;
}

export const useBootStore = create<BootState>((set, get) => ({
  isBootActive: false,
  progress: 0,
  readyScenes: new Set<string>(),
  activeSceneId: null,
  compileTimes: {},

  setBootActive: (active: boolean) => {
    set({ isBootActive: active });
  },

  updateProgress: (p: number) => {
    // Progress is monotonic: never decreases (§6.2)
    const current = get().progress;
    const next = Math.min(100, Math.max(current, p));
    set({ progress: next });
  },

  setActiveSceneId: (id: string | null) => {
    set({ activeSceneId: id });
  },

  markReady: (sceneId: string, compileDurationMs = 0) => {
    set((state) => {
      const nextSet = new Set(state.readyScenes);
      nextSet.add(sceneId);
      const nextTimes = { ...state.compileTimes, [sceneId]: compileDurationMs };
      return { readyScenes: nextSet, compileTimes: nextTimes };
    });
  },

  isSceneReady: (sceneId: string) => {
    return get().readyScenes.has(sceneId);
  },
}));

/**
 * Promise-based helper to wait for a scene to compile & initialize with a timeout cap.
 * Used during route transitions (§5.1) with a default 1.2s timeout.
 */
export function waitForSceneReady(sceneId: string, timeoutMs = 1200): Promise<boolean> {
  if (useBootStore.getState().isSceneReady(sceneId)) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false); // Cap reached, release anyway (§5.1)
      }
    }, timeoutMs);

    const unsubscribe = useBootStore.subscribe((state) => {
      if (state.readyScenes.has(sceneId) && !resolved) {
        resolved = true;
        clearTimeout(timer);
        unsubscribe();
        resolve(true);
      }
    });
  });
}
