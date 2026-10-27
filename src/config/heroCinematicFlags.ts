/**
 * Central A/B Configuration Flags for Cinematic 3D Hero Elevation
 *
 * Hard Constraint 1: Additive & 100% Reversible.
 * Every camera damper, lighting rig, LUT profile, material upgrade, and cinematic detail
 * is gated behind `isHeroCinematicEnabled("<hero>")`.
 *
 * Overrides supported via URL query parameters:
 * - `?cinematic=0`: Forces all cinematic elevations OFF (pure baseline comparison).
 * - `?cinematic=1`: Forces all cinematic elevations ON.
 * - `?cinematic_<hero>=0|1`: Per-hero targeted override (e.g., `?cinematic_home=1`).
 */

export type HeroCinematicKey =
  | "home"
  | "events"
  | "about"
  | "board"
  | "gallery"
  | "games"
  | "guide"
  | "suggestions"
  | "join";

export const CINEMATIC_V2_FLAGS: Record<HeroCinematicKey, boolean> = {
  home: true, // Hero 1 target
  events: true, // Hero 2 target
  about: true, // Hero 3 target
  board: true, // Hero 4 target
  gallery: true, // Hero 5 target
  games: true, // Hero 9 target (Jailer 2 Beach Blast)
  guide: true, // Hero 6 target
  suggestions: true, // Hero 7 target
  join: true, // Hero 8 target
};

export function isHeroCinematicEnabled(hero: HeroCinematicKey): boolean {
  if (typeof window === "undefined") {
    return CINEMATIC_V2_FLAGS[hero];
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const globalOverride = params.get("cinematic");
    if (globalOverride === "0") return false;
    if (globalOverride === "1") return true;

    const heroOverride = params.get(`cinematic_${hero}`);
    if (heroOverride === "0") return false;
    if (heroOverride === "1") return true;
  } catch {
    // Ignore URL parse failures in non-standard environments
  }

  return CINEMATIC_V2_FLAGS[hero];
}
