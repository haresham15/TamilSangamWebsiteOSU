// src/gl/art/LightRig.tsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

export interface LightRigProps {
  /** Motivated main source (sun, window, torch wash). The only shadow caster. */
  keyColor?: THREE.ColorRepresentation;
  keyIntensity?: number;
  keyPosition?: Vec3;
  keyTarget?: Vec3;
  /** Shadow map size; 0 disables shadows. Drive updates with useShadowUpdates (src/gl/shadows.ts). */
  shadowMapSize?: number;
  /** Half-extent of the orthographic shadow frustum, in metres. */
  shadowExtent?: number;
  /** Sky/ground ambient. Keep it the complementary temperature of the key and well below it. */
  skyColor?: THREE.ColorRepresentation;
  groundColor?: THREE.ColorRepresentation;
  fillIntensity?: number;
  /** Back/rim light that separates silhouettes from the background. */
  rimColor?: THREE.ColorRepresentation;
  rimIntensity?: number;
  rimPosition?: Vec3;
}

/**
 * Three-point rig with a clear hierarchy: one strong key, a dim opposite-temperature fill,
 * one rim. Lights are tagged `userData.gradeRole` so the Tier-B grade fallback can tint them.
 * Rule of thumb: key : fill ≈ 4 : 1 or steeper. Even lighting is what makes a scene look flat.
 */
export function LightRig({
  keyColor = "#ffd9a8",
  keyIntensity = 3,
  keyPosition = [4, 6, 3],
  keyTarget = [0, 0, 0],
  shadowMapSize = 1024,
  shadowExtent = 6,
  skyColor = "#7d8fb3",
  groundColor = "#2a1d14",
  fillIntensity = 0.35,
  rimColor = "#a8c4ff",
  rimIntensity = 1.2,
  rimPosition = [-3, 3, -5],
}: LightRigProps) {
  const key = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    const light = key.current;
    if (!light) return;
    light.target.position.set(...keyTarget);
    light.target.updateMatrixWorld();
    const cam = light.shadow.camera;
    cam.left = -shadowExtent;
    cam.right = shadowExtent;
    cam.top = shadowExtent;
    cam.bottom = -shadowExtent;
    cam.near = 0.5;
    cam.far = 40;
    cam.updateProjectionMatrix();
    // Depends on the vector contents, not their identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyTarget[0], keyTarget[1], keyTarget[2], shadowExtent]);

  return (
    <>
      <directionalLight
        ref={key}
        color={keyColor}
        intensity={keyIntensity}
        position={keyPosition}
        castShadow={shadowMapSize > 0}
        shadow-mapSize={[shadowMapSize || 1, shadowMapSize || 1]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={3}
        userData={{ gradeRole: "key" }}
      />
      <hemisphereLight args={[skyColor, groundColor, fillIntensity]} userData={{ gradeRole: "fill" }} />
      <directionalLight color={rimColor} intensity={rimIntensity} position={rimPosition} userData={{ gradeRole: "rim" }} />
    </>
  );
}
