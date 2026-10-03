"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SUN_DIR } from "./sun";

interface MorningLightShaftsProps {
  enabled?: boolean;
  reducedMotion?: boolean;
}

const shaftVertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const shaftFragmentShader = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
uniform float uBaseOpacity;

void main() {
  // Soft vertical beam gradient (intense near gate bars, tapering down onto path)
  float vertFade = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.35, vUv.y);
  
  // Soft horizontal bell curve across quad width
  float horizFade = sin(vUv.x * 3.14159265);
  
  // Subtle scrolling atmospheric dust streamer
  float stream = sin(vUv.y * 14.0 - uTime * 0.5 + vUv.x * 4.0) * 0.12 + 0.88;
  
  float alpha = vertFade * horizFade * stream * uBaseOpacity;
  gl_FragColor = vec4(uColor, alpha);
}
`;

interface ShaftConfig {
  x: number;
  y: number;
  z: number;
  length: number;
  width: number;
  opacity: number;
}

function ShaftPlane({
  cfg,
  beamQuat,
  reducedMotion,
}: {
  cfg: ShaftConfig;
  beamQuat: THREE.Quaternion;
  reducedMotion: boolean;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#FFE8B8") },
      uBaseOpacity: { value: cfg.opacity },
    }),
    [cfg.opacity]
  );

  useFrame((state) => {
    if (!reducedMotion && matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[cfg.x, cfg.y, cfg.z]} quaternion={beamQuat} renderOrder={1}>
      <planeGeometry args={[cfg.width, cfg.length]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={shaftVertexShader}
        fragmentShader={shaftFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Morning Light Shafts (Tier A Only — §3.5)
 * 5 additive quads aligned along -SUN_DIR piercing through the ironwork transom & filigree bars.
 */
export function MorningLightShafts({
  enabled = true,
  reducedMotion = false,
}: MorningLightShaftsProps) {
  // Direction along which morning sunbeams travel (from sun to origin: -SUN_DIR)
  const beamDir = useMemo(() => SUN_DIR.clone().negate().normalize(), []);

  // Compute rotation quaternion to orient quads parallel to beam direction
  const beamQuat = useMemo(() => {
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    // Align quad's local Y axis with beamDir
    q.setFromUnitVectors(up, beamDir);
    return q;
  }, [beamDir]);

  // Transom / iron bar pass-through locations
  const shaftConfigs: ShaftConfig[] = useMemo(
    () => [
      { x: -1.8, y: 4.2, z: 0.1, length: 12.0, width: 0.9, opacity: 0.08 },
      { x: -0.9, y: 4.6, z: 0.1, length: 14.0, width: 1.1, opacity: 0.11 },
      { x:  0.0, y: 4.8, z: 0.1, length: 15.0, width: 1.3, opacity: 0.12 },
      { x:  0.9, y: 4.6, z: 0.1, length: 14.0, width: 1.1, opacity: 0.11 },
      { x:  1.8, y: 4.2, z: 0.1, length: 12.0, width: 0.9, opacity: 0.08 },
    ],
    []
  );

  if (!enabled) return null;

  return (
    <group>
      {shaftConfigs.map((cfg, i) => (
        <ShaftPlane
          key={i}
          cfg={cfg}
          beamQuat={beamQuat}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}
