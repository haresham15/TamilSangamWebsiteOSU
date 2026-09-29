"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const DUST_VERTEX = /* glsl */ `
  uniform float uTime;
  attribute float aSize;
  attribute float aSpeed;
  attribute float aPhase;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Slow drifting float in sunbeams
    pos.y += sin(uTime * 0.4 * aSpeed + aPhase) * 0.45;
    pos.x += cos(uTime * 0.3 * aSpeed + aPhase) * 0.35;
    pos.z += sin(uTime * 0.25 * aSpeed + aPhase) * 0.25;

    // Twinkle modulation
    vAlpha = (sin(uTime * 2.0 * aSpeed + aPhase) * 0.35 + 0.65);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (150.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const DUST_FRAGMENT = /* glsl */ `
  varying float vAlpha;

  void main() {
    // Soft circular particle falloff
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha * 0.75;
    vec3 dustGold = vec3(1.0, 0.82, 0.54); // #ffd08a warm sunlit gold

    gl_FragColor = vec4(dustGold, alpha);
  }
`;

const COUNT = 300;

export function DustMotes() {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { geometry, uniforms } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const speeds = new Float32Array(COUNT);
    const phases = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Concentrated inside the sunlit shaft (x from -6 to +14, y from 0.5 to 4.5, z from -2 to -45)
      positions[i * 3 + 0] = (Math.random() - 0.3) * 20.0;
      positions[i * 3 + 1] = 0.5 + Math.random() * 4.0;
      positions[i * 3 + 2] = -2.0 - Math.random() * 42.0;

      sizes[i] = 1.6 + Math.random() * 2.8;
      speeds[i] = 0.6 + Math.random() * 0.8;
      phases[i] = Math.random() * Math.PI * 2.0;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    const uni = {
      uTime: { value: 0 },
    };

    return { geometry: geo, uniforms: uni };
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: DUST_VERTEX,
        fragmentShader: DUST_FRAGMENT,
        uniforms,
        transparent: true,
        blending: THREE.AdditiveBlending,
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

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      onUpdate={(self) => {
        matRef.current = self.material as THREE.ShaderMaterial;
      }}
    />
  );
}
