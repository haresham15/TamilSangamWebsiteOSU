"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { pluckBus } from "./pluckBus";
import { galleryScrollState } from "./galleryStore";
import { getHeroTimelineValues } from "./heroTimeline";

const STRING_VERTEX = /* glsl */ `
  attribute float aU; // Normalized 0.0 to 1.0 along string length
  uniform float uEnergy;
  uniform float uFreq;
  uniform float uPhase;
  uniform float uMaxAmp;
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vEnergy;

  void main() {
    vUv = uv;
    vEnergy = uEnergy;
    vec3 pos = position;

    // 4-Harmonic Standing Wave Modal Vibration (PRD Section 5.3.2)
    float d = 0.0;
    float pi = 3.1415926535;
    for (int n = 1; n <= 4; n++) {
      float fn = float(n);
      float amp = uEnergy / (fn * fn);
      d += amp * sin(fn * pi * aU) * cos(uTime * uFreq * fn + uPhase * fn);
    }

    pos.y += d * uMaxAmp;
    pos.z += d * 0.25 * uMaxAmp; // Subtle out-of-plane wobble for physical depth

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPos.xyz;
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const STRING_FRAGMENT = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform float uIsWound; // 1.0 = wound bronze, 0.0 = plain steel
  uniform float uEnergy;
  uniform vec3 uSunDir;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vEnergy;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPosition);
    vec3 L = normalize(uSunDir);
    vec3 H = normalize(L + V);

    // 1. Helical micro-ribbing normal for wound acoustic strings
    if (uIsWound > 0.5) {
      float wrap = sin(vUv.x * 2400.0) * 0.16;
      N = normalize(N + vec3(wrap, 0.0, 0.0));
    }

    // 2. Anisotropic Specular Highlight from setting sun
    float NdotL = max(dot(N, L), 0.0);
    float NdotH = max(dot(N, H), 0.0);
    float spec = pow(NdotH, uIsWound > 0.5 ? 64.0 : 128.0);

    // Warm Sunset Specular Glint & Metal Color
    vec3 sunGlaze = vec3(1.0, 0.82, 0.50) * spec * 1.5;
    vec3 ambient = uBaseColor * (0.15 + 0.35 * NdotL);

    // 3. Emissive Golden Bloom on Vibration (PRD: pow(e, 0.7) * (1 + 4e))
    vec3 goldGlow = vec3(1.0, 0.72, 0.35);
    float glowFactor = (vEnergy > 0.01) ? pow(vEnergy, 0.8) * (0.6 + 3.0 * vEnergy) : 0.0;
    vec3 emissive = goldGlow * glowFactor;

    vec3 finalColor = ambient + sunGlaze + emissive;

    // 4. Motion-blur alpha envelope at high energy
    float blurEdge = 1.0 - pow(abs(vUv.y - 0.5) * 2.0, 4.0) * (vEnergy * 0.35);

    gl_FragColor = vec4(finalColor, blurEdge * uOpacity);
  }
`;

interface GuitarStringProps {
  index: number;
  radius: number;
  y: number;
  isWound: boolean;
  baseColor: string;
}

export function GuitarString({ index, radius, y, isWound, baseColor }: GuitarStringProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // String extends 22 meters horizontally (-11 to +11) with 160 subdivisions
  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(radius, radius, 22.0, 12, 160);
    geo.rotateZ(Math.PI / 2); // Orient horizontally along X-axis

    // Generate normalized U attribute along string length (0.0 at left, 1.0 at right)
    const pos = geo.attributes.position;
    const aU = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      aU[i] = (x + 11.0) / 22.0;
    }
    geo.setAttribute("aU", new THREE.BufferAttribute(aU, 1));
    return geo;
  }, [radius]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uEnergy: { value: 0 },
      uFreq: { value: pluckBus.freqs[index] },
      uPhase: { value: index * 1.15 },
      uMaxAmp: { value: pluckBus.maxAmps[index] },
      uBaseColor: { value: new THREE.Color(baseColor) },
      uIsWound: { value: isWound ? 1.0 : 0.0 },
      uSunDir: { value: new THREE.Vector3(0.5, 0.4, -0.7).normalize() },
      uOpacity: { value: 1.0 },
    }),
    [index, baseColor, isWound]
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: STRING_VERTEX,
        fragmentShader: STRING_FRAGMENT,
        uniforms,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    [uniforms]
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    // Read energy directly from pluckBus Float32Array (no allocations)
    const energy = pluckBus.energies[index];
    const timeline = getHeroTimelineValues(galleryScrollState.progress);

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      matRef.current.uniforms.uEnergy.value = energy;
      matRef.current.uniforms.uOpacity.value = timeline.stringsOpacity;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, y, 0]}
      geometry={geometry}
      material={material}
      onPointerDown={(e) => {
        e.stopPropagation();
        pluckBus.pluck(index, 0.95);
      }}
      onPointerEnter={() => {
        pluckBus.pluck(index, 0.65);
      }}
      onUpdate={(self) => {
        matRef.current = self.material as THREE.ShaderMaterial;
      }}
    />
  );
}
