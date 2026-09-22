"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";

interface ShatterTransitionPassProps {
  triggerState?: {
    active: boolean;
    worldPos?: [number, number, number];
    u: number;
    v: number;
    slug?: string;
  };
  onComplete?: (slug?: string) => void;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform float uProgress;
  uniform vec2 uOrigin;
  uniform float uFlash;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Hash & Noise for Voronoi crack edges
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float voronoiNoise(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float m = 8.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = vec2(hash(n + g));
        vec2 r = g + o - f;
        float d = dot(r, r);
        m = min(m, d);
      }
    }
    return sqrt(m);
  }

  void main() {
    if (uProgress <= 0.001 && uFlash <= 0.01) {
      discard;
    }

    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 delta = (vUv - uOrigin) * aspect;
    float dist = length(delta);
    float angle = atan(delta.y, delta.x);

    // Radial expansion front
    float radius = uProgress * 2.2;
    float shockFront = smoothstep(radius - 0.12, radius, dist) - smoothstep(radius, radius + 0.05, dist);

    // Radial Voronoi crack patterns
    float crack = voronoiNoise(delta * 22.0 + vec2(angle * 3.5));
    float crackLines = step(0.88, crack) * smoothstep(0.0, radius, dist);

    // Edge incinerate incandescent orange
    vec3 flameAmber = vec3(1.0, 0.55, 0.05);
    vec3 flameWhiteHot = vec3(1.0, 0.95, 0.7);
    vec3 crackColor = mix(flameAmber, flameWhiteHot, shockFront * 2.0);

    // Fracture darkness inside the shattered zone
    float insideShatter = smoothstep(radius, radius - 0.25, dist);
    vec3 blackout = vec3(0.04, 0.02, 0.01);

    // Bloom exposure flash
    vec3 flashColor = vec3(1.0, 0.85, 0.6) * uFlash;

    vec3 finalColor = flashColor;
    float alpha = uFlash * 0.85;

    if (dist < radius) {
      finalColor += crackColor * crackLines * 3.0;
      finalColor += crackColor * shockFront * 2.5;
      finalColor = mix(finalColor, blackout, insideShatter * uProgress * 0.95);
      alpha = max(alpha, min(1.0, insideShatter * uProgress + shockFront));
    } else {
      finalColor += crackColor * shockFront * 3.0;
      alpha = max(alpha, shockFront);
    }

    gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
  }
`;

export function ShatterTransitionPass({
  triggerState,
  onComplete,
}: ShatterTransitionPassProps) {
  const { camera, size } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const startTime = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (materialRef.current?.uniforms?.uResolution) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size]);

  useEffect(() => {
    if (triggerState?.active && materialRef.current?.uniforms) {
      startTime.current = performance.now();
      completedRef.current = false;

      if (triggerState.worldPos) {
        // Project 3D world coordinates of gun barrel tip into NDC -> UV space
        const p = new THREE.Vector3(...triggerState.worldPos);
        p.project(camera);
        const originU = (p.x + 1) / 2;
        const originV = (-p.y + 1) / 2;
        materialRef.current.uniforms.uOrigin.value.set(
          THREE.MathUtils.clamp(originU, 0.05, 0.95),
          1.0 - THREE.MathUtils.clamp(originV, 0.05, 0.95)
        );
      } else {
        materialRef.current.uniforms.uOrigin.value.set(triggerState.u, 1.0 - triggerState.v);
      }

      materialRef.current.uniforms.uProgress.value = 0;
      materialRef.current.uniforms.uFlash.value = 5.0; // Instant exposure multiplier
    }
  }, [triggerState, camera]);

  useFrame(() => {
    if (!startTime.current || completedRef.current || !materialRef.current?.uniforms) return;

    const elapsed = (performance.now() - startTime.current) / 1000;
    const duration = 0.85; // 850ms total transition
    const progress = Math.min(1.0, elapsed / duration);

    materialRef.current.uniforms.uProgress.value = progress;

    // Exponential decay of bloom flash from 6.0 down to 0.0 in 300ms
    const flashDecay = Math.max(0, Math.exp(-elapsed * 9.5));
    materialRef.current.uniforms.uFlash.value = flashDecay * 5.0;

    // Anchor overlay quad 0.5 units in front of camera
    if (meshRef.current) {
      meshRef.current.position.set(0, 0, -0.45);
      meshRef.current.rotation.set(0, 0, 0);
    }

    if (progress >= 1.0 && !completedRef.current) {
      completedRef.current = true;
      if (onComplete) {
        onComplete(triggerState?.slug);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      visible={Boolean(triggerState?.active)}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uProgress: { value: 0 },
          uOrigin: { value: new THREE.Vector2(0.5, 0.5) },
          uFlash: { value: 0 },
          uResolution: { value: new THREE.Vector2(size.width, size.height) },
        }}
        transparent
        depthTest={false}
        depthWrite={false}
      />
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
