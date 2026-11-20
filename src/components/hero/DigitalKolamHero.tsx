"use client";

import React, { useRef, useEffect, useMemo, useState, useSyncExternalStore, Suspense } from "react";
import * as THREE from "three";
import Image from "next/image";
import { useFrame, type RootState } from "@react-three/fiber";
import { PerspectiveCamera, Text3D, Center, Lightformer } from "@react-three/drei";
import { BakedEnvironment } from "@/gl/BakedEnvironment";
import { SceneView as View } from "@/components/canvas/SceneView";
import { useLiteMode } from "@/context/LiteModeContext";
import { heroScrollProgress, heroDirectorState } from "@/engine/heroScrollStore";
import { governor } from "@/engine/governor";
import { registerSystem } from "@/engine/masterTick";
import { useBootStore } from "@/engine/bootStore";
import { evalCamera, STRAND_COUNT, WREATH_CY, WREATH_R_IN } from "./flowMath";
import {
  generatePulliLattice,
  generateStrandWaypoints,
  buildResampledStrand,
  buildStaticKolamMeshes,
  buildCompositePath,
  buildPathTextureBundle,
  PulliDotLattice,
} from "./pathBuilder";
import {
  createPeelConveyorMaterial,
  createPowderConveyorMaterial,
  createPowderSharedUniforms,
  createShedGrainGeometry,
  THRESHOLD_FLOOR_Z,
} from "./peelConveyorShader";
import { createThresholdStoneMaterial, HERO_SCENE_BG } from "./thresholdStone";
import { createDabGeometry, createDabMaterial } from "./powderDabs";
import { createSurfaceMaterial } from "@/gl/art/surface";
import { seeded } from "@/gl/art/geometry";
import { DustMotes as ArtDustMotes } from "@/gl/art/Atmosphere";
import { ContactShadows } from "@/gl/art/ContactShadow";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { useShadowUpdates } from "@/gl/shadows";
import { useRenderMode } from "@/components/providers/useRenderMode";
import { playCinematicWhoosh } from "@/audio/sounds";
import { useReducedMotion } from "framer-motion";
import { createHeroKineticsTracker } from "@/lib/heroKinetics";
import muktaFont from "../../../public/fonts/mukta-malar-tamil.json";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { createCinemaCameraDamper, smootherstep } from "@/lib/cinemaCameraDamper";
import { proceduralPbrMaps } from "@/lib/proceduralPbrMaps";

/**
 * Camera Vertical Truck Glide (§PRD 5.2)
 * Glides downward from y = 0 to y = -1.2 * Hv, with camZ 12 -> 11.2 and pitch -4 deg -> 0 deg.
 * Elevated with scroll-velocity inertia, pointer parallax, and portal push-through (Act II -> Act III).
 */
function HeroTruckCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const currentPos = useRef(new THREE.Vector3(0, 0, 12));
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  // URL flag parsed once per mount, not per frame.
  const [isCinematic] = useState(() => isHeroCinematicEnabled("home"));
  const kineticsRef = useRef(createHeroKineticsTracker(4.2, 5.0, 4.0));
  const { isLiteMode } = useLiteMode();
  const reducedMotion = useReducedMotion();
  const isReduced = Boolean(reducedMotion || isLiteMode);

  const damperRef = useRef(
    createCinemaCameraDamper({
      lambdaPos: 6.0,
      lambdaLook: 10.0,
      breathingAmplitude: 0.0035,
      breathingRoll: 0.0015,
    })
  );

  useSafeFrame((state, safeDelta) => {
    const rawP = heroDirectorState.scrubActive
      ? heroDirectorState.scrubProgress
      : heroScrollProgress.current;

    const kinetics = kineticsRef.current.update(rawP, state.pointer, safeDelta);
    const p = isCinematic ? rawP : kinetics.smoothProgress;

    const { camY, camZ, pitchDeg } = evalCamera(p);

    if (isCinematic) {
      // Workstream 1: Dual-Channel Camera Damper with C1 Hermite Portal Push
      // The wreath frames the Kural through its whole beat (PRD §9: tiers 0.54–0.66, dwell to
      // Act III); the push only starts once the verse has left (page timeline, p ≈ 0.875).
      const pushT = heroPushT(p);
      const easePush = smootherstep(pushT);
      // Shorter push than the tube look: past ~3 units the powder dabs grow into blobs.
      const portalZOffset = easePush * 3.0;

      const px = kinetics.smoothPointerX * 0.35;
      const py = -kinetics.smoothPointerY * 0.25;
      const aspectScale = state.viewport.aspect < 1.2 ? 1.2 / Math.max(state.viewport.aspect, 0.5) : 1.0;

      // Oblique view onto the threshold: the camera sits back along -Y and looks across the
      // stone, so the floor recedes toward the top of the frame. The aim point stays (0, camY).
      const dist = heroCamDist(p, camZ, state.viewport.aspect) - portalZOffset * aspectScale;
      const tilt = THREE.MathUtils.degToRad(heroTiltDeg(p));
      targetPos.current.set(px, camY - dist * Math.sin(tilt) + py, THRESHOLD_FLOOR_Z + dist * Math.cos(tilt));
      targetLookAt.current.set(0, camY + py * 0.4, THRESHOLD_FLOOR_Z);
      // As the wreath forms, aim a little below its centre so the near (larger) side of the
      // ring stays in frame and the ring sits centred around the Kural.
      const settle = THREE.MathUtils.smoothstep(p, 0.3, 0.6);
      targetPos.current.y -= 0.3 * settle;

      const damped = damperRef.current.update(targetPos.current, targetLookAt.current, p, safeDelta, {
        isReducedMotion: isReduced,
        isLiteMode,
        additionalRoll: kinetics.velocityBank * 0.6,
      });

      state.camera.position.copy(damped.position);
      state.camera.rotation.set(
        (pitchDeg + heroTiltDeg(p)) * (Math.PI / 180) - kinetics.smoothPointerY * 0.035 + kinetics.velocityPitch,
        kinetics.smoothPointerX * 0.045,
        damped.roll
      );
    } else {
      // Baseline fall-back damper
      const damp = 1 - Math.exp(-22 * safeDelta);
      currentPos.current.y += (camY - currentPos.current.y) * damp;
      currentPos.current.z += (camZ - currentPos.current.z) * damp;

      const pushT = Math.max(0, Math.min(1, (p - 0.62) / 0.16));
      const easePush = pushT * pushT * (3 - 2 * pushT);
      const portalZOffset = easePush * 6.5;

      const px = kinetics.smoothPointerX * 0.35;
      const py = -kinetics.smoothPointerY * 0.25;

      const aspectScale = state.viewport.aspect < 1.2 ? 1.2 / Math.max(state.viewport.aspect, 0.5) : 1.0;
      state.camera.position.set(px, currentPos.current.y + py, (currentPos.current.z - portalZOffset) * aspectScale);
      state.camera.rotation.set(
        pitchDeg * (Math.PI / 180) - kinetics.smoothPointerY * 0.035 + kinetics.velocityPitch,
        kinetics.smoothPointerX * 0.045,
        kinetics.velocityBank * 0.6
      );
    }

    if (typeof window !== "undefined") {
      (window as unknown as { __heroCameraDiagnostic?: unknown }).__heroCameraDiagnostic = {
        position: [state.camera.position.x, state.camera.position.y, state.camera.position.z],
        rotation: [state.camera.rotation.x, state.camera.rotation.y, state.camera.rotation.z],
        fov: (state.camera as THREE.PerspectiveCamera).fov,
        p,
      };
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 12]} fov={35} />;
}

/** Cinematic camera tilt off the stone's normal (degrees): an oblique view across the threshold. */
const HERO_TILT_DEG = 26;

/**
 * Tilt for scroll p. While the strands peel (p 0.1–0.5) the camera looks a little further
 * across the stone so the letter stays at the top of frame as the threads leave it, instead of
 * dropping out abruptly; it is gone by p 0.45 (PRD §5.3).
 */
function heroTiltDeg(p: number): number {
  const up = THREE.MathUtils.smoothstep(p, 0.08, 0.2);
  const down = 1 - THREE.MathUtils.smoothstep(p, 0.37, 0.47);
  return HERO_TILT_DEG + 20 * up * down;
}

/** Camera push-through toward Act III, 0→1. Starts after the Kural has faded out. */
function heroPushT(p: number): number {
  return Math.max(0, Math.min(1, (p - 0.86) / 0.12));
}

/** Half-extent of the finished wreath plus a margin for the nav and screen edge (world units). */
const WREATH_FRAME_HALF_W = 5.0;
const WREATH_FRAME_HALF_H = 3.75;

/**
 * Camera distance to the aim point. During the descent it follows the PRD camera (camZ, scaled
 * up on narrow screens); as the wreath forms it backs off just enough that the whole ring fits
 * the frame (on 375 px that means further back, not cropped sides).
 */
function heroCamDist(p: number, camZ: number, aspect: number): number {
  const aspectScale = aspect < 1.2 ? 1.2 / Math.max(aspect, 0.5) : 1.0;
  const base = camZ * aspectScale;
  const t = Math.tan(THREE.MathUtils.degToRad(17.5));
  const fit = Math.max(WREATH_FRAME_HALF_H / t, WREATH_FRAME_HALF_W / (t * Math.max(aspect, 0.3)));
  const k = THREE.MathUtils.smoothstep(p, 0.42, 0.62);
  return base + Math.max(0, fit - base) * k;
}

/**
 * Shared Safe Frame Hook enforcing Safeguard 2 (Delta Clamping)
 */
function useSafeFrame(callback: (state: RootState, safeDelta: number) => void) {
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    callback(state, dt);
  });
}

/**
 * Quintic C2-continuous smootherstep: 6x^5 - 15x^4 + 10x^3
 */
function _smootherstep(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

/**
 * Kolam Shader Material Patched via onBeforeCompile (§MASTER DIRECTIVE)
 * Retains complete Three.js PBR pipeline, HDR bloom emissive response, and fog.
 * Injects:
 * - Travelling light wave pulses along the continuous threads
 * - Draw-on emergence transition factor
 * - Diagnostic Wireframe Companion for Director's Viewport (§6.3)
 */
/**
 * Kolam Gold Shader Material Patched via onBeforeCompile (§PRD 8.2)
 * Retains complete Three.js PBR pipeline, HDR bloom emissive response, and fog.
 * Injects:
 * - Subtle travelling light pulse wave along the continuous woven threads
 */
function _createSymmetricKolamMaterial() {
  const customMaterial = new THREE.MeshStandardMaterial({
    color: "#A6F0CF",
    metalness: 0.55,
    roughness: 0.22,
    emissive: "#FF9E1B",
    emissiveIntensity: 0.20,
  });
  customMaterial.defines = { USE_UV: "" };

  customMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uScroll = { value: 0 };
    shader.fragmentShader = `
      uniform float uTime;
      uniform float uScroll;
      ${shader.fragmentShader}
    `.replace(
      `#include <emissivemap_fragment>`,
      `#include <emissivemap_fragment>
       // Subtle travelling light pulse along the woven threads
       float pulse = sin(vUv.x * 24.0 - uTime * 2.0);
       float glow = smoothstep(0.65, 1.0, pulse) * 0.35;
       totalEmissiveRadiance += vec3(1.0, 0.72, 0.25) * glow;
      `
    );
    customMaterial.userData.shader = shader;
  };

  // Diagnostic wireframe material variant (§6.3)
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x00ff41,
    wireframe: true,
    toneMapped: false,
  });

  return { material: customMaterial, wireMaterial: wireMat };
}

/**
 * Stationary Grounded Pulli Points (§PRD 5.1 & 5.4)
 * Small warm gold dots of the Pulli grid stay completely stationary in 3D world space.
 * Extended vertically to cover y in [+0.6 Hv, -1.9 Hv] (~+4.54 to -14.38).
 */
function GroundedPulliPoints({ lattice }: { lattice: PulliDotLattice }) {
  const dotsRef = useRef<THREE.InstancedMesh>(null);
  const totalCount = lattice.dotCount * 2;

  // 8×6 segments: dots are 4–10 px on screen; 10×8 cost 93k triangles for 582 instances.
  const dotGeo = useMemo(() => new THREE.SphereGeometry(0.026, 8, 6), []);
  const dotMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: "#FFF4D0",
      emissive: "#FFC526",
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.6,
    });

    const uniforms = {
      uP: { value: 0 },
      uCenter: { value: new THREE.Vector2(0, WREATH_CY) },
      uTextRadius: { value: 1.15 * WREATH_R_IN },
    };
    mat.userData.uniforms = uniforms;

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uP = uniforms.uP;
      shader.uniforms.uCenter = uniforms.uCenter;
      shader.uniforms.uTextRadius = uniforms.uTextRadius;

      shader.vertexShader = `
        varying vec2 vDotPos;
        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
         #ifdef USE_INSTANCING
           vDotPos = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xy;
         #else
           vDotPos = position.xy;
         #endif
        `
      );

      shader.fragmentShader = `
        uniform float uP;
        uniform vec2 uCenter;
        uniform float uTextRadius;
        varying vec2 vDotPos;
        ${shader.fragmentShader}
      `.replace(
        `#include <emissivemap_fragment>`,
        `#include <emissivemap_fragment>
         // PRD §8.4: Fade dot alpha/emissive inside radius 1.15 * R_in around C once wreath forms
         float dotDist = length(vDotPos - uCenter);
         float kuralFormT = smoothstep(0.42, 0.60, uP);
         float insideVoid = 1.0 - smoothstep(uTextRadius * 0.70, uTextRadius, dotDist);
         float dimFactor = mix(1.0, 0.12, kuralFormT * insideVoid);

         // Soft glow pulse following peel front down the lattice
         float peelFrontY = mix(4.5, -9.08, smoothstep(0.12, 0.60, uP));
         float peelDist = abs(vDotPos.y - peelFrontY);
         float pulse = exp(-peelDist * peelDist / 1.4) * (1.0 - kuralFormT * 0.85);

         diffuseColor.rgb *= dimFactor;
         totalEmissiveRadiance *= dimFactor;
         totalEmissiveRadiance += vec3(1.0, 0.75, 0.3) * pulse * 0.35;
        `
      );
    };

    return mat;
  }, []);

  const dotWireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x00ff41,
        wireframe: true,
        toneMapped: false,
      }),
    []
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(
    () => () => {
      dotGeo.dispose();
      dotMat.dispose();
      dotWireMat.dispose();
    },
    [dotGeo, dotMat, dotWireMat]
  );

  useEffect(() => {
    if (!dotsRef.current) return;
    let idx = 0;
    // Left hemisphere pulli dots
    for (let i = 0; i < lattice.dotCount; i++) {
      dummy.position.set(
        lattice.leftDots[i * 3],
        lattice.leftDots[i * 3 + 1],
        lattice.leftDots[i * 3 + 2]
      );
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      dotsRef.current.setMatrixAt(idx++, dummy.matrix);
    }
    // Right hemisphere pulli dots
    for (let i = 0; i < lattice.dotCount; i++) {
      dummy.position.set(
        lattice.rightDots[i * 3],
        lattice.rightDots[i * 3 + 1],
        lattice.rightDots[i * 3 + 2]
      );
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      dotsRef.current.setMatrixAt(idx++, dummy.matrix);
    }
    dotsRef.current.instanceMatrix.needsUpdate = true;
  }, [lattice, dummy]);

  useSafeFrame(() => {
    if (dotsRef.current) {
      dotsRef.current.visible = heroDirectorState.dotsVisible;
    }
    const p = heroDirectorState.scrubActive
      ? heroDirectorState.scrubProgress
      : heroScrollProgress.current;
    if (dotMat.userData.uniforms) {
      dotMat.userData.uniforms.uP.value = p;
    }
  });

  return (
    <instancedMesh
      ref={dotsRef}
      args={[dotGeo, dotMat, totalCount]}
      userData={{ wireMaterial: dotWireMat }}
      position={[0, 0, 0]}
    />
  );
}

/**
 * Peel & Flow Kolam Mesh — GPU Conveyor (§PRD 6, 7 & 8)
 * Renders the 7 authentic dot-woven strands per half with zero-twist camera-aligned frames.
 * Displaces vertices dynamically along composite path Pi_k(s) based on analytic feed s = f_k(p) - a.
 * At p = 0.00, renders the pristine stationary weave.
 * As p advances, lines peel exclusively at the top seam (V-notch) and flow downward into the wreath.
 */
function PeelAndFlowKolamMesh({ isMobile, tier, look }: { isMobile: boolean; tier: string; look: "powder" | "tube" }) {
  if (look === "powder") return <PowderKolam isMobile={isMobile} tier={tier} />;
  return <TubeKolam isMobile={isMobile} tier={tier} />;
}

/**
 * Cinematic path: the same conveyor drawn as rice powder on the threshold stone.
 * Ridge (lit, casts the peel shadow) + skirt (contact darkening, loose grains) per half,
 * and the pulli as powder dabs.
 */
function PowderKolam({ isMobile, tier }: { isMobile: boolean; tier: string }) {
  const built = useMemo(() => {
    const lattice = generatePulliLattice(isMobile);
    const strands = [];
    const compositePaths = [];
    for (let k = 0; k < STRAND_COUNT; k++) {
      const strand = buildResampledStrand(generateStrandWaypoints(k, STRAND_COUNT), k, 0.02);
      strands.push(strand);
      compositePaths.push(buildCompositePath(strand, k, 0.02));
    }
    const bundle = buildPathTextureBundle(compositePaths, tier === "A" ? 4096 : 2048);
    // The ridge's underside is buried in the stone, so 10/8 radial segments keep the
    // triangle count inside the PRD §8.3 budget (84k A / 43k B for both halves).
    const ridgeGeometry = buildStaticKolamMeshes(strands, tier === "A" ? 10 : 8, tier === "A" ? 0.045 : 0.07, 0.024).rightGeometry;
    // Skirt: a flat ribbon (2 quads across) on the stone, coarser along the line.
    const skirtGeometry = buildStaticKolamMeshes(strands, 2, tier === "A" ? 0.06 : 0.09, 0.024).rightGeometry;
    const shared = createPowderSharedUniforms();
    const right = createPowderConveyorMaterial(bundle, +0.03, shared);
    const left = createPowderConveyorMaterial(bundle, -0.03, shared);
    // Different seeds per half so the shed dust does not mirror.
    const grainRight = createShedGrainGeometry(STRAND_COUNT, tier === "A" ? 28 : 12, 5);
    const grainLeft = createShedGrainGeometry(STRAND_COUNT, tier === "A" ? 28 : 12, 17);
    return { lattice, ridgeGeometry, skirtGeometry, grainRight, grainLeft, shared, right, left, pathTexture: bundle.texture };
  }, [isMobile, tier]);

  useEffect(
    () => () => {
      built.ridgeGeometry.dispose();
      built.skirtGeometry.dispose();
      built.grainRight.dispose();
      built.grainLeft.dispose();
      for (const half of [built.right, built.left]) {
        half.material.dispose();
        half.depthMaterial.dispose();
        half.skirtMaterial.dispose();
        half.grainMaterial.dispose();
        half.wireMaterial.dispose();
      }
      built.pathTexture.dispose();
    },
    [built]
  );

  const containerRef = useRef<THREE.Group>(null);

  useSafeFrame((state) => {
    const p = heroDirectorState.scrubActive ? heroDirectorState.scrubProgress : heroScrollProgress.current;
    built.shared.uP.value = p;
    built.shared.uTime.value = state.clock.elapsedTime * heroDirectorState.speedMultiplier;
    // Depth falloff from the camera's aim distance to the far edge; deeper under the intro title.
    const cam = state.camera;
    const aimDist = Math.max(1, cam.position.z - THRESHOLD_FLOOR_Z) / Math.max(0.2, Math.cos(cam.rotation.x));
    const introT = 1 - THREE.MathUtils.smoothstep(p, 0.06, 0.14);
    built.shared.uDepthDim.value.set(aimDist * (0.95 - 0.1 * introT), aimDist * 1.6, 0.5 + 0.4 * introT);
    // Grains about 0.012 world units across, in framebuffer pixels.
    const fov = (state.camera as THREE.PerspectiveCamera).fov;
    built.shared.uPointScale.value =
      (0.012 * state.size.height * state.viewport.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(fov * 0.5)));
    built.shared.uDepthDim.value.z = 0.3; // lifted ground: keep distant kolam lines readable
    if (containerRef.current) {
      // Portal push-through (Act II → III): the wreath opens radially past the frustum.
      const pushT = heroPushT(p);
      const radialScale = 1.0 + pushT * pushT * 2.8;
      containerRef.current.scale.set(radialScale, radialScale, 1.0);
      // The skirt is a decal on the stone; once the ring scales off the floor it would float.
      built.shared.uSkirtOpacity.value = 1 - Math.min(1, pushT * 3);
    }
  });

  return (
    <>
      <PowderDabs lattice={built.lattice} depthDim={built.shared.uDepthDim} />
      <group ref={containerRef} name="PowderKolamContainer">
        <mesh name="RightSkirt" geometry={built.skirtGeometry} material={built.right.skirtMaterial} frustumCulled={false} renderOrder={1} />
        <mesh name="LeftSkirt" geometry={built.skirtGeometry} material={built.left.skirtMaterial} scale={[-1, 1, 1]} frustumCulled={false} renderOrder={1} />
        <points name="RightShed" geometry={built.grainRight} material={built.right.grainMaterial} frustumCulled={false} renderOrder={2} />
        <points name="LeftShed" geometry={built.grainLeft} material={built.left.grainMaterial} scale={[-1, 1, 1]} frustumCulled={false} renderOrder={2} />
        <mesh
          name="RightHalf"
          geometry={built.ridgeGeometry}
          material={built.right.material}
          customDepthMaterial={built.right.depthMaterial}
          userData={{ wireMaterial: built.right.wireMaterial }}
          frustumCulled={false}
          castShadow
        />
        <mesh
          name="LeftHalf"
          geometry={built.ridgeGeometry}
          material={built.left.material}
          customDepthMaterial={built.left.depthMaterial}
          userData={{ wireMaterial: built.left.wireMaterial }}
          scale={[-1, 1, 1]}
          frustumCulled={false}
          castShadow
        />
      </group>
    </>
  );
}

/** Pulli dots as powder dabs on the stone: one instanced draw, static matrices. */
function PowderDabs({ lattice, depthDim }: { lattice: PulliDotLattice; depthDim: { value: THREE.Vector3 } }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const total = lattice.dotCount * 2;
  const geometry = useMemo(() => createDabGeometry(10), []);
  const dab = useMemo(() => createDabMaterial(depthDim), [depthDim]);
  useDisposeOnUnmount(geometry, dab.material);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const rand = seeded(31);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const zAxis = new THREE.Vector3(0, 0, 1);
    let idx = 0;
    for (const dots of [lattice.leftDots, lattice.rightDots]) {
      for (let i = 0; i < lattice.dotCount; i++) {
        const r = 0.034 * (0.7 + rand() * 0.65);
        pos.set(dots[i * 3] + (rand() - 0.5) * 0.012, dots[i * 3 + 1] + (rand() - 0.5) * 0.012, THRESHOLD_FLOOR_Z);
        q.setFromAxisAngle(zAxis, rand() * Math.PI * 2);
        scl.set(r * (0.9 + rand() * 0.25), r * (0.8 + rand() * 0.2), 0.011 * (0.8 + rand() * 0.45));
        mesh.setMatrixAt(idx++, m.compose(pos, q, scl));
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [lattice]);

  useSafeFrame((state) => {
    if (ref.current) ref.current.visible = heroDirectorState.dotsVisible;
    dab.uniforms.uP.value = heroDirectorState.scrubActive ? heroDirectorState.scrubProgress : heroScrollProgress.current;
    dab.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <instancedMesh ref={ref} args={[geometry, dab.material, total]} receiveShadow />;
}

function TubeKolam({ isMobile, tier }: { isMobile: boolean; tier: string }) {
  const { lattice, rightGeometry, rightConveyor, leftConveyor, pathTexture } = useMemo(() => {
    const lattice = generatePulliLattice(isMobile);
    const strands = [];
    const compositePaths = [];

    for (let k = 0; k < STRAND_COUNT; k++) {
      const waypoints = generateStrandWaypoints(k, STRAND_COUNT);
      const strand = buildResampledStrand(waypoints, k, 0.02);
      strands.push(strand);
      compositePaths.push(buildCompositePath(strand, k, 0.02));
    }

    // PRD §8.3: path samples N = 4096 (Tier A) / 2048 (Tier B)
    const bundle = buildPathTextureBundle(compositePaths, tier === "A" ? 4096 : 2048);

    const radialSegs = tier === "A" ? 10 : 8;
    const dsTube = tier === "A" ? 0.045 : 0.07;
    const { rightGeometry } = buildStaticKolamMeshes(
      strands,
      radialSegs,
      dsTube,
      0.024
    );

    const rightConveyor = createPeelConveyorMaterial(bundle, +0.03);
    const leftConveyor = createPeelConveyorMaterial(bundle, -0.03);

    return { lattice, rightGeometry, rightConveyor, leftConveyor, pathTexture: bundle.texture };
  }, [isMobile, tier]);

  // Built by hand in useMemo, so R3F never disposes them; release on rebuild/unmount.
  useEffect(
    () => () => {
      rightGeometry.dispose();
      rightConveyor.material.dispose();
      rightConveyor.wireMaterial.dispose();
      leftConveyor.material.dispose();
      leftConveyor.wireMaterial.dispose();
      pathTexture.dispose();
    },
    [rightGeometry, rightConveyor, leftConveyor, pathTexture]
  );

  const containerRef = useRef<THREE.Group>(null);

  // Hot loop execution (clamped delta)
  useSafeFrame((state) => {
    const time = state.clock.elapsedTime;
    const speedMult = heroDirectorState.speedMultiplier;
    const p = heroDirectorState.scrubActive
      ? heroDirectorState.scrubProgress
      : heroScrollProgress.current;

    rightConveyor.uniforms.uTime.value = time * speedMult;
    rightConveyor.uniforms.uP.value = p;

    leftConveyor.uniforms.uTime.value = time * speedMult;
    leftConveyor.uniforms.uP.value = p;

    // Camera Portal Push-Through: Kolam wreath scales radially outward past frustum
    if (containerRef.current) {
      const pushT = Math.max(0, Math.min(1, (p - 0.62) / 0.16));
      const radialScale = 1.0 + pushT * pushT * 2.8;
      containerRef.current.scale.set(radialScale, radialScale, 1.0);
    }
  });

  return (
    <>
      {/* Grounded Stationary Pulli Dots Lattice */}
      <GroundedPulliPoints lattice={lattice} />

      {/* Symmetric Dot-Woven Kolam Halves Driven by GPU Conveyor */}
      <group ref={containerRef} name="PeelAndFlowKolamContainer" position={[0, 0, 0]}>
        <mesh
          name="RightHalf"
          geometry={rightGeometry}
          material={rightConveyor.material}
          userData={{ wireMaterial: rightConveyor.wireMaterial }}
          scale={[1, 1, 1]}
          castShadow
          receiveShadow
        />
        <mesh
          name="LeftHalf"
          geometry={rightGeometry}
          material={leftConveyor.material}
          userData={{ wireMaterial: leftConveyor.wireMaterial }}
          scale={[-1, 1, 1]}
          castShadow
          receiveShadow
        />
      </group>
    </>
  );
}

/**
 * React Bits ScrollExpand Intro Title & Scroll Cue Overlay (p in [0.00, 0.12])
 * Renders the expanding visible black frame with thick solid black bezel borders,
 * the headline held over the frame that lifts away as the media takes over,
 * and the subtle scroll hint.
 */
// Intro surround colour (warm espresso, same as the scene's darkest value).
const INTRO_MATTE = HERO_SCENE_BG;

function ScrollExpandIntroOverlay() {
  const frameRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const hasTriggeredWhoosh = useRef(false);
  const lastP = useRef(-1);
  const hasInitialized = useRef(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const p = heroDirectorState.scrubActive
        ? heroDirectorState.scrubProgress
        : heroScrollProgress.current;

      // Skip redundant DOM mutations when progress is stationary
      if (hasInitialized.current && Math.abs(p - lastP.current) < 0.00008) {
        raf = requestAnimationFrame(update);
        return;
      }
      lastP.current = p;
      hasInitialized.current = true;

      const EXPAND_END = 0.12;
      const expandT = Math.min(1, Math.max(0, p / EXPAND_END));
      const easeE = expandT * expandT * (3 - 2 * expandT);
      const borderOpacity = 1 - easeE;

      // Cinematic sound whoosh on hero frame expansion
      if (p > 0.015 && p < EXPAND_END && !hasTriggeredWhoosh.current) {
        hasTriggeredWhoosh.current = true;
        playCinematicWhoosh(0.55);
      } else if (p <= 0.005) {
        hasTriggeredWhoosh.current = false;
      }

      // Expanding Visible Black Frame with thick solid black bezel matte
      if (frameRef.current) {
        if (p >= EXPAND_END) {
          frameRef.current.style.opacity = "0";
          frameRef.current.style.visibility = "hidden";
        } else {
          frameRef.current.style.visibility = "visible";
          const isMobile = window.innerWidth < 768;
          const startW = isMobile ? 66 : 34;
          const startH = isMobile ? 42 : 42;
          const w = startW + (100 - startW) * easeE;
          const h = startH + (100 - startH) * easeE;

          // Feathered ellipse of light: no edge, the scene falls off into warm darkness. The
          // gradient is painted once per breakpoint and grown with a compositor-only scale, so
          // scrolling the intro never repaints a full-screen gradient.
          if (frameRef.current.dataset.matte !== String(isMobile)) {
            frameRef.current.dataset.matte = String(isMobile);
            frameRef.current.style.background = `radial-gradient(ellipse ${startW * 0.78}vw ${startH * 0.78}vh at 50% 50%, ${INTRO_MATTE}00 0%, ${INTRO_MATTE}00 42%, ${INTRO_MATTE}a6 78%, ${INTRO_MATTE}e0 100%)`;
          }
          frameRef.current.style.transform = `scale(${w / startW}, ${h / startH})`;
          frameRef.current.style.opacity = `${borderOpacity}`;
        }
      }

      // Title lifts and fades as scroll begins
      if (titleRef.current) {
        if (p >= EXPAND_END) {
          titleRef.current.style.opacity = "0";
          titleRef.current.style.visibility = "hidden";
          titleRef.current.style.pointerEvents = "none";
        } else {
          titleRef.current.style.visibility = "visible";
          const out = Math.min(1, Math.max(0, (p - 0.01) / 0.07));
          const easeOut = out * out * (3 - 2 * out);
          titleRef.current.style.opacity = `${1 - easeOut}`;
          titleRef.current.style.transform = `translate3d(0, ${-28 * easeOut}px, 0)`;
        }
      }

      // Hint fades immediately on scroll
      if (hintRef.current) {
        if (p >= 0.065) {
          hintRef.current.style.opacity = "0";
          hintRef.current.style.visibility = "hidden";
          hintRef.current.style.pointerEvents = "none";
        } else {
          hintRef.current.style.visibility = "visible";
          const gone = Math.min(1, Math.max(0, (p - 0.01) / 0.05));
          const easeGone = gone * gone * (3 - 2 * gone);
          hintRef.current.style.opacity = `${1 - easeGone}`;
          hintRef.current.style.transform = `translate3d(0, ${10 * easeGone}px, 0)`;
        }
      }

      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {/* Expanding Visible Black Frame with Thick Black Bezel Matte */}
      <div
        ref={frameRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 26vw 33vh at 50% 50%, ${INTRO_MATTE}00 0%, ${INTRO_MATTE}00 42%, ${INTRO_MATTE}a6 78%, ${INTRO_MATTE}e0 100%)`,
          willChange: "transform, opacity",
        }}
      />

      {/* Title held at upper portion above the frame, positioned cleanly below navbar */}
      <div
        ref={titleRef}
        className="absolute top-0 left-0 right-0 pt-20 sm:pt-24 text-center transition-opacity"
        style={{ willChange: "opacity, transform" }}
      >
        <span className="block font-space-mono text-[9px] sm:text-xs tracking-[0.26em] text-[#D4FFEA] uppercase [text-shadow:0_0_6px_#2A1A14,0_0_14px_#2A1A14]">
          THE OHIO STATE UNIVERSITY
        </span>
        <h1 className="font-anek-tamil text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] mt-1 sm:mt-1.5">
          <span className="sr-only">OSU </span>TAMIL SANGAM
          <span className="sr-only"> (ஒஹையோ மாநிலப் பல்கலைக்கழகத் தமிழ்ச் சங்கம்) — Official Tamil Student Organization at The Ohio State University</span>
        </h1>
      </div>

      {/* Scroll Hint held at bottom (bottom-16 on mobile to clear floating utility dock) */}
      <div
        ref={hintRef}
        className="absolute bottom-16 sm:bottom-8 left-0 right-0 text-center px-4 transition-opacity"
        style={{ willChange: "opacity, transform" }}
      >
        <p className="font-space-mono text-[11px] sm:text-xs tracking-[0.22em] text-[#FFF6E6] uppercase [text-shadow:0_0_6px_#2A1A14,0_0_14px_#2A1A14]">
          SCROLL TO ENTER ·{" "}
          <span lang="ta" className="tracking-normal normal-case">
            கீழே உருட்டவும்
          </span>{" "}
          &darr;
        </p>
      </div>
    </div>
  );
}

/**
 * 3D Golden "அ" Emblem Component (§MASTER DIRECTIVE & ScrollExpand)
 * High-fidelity single-glyph Tamil letter "அ" from Mukta Malar font,
 * suspended stationary in the central void at [0, 0, 0.05].
 * - Monumental scale 1.35x per user request for full-screen edge-to-edge immersion.
 * - Gentle micro-motion, leaving the frame purely as the camera descends.
 */
function GoldenTamilEmblem({ isMobile, tier }: { isMobile: boolean; tier: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const specularLightRef = useRef<THREE.PointLight>(null);
  const kineticsRef = useRef(createHeroKineticsTracker(7.5, 5.0, 4.0));
  const elapsed = useRef(0);
  const isCinematic = isHeroCinematicEnabled("home");

  const roughMap = useMemo(() => {
    if (!isCinematic) return null;
    return proceduralPbrMaps.getNoiseRoughness("kolam-emblem-rough", 256, 256, 0.10, 0.22);
  }, [isCinematic]);

  useEffect(() => {
    return () => {
      if (roughMap) {
        proceduralPbrMaps.release("kolam-emblem-rough");
      }
    };
  }, [roughMap]);

  const emblemWireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x00ff41,
        wireframe: true,
        toneMapped: false,
      }),
    []
  );

  useEffect(() => () => emblemWireMat.dispose(), [emblemWireMat]);

  useSafeFrame((state, dt) => {
    const time = (elapsed.current += dt);
    const rawP = heroDirectorState.scrubActive
      ? heroDirectorState.scrubProgress
      : heroScrollProgress.current;
    const kinetics = kineticsRef.current.update(rawP, state.pointer, dt);

    if (groupRef.current) {
      // Magnetic 3D "அ" figure-8 levitation & velocity tilt
      const floatY = Math.sin(time * 1.2) * 0.06;
      const rotY = Math.sin(time * 0.8) * 0.08 + kinetics.smoothPointerX * 0.18;
      const rotX = -kinetics.smoothPointerY * 0.14 + kinetics.velocityPitch * 1.8;

      groupRef.current.position.set(kinetics.smoothPointerX * 0.12, floatY, 0.05);
      groupRef.current.rotation.set(rotX, rotY, kinetics.velocityBank * 0.7);
      groupRef.current.scale.setScalar(1.35);

      // Dynamic specular light tracking pointer across stem and curved loop
      if (specularLightRef.current) {
        specularLightRef.current.position.set(
          kinetics.smoothPointerX * 2.2 + 0.6,
          -kinetics.smoothPointerY * 1.6 + 0.3,
          1.4
        );
      }

      if (materialRef.current) {
        materialRef.current.opacity = 1.0;
        materialRef.current.transparent = false;
      }
    }
  });

  const letterSize = isMobile ? 1.4 : 1.85;

  return (
    <group ref={groupRef} position={[0, 0, 0.05]}>
      {/* Living gold specular light sweeping across stem & loop bevels */}
      <pointLight ref={specularLightRef} color="#A6F0CF" intensity={4.2} distance={6} />
      <Center>
        <Text3D
          font={muktaFont as unknown as Parameters<typeof Text3D>[0]["font"]}
          size={letterSize}
          height={0.32}
          // 64/16 produced 196k triangles (×2 with the shadow pass) for a ~3 px bevel;
          // 32/8 (52k) and 24/6 (30k) are visually identical at this size.
          curveSegments={tier === "A" ? 32 : 24}
          bevelEnabled
          bevelSize={0.018}
          bevelThickness={0.032}
          bevelSegments={tier === "A" ? 8 : 6}
          rotation={[0, 0, 0]}
          userData={{ wireMaterial: emblemWireMat }}
          castShadow
          receiveShadow
        >
          அ
          {isCinematic ? (
            <meshPhysicalMaterial
              ref={materialRef}
              color="#25173B"
              metalness={0.94}
              roughness={0.14}
              roughnessMap={roughMap || undefined}
              clearcoat={1.0}
              clearcoatRoughness={0.08}
              anisotropy={0.45}
              anisotropyRotation={0.78}
              envMapIntensity={2.2}
            />
          ) : (
            <meshPhysicalMaterial
              ref={materialRef}
              color="#25173B"
              metalness={0.96}
              roughness={0.12}
              clearcoat={1.0}
              clearcoatRoughness={0.08}
              envMapIntensity={2.4}
            />
          )}
        </Text3D>
      </Center>
    </group>
  );
}

/**
 * Cinematic "அ": cast aged brass resting on the threshold stone. Bevelled so the rim light
 * has an edge to catch; roughness breakup from the kit; grounded by the key's shadow.
 * Static (PRD §5.1): the camera's parallax supplies the motion.
 */
function CastEmblem({ isMobile, tier }: { isMobile: boolean; tier: string }) {
  const material = useMemo(
    () =>
      createSurfaceMaterial(
        "agedBrass",
        // Lower roughness than the preset so the key draws a hot line along the bevel.
        { color: "#ad8f62", roughness: 0.3, envMapIntensity: 1.35 },
        { space: "local", scale: 11, bump: 0.0012, roughnessVariation: 0.18, albedoVariation: 0.1, tintAmount: 0.08 }
      ),
    []
  );
  useDisposeOnUnmount(material);
  // Mobile frames the scene from much further back; 1.4x keeps the letter the subject.
  const letterSize = isMobile ? 1.96 : 1.85;
  const scale = 1.35;
  const depth = 0.22;
  const bevelThickness = 0.07;
  // Back face just under the stone so the letter reads as resting on it, not hovering.
  const restZ = THRESHOLD_FLOOR_Z + ((depth + 2 * bevelThickness) / 2) * scale - 0.015;
  const footprint = letterSize * scale;
  const contact = useMemo(
    () => [{ position: [0, 0, 0] as [number, number, number], size: [footprint * 1.22, footprint * 0.98] as [number, number], opacity: 0.5 }],
    [footprint]
  );

  return (
    <>
      {/* Contact occlusion on the stone around the letter's base. The kit lays decals in XZ;
          the group turns that plane onto the XY stone. */}
      <group position={[0, 0, THRESHOLD_FLOOR_Z]} rotation={[Math.PI / 2, 0, 0]}>
        <ContactShadows spots={contact} softness={0.55} lift={0.002} />
      </group>
      <group position={[0, 0, restZ]} scale={scale}>
        <Center>
          <Text3D
            font={muktaFont as unknown as Parameters<typeof Text3D>[0]["font"]}
            size={letterSize}
            height={depth}
            curveSegments={tier === "A" ? 24 : 16}
            bevelEnabled
            bevelSize={0.055}
            bevelThickness={bevelThickness}
            bevelSegments={tier === "A" ? 6 : 3}
            castShadow
            receiveShadow
          >
            அ
            <primitive object={material} attach="material" />
          </Text3D>
        </Center>
      </group>
    </>
  );
}

const KEY_OFFSET = new THREE.Vector3(-7.0, 6.0, 4.4); // low raking dawn sun, upper left (~25° above the stone)
const RIM_OFFSET = new THREE.Vector3(6.0, -5.0, 1.6); // cool grazing rim from lower right

/**
 * Light and stone for the cinematic path. One warm raking key (the only shadow caster), a
 * dim cool sky fill, a cool rim that rises as the emblem is revealed, and the threshold
 * stone. The rig follows the camera's scripted descent (a pure function of scroll), so the
 * shadow map only re-renders when scroll moves the scene.
 */
function ThresholdStage({ mode }: { mode: "A" | "B" }) {
  const rigRef = useRef<THREE.Group>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const [keyTarget] = useState(() => new THREE.Object3D());
  const stone = useMemo(() => createThresholdStoneMaterial(), []);
  const floorGeometry = useMemo(() => new THREE.PlaneGeometry(70, 70, 1, 1), []);
  useDisposeOnUnmount(floorGeometry, stone.material);
  const invalidateShadows = useShadowUpdates({ mode: "onChange" });
  const last = useRef({ p: -1, ext: 0, frame: 0, reveal: 0 });

  useSafeFrame((state, dt) => {
    const p = heroDirectorState.scrubActive ? heroDirectorState.scrubProgress : heroScrollProgress.current;
    const cam = state.camera as THREE.PerspectiveCamera;
    const l = last.current;
    l.frame++;

    // Scripted camera height (no pointer parallax) keeps the shadow frustum still on mouse move.
    const { camY, camZ } = evalCamera(p);
    const aspect = state.viewport.aspect;
    if (rigRef.current) rigRef.current.position.set(0, camY, 0);
    // Depth falloff across the tilted stone; scaled so the far-back mobile framing is not drowned.
    const fog = state.scene.fog as THREE.FogExp2 | null;
    if (fog && "density" in fog) fog.density = 0.36 / heroCamDist(p, camZ, aspect);

    // Visible stretch of stone for the tilted camera: near edge (bottom of frame) to far edge (top).
    const halfFov = THREE.MathUtils.degToRad(cam.fov * 0.5);
    const camH = Math.max(1, cam.position.z - THRESHOLD_FLOOR_Z);
    const yNear = cam.position.y + camH * Math.tan(cam.rotation.x - halfFov);
    const yFar = cam.position.y + camH * Math.tan(Math.min(1.45, cam.rotation.x + halfFov));
    const aimDist = camH / Math.cos(cam.rotation.x);
    stone.uniforms.uViewCenter.value.set(cam.position.x, (yNear + yFar) * 0.5);
    stone.uniforms.uViewHalf.value.set(aimDist * Math.tan(halfFov) * aspect * 1.15, (yFar - yNear) * 0.5);
    stone.uniforms.uP.value = p;

    const key = keyRef.current;
    if (key) {
      // Shadow frustum from the scripted camera (no pointer parallax), centred on the aim point.
      const tilt = THREE.MathUtils.degToRad(heroTiltDeg(p));
      const dist = heroCamDist(p, camZ, aspect);
      const h = dist * Math.cos(tilt);
      const back = dist * Math.sin(tilt);
      const farRel = h * Math.tan(tilt + THREE.MathUtils.degToRad(17.5)) - back;
      const nearRel = back - h * Math.tan(tilt - THREE.MathUtils.degToRad(17.5));
      const halfW = (h / Math.cos(tilt + THREE.MathUtils.degToRad(17.5))) * Math.tan(THREE.MathUtils.degToRad(17.5)) * aspect;
      const ext = Math.max(farRel, nearRel, halfW) * 1.05;
      if (Math.abs(ext - l.ext) > l.ext * 0.04) {
        l.ext = ext;
        const sc = key.shadow.camera;
        sc.left = -ext;
        sc.right = ext;
        sc.top = ext;
        sc.bottom = -ext;
        sc.near = 1;
        sc.far = 30;
        sc.updateProjectionMatrix();
        invalidateShadows();
      }
    }
    // Re-render shadows when scroll moves the threads; while strands are in flight the
    // lifted tails also ripple with time, so refresh every other frame inside that window.
    const inFlight = p > 0.035 && p < 0.64;
    if (Math.abs(p - l.p) > 1e-5 || (inFlight && l.frame % 2 === 0)) {
      l.p = p;
      invalidateShadows();
    }

    // Emblem reveal: the cool rim rises over the first seconds, then settles.
    l.reveal = Math.min(1, l.reveal + dt / 2.6);
    const r = l.reveal;
    if (rimRef.current) rimRef.current.intensity = r * r * (3 - 2 * r) * (0.9 + 0.8 * Math.sin(Math.PI * r));
  });

  // 1024/512: a 2048 map alone was +12 MB of texture memory; the only shadows that need
  // detail are the emblem's and the lifted threads', and both are soft at this scale.
  const shadowSize = mode === "A" ? 1024 : 512;

  return (
    <>
      <BakedEnvironment resolution={128}>
        {/* Dawn sky through the doorway (matches the key), a cool open sky, dark ground bounce */}
        <Lightformer form="rect" intensity={3.4} color="#ffc58a" position={[-6, 5, 4]} scale={[7, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.6} color="#e0a8a0" position={[5, 4, 6]} scale={[8, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.5} color="#7a5236" position={[0, -6, 2]} scale={[12, 4, 1]} target={[0, 0, 0]} />
        {/* Lit stone all around at low angle: what the bevels mirror (else they read as black outlines) */}
        <Lightformer form="rect" intensity={0.9} color="#c9b49a" position={[-8, 0, 1]} scale={[3, 14, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.75} color="#c9b49a" position={[0, -8, 1]} scale={[14, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.4} color="#e6b8a0" position={[8, 2, 1]} scale={[3, 14, 1]} target={[0, 0, 0]} />
        {/* Open sky over the threshold: what a face lying on the stone mirrors */}
        <Lightformer form="rect" intensity={1.1} color="#f0d2b0" position={[0, 0, 8]} scale={[10, 10, 1]} target={[0, 0, 0]} />
      </BakedEnvironment>

      <group ref={rigRef}>
        <primitive object={keyTarget} position={[0, 0, THRESHOLD_FLOOR_Z]} />
        <directionalLight
          ref={keyRef}
          position={[KEY_OFFSET.x, KEY_OFFSET.y, KEY_OFFSET.z]}
          target={keyTarget}
          color="#ffb877"
          intensity={5.2}
          castShadow
          shadow-mapSize={[shadowSize, shadowSize]}
          shadow-bias={-0.0003}
          shadow-normalBias={0.02}
          shadow-radius={2}
        />
        <directionalLight
          ref={rimRef}
          position={[RIM_OFFSET.x, RIM_OFFSET.y, RIM_OFFSET.z]}
          target={keyTarget}
          color="#a9c1ff"
          intensity={0}
          userData={{ gradeRole: "rim" }}
        />
        {/* A few motes hanging in the key light; nothing else is additive in the scene. */}
        <ArtDustMotes
          position={[0, 0, 1.4]}
          size={[11, 7, 2.4]}
          count={mode === "A" ? 34 : 16}
          color="#ffd59e"
          intensity={0.22}
          pointSize={22}
          drift={[0.01, 0.006, 0]}
          seed={11}
        />
      </group>
      {/* Dim warm-sand fill from the open side (sky = +Z, toward the camera).
          Key and fill are not tagged gradeRole: the kolam-hearth Tier-B fallback lerps the key
          toward mint and the fill toward purple, which turns this stone olive. */}
      <hemisphereLight args={["#e8b48a", "#5a3a28", 1.1]} position={[0, 0, 1]} />
      {/* Golden-hour pool: warm glow centred on the glyph, falling off toward the frame edges. */}
      <pointLight position={[0, 0.4, 3.2]} color="#ffb060" intensity={26} distance={11} decay={2} />

      <mesh geometry={floorGeometry} material={stone.material} position={[0, -6, THRESHOLD_FLOOR_Z]} receiveShadow />
    </>
  );
}

/**
 * Dust Motes Atmospheric Layer (§PRD 6.4)
 * Subtle golden dust particles drifting in the ambient void.
 */
function DustMotes({ isMobile, tier }: { isMobile: boolean; tier: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = tier === "A" ? (isMobile ? 60 : 120) : (isMobile ? 30 : 60);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random generation to adhere to pure render rules
      const seed1 = Math.sin((i + 1) * 12.9898) * 43758.5453;
      const frac1 = seed1 - Math.floor(seed1);
      const seed2 = Math.sin((i + 1) * 78.233) * 43758.5453;
      const frac2 = seed2 - Math.floor(seed2);
      const seed3 = Math.sin((i + 1) * 45.164) * 43758.5453;
      const frac3 = seed3 - Math.floor(seed3);
      const seed4 = Math.sin((i + 1) * 93.719) * 43758.5453;
      const frac4 = seed4 - Math.floor(seed4);

      const angle = frac1 * Math.PI * 2;
      const radius = 1.8 + frac2 * 3.5;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (frac3 - 0.5) * 6.5;
      pos[i * 3 + 2] = (frac4 - 0.5) * 1.5;
    }
    return pos;
  }, [count]);

  useSafeFrame((_, safeDelta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z += 0.04 * safeDelta;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#4FD6E0"
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function DigitalKolamHero() {
  const viewportRef = useRef<HTMLDivElement>(null);
  // static = Tier C, Lite or reduced motion: the SVG fallback, no 3D assets.
  const { mode } = useRenderMode();
  const isWebglEnabled = mode !== "static";
  const tier = mode === "A" ? "A" : "B";
  // URL flag parsed once per mount: ?cinematic_home=0 shows the previous tube look.
  const [cinematic] = useState(() => isHeroCinematicEnabled("home"));

  const isMobile = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => (typeof window !== "undefined" ? window.innerWidth < 768 : false),
    () => false
  );

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (mounted) {
      useBootStore.getState().markReady("home-kolam");
    }
  }, [mounted]);

  useEffect(() => {
    if (!isWebglEnabled) return;
    let inView = true;
    const stop = registerSystem({
      order: 50,
      step: () => governor.request("home-hero", inView && heroScrollProgress.current < 0.95 ? 2 : 0),
    });
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      inView = entry.isIntersecting;
      if (!inView) governor.request("home-hero", 0);
    });
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => {
      stop();
      observer.disconnect();
      governor.request("home-hero", 0);
    };
  }, [isWebglEnabled]);

  return (
    <div ref={viewportRef} className="absolute inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
      {mounted && isWebglEnabled && (
        <View className="w-full h-full pointer-events-auto" index={2} grade={{ hero: "home", profile: "kolam-hearth" }}>
          <color attach="background" args={[cinematic ? HERO_SCENE_BG : "#050201"]} />
          <fogExp2 attach="fog" args={[cinematic ? HERO_SCENE_BG : "#050201", 0.03]} />
          <HeroTruckCamera />

          {cinematic ? (
            <>
              <ThresholdStage mode={tier} />
              <PeelAndFlowKolamMesh isMobile={isMobile} tier={tier} look="powder" />
              <Suspense fallback={null}>
                <CastEmblem isMobile={isMobile} tier={tier} />
              </Suspense>
            </>
          ) : (
            <>
              {/* Baseline Studio Lighting */}
              <BakedEnvironment resolution={256}>
                <Lightformer
                  form="rect"
                  intensity={3.5}
                  color="#F4F0FA"
                  position={[-5, 3, 5]}
                  scale={[8, 5, 1]}
                  target={[0, 0, 0]}
                />
                <Lightformer
                  form="rect"
                  intensity={4.8}
                  color="#F26BB5"
                  position={[6, 2, -2]}
                  scale={[6, 8, 1]}
                  target={[0, 0, 0]}
                />
                <Lightformer
                  form="ring"
                  intensity={2.4}
                  color="#A6F0CF"
                  scale={10}
                  position={[0, 8, 0]}
                  target={[0, 0, 0]}
                />
                <Lightformer
                  form="rect"
                  intensity={1.4}
                  color="#3A2618"
                  scale={[12, 4, 1]}
                  position={[0, -6, 2]}
                  target={[0, 0, 0]}
                />
              </BakedEnvironment>
              <ambientLight intensity={0.8} color="#2a1a08" />
              <directionalLight position={[5, 8, 5]} intensity={3.0} color="#FFF8E7" castShadow />
              <directionalLight position={[-5, 4, 4]} intensity={1.8} color="#FFE8B5" />
              <pointLight position={[0, 0, 4.0]} intensity={4.5} color="#FFF5DE" distance={16} />
              <pointLight position={[0, -2, 2.0]} intensity={3.0} color="#A6F0CF" distance={12} />
              <DustMotes isMobile={isMobile} tier={tier} />
              <PeelAndFlowKolamMesh isMobile={isMobile} tier={tier} look="tube" />
              <Suspense fallback={null}>
                <GoldenTamilEmblem isMobile={isMobile} tier={tier} />
              </Suspense>
            </>
          )}
        </View>
      )}

      {/* React Bits ScrollExpand Title & Hint DOM Overlay */}
      {mounted && <ScrollExpandIntroOverlay />}

      {/* Tier C / Lite Mode / reduced-motion SVG Fallback (§PRD 10) */}
      {mounted && !isWebglEnabled && (
        <StaticKolamFallback isMobile={isMobile} />
      )}
    </div>
  );
}

/**
 * Static Kolam Fallback Component (§PRD 10)
 * Shown when WebGL is unavailable, Lite Mode is on, or the user prefers reduced motion:
 * a rendered still of the cinematic scene (rice-powder kolam and the brass "அ" on the
 * threshold stone), so the static page keeps the same look without loading any 3D.
 */
function StaticKolamFallback({ isMobile: _isMobile }: { isMobile: boolean }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none" style={{ backgroundColor: HERO_SCENE_BG }}>
      {/* Full-bleed in landscape; a 16:9 band in portrait. The mask feathers the band's own
          edges so the still never reads as a card. */}
      <div
        className="absolute inset-0 portrait:inset-x-0 portrait:inset-y-auto portrait:top-1/2 portrait:-translate-y-1/2 portrait:aspect-video"
        style={{
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, #000 45%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, #000 45%, transparent 100%)",
        }}
      >
        <Image
          src="/home/home-hero-poster.webp"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          priority
          // Already a 77 KB WebP; served as-is so a re-rendered poster is never shadowed by a cached resize.
          unoptimized
          className="object-cover object-center"
        />
      </div>
      {/* The letter in the still is decorative; keep it in the accessibility tree as text. */}
      <span className="sr-only" lang="ta">
        அ
      </span>
    </div>
  );
}
export default DigitalKolamHero;
