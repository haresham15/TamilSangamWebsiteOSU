/**
 * Render-space counterparts of the documented Guide Station DTCG tokens.
 * Keep Three.js color literals centralized here; JSX only consumes named roles.
 */
export const guideStationPalette = {
  fog: "#0A0F14",
  haze: "#14283A",
  hazeBright: "#2A4A63",
  coach: "#1A242F",
  coachEdge: "#4D6B85",
  coachBand: "#D9CFB4",
  platform: "#1B2229",
  platformEdge: "#B99845",
  practicalWarm: "#FFD9A0",
  practicalCool: "#9FD6FF",
  boardInk: "#0C0C0E",
  boardGlyph: "#F1E9D2",
  windowGlow: "#FFB84D",
  windowFalloff: "#FF8A2A",
  rim: "#7AA7D6",
} as const;

export const GUIDE_STATION_FOG_DENSITY = 0.018;
