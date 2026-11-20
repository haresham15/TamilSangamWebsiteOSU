// src/components/games-hero/beach/BeachWorld.tsx
"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { ContactShadows, type ContactSpot } from "@/gl/art/ContactShadow";
import { FOUNTAIN, GROUND_TOP, PARASOL, SUV_XS, SUV_Z } from "./beachLayout";
import {
  FOG_COLOR,
  FOG_DENSITY,
  SUN_COLOR,
  SUN_DIRECTION,
  SUN_INTENSITY,
  bakeSkyEnvironment,
  buildCanopy,
  buildFence,
  buildFronds,
  buildOcean,
  buildPlaster,
  buildSand,
  buildStone,
  buildSuvs,
  buildTrunks,
  createBeachMaterials,
} from "./beachWorldBuild";

export type BeachQuality = 0 | 1 | 2;

export interface BeachWorldProps {
  /** 0 best (animated sea and palms, 2K shadow map) → 2 mobile (1K shadow map, no sand ripples or glints). */
  quality: BeachQuality;
  /** Holds ambient motion at t = 0 for deterministic captures (?debug). */
  frozen?: boolean;
}

/** Soft ground contact under the SUVs and garden props (the sun shadow falls behind them). */
const CONTACT_SPOTS: ContactSpot[] = [
  ...SUV_XS.map((x): ContactSpot => ({ position: [x, GROUND_TOP, SUV_Z], size: [2.9, 5.1], opacity: 0.6 })),
  { position: [FOUNTAIN.x, GROUND_TOP, FOUNTAIN.z], size: [2.4, 2.4], opacity: 0.45 },
  { position: [PARASOL.x, GROUND_TOP, PARASOL.z], size: [0.45, 0.45], opacity: 0.4 },
];

/** Shadow maps are rendered for the first few frames (materials still compiling), then held. */
const SHADOW_WARMUP_FRAMES = 3;

/**
 * The sunlit beach compound behind the Games hero: sky, sand, sea, breached wall, iron fence,
 * three SUVs, palms and the garden fountain, laid out from beachLayout (the Blender scene).
 *
 * Owns its scene's `fog` and `environment` (a baked sky PMREM) while mounted, so mount it in its
 * own scene. Output is scene-linear HDR, calibrated for the plates' view transform (AgX at
 * −0.7 EV, see LayeredFocusCompositor.gamesAgX). One shadow-casting light, rendered once.
 */
export function BeachWorld({ quality, frozen = false }: BeachWorldProps) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  const time = useMemo(() => ({ value: 0 }), []);
  const sway = useMemo(() => ({ value: 0 }), []);
  const geometries = useMemo(
    () => ({
      dome: new THREE.SphereGeometry(1, 32, 16),
      sand: buildSand(),
      ocean: buildOcean(),
      plaster: buildPlaster(),
      stone: buildStone(),
      fence: buildFence(),
      canopy: buildCanopy(),
      trunks: buildTrunks(),
      fronds: buildFronds(),
    }),
    []
  );
  const suv = useMemo(() => buildSuvs(), []);
  const materials = useMemo(() => createBeachMaterials(time, sway, quality < 2), [time, sway, quality]);
  const fog = useMemo(() => new THREE.FogExp2(FOG_COLOR, FOG_DENSITY), []);
  const sun = useMemo(() => {
    const light = new THREE.DirectionalLight(SUN_COLOR, SUN_INTENSITY);
    light.name = "BeachSun";
    light.target.position.set(2, 0, -29);
    light.position.copy(light.target.position).addScaledVector(SUN_DIRECTION, 60);
    light.castShadow = true;
    const size = quality === 0 ? 2048 : 1024;
    light.shadow.mapSize.set(size, size);
    Object.assign(light.shadow.camera, { left: -22, right: 22, top: 20, bottom: -20, near: 20, far: 110 });
    light.shadow.camera.updateProjectionMatrix();
    light.shadow.bias = -0.0004;
    light.shadow.normalBias = 0.03;
    light.shadow.autoUpdate = false;
    light.shadow.needsUpdate = true;
    return light;
  }, [quality]);
  useDisposeOnUnmount(geometries, suv, materials, sun);

  // Sky reflections and fill: bake before the first frame so nothing renders unlit.
  useLayoutEffect(() => {
    const environment = bakeSkyEnvironment(gl, geometries.dome);
    const previousEnvironment = scene.environment;
    const previousFog = scene.fog;
    scene.environment = environment.texture;
    scene.fog = fog;
    return () => {
      if (scene.environment === environment.texture) scene.environment = previousEnvironment;
      if (scene.fog === fog) scene.fog = previousFog;
      environment.dispose();
    };
  }, [gl, scene, geometries.dome, fog]);

  const warmup = useRef(SHADOW_WARMUP_FRAMES);
  useEffect(() => {
    warmup.current = SHADOW_WARMUP_FRAMES;
    sun.shadow.needsUpdate = true;
  }, [sun]);

  const animated = quality === 0 && !frozen;
  useEffect(() => {
    sway.value = quality === 0 ? 1 : 0;
    if (frozen) time.value = 0;
  }, [quality, frozen, sway, time]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (warmup.current > 0) {
      warmup.current--;
      sun.shadow.needsUpdate = true;
    }
    if (animated && dt > 0) time.value += dt;
  });

  return (
    <group name="BeachWorld">
      <mesh name="BeachSky" geometry={geometries.dome} material={materials.sky} frustumCulled={false} renderOrder={-1000} />
      <mesh name="BeachSand" geometry={geometries.sand} material={materials.sand} receiveShadow />
      <mesh name="BeachOcean" geometry={geometries.ocean} material={materials.ocean} />
      <mesh name="CompoundPlaster" geometry={geometries.plaster} material={materials.plaster} castShadow receiveShadow />
      <mesh name="CompoundStone" geometry={geometries.stone} material={materials.stone} castShadow receiveShadow />
      <mesh name="IronFence" geometry={geometries.fence} material={materials.iron} castShadow />
      <mesh name="SuvBody" geometry={suv.body} material={materials.suvBody} castShadow receiveShadow />
      <mesh name="SuvGlass" geometry={suv.glass} material={materials.suvGlass} />
      <mesh name="SuvRubber" geometry={suv.dark} material={materials.suvDark} castShadow receiveShadow />
      <mesh name="SuvChrome" geometry={suv.chrome} material={materials.suvChrome} />
      <mesh name="PalmTrunks" geometry={geometries.trunks} material={materials.bark} />
      <mesh name="PalmFronds" geometry={geometries.fronds} material={materials.fronds} />
      <mesh name="ParasolCanvas" geometry={geometries.canopy} material={materials.canvas} castShadow receiveShadow />
      <ContactShadows spots={CONTACT_SPOTS} />
      <primitive object={sun} />
      <primitive object={sun.target} />
      <hemisphereLight args={["#c9d3de", "#b7a389", 0.3]} />
    </group>
  );
}
