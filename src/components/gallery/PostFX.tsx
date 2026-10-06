"use client";


import * as THREE from "three";
import { EffectComposer, Bloom, GodRays, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { HERO_CONSTANTS } from "./heroTimeline";

interface PostFXProps {
  sunMesh: THREE.Mesh | null;
}

export function PostFX({ sunMesh }: PostFXProps) {
  return (
    <EffectComposer multisampling={0}>
      {/* 1. Volumetric GodRays streaming from the setting sun */}
      {sunMesh && (
        <GodRays
          sun={sunMesh}
          blendFunction={BlendFunction.SCREEN}
          samples={60}
          density={0.9}
          decay={0.94}
          weight={0.45}
          exposure={0.4}
          clampMax={1.0}
        />
      )}

      {/* 2. Mipmap Bloom capturing the over-exposed solar core & sea glitter */}
      <Bloom
        luminanceThreshold={HERO_CONSTANTS.bloomThreshold}
        luminanceSmoothing={0.3}
        intensity={HERO_CONSTANTS.bloomIntensityBase}
        mipmapBlur
        radius={0.75}
      />

      {/* 3. 35mm Film Grain (6-8% opacity) */}
      <Noise
        opacity={HERO_CONSTANTS.grainOpacity}
        blendFunction={BlendFunction.OVERLAY}
      />

      {/* 4. Anamorphic Lens Vignette */}
      <Vignette
        eskil={false}
        offset={HERO_CONSTANTS.vignetteOffset}
        darkness={HERO_CONSTANTS.vignetteDarkness}
      />
    </EffectComposer>
  );
}
