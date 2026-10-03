/**
 * Unified Art Direction & Animation Constants for Vaaranam Aayiram Gallery Hero
 * Source of truth: docs/gallery-hero-prd.md (Sections 3.3 & 12)
 */

export const HERO_PALETTE = {
  skyZenith: "#170d2b",      // Deep dusk violet, echoing brand Royal Purple #4c2472
  skyUpperMid: "#5c2466",    // Brand purple bleeding to rich plum
  skyLowerMid: "#e2553f",    // Kumkumam coral family
  horizonGold: "#ff9a3c",    // Solar gold sunrise/sunset band
  horizonAmber: "#ffc86b",   // Soft horizon warmth
  sunCore: "#fff4d6",        // Over-exposed solar core
  seaBase: "#2a1a3a",        // Deep dusk sea base
  seaGlitter: "#ffd08a",     // Specular golden hour wave reflections
  silhouettes: "#0d0709",    // Palm and roadside pole silhouettes
  silhouetteRim: "#e2723f",  // 6% warm rim highlight
  mintFlare: "#55CCA2",      // Brand anamorphic teal streak accent
  paperIvory: "#f6efe0",     // Warm Polaroid border paper
  washColor: "#fff4d6",      // Finale whiteout dissolve color
  fogColor: "#df6c3d",       // Atmospheric horizon haze
} as const;

export const HERO_CONSTANTS = {
  // Scenery & Camera Dimensions
  cameraEyeHeight: 1.4,      // First-person eye height in meters
  baseFov: 38,               // Anamorphic cinematic focal length
  idleDollySpeed: 1.2,       // Slow forward glide in m/s
  sunZ: -380,                // Deep Z position of the sun
  sunY: 6.5,                 // Low setting sun elevation above horizon
  sunRadius: 18.0,           // Sun disc radius in world units
  sunHaloMultiplier: 3.2,    // Radial golden halo size
  horizonY: 0.0,             // Horizon position in world space
  roadWidth: 8.4,            // Asphalt width in meters
  fogDensity: 0.006,         // Atmospheric exp² fog density
  dustCount: 300,            // Additive floating dust motes in sunbeam

  // Scroll Metrics
  scrollDistanceDesktop: 4200, // Equiv to ~600vh scroll runway
  scrollDistanceMobile: 3500,  // Equiv to ~500vh
  scrubDamping: 0.1,           // Ultra-responsive real-time scroll sync with Lenis

  // PostFX & Optics
  bloomThreshold: 0.85,
  bloomIntensityBase: 0.8,
  bloomIntensityFinale: 5.5,
  vignetteDarkness: 0.55,
  vignetteOffset: 0.35,
  grainOpacity: 0.07,
} as const;

export interface TimelineFrame {
  cameraZ: number;
  cameraY: number;
  fov: number;
  stringsOpacity: number;
  overlayOpacity: number;
  washOpacity: number;
  bloomIntensity: number;
  dollySpeedMultiplier: number;
}

export function getHeroTimelineValues(p: number): TimelineFrame {
  const clampedP = Math.max(0, Math.min(1, p));

  // 1. Camera Z progression toward the setting sun
  let cameraZ = 0;
  let fov = 38;
  let dollySpeedMultiplier = 1.0;

  if (clampedP <= 0.08) {
    cameraZ = -clampedP * 50.0; // 0 to -4m
    fov = 38;
    dollySpeedMultiplier = 1.0;
  } else if (clampedP <= 0.55) {
    const t = (clampedP - 0.08) / 0.47;
    cameraZ = -4.0 - t * 45.0; // -4 to -49m
    fov = 38 + t * 6.0; // 38 to 44 deg
    dollySpeedMultiplier = 1.0 + t * 1.5;
  } else if (clampedP <= 0.80) {
    const t = (clampedP - 0.55) / 0.25;
    cameraZ = -49.0 - t * 90.0; // -49 to -139m
    fov = 44 + t * 6.0; // 44 to 50 deg
    dollySpeedMultiplier = 2.5 + t * 1.5;
  } else if (clampedP <= 0.94) {
    const t = (clampedP - 0.80) / 0.14;
    cameraZ = -139.0 - t * 120.0; // -139 to -259m
    fov = 50 + t * 8.0; // 50 to 58 deg
    dollySpeedMultiplier = 4.0;
  } else {
    cameraZ = -259.0;
    fov = 58;
    dollySpeedMultiplier = 0.0;
  }

  // Camera Y lowers slightly as we approach the horizon
  const cameraY = HERO_CONSTANTS.cameraEyeHeight - Math.min(0.35, clampedP * 0.4);

  // 2. Strings opacity (slacken & fade out past p = 0.55)
  let stringsOpacity = 1.0;
  if (clampedP > 0.55 && clampedP <= 0.80) {
    stringsOpacity = 1.0 - (clampedP - 0.55) / 0.25;
  } else if (clampedP > 0.80) {
    stringsOpacity = 0.0;
  }

  // 3. Overlay title opacity (fades out early in the journey)
  let overlayOpacity = 1.0;
  if (clampedP > 0.06 && clampedP <= 0.16) {
    overlayOpacity = 1.0 - (clampedP - 0.06) / 0.10;
  } else if (clampedP > 0.16) {
    overlayOpacity = 0.0;
  }

  // 4. Finale Sunset Washout (easeInCubic p ∈ [0.80, 0.94])
  let washOpacity = 0.0;
  if (clampedP > 0.80 && clampedP <= 0.94) {
    const t = (clampedP - 0.80) / 0.14;
    washOpacity = t * t * t; // Ease in cubic
  } else if (clampedP > 0.94) {
    washOpacity = 1.0;
  }

  // 5. Dynamic Bloom Intensity
  let bloomIntensity: number = HERO_CONSTANTS.bloomIntensityBase;
  if (clampedP <= 0.55) {
    bloomIntensity = HERO_CONSTANTS.bloomIntensityBase + (clampedP / 0.55) * 0.7; // 0.8 -> 1.5
  } else if (clampedP <= 0.80) {
    const t = (clampedP - 0.55) / 0.25;
    bloomIntensity = 1.5 + t * 1.5; // 1.5 -> 3.0
  } else if (clampedP <= 0.94) {
    const t = (clampedP - 0.80) / 0.14;
    bloomIntensity = 3.0 + t * 3.0; // 3.0 -> 6.0
  } else {
    bloomIntensity = 6.0;
  }

  return {
    cameraZ,
    cameraY,
    fov,
    stringsOpacity,
    overlayOpacity,
    washOpacity,
    bloomIntensity,
    dollySpeedMultiplier,
  };
}
