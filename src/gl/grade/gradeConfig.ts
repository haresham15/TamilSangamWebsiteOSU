// src/gl/grade/gradeConfig.ts
import { ToneMappingMode } from "postprocessing";

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
