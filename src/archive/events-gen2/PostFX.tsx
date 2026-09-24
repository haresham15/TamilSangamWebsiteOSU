"use client";

import React, { RefObject, useEffect, useState } from "react";
import * as THREE from "three";
import {
  EffectComposer,
  SelectiveBloom,
  GodRays,
  DepthOfField,
  Vignette,
  Noise,
  ToneMapping,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";

export interface PostFXProps {
  keyLightMeshRef: RefObject<THREE.Mesh | null>;
  keyLightPointLightRef?: RefObject<THREE.Light | null>;
  bloomSelection?: RefObject<THREE.Object3D | null>[];
  showFinaleFX?: boolean;
  focusDistance?: number;
  bokehScale?: number;
  bloomRadius?: number;
  enableGodRaysBlur?: boolean;
  godRaysSamples?: number;
}

/**
 * PostFX:
 * High-octane cinematic post-processing pipeline per §8 of Master PRD.
 *
 * CRITICAL SPEC:
 * Bloom uses SelectiveBloom restricted strictly to THREE Layer 1 (the key light source mesh
 * and rim edge highlights). This eliminates the full-scene blowout defect.
 */
export function PostFX({
  keyLightMeshRef,
  keyLightPointLightRef,
  bloomSelection,
  showFinaleFX = false,
  bokehScale = 4,
  bloomRadius = 0.6,
  enableGodRaysBlur = true,
  godRaysSamples = 60,
}: PostFXProps) {
  // Ensure the sun mesh is mounted before instantiating GodRays to prevent null matrixWorld crash
  const [sunMesh, setSunMesh] = useState<THREE.Mesh | null>(null);

  useEffect(() => {
    if (keyLightMeshRef.current) {
      setSunMesh(keyLightMeshRef.current);
    }
  }, [keyLightMeshRef]);

  const selectionList = bloomSelection || (keyLightMeshRef ? [keyLightMeshRef] : []);
  const lightsList = keyLightPointLightRef ? [keyLightPointLightRef] : [];

  return (
    <EffectComposer multisampling={0} enableNormalPass={false} autoClear={false}>
      {/* 1. Selective Bloom: Bound strictly to Layer 1 objects */}
      <SelectiveBloom
        selection={selectionList}
        selectionLayer={1}
        lights={lightsList}
        intensity={0.9}
        luminanceThreshold={0.75}
        luminanceSmoothing={0.2}
        mipmapBlur
        radius={bloomRadius}
      />

      {/* 2. Volumetric GodRays centered on the key light mesh */}
      {sunMesh && (
        <GodRays
          sun={sunMesh}
          samples={godRaysSamples}
          density={0.96}
          decay={0.93}
          weight={0.4}
          exposure={0.55}
          clampMax={1.0}
          blur={enableGodRaysBlur}
        />
      )}

      {/* 3. Cinematic Depth of Field: Autofocuses on hero billboard, blurring foreground crowd */}
      <DepthOfField
        target={[0, 3.2, 0]}
        focalLength={0.06}
        bokehScale={bokehScale}
      />

      {/* 4. Vignette: Focuses viewer's eye into central backlit silhouette */}
      <Vignette offset={0.3} darkness={0.65} eskil={false} />

      {/* 5. Fine Film Grain Overlay */}
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.035} />

      {/* 6. ACES Filmic Tone Mapping Pass */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      {/* 7. Finale Sequence Chromatic Aberration */}
      {showFinaleFX && (
        <ChromaticAberration offset={new THREE.Vector2(0.0009, 0.0009)} />
      )}
    </EffectComposer>
  );
}
