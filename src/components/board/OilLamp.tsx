"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { noise1D } from "./noise";

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

  void main() {
    vec2 centeredUv = vUv - vec2(0.5, 0.28);
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
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: phaseOffset },
      uIntensity: { value: 1.0 },
    }),
    [phaseOffset]
  );

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const time = clock.getElapsedTime();
    uniforms.uTime.value = time;
    const n = noise1D(time * 4.2 + phaseOffset * 17.3);
    const flicker = 0.85 + 0.35 * n;
    uniforms.uIntensity.value = flicker * 1.5;

    if (isRealLight && pointLightRef.current) {
      pointLightRef.current.intensity = flicker * 2.8;
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
        {/* Soft Point Glow Core */}
        <pointLight color="#FF9A3C" intensity={1.8} distance={3.5} decay={2} />
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
