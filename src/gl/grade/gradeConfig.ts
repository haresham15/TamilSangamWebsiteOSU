// src/gl/grade/gradeConfig.ts
import { ToneMappingMode } from "postprocessing";

export type HeroGradeProfileName =
  | "kolam-hearth"
  | "leo-forge"
  | "chola-gopuram"
  | "darbar-torch"
  | "vaaranam-kodachrome"
  | "alaipayuthey-bluehour"
  | "kaththi-blueprint"
  | "nanban-morning"
  | "jailer-sunblast";

export interface HeroGradeProfile {
  lutPath: string;
  lutSize: number;
  lutOpacity: number; // Strictly 0.60 - 0.85 per PRD §3.3
  bloom: {
    luminanceThreshold: number;
    intensity: number;
    mipmapBlur: boolean;
  };
  vignette: {
    offset: number;
    darkness: number;
  };
  grain: {
    opacity: number;
  };
  tierBFallback: {
    keyLightTint: string;
    fillLightTint: string;
    fogTint: string;
    exposureBias: number;
  };
}

export interface GradeConfig {
  lutPath: string;
  lutSize: number;
  toneMappingMode: ToneMappingMode;
  exposure: number;
  intensity: number; // 0.6 - 0.85 per PRD §3.3 to preserve Dravidian brand tokens
  bloom: {
    luminanceThreshold: number;
    intensity: number;
    mipmapBlur: boolean;
  };
  vignette: {
    offset: number;
    darkness: number;
  };
  grain: {
    opacity: number;
  };
}

export const HERO_GRADE_PROFILES: Record<HeroGradeProfileName, HeroGradeProfile> = {
  "kolam-hearth": {
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.72,
    bloom: { luminanceThreshold: 0.82, intensity: 0.55, mipmapBlur: true },
    vignette: { offset: 0.35, darkness: 0.42 },
    grain: { opacity: 0.035 },
    tierBFallback: {
      keyLightTint: "#FFF8EB",
      fillLightTint: "#2A1808",
      fogTint: "#050201",
      exposureBias: 1.05,
    },
  },
  "leo-forge": {
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.78,
    bloom: { luminanceThreshold: 0.75, intensity: 0.68, mipmapBlur: true },
    vignette: { offset: 0.32, darkness: 0.48 },
    grain: { opacity: 0.045 },
    tierBFallback: {
      keyLightTint: "#FFA216",
      fillLightTint: "#161018",
      fogTint: "#0E0B10",
      exposureBias: 1.1,
    },
  },
  "chola-gopuram": {
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.74,
    bloom: { luminanceThreshold: 0.80, intensity: 0.50, mipmapBlur: true },
    vignette: { offset: 0.36, darkness: 0.44 },
    grain: { opacity: 0.038 },
    tierBFallback: {
      keyLightTint: "#FFF8EB",
      fillLightTint: "#3A2618",
      fogTint: "#14110F",
      exposureBias: 1.0,
    },
  },
  "darbar-torch": {
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.76,
    bloom: { luminanceThreshold: 0.72, intensity: 0.62, mipmapBlur: true },
    vignette: { offset: 0.30, darkness: 0.50 },
    grain: { opacity: 0.040 },
    tierBFallback: {
      keyLightTint: "#FFD074",
      fillLightTint: "#250D18",
      fogTint: "#120A06",
      exposureBias: 1.05,
    },
  },
  "vaaranam-kodachrome": {
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.78,
    bloom: { luminanceThreshold: 0.76, intensity: 0.60, mipmapBlur: true },
    vignette: { offset: 0.34, darkness: 0.42 },
    grain: { opacity: 0.042 },
    tierBFallback: {
      keyLightTint: "#FFE8C2",
      fillLightTint: "#182030",
      fogTint: "#140D18",
      exposureBias: 1.05,
    },
  },
  "alaipayuthey-bluehour": {
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.78,
    bloom: { luminanceThreshold: 0.74, intensity: 0.62, mipmapBlur: true },
    vignette: { offset: 0.33, darkness: 0.46 },
    grain: { opacity: 0.045 },
    tierBFallback: {
      keyLightTint: "#FFB84D",
      fillLightTint: "#1B334B",
      fogTint: "#0A1420",
      exposureBias: 1.0,
    },
  },
  "kaththi-blueprint": {
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.72,
    bloom: { luminanceThreshold: 0.70, intensity: 0.58, mipmapBlur: true },
    vignette: { offset: 0.38, darkness: 0.48 },
    grain: { opacity: 0.038 },
    tierBFallback: {
      keyLightTint: "#FFE6B8",
      fillLightTint: "#381D2C",
      fogTint: "#0F050A",
      exposureBias: 1.02,
    },
  },
  "nanban-morning": {
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.74,
    bloom: { luminanceThreshold: 0.78, intensity: 0.52, mipmapBlur: true },
    vignette: { offset: 0.40, darkness: 0.36 },
    grain: { opacity: 0.032 },
    tierBFallback: {
      keyLightTint: "#FFF5DE",
      fillLightTint: "#2B3828",
      fogTint: "#FAF5EA",
      exposureBias: 1.0,
    },
  },
  "jailer-sunblast": {
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.74,
    bloom: { luminanceThreshold: 0.72, intensity: 0.65, mipmapBlur: true },
    vignette: { offset: 0.38, darkness: 0.38 },
    grain: { opacity: 0.035 },
    tierBFallback: {
      keyLightTint: "#FFF4D6",
      fillLightTint: "#E8C574",
      fogTint: "#B8E6E8",
      exposureBias: 1.08,
    },
  },
};

export const gradeConfig: GradeConfig = {
  lutPath: "/luts/heritage-33.png",
  lutSize: 33,
  toneMappingMode: ToneMappingMode.AGX,
  exposure: 1.0,
  intensity: 0.75, // balanced intensity preserving brand tokens (ΔE <= 4)
  bloom: {
    luminanceThreshold: 0.85,
    intensity: 0.35,
    mipmapBlur: true,
  },
  vignette: {
    offset: 0.3,
    darkness: 0.4,
  },
  grain: {
    opacity: 0.05,
  },
};
