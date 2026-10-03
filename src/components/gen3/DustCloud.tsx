"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { seededRandom } from "@/lib/prng";

const dustVertexShader = `
uniform float uTime;
attribute float aPhase;
attribute float aSpeed;
varying float vAlpha;

void main() {
  vec3 pos = position;
  
  // GPU-driven continuous upward drift with modulo wrap
  float yOffset = mod(pos.y + uTime * aSpeed * 1.2, 12.0);
  pos.y = yOffset;
  pos.x += sin(uTime * 0.5 + aPhase) * 0.2;
  pos.z += cos(uTime * 0.4 + aPhase) * 0.1;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Perspective point attenuation
  gl_PointSize = (24.0 / -mvPosition.z);
  
  // Soft boundary alpha falloff at floor (0) and ceiling (12)
  vAlpha = smoothstep(0.0, 1.2, pos.y) * smoothstep(12.0, 10.0, pos.y) * 0.45;
}
`;

const dustFragmentShader = `
varying float vAlpha;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;
  
  // Soft radial glow for illuminated arena concert dust motes
  float strength = pow(1.0 - (dist * 2.0), 1.5);
  gl_FragColor = vec4(vec3(1.0, 0.8, 0.53), strength * vAlpha);
}
`;

export function DustCloud({ count = 200 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const sp = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (seededRandom(i * 3 + 1) - 0.5) * 8; // x
      pos[i * 3 + 1] = seededRandom(i * 3 + 2) * 12;        // y
      pos[i * 3 + 2] = (seededRandom(i * 3 + 3) - 0.5) * 8 - 3; // z

      ph[i] = seededRandom(i * 3 + 4) * Math.PI * 2;
      sp[i] = 0.12 + seededRandom(i * 3 + 5) * 0.35;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(ph, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(sp, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: dustVertexShader,
      fragmentShader: dustFragmentShader,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, [count]);

  // Clean unmount disposal for memory safety
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Zero CPU writes: only update a single float time uniform on GPU
  useFrame((state) => {
    if (pointsRef.current) {
      (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}
