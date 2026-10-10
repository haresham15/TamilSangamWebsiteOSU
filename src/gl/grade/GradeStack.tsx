// src/gl/grade/GradeStack.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { EffectComposer, Bloom, ToneMapping, LUT, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { LUT3DEffect } from "postprocessing";
import { useGradeLut } from "./useGradeLut";
import { gradeConfig } from "./gradeConfig";
import { useDirectorStore } from "@/director/directorStore";
import gsap from "gsap";

export interface GradeStackProps {
  tier: "A" | "B" | "C";
  gradeOn?: boolean;
  intensity?: number;
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
 */
export function GradeStack({
  tier,
  gradeOn = true,
  intensity = gradeConfig.intensity,
}: GradeStackProps) {
  const lut = useGradeLut();
  const lutRef = useRef<LUT3DEffect>(null);
  const directorGradeOn = useDirectorStore((s) => s.gradeOn);
  const directorLutIntensity = useDirectorStore((s) => s.lutIntensity);
  const activeGradeOn = gradeOn && directorGradeOn;

  useEffect(() => {
    if (lutRef.current) {
      const effectiveIntensity = directorLutIntensity !== undefined ? directorLutIntensity : intensity;
      const targetOpacity = activeGradeOn ? effectiveIntensity : 0;
      gsap.to(lutRef.current.blendMode.opacity, {
        value: targetOpacity,
        duration: 0.15,
        ease: "power2.out",
      });
    }
  }, [activeGradeOn, intensity, directorLutIntensity]);

  if (tier !== "A" || !lut) return null;

  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom
        mipmapBlur={gradeConfig.bloom.mipmapBlur}
        luminanceThreshold={gradeConfig.bloom.luminanceThreshold}
        intensity={gradeConfig.bloom.intensity}
      />
      <ToneMapping mode={gradeConfig.toneMappingMode} />
      <LUT
        ref={lutRef}
        lut={lut}
        blendFunction={BlendFunction.NORMAL}
      />
      <Vignette
        offset={gradeConfig.vignette.offset}
        darkness={gradeConfig.vignette.darkness}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={gradeConfig.grain.opacity}
      />
    </EffectComposer>
  );
}

export default GradeStack;
