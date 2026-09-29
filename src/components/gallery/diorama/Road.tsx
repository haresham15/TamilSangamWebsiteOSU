"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { galleryScrollState } from "../galleryStore";

const ROAD_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const ROAD_FRAGMENT = /* glsl */ `
  uniform float uDollyOffset;
  uniform float uSunX;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  float hash(vec2 p) {
    p = fract(p * vec2(178.23, 342.12));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
  }

  // Smooth value noise for natural asphalt grain
  float smoothNoise(vec2 p) {
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
    float x = vWorldPos.x;
    float z = vWorldPos.z - uDollyOffset;

    // 1. Asphalt Base (Rich warm dark stone #151119 with smooth fine asphalt grain)
    vec3 asphalt = vec3(0.082, 0.066, 0.098);
    float grain = smoothNoise(vec2(x * 35.0, z * 25.0)) * 0.028;
    asphalt += vec3(grain);

    // 2. Center Dashed Line (3m dash, 6m gap = 9m period)
    float dashPeriod = 9.0;
    float dashZ = mod(z, dashPeriod);
    float dashMask = smoothstep(0.0, 0.08, dashZ) * (1.0 - smoothstep(3.1, 3.25, dashZ));
    float centerLine = smoothstep(0.12, 0.07, abs(x)) * dashMask;

    // 3. Solid White-Gold Shoulder Edge Lines (|x| ≈ 3.95m, width ≈ 0.16m)
    float edgeLineLeft = smoothstep(0.12, 0.05, abs(x + 3.95));
    float edgeLineRight = smoothstep(0.12, 0.05, abs(x - 3.95));
    float edgeLines = max(edgeLineLeft, edgeLineRight);

    // Worn painted markings color (Warm Ivory-Gold #f0dfc8)
    vec3 paintColor = vec3(0.94, 0.87, 0.78);

    // 4. Sun-Sheen Streak: specular glaze reflecting the low sun along the asphalt
    float sunGlazeDist = abs(x - (uSunX * 0.22));
    float sunGlaze = exp(-pow(sunGlazeDist / 2.8, 2.0));
    float depthFactor = clamp((-vWorldPos.z) / 380.0, 0.0, 1.0);
    vec3 sheenColor = vec3(0.60, 0.35, 0.20) * sunGlaze * (0.35 + 0.65 * depthFactor);

    // Combine layers
    vec3 col = asphalt + sheenColor;
    col = mix(col, paintColor, (centerLine + edgeLines) * 0.85);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Road() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const currentOffset = useRef(0);

  const uniforms = useMemo(
    () => ({
      uDollyOffset: { value: 0 },
      uSunX: { value: 16.0 },
    }),
    []
  );

  // Road plane: width = 8.4m, length = 420m (z from 10 to -400)
  const geometry = useMemo(() => new THREE.PlaneGeometry(8.4, 420), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ROAD_VERTEX,
        fragmentShader: ROAD_FRAGMENT,
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

  useFrame((_, delta) => {
    // Constant idle dolly advance (1.2 m/s) + velocity scaling
    const speed = 1.2 + Math.min(2.8, Math.abs(galleryScrollState.velocity) * 0.003);
    currentOffset.current += delta * speed;

    if (matRef.current) {
      matRef.current.uniforms.uDollyOffset.value = currentOffset.current;
    }
  });

  return (
    <mesh
      position={[0, 0.0, -195]}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geometry}
      material={material}
      onUpdate={(self) => {
        matRef.current = self.material as THREE.ShaderMaterial;
      }}
    />
  );
}
