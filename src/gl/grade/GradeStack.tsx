// src/gl/grade/GradeStack.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { EffectComposer, Bloom, ToneMapping, LUT, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { LUT3DEffect } from "postprocessing";
import { useGradeLut } from "./useGradeLut";
import {
  gradeConfig,
  HERO_GRADE_PROFILES,
  type HeroGradeProfileName,
} from "./gradeConfig";
import { useDirectorStore } from "@/director/directorStore";
import gsap from "gsap";

export interface GradeStackProps {
  tier: "A" | "B" | "C";
  gradeOn?: boolean;
  intensity?: number;
  profile?: HeroGradeProfileName;
}

/**
 * GradeStack (§3.1, §3.5, §6.2)
 * The definitive sensory color grading pipeline for Tier A heroes:
 * 
 * Order of Operations:
 *   Scene-Linear Render -> Bloom (HDR) -> ToneMapping (AGX) -> LUT (Display-Referred) -> Vignette -> Grain -> Canvas
 * 
 * Rules:
 *   - Exactly ONE tone mapper (renderer tone mapping MUST be NoToneMapping / <Canvas flat>)
 *   - Opacity blend driving: never unmount/remount LUT effect (rebuilding pass hitches frames)
 *   - Tier gating: only renders on Tier A; tier B uses material approximations; tier C has no canvas.
 *   - Director Viewport integration: Raw feed toggles animate LUT opacity to 0 over 250ms.
 *   - Profile support: dynamically sets bloom, vignette, grain, and LUT opacity per hero route.
 */
export function GradeStack({
  tier,
  gradeOn = true,
  intensity,
  profile,
}: GradeStackProps) {
  const lut = useGradeLut();
  const lutRef = useRef<LUT3DEffect>(null);
  const directorGradeOn = useDirectorStore((s) => s.gradeOn);
  const directorLutIntensity = useDirectorStore((s) => s.lutIntensity);
  const activeGradeOn = gradeOn && directorGradeOn;

  const profileConfig = profile ? HERO_GRADE_PROFILES[profile] : null;
  const effectiveBaseIntensity =
    intensity !== undefined
      ? intensity
      : profileConfig
      ? profileConfig.lutOpacity
      : gradeConfig.intensity;

  useEffect(() => {
    if (lutRef.current) {
      const effectiveIntensity =
        directorLutIntensity !== undefined
          ? directorLutIntensity
          : effectiveBaseIntensity;
      const targetOpacity = activeGradeOn ? effectiveIntensity : 0;
      gsap.to(lutRef.current.blendMode.opacity, {
        value: targetOpacity,
        duration: 0.25,
        ease: "power2.out",
      });
    }
  }, [activeGradeOn, effectiveBaseIntensity, directorLutIntensity]);

  if (tier !== "A" || !lut) return null;

  const bloomConfig = profileConfig ? profileConfig.bloom : gradeConfig.bloom;
  const vignetteConfig = profileConfig ? profileConfig.vignette : gradeConfig.vignette;
  const grainConfig = profileConfig ? profileConfig.grain : gradeConfig.grain;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        mipmapBlur={bloomConfig.mipmapBlur}
        luminanceThreshold={bloomConfig.luminanceThreshold}
        intensity={bloomConfig.intensity}
      />
      <ToneMapping mode={gradeConfig.toneMappingMode} />
      <LUT
        ref={lutRef}
        lut={lut}
        blendFunction={BlendFunction.NORMAL}
      />
      <Vignette
        offset={vignetteConfig.offset}
        darkness={vignetteConfig.darkness}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={grainConfig.opacity}
      />
    </EffectComposer>
  );
}

export default GradeStack;
