// src/audio/armUnlock.ts
"use client";

import { audio } from "./AudioController";

/**
 * armAudioUnlock (§4.4)
 * Sets one-shot passive listeners on pointerdown, keydown, and touchend
 * to prepare the Web Audio context synchronously within a valid user gesture.
 * 
 * Does NOT emit sound. If the user previously opted into sound via nav toggle,
 * restores master gain smoothly.
 */
export function armAudioUnlock() {
  if (typeof window === "undefined") return;

  const events = ["pointerdown", "keydown", "touchend"] as const;
  const ac = new AbortController();

  const handler = () => {
    audio.unlock();
    try {
      const saved =
        localStorage.getItem("sound") ??
        localStorage.getItem("sangam_sound_enabled");
      if (saved === "1" || saved === "true") {
        audio.setEnabled(true);
      }
    } catch {
      // Ignore private mode storage restrictions
    }
    ac.abort();
  };

  events.forEach((e) =>
    window.addEventListener(e, handler, {
      capture: true,
      passive: true,
      signal: ac.signal,
    })
  );
}
