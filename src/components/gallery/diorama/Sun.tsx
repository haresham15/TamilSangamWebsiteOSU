"use client";

import React, { forwardRef, useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const SUN_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SUN_FRAGMENT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    // Center at (0.5, 0.5)
    vec2 p = vUv - vec2(0.5);
    float dist = length(p) * 2.0; // 0.0 at center, 1.0 at edge

    if (dist > 1.0) discard;

    // Gentle breathing pulse
    float pulse = sin(uTime * 1.2) * 0.025;
    float r = dist / (1.0 + pulse);

    // 1. Intense HDR Solar Core (#fff4d6, values > 1.0 for GodRays & Bloom capture)
    float core = exp(-pow(r * 3.8, 2.5));
    vec3 coreColor = vec3(2.4, 2.1, 1.7); // HDR Warm White Core

    // 2. Solar Corona (#ff9a3c Solar Gold)
    float corona = exp(-pow(r * 1.8, 1.8));
    vec3 coronaColor = vec3(1.0, 0.58, 0.22);

    // 3. Wide Atmospheric Halo (#ffc86b to Kumkumam Amber)
    float halo = smoothstep(1.0, 0.0, r);
    vec3 haloColor = vec3(0.92, 0.38, 0.18);

    vec3 col = mix(haloColor, coronaColor, corona);
    col = mix(col, coreColor, core);

    // Ultra-soft edge fade to zero (no visible geometric boundary)
    float alpha = pow(halo, 2.2);

    gl_FragColor = vec4(col, alpha);
  }
`;

export const Sun = forwardRef<THREE.Mesh, { position?: [number, number, number] }>(
  ({ position = [16.0, 6.5, -380] }, ref) => {
    const matRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(
      () => ({
        uTime: { value: 0 },
      }),
      []
    );

    const geometry = useMemo(() => new THREE.PlaneGeometry(90, 90), []);
    const material = useMemo(
      () =>
        new THREE.ShaderMaterial({
          vertexShader: SUN_VERTEX,
          fragmentShader: SUN_FRAGMENT,
          uniforms,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: true,
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
        ref={ref}
        position={position}
        geometry={geometry}
        material={material}
        onUpdate={(self) => {
          matRef.current = self.material as THREE.ShaderMaterial;
        }}
      />
    );
  }
);

Sun.displayName = "Sun";
