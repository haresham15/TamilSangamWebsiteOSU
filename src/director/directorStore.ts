// src/director/directorStore.ts
import { create } from "zustand";
import { setWire as setSceneWire } from "./wireframe";
import { playToggleTick } from "@/audio/sounds";

export interface DirectorState {
  open: boolean;
  gradeOn: boolean;
  wire: boolean;
  scanlineActive: boolean;
  announcement: string;

  toggleOpen: () => void;
  close: () => void;
  toggleGrade: () => void;
  toggleWire: () => void;
  setGradeOn: (on: boolean) => void;
  setWire: (on: boolean) => void;
}

export const useDirectorStore = create<DirectorState>((set, get) => ({
  open: false,
  gradeOn: true,
  wire: false,
  scanlineActive: false,
  announcement: "",

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
    // Reset both toggles on close (§6.1)
    setSceneWire(false);
    playToggleTick();
    set({
      open: false,
      gradeOn: true,
      wire: false,
      scanlineActive: false,
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
}));

// Simple hook alias for R3F components
export function useDirector() {
  const open = useDirectorStore((s) => s.open);
  const gradeOn = useDirectorStore((s) => s.gradeOn);
  const wire = useDirectorStore((s) => s.wire);
  const toggleGrade = useDirectorStore((s) => s.toggleGrade);
  const toggleWire = useDirectorStore((s) => s.toggleWire);
  return { open, gradeOn, wire, toggleGrade, toggleWire, intensity: 0.75 };
}
