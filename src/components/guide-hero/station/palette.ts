/**
 * Render-space counterparts of the documented Guide Station DTCG tokens.
 * Keep Three.js color literals centralized here; JSX only consumes named roles.
 */
export const guideStationPalette = {
  fog: "#0A0F14",
  haze: "#14283A",
  hazeBright: "#2A4A63",
  coach: "#1B334B", // Rich Prussian Blue-Teal (never pitch-black!)
  coachDark: "#101D2A",
  coachEdge: "#4A5D6E", // Brushed Anodized Aluminum & Weathered Steel
  coachBand: "#C8B898", // Faded cream-ochre livery pinstripe
  platform: "#0E1620", // Wet dark asphalt/concrete
  platformEdge: "#D4AF37", // Yellow tactile platform safety line
  practicalWarm: "#FFD9A0",
  practicalCool: "#5B9BD5", // Platform mercury-vapor blue
  boardInk: "#0C0C0E",
  boardGlyph: "#F1E9D2",
  windowGlow: "#FFB84D",
  windowFalloff: "#FF8A2A",
  rim: "#68A8E8", // Cool blue-hour moonlight rim
} as const;

export const GUIDE_STATION_FOG_DENSITY = 0.018;

