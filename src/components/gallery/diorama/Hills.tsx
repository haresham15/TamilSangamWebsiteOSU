"use client";

import React, { useMemo, useEffect } from "react";
import * as THREE from "three";

const HILL_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const HILL_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uRimColor;
  uniform float uFreq;
  uniform float uSeed;
  varying vec2 vUv;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), u);
  }

  void main() {
    // Generate layered sinusoidal mountain ridgeline
    float x = vUv.x * uFreq + uSeed;
    float ridge = 0.45 * noise(x) 
                + 0.25 * noise(x * 2.1 + 1.2) 
                + 0.12 * noise(x * 4.3 + 2.5);
    ridge = ridge * 0.75 + 0.15; // Normalized height profile

    float diff = vUv.y - ridge;
    if (diff > 0.04) discard;

    // Smooth edge alpha
    float alpha = 1.0 - smoothstep(-0.02, 0.04, diff);

    // Warm golden rim highlight from the low setting sun along the crest
    float rim = smoothstep(-0.03, 0.01, diff) * (1.0 - smoothstep(0.01, 0.04, diff));
    vec3 col = mix(uColor, uRimColor, rim * 0.7);

    gl_FragColor = vec4(col, alpha);
  }
`;

interface HillLayerProps {
  depth: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rimColor: string;
  freq: number;
  seed: number;
}

function HillLayer({ depth, y, width, height, color, rimColor, freq, seed }: HillLayerProps) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uRimColor: { value: new THREE.Color(rimColor) },
      uFreq: { value: freq },
      uSeed: { value: seed },
    }),
    [color, rimColor, freq, seed]
  );

  const geometry = useMemo(() => new THREE.PlaneGeometry(width, height), [width, height]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: HILL_VERTEX,
        fragmentShader: HILL_FRAGMENT,
        uniforms,
        transparent: true,
        depthWrite: false,
      }),
    [uniforms]
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <mesh position={[0, y, depth]} geometry={geometry} material={material} />;
}

export function Hills() {
  return (
    <group name="coastal-hills">
      {/* Layer 3: Distant deep purple-blue headlands (z = -350) */}
      <HillLayer
        depth={-350}
        y={12.0}
        width={900}
        height={34}
        color="#2b1a3d"
        rimColor="#d47d4e"
        freq={3.5}
        seed={12.3}
      />

      {/* Layer 2: Mid-ground coastal range (z = -300) */}
      <HillLayer
        depth={-300}
        y={8.5}
        width={800}
        height={28}
        color="#1f102b"
        rimColor="#f59451"
        freq={4.8}
        seed={45.7}
      />

      {/* Layer 1: Fore-ridges with warm golden rim (z = -260) */}
      <HillLayer
        depth={-260}
        y={5.5}
        width={700}
        height={22}
        color="#14081c"
        rimColor="#ffaa5c"
        freq={6.2}
        seed={88.9}
      />
    </group>
  );
}
