import * as THREE from "three";

/**
 * The Morning Campus — Single Shared Sun Vector (§3.1)
 *
 * This hero is fixed "morning" and deliberately ignores the global time-of-day/tinai system.
 * A single shared sun vector drives:
 * 1. Sky dome sun disc and halo glow (MorningSkyDome shader)
 * 2. Key directional light position and direction
 * 3. Shadow camera frustum orientation
 * 4. Volumetric light shaft alignment (tier A)
 *
 * Elevation: 22° (0.384 rad) — low morning sun behind the gates creating long shadows toward camera.
 * Azimuth: 45° (0.785 rad) — back-right of the camera view axis (camera looks toward -Z).
 */
export const SUN_ELEVATION_RAD = (22 * Math.PI) / 180;
export const SUN_AZIMUTH_RAD = (45 * Math.PI) / 180;

export const SUN_DIR = new THREE.Vector3(
  Math.cos(SUN_ELEVATION_RAD) * Math.sin(SUN_AZIMUTH_RAD), // ~ 0.6556 (right)
  Math.sin(SUN_ELEVATION_RAD),                             // ~ 0.3746 (up)
 -Math.cos(SUN_ELEVATION_RAD) * Math.cos(SUN_AZIMUTH_RAD)  // ~ -0.6556 (back toward camera)
).normalize();

export const SUN_DIST = 40;
export const SUN_POS: [number, number, number] = [
  SUN_DIR.x * SUN_DIST,
  SUN_DIR.y * SUN_DIST,
  SUN_DIR.z * SUN_DIST,
];

// Palette Ground Truth (sRGB) — §2 PRD v2
export const FOG_COLOR = "#F4EEDD";    // Warm limestone morning haze / horizon
export const SKY_MID = "#F7E7C6";      // Warm amber haze band
export const SKY_ZENITH = "#9CC4E8";   // Crisp collegiate blue zenith
export const SUN_COLOR = "#FFF8E7";    // Warm morning solar disk
export const LIMESTONE_COLOR = "#E8E4D9";
export const PATHWAY_COLOR = "#D1CCC0";
export const IRON_BASE = "#141414";
export const FOG_DENSITY = 0.015;
