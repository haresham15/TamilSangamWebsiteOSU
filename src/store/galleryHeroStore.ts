import { create } from "zustand";

export interface GalleryHeroState {
  scrollProgress: number;
  smoothedVelocity: number;
  currentAmplitude: number;
  activePolaroidsCount: number;
  cooldownTimer: number;
  finaleFired: boolean;
  fps: number;
  debugMode: boolean;
  isPlucking: boolean;

  setScrollProgress: (progress: number) => void;
  setSmoothedVelocity: (velocity: number) => void;
  setCurrentAmplitude: (amplitude: number) => void;
  setActivePolaroidsCount: (count: number) => void;
  setCooldownTimer: (timer: number) => void;
  setFinaleFired: (fired: boolean) => void;
  setFps: (fps: number) => void;
  setDebugMode: (debug: boolean) => void;
  setIsPlucking: (plucking: boolean) => void;
  resetState: () => void;
}

export const useGalleryHeroStore = create<GalleryHeroState>((set) => ({
  scrollProgress: 0,
  smoothedVelocity: 0,
  currentAmplitude: 0,
  activePolaroidsCount: 0,
  cooldownTimer: 0,
  finaleFired: false,
  fps: 60,
  debugMode: false,
  isPlucking: false,

  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setSmoothedVelocity: (smoothedVelocity) => set({ smoothedVelocity }),
  setCurrentAmplitude: (currentAmplitude) => set({ currentAmplitude }),
  setActivePolaroidsCount: (activePolaroidsCount) => set({ activePolaroidsCount }),
  setCooldownTimer: (cooldownTimer) => set({ cooldownTimer }),
  setFinaleFired: (finaleFired) => set({ finaleFired }),
  setFps: (fps) => set({ fps }),
  setDebugMode: (debugMode) => set({ debugMode }),
  setIsPlucking: (isPlucking) => set({ isPlucking }),
  resetState: () =>
    set({
      scrollProgress: 0,
      smoothedVelocity: 0,
      currentAmplitude: 0,
      activePolaroidsCount: 0,
      cooldownTimer: 0,
      finaleFired: false,
      isPlucking: false,
    }),
}));
