"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const SEA_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const SEA_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uSunX;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  // Smooth wave noise
  float waveNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    // 1. Deep coastal base gradient reflecting sunset sky
    // Foreground dark dusk purple #22132e -> Horizon warm amber reflection #733025
    float depthFactor = clamp((-vWorldPos.z) / 380.0, 0.0, 1.0);
    vec3 cDeepSea = vec3(0.125, 0.070, 0.175); // #20122c
    vec3 cHorizonSea = vec3(0.52, 0.22, 0.15); // Golden sunset reflection
    vec3 baseSea = mix(cDeepSea, cHorizonSea, pow(depthFactor, 1.3));

    // 2. Setting Sun Glitter Column
    // The glitter path widens as it approaches the camera in foreground
    float columnSpread = mix(28.0, 9.0, depthFactor);
    float distFromSunAxis = abs(vWorldPos.x - uSunX);
    float columnEnvelope = exp(-pow(distFromSunAxis / columnSpread, 2.2));

    // High-frequency animated water wave micro-facets (stretched horizontally & vertically)
    vec2 waveUv1 = vec2(vWorldPos.x * 2.5, vWorldPos.z * 0.8 + uTime * 1.1);
    vec2 waveUv2 = vec2(vWorldPos.x * 4.0 - uTime * 0.4, vWorldPos.z * 1.5 - uTime * 1.4);
    vec2 waveUv3 = vec2(vWorldPos.x * 1.2 + uTime * 0.6, vWorldPos.z * 0.35 + uTime * 0.8);

    float n1 = waveNoise(waveUv1);
    float n2 = waveNoise(waveUv2);
    float n3 = waveNoise(waveUv3);
    float waveFacet = pow(n1 * n2, 2.0) * n3 * 16.0;

    // Specular crest thresholding
    float sparkles = smoothstep(0.65, 1.1, waveFacet) * columnEnvelope;

    // HDR Specular Glitter Color (#ffd08a gold with values > 1.0 for Bloom capture)
    vec3 glitterColor = vec3(2.4, 1.85, 1.15) * sparkles * (0.5 + 0.5 * depthFactor);

    vec3 finalColor = baseSea + glitterColor;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function Sea() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSunX: { value: 16.0 },
    }),
    []
  );

  // Sea plane to the right of the road: from x = 4.2 to x = 320, z from 5 to -390
  const geometry = useMemo(() => new THREE.PlaneGeometry(320, 420), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SEA_VERTEX,
        fragmentShader: SEA_FRAGMENT,
        uniforms,
      }),
    [uniforms]
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh
      position={[164.2, -0.05, -195]}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geometry}
      material={material}
      onUpdate={(self) => {
        matRef.current = self.material as THREE.ShaderMaterial;
      }}
    />
  );
}
