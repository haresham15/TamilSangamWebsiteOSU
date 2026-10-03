"use client";

import React, { useMemo, useEffect } from "react";
import * as THREE from "three";

const VERGE_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const VERGE_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    float depthFactor = clamp((-vWorldPos.z) / 380.0, 0.0, 1.0);

    // Warm coastal dune & roadside earth tones (Dark earth #191016 -> Horizon haze #45211e)
    vec3 cForegroundEarth = vec3(0.098, 0.063, 0.086);
    vec3 cHorizonEarth = vec3(0.32, 0.15, 0.12);
    vec3 col = mix(cForegroundEarth, cHorizonEarth, pow(depthFactor, 1.3));

    // Subtle organic soil / scrub texture
    float n = hash(floor(vec2(vWorldPos.x * 2.5, vWorldPos.z * 1.5))) * 0.04;
    col += vec3(n);

    // Golden hour ambient warm rim along the verge
    float rim = (1.0 - smoothstep(-15.0, -4.2, vWorldPos.x)) * 0.08;
    col += vec3(0.9, 0.45, 0.2) * rim;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Verge() {
  const geometry = useMemo(() => new THREE.PlaneGeometry(120, 420), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERGE_VERTEX,
        fragmentShader: VERGE_FRAGMENT,
      }),
    []
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <mesh
      position={[-64.2, -0.06, -195]}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geometry}
      material={material}
    />
  );
}
