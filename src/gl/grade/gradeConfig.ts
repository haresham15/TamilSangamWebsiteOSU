// src/gl/grade/gradeConfig.ts

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

export type GradeToneMapping = "aces" | "agx";

export interface HeroGradeProfile {
  /**
   * Tone operator applied in GradePass (scene renders linear HDR into the grade target).
   * Every profile uses ACES: AgX (asked for by the Events/Suggestions PRDs) moves emblem purple
   * ΔE2000 9.6 from the ungraded look even with no LUT, failing the brand-swatch gate.
   */
  toneMapping: GradeToneMapping;
  /** Pre-tonemap exposure; 1.05 matches GlobalCanvas toneMappingExposure for ungraded parity. */
  exposure: number;
  lutPath: string;
  lutSize: number;
  /**
   * Heritage LUT mix. Capped at 0.33: scripts/test-color-pipeline.mjs measures brand swatches
   * (emblem purple, mint, gold) drifting past ΔE2000 4 above that (0.72–0.78 gave ΔE 6–8.5).
   */
  lutOpacity: number;
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
  toneMapping: GradeToneMapping;
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
    toneMapping: "aces",
    exposure: 1.05,
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.30,
    bloom: { luminanceThreshold: 0.82, intensity: 0.55, mipmapBlur: true },
    vignette: { offset: 0.35, darkness: 0.42 },
    grain: { opacity: 0.035 },
    tierBFallback: {
      keyLightTint: "#FFD9B0",
      fillLightTint: "#352254",
      fogTint: "#140C20",
      exposureBias: 1.05,
    },
  },
  "leo-forge": {
    toneMapping: "aces",
    exposure: 1.05,
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.33,
    bloom: { luminanceThreshold: 0.75, intensity: 0.68, mipmapBlur: true },
    vignette: { offset: 0.32, darkness: 0.48 },
    grain: { opacity: 0.045 },
    tierBFallback: {
      keyLightTint: "#7AE7B5",
      fillLightTint: "#25173B",
      fogTint: "#140C20",
      exposureBias: 1.1,
    },
  },
  "chola-gopuram": {
    toneMapping: "aces",
    exposure: 1.05,
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.31,
    bloom: { luminanceThreshold: 0.80, intensity: 0.50, mipmapBlur: true },
    vignette: { offset: 0.36, darkness: 0.44 },
    grain: { opacity: 0.038 },
    tierBFallback: {
      keyLightTint: "#C7F7E1",
      fillLightTint: "#352254",
      fogTint: "#140C20",
      exposureBias: 1.0,
    },
  },
  "darbar-torch": {
    toneMapping: "aces",
    exposure: 1.05,
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    // Torch-lit golds: the heritage LUT's mint highlight push turned saturated yellow
    // highlights (finale disc) chartreuse at 0.32.
    lutOpacity: 0.12,
    bloom: { luminanceThreshold: 0.72, intensity: 0.62, mipmapBlur: true },
    vignette: { offset: 0.30, darkness: 0.50 },
    grain: { opacity: 0.040 },
    tierBFallback: {
      keyLightTint: "#A6F0CF",
      fillLightTint: "#452C6D",
      fogTint: "#140C20",
      exposureBias: 1.05,
    },
  },
  "vaaranam-kodachrome": {
    toneMapping: "aces",
    exposure: 1.05,
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.33,
    bloom: { luminanceThreshold: 0.76, intensity: 0.60, mipmapBlur: true },
    vignette: { offset: 0.34, darkness: 0.42 },
    grain: { opacity: 0.042 },
    tierBFallback: {
      keyLightTint: "#C7F7E1",
      fillLightTint: "#352254",
      fogTint: "#140C20",
      exposureBias: 1.05,
    },
  },
  "alaipayuthey-bluehour": {
    toneMapping: "aces",
    exposure: 1.05,
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.33,
    bloom: { luminanceThreshold: 0.74, intensity: 0.62, mipmapBlur: true },
    vignette: { offset: 0.33, darkness: 0.46 },
    grain: { opacity: 0.045 },
    tierBFallback: {
      keyLightTint: "#4FD6E0",
      fillLightTint: "#25173B",
      fogTint: "#140C20",
      exposureBias: 1.0,
    },
  },
  "kaththi-blueprint": {
    toneMapping: "aces",
    exposure: 1.05,
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.30,
    bloom: { luminanceThreshold: 0.70, intensity: 0.58, mipmapBlur: true },
    vignette: { offset: 0.38, darkness: 0.48 },
    grain: { opacity: 0.038 },
    tierBFallback: {
      keyLightTint: "#A6F0CF",
      fillLightTint: "#352254",
      fogTint: "#140C20",
      exposureBias: 1.02,
    },
  },
  "nanban-morning": {
    toneMapping: "aces",
    exposure: 1.05,
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.31,
    bloom: { luminanceThreshold: 0.78, intensity: 0.52, mipmapBlur: true },
    vignette: { offset: 0.40, darkness: 0.36 },
    grain: { opacity: 0.032 },
    tierBFallback: {
      keyLightTint: "#C7F7E1",
      fillLightTint: "#352254",
      fogTint: "#140C20",
      exposureBias: 1.0,
    },
  },
  "jailer-sunblast": {
    toneMapping: "aces",
    exposure: 1.05,
    lutPath: "/luts/heritage-33.png",
    lutSize: 33,
    lutOpacity: 0.31,
    bloom: { luminanceThreshold: 0.72, intensity: 0.65, mipmapBlur: true },
    vignette: { offset: 0.38, darkness: 0.38 },
    grain: { opacity: 0.035 },
    tierBFallback: {
      keyLightTint: "#A6F0CF",
      fillLightTint: "#452C6D",
      fogTint: "#140C20",
      exposureBias: 1.08,
    },
  },
};

export const gradeConfig: GradeConfig = {
  lutPath: "/luts/heritage-33.png",
  lutSize: 33,
  toneMapping: "agx",
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
