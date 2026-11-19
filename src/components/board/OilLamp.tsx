"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { noise1D } from "./noise";
import { applyInstanceTransforms } from "@/gl/art/geometry";
import { createSurfaceMaterial } from "@/gl/art/surface";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { STANDING_FLAMES, createFlameGeometry, createFlameMaterial, createStandingLampGeometry } from "./boardArt";

import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";

interface OilLampProps {
  position: [number, number, number];
  phaseOffset?: number;
  isRealLight?: boolean;
}

/**
 * Traditional Chola Kuthuvilakku Stone/Brass Wall Sconce Lamp (§2, §5).
 * - Flame core sits on bloom layer (layers.set(1) / layers.enable(1)) as designated bloom source.
 * - Noise-driven organic flicker with per-instance phase offset (never synchronized).
 * - Real PointLight is only active when `isRealLight` is true (capped at 2-3 scene-wide).
 * - Micro-Detail 1: Wind flutter tip displacement & dynamic amber irradiance when cinematic enabled.
 */
const flameVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const flameFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uPhase;
  uniform float uIntensity;
  uniform float uCinematic;

  void main() {
    float windFlutter = uCinematic > 0.5 ? sin(uTime * 14.0 + vUv.y * 7.0 + uPhase * 3.0) * 0.035 * (1.0 - vUv.y) : 0.0;
    vec2 centeredUv = (vUv - vec2(0.5, 0.28)) + vec2(windFlutter, 0.0);
    float radial = smoothstep(0.48, 0.0, length(centeredUv * vec2(1.5, 0.88)));
    float verticalFade = pow(1.0 - clamp(vUv.y, 0.0, 1.0), 1.6);
    float flicker = 0.92 + 0.08 * sin(uTime * 13.0 + uPhase) * cos(uTime * 7.3);
    vec3 flameCol = mix(vec3(0.78, 0.35, 0.19), vec3(1.0, 0.88, 0.55), radial);
    gl_FragColor = vec4(flameCol * flicker, radial * verticalFade * uIntensity);
  }
`;

export function OilLamp({
  position,
  phaseOffset = 0,
  isRealLight = false,
}: OilLampProps) {
  const flameMeshRef = useRef<THREE.Mesh>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  // URL flag parsed once per mount, not per frame.
  const [isCinematic] = useState(() => isHeroCinematicEnabled("board"));
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: phaseOffset },
      uIntensity: { value: 1.0 },
      uCinematic: { value: 0.0 },
    }),
    [phaseOffset]
  );

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const time = clock.getElapsedTime();
    uniforms.uTime.value = time;
    uniforms.uCinematic.value = isCinematic ? 1.0 : 0.0;
    const n = noise1D(time * 4.2 + phaseOffset * 17.3);
    const flicker = 0.85 + 0.35 * n;
    uniforms.uIntensity.value = flicker * 1.5;

    if (isRealLight && pointLightRef.current) {
      pointLightRef.current.intensity = flicker * 2.8;
      if (isCinematic) {
        // Micro-Detail 1: warm amber-to-gold radiance shift with flicker
        pointLightRef.current.color.setRGB(1.0, 0.60 + 0.08 * n, 0.24);
      }
    }
  });

  return (
    <group position={position}>
      {/* Wall Mounting Plate */}
      <mesh position={[0, 0, -0.22]}>
        <boxGeometry args={[0.24, 0.45, 0.08]} />
        <meshStandardMaterial color="#2d1e15" roughness={0.85} metalness={0.6} />
      </mesh>

      {/* Ornate Curved Cast-Bronze Arm */}
      <mesh position={[0, -0.08, -0.1]}>
        <cylinderGeometry args={[0.035, 0.045, 0.28, 8]} />
        <meshStandardMaterial color="#4a331f" roughness={0.7} metalness={0.75} />
      </mesh>

      {/* Multi-Tiered Oil Vessel (Agal / Kuthuvilakku Base) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.09, 0.12, 16]} />
        <meshStandardMaterial color="#5c3f25" roughness={0.6} metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.06, 16]} />
        <meshStandardMaterial color="#3b2614" roughness={0.7} metalness={0.85} />
      </mesh>

      {/* Dark Pool of Sesame / Ghee Oil inside Dish */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 16]} />
        <meshStandardMaterial color="#1f140a" roughness={0.15} metalness={0.4} />
      </mesh>

      {/* Cotton Wick Spindle */}
      <mesh position={[0, 0.08, 0.04]}>
        <cylinderGeometry args={[0.015, 0.015, 0.06, 8]} />
        <meshStandardMaterial color="#1a1208" roughness={0.9} />
      </mesh>

      {/* Volumetric Vilakku Flame Crossed Billboards */}
      <group position={[0, 0.24, 0.04]}>
        <mesh ref={flameMeshRef}>
          <planeGeometry args={[0.22, 0.36]} />
          <shaderMaterial
            vertexShader={flameVertexShader}
            fragmentShader={flameFragmentShader}
            uniforms={uniforms}
            transparent={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.22, 0.36]} />
          <shaderMaterial
            vertexShader={flameVertexShader}
            fragmentShader={flameFragmentShader}
            uniforms={uniforms}
            transparent={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* No per-lamp "glow core" point light: every extra light is evaluated by every lit
            fragment in the hero. Glow comes from the flame billboards (+ grade bloom); real
            illumination from the capped `isRealLight` light below (PRD §5). */}
      </group>

      {/* Conditional Real PointLight */}
      {isRealLight && (
        <pointLight
          ref={pointLightRef}
          position={[0, 0.25, 0.15]}
          color="#FF9E44"
          intensity={2.8}
          distance={8.0}
          decay={2.0}
        />
      )}
    </group>
  );
}

/**
 * Art-pass altar lamps: a pair of floor-standing brass kuthuvilakku with five lit lips each.
 * Shared geometry and material, ONE instanced body draw and ONE instanced flame draw for
 * both lamps (the legacy pair cost ~16 draws with per-mesh JSX materials and two extra real
 * lights). Their light on the sanctum stone comes from the fake lamp light, not real lights.
 */
export function FinaleLamps({ positions }: { positions: [number, number, number][] }) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const flameRef = useRef<THREE.InstancedMesh>(null);

  const assets = useMemo(() => {
    const body = createStandingLampGeometry();
    const brass = createSurfaceMaterial("agedBrass", {}, { cavity: true, space: "local" });
    const flames = positions.flatMap((p, li) =>
      STANDING_FLAMES.map((f, fi) => ({ position: [p[0] + f[0], p[1] + f[1], p[2] + f[2]] as [number, number, number], phase: li * 2.4 + fi * 1.7 }))
    );
    const flameGeo = createFlameGeometry(flames.map((f) => f.phase), 0.85);
    // No wide glow: five overlapping glows per lamp summed into a visible box.
    const flameMat = createFlameMaterial({ halo: 0.3, glow: 0, fog: 0.0 });
    return { body, brass, flames, flameGeo, flameMat };
  }, [positions]);
  useDisposeOnUnmount(assets.body, assets.brass, assets.flameGeo, assets.flameMat);

  useEffect(() => {
    if (bodyRef.current) applyInstanceTransforms(bodyRef.current, positions.map((position) => ({ position })));
    if (flameRef.current) applyInstanceTransforms(flameRef.current, assets.flames);
  }, [positions, assets]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    assets.flameMat.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[assets.body, assets.brass, positions.length]} />
      <instancedMesh ref={flameRef} args={[assets.flameGeo, assets.flameMat, assets.flames.length]} frustumCulled={false} />
    </group>
  );
}
