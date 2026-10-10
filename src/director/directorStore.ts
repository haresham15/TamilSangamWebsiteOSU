import { create } from "zustand";
import { setWire as setSceneWire } from "./wireframe";
import { playToggleTick } from "@/audio/sounds";
import {
  setHeroDirectorScrub,
  setHeroDirectorDotsVisible,
  setHeroDirectorSpeed,
} from "@/engine/heroScrollStore";

export interface DirectorState {
  open: boolean;
  gradeOn: boolean;
  wire: boolean;
  lutIntensity: number;
  scanlineActive: boolean;
  announcement: string;

  // Hero Kolam Diagnostics & Live Tuning
  heroScrubActive: boolean;
  heroScrubProgress: number;
  heroDotsVisible: boolean;
  heroSpeed: number;
  showHeroInspector: boolean;

  toggleOpen: () => void;
  close: () => void;
  toggleGrade: () => void;
  toggleWire: () => void;
  setGradeOn: (on: boolean) => void;
  setWire: (on: boolean) => void;
  setLutIntensity: (val: number) => void;

  toggleHeroScrub: () => void;
  setHeroScrubProgress: (val: number) => void;
  toggleHeroDots: () => void;
  setHeroSpeed: (val: number) => void;
  toggleHeroInspector: () => void;
}

export const useDirectorStore = create<DirectorState>((set, get) => ({
  open: false,
  gradeOn: true,
  wire: false,
  lutIntensity: 0.75,
  scanlineActive: false,
  announcement: "",

  // Hero Kolam Defaults
  heroScrubActive: false,
  heroScrubProgress: 0,
  heroDotsVisible: true,
  heroSpeed: 1.0,
  showHeroInspector: true,

  toggleOpen: () => {
    const nextOpen = !get().open;
    if (nextOpen) {
      playToggleTick();
      set({
        open: true,
        announcement: "Director's Viewport opened. Press C to toggle grade, W to toggle wireframe, Escape to close.",
      });
    } else {
      get().close();
    }
  },

  close: () => {
    // Reset all toggles and overrides on close (§6.1)
    setSceneWire(false);
    setHeroDirectorScrub(false);
    setHeroDirectorDotsVisible(true);
    setHeroDirectorSpeed(1.0);
    playToggleTick();
    set({
      open: false,
      gradeOn: true,
      wire: false,
      scanlineActive: false,
      heroScrubActive: false,
      heroDotsVisible: true,
      heroSpeed: 1.0,
      announcement: "Director's Viewport closed. Standard rendering restored.",
    });
  },

  toggleGrade: () => {
    const nextGrade = !get().gradeOn;
    playToggleTick();
    set({
      gradeOn: nextGrade,
      announcement: nextGrade
        ? "Color grade: ACTIVE (film look)."
        : "Color grade: RAW (ungraded linear pass).",
    });
  },

  toggleWire: () => {
    const nextWire = !get().wire;
    playToggleTick();

    // Trigger 250 ms DOM scanline mask (§6.3)
    set({
      wire: nextWire,
      scanlineActive: true,
      announcement: nextWire
        ? "Wireframe mode: ENABLED (#00FF41 diagnostic mesh)."
        : "Wireframe mode: DISABLED (solid materials restored).",
    });

    setSceneWire(nextWire);

    setTimeout(() => {
      set({ scanlineActive: false });
    }, 250);
  },

  setGradeOn: (on: boolean) => {
    set({
      gradeOn: on,
      announcement: on
        ? "Color grade: ACTIVE."
        : "Color grade: RAW.",
    });
  },

  setWire: (on: boolean) => {
    setSceneWire(on);
    set({
      wire: on,
      announcement: on
        ? "Wireframe mode: ENABLED."
        : "Wireframe mode: DISABLED.",
    });
  },

  setLutIntensity: (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    set({
      lutIntensity: clamped,
      announcement: `LUT Intensity set to ${Math.round(clamped * 100)}%`,
    });
  },

  toggleHeroScrub: () => {
    const nextActive = !get().heroScrubActive;
    playToggleTick();
    setHeroDirectorScrub(nextActive, get().heroScrubProgress);
    set({
      heroScrubActive: nextActive,
      announcement: nextActive
        ? "Hero Scrub Override: ACTIVE. Scroll position locked to Director slider."
        : "Hero Scrub Override: DISABLED. Live page scroll restored.",
    });
  },

  setHeroScrubProgress: (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setHeroDirectorScrub(get().heroScrubActive, clamped);
    set({
      heroScrubProgress: clamped,
    });
  },

  toggleHeroDots: () => {
    const nextDots = !get().heroDotsVisible;
    playToggleTick();
    setHeroDirectorDotsVisible(nextDots);
    set({
      heroDotsVisible: nextDots,
      announcement: nextDots ? "Pulli Lattice: VISIBLE." : "Pulli Lattice: HIDDEN (Threads isolated).",
    });
  },

  setHeroSpeed: (val: number) => {
    const clamped = Math.max(0.1, Math.min(4.0, val));
    setHeroDirectorSpeed(clamped);
    set({
      heroSpeed: clamped,
      announcement: `Pulse wave speed: ${clamped.toFixed(1)}x`,
    });
  },

  toggleHeroInspector: () => {
    set((s) => ({ showHeroInspector: !s.showHeroInspector }));
  },
}));

// Simple hook alias for R3F components
export function useDirector() {
  const open = useDirectorStore((s) => s.open);
  const gradeOn = useDirectorStore((s) => s.gradeOn);
  const wire = useDirectorStore((s) => s.wire);
  const lutIntensity = useDirectorStore((s) => s.lutIntensity);
  const toggleGrade = useDirectorStore((s) => s.toggleGrade);
  const toggleWire = useDirectorStore((s) => s.toggleWire);
  const setLutIntensity = useDirectorStore((s) => s.setLutIntensity);

  const heroScrubActive = useDirectorStore((s) => s.heroScrubActive);
  const heroScrubProgress = useDirectorStore((s) => s.heroScrubProgress);
  const heroDotsVisible = useDirectorStore((s) => s.heroDotsVisible);
  const heroSpeed = useDirectorStore((s) => s.heroSpeed);
  const showHeroInspector = useDirectorStore((s) => s.showHeroInspector);

  return {
    open,
    gradeOn,
    wire,
    lutIntensity,
    toggleGrade,
    toggleWire,
    setLutIntensity,
    intensity: lutIntensity,
    heroScrubActive,
    heroScrubProgress,
    heroDotsVisible,
    heroSpeed,
    showHeroInspector,
  };
}
