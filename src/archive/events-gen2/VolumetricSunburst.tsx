"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useScrollProgress } from "@/components/scroll/useScrollProgress";

const sunburstVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sunburstFragmentShader = /* glsl */ `
  uniform vec3 uColorHot;
  uniform vec3 uColorDeep;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    vec2 centered = vUv - 0.5;
    float angle = atan(centered.y, centered.x);
    float dist = length(centered);

    // 32 radiating spokes, slight animated flicker per §7
    float spokes = abs(sin(angle * 32.0 + sin(uTime * 0.15) * 0.4));
    spokes = pow(spokes, 6.0);

    // Confined radial falloff: strictly 0.0 before quad boundary (dist = 0.5)
    float falloff = smoothstep(0.48, 0.04, dist);
    float ray = spokes * falloff * uIntensity;

    vec3 color = mix(uColorDeep, uColorHot, ray);
    // In AdditiveBlending, multiplying by ray guarantees vec3(0.0) outside rays and at edges
    gl_FragColor = vec4(color * ray * 1.6, 1.0);
  }
`;

export interface VolumetricSunburstProps {
  position?: [number, number, number];
  size?: number;
}

/**
 * VolumetricSunburst:
 * Art-directable radial ray-burst shader plane positioned behind the key light.
 * Restated parameters per §7 of Master PRD:
 * - 32 radiating spokes with pow(spokes, 6.0)
 * - uColorHot: #FFD37A, uColorDeep: #B8460E
 * - uIntensity: scroll-driven (0.6 at crane -> 1.0 at push-in)
 * - Additive blending, depthWrite: false, renderOrder: 0
 * - Confined world units (occupies center 40-50% frame at crane shot)
 */
export function VolumetricSunburst({
  position = [0, 3.4, -2.8],
  size = 10,
}: VolumetricSunburstProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const scrollStore = useScrollProgress();

  const uniforms = useMemo(
    () => ({
      uColorHot: { value: new THREE.Color("#FFD37A") },
      uColorDeep: { value: new THREE.Color("#B8460E") },
      uTime: { value: 0 },
      uIntensity: { value: 0.6 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();

    // Drive intensity from ref store without React state re-renders (60fps clean)
    const p = scrollStore.current;
    materialRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(0.6, 1.0, p);
  });

  return (
    <mesh
      position={position}
      renderOrder={0}
      name="volumetric-sunburst-plane"
    >
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={sunburstVertexShader}
        fragmentShader={sunburstFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
