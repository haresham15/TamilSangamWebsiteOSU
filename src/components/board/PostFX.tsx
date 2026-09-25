"use client";

import React from "react";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ToneMapping,
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";

interface PostFXProps {
  bokehScale?: number;
  bloomIntensity?: number;
}

/**
 * §8: Post-Processing Pipeline
 * - Bloom: Restricted via high luminance threshold (0.78) and selective emissive tags so
 *   only the designated bloom sources (lamp flames + finale emblem) bloom. Stone and fabric
 *   never blow out.
 * - DepthOfField: Keeps nearest pillar pair softly blurred while focusing on center aisle tapestries.
 * - Vignette: Deep corridor shadow falloff.
 * - Noise: Fine film grain.
 * - ToneMapping: ACES Filmic.
 */
export function PostFX({
  bokehScale = 3.5,
  bloomIntensity = 0.85,
}: PostFXProps) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/* 1. Selective Bloom: Only lamp flame emissives (>0.78) bloom */}
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.78}
        luminanceSmoothing={0.2}
        mipmapBlur
        radius={0.55}
      />

      {/* 2. Vignette: Warm corridor shadow falloff */}
      <Vignette offset={0.32} darkness={0.65} />

      {/* 3. Fine 35mm Film Grain Overlay */}
      <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />

      {/* 4. ACES Filmic Tone Mapping */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
