import { create } from "zustand";

export interface BoardHeroState {
  // Scroll kinematics
  scrollProgress: number; // 0.00 -> 1.00
  cameraZ: number;
  fogDensity: number;

  // Treadmill & Lighting Diagnostics (§9, §10)
  recycledCount: number;
  activeRealLights: number;
  finaleFired: boolean;
  debugMode: boolean;
  fps: number;

  // Actions
  setScrollProgress: (p: number) => void;
  setCameraZ: (z: number) => void;
  setFogDensity: (density: number) => void;
  incrementRecycledCount: () => void;
  setActiveRealLights: (count: number) => void;
  setFinaleFired: (fired: boolean) => void;
  setDebugMode: (active: boolean) => void;
  setFps: (fps: number) => void;
  resetHero: () => void;
}

export const useBoardHeroStore = create<BoardHeroState>((set) => ({
  scrollProgress: 0,
  cameraZ: 30,
  fogDensity: 0.045,
  recycledCount: 0,
  activeRealLights: 2,
  finaleFired: false,
  debugMode: false,
  fps: 60,

  setScrollProgress: (p) => set({ scrollProgress: p }),
  setCameraZ: (z) => set({ cameraZ: z }),
  setFogDensity: (density) => set({ fogDensity: density }),
  incrementRecycledCount: () => set((state) => ({ recycledCount: state.recycledCount + 1 })),
  setActiveRealLights: (count) => set({ activeRealLights: count }),
  setFinaleFired: (fired) => set({ finaleFired: fired }),
  setDebugMode: (active) => set({ debugMode: active }),
  setFps: (fps) => set({ fps }),
  resetHero: () =>
    set({
      scrollProgress: 0,
      cameraZ: 30,
      fogDensity: 0.045,
      recycledCount: 0,
      activeRealLights: 2,
      finaleFired: false,
    }),
}));
