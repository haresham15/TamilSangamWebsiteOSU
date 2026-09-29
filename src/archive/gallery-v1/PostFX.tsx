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
  bloomIntensity?: number;
}

/**
 * §6 & §8: Post-Processing Pipeline
 * - Bloom: Restricted via high luminanceThreshold (0.80) and mipmapBlur so that ONLY
 *   the designated layer-1 sources (sun disc, flare streak, hard pluck vibration) bloom.
 *   Cyclorama and polaroid cardstock never bloom or wash out.
 * - Vignette: Warm golden-hour peripheral falloff (offset: 0.35, darkness: 0.60).
 * - Noise: Subtle 35mm film grain overlay (opacity: 0.025).
 * - ToneMapping: ACES Filmic Tone Mapping.
 */
export function PostFX({ bloomIntensity = 0.9 }: PostFXProps) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/* 1. Selective Bloom: Restricted to sun disc + flare streak (>0.80 luminance) */}
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.80}
        luminanceSmoothing={0.20}
        mipmapBlur
        radius={0.60}
      />

      {/* 2. Coastal Golden-Hour Vignette */}
      <Vignette offset={0.35} darkness={0.60} />

      {/* 3. Subtle 35mm Film Grain */}
      <Noise opacity={0.025} blendFunction={BlendFunction.OVERLAY} />

      {/* 4. ACES Filmic Tone Mapping */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
