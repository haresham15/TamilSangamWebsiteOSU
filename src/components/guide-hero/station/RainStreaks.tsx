"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { guideStationPalette } from "./palette";

const RAIN_COUNT = 350;

/**
 * Single-draw-call GPU Drizzle System (Fix 3):
 * Replaces heavy InstancedMesh CPU matrix loops with a single GPU vertex/fragment
 * shader. Sub-pixel ribbons (0.0018m width, 0.42m length) cycle smoothly on the GPU.
 * Alpha is masked by the 3D window light cone (peak opacity <= 0.12).
 */
export function RainStreaks() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.InstancedBufferGeometry();

    // Base ribbon quad: width 0.0016m, length 0.38m
    const w = 0.0008;
    const l = 0.38;
    const positions = new Float32Array([
      -w, 0, 0,
       w, 0, 0,
      -w, l, 0,
       w, l, 0,
    ]);
    const uvs = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      1, 1,
    ]);
    const indices = [0, 1, 2, 2, 1, 3];

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);

    // Instanced attributes: 350 streaks angled at ~4° wind slant
    const origins = new Float32Array(RAIN_COUNT * 3);
    const speeds = new Float32Array(RAIN_COUNT);
    const tilts = new Float32Array(RAIN_COUNT);

    for (let i = 0; i < RAIN_COUNT; i++) {
      // Concentrate streaks in front of the coach and platform (x: -5 to +5, z: 0.3 to 5.0)
      origins[i * 3 + 0] = (((i * 37) % 100) / 100 - 0.5) * 8.5;
      origins[i * 3 + 1] = (((i * 53) % 100) / 100) * 6.0;
      origins[i * 3 + 2] = 0.3 + (((i * 79) % 100) / 100) * 4.8;

      speeds[i] = 5.2 + (i % 7) * 0.45;
      // ~4° wind slant (-0.07 rad)
      tilts[i] = -0.07 + ((i % 5) - 2) * 0.006;
    }

    geo.setAttribute("aOrigin", new THREE.InstancedBufferAttribute(origins, 3));
    geo.setAttribute("aSpeed", new THREE.InstancedBufferAttribute(speeds, 1));
    geo.setAttribute("aTilt", new THREE.InstancedBufferAttribute(tilts, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute vec3 aOrigin;
        attribute float aSpeed;
        attribute float aTilt;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          vUv = uv;
          float fallHeight = 6.2;
          float currentY = aOrigin.y - mod(uTime * aSpeed, fallHeight);
          if (currentY < 0.05) currentY += fallHeight;

          vec3 pos = position;
          pos.x += pos.y * aTilt;

          vec3 worldPos = vec3(aOrigin.x + pos.x, currentY + pos.y, aOrigin.z + pos.z);
          vWorldPos = worldPos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          // Soft velocity tail falloff
          float tail = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.35, vUv.y);

          // Proximity to warm window spill cone (origin [0, 1.65, 0.0])
          vec3 d = vWorldPos - vec3(0.0, 1.65, 0.0);
          float distFromConeAxis = length(vec2(d.x, d.y * 1.3));
          float coneRadiusAtZ = 0.55 + max(0.0, d.z) * 0.72;
          float inWindowCone = (d.z > 0.0 && distFromConeAxis < coneRadiusAtZ) ?
            max(0.0, 1.0 - distFromConeAxis / coneRadiusAtZ) : 0.0;

          // Proximity to blue-hour platform lamps
          float dLamp1 = length(vWorldPos - vec3(-3.2, 4.0, 3.5));
          float dLamp2 = length(vWorldPos - vec3(3.2, 4.0, 3.5));
          float inLamp = clamp(1.0 - min(dLamp1, dLamp2) / 6.0, 0.0, 1.0);

          vec3 coldBlue = vec3(0.40, 0.65, 0.90);
          vec3 warmAmber = vec3(1.0, 0.74, 0.36);
          vec3 col = mix(coldBlue, warmAmber, inWindowCone);

          // Sub-pixel translucent alpha (peak <= 0.14)
          float alpha = tail * (0.02 + inWindowCone * 0.09 + inLamp * 0.03);
          if (alpha < 0.004) discard;

          gl_FragColor = vec4(col, alpha);
        }
      `,
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame((_, delta) => {
    if (reduceMotion) return;
    const dt = Math.min(delta, 0.05);
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += dt;
    }
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  if (reduceMotion) {
    return null;
  }

  return (
    <group name="DrizzleAndShafts">
      {/* Zero-CPU GPU Drizzle Streaks (no polygonal cone/cylinder meshes!) */}
      <mesh
        ref={(el) => {
          if (el) materialRef.current = el.material as THREE.ShaderMaterial;
        }}
        geometry={geometry}
        material={material}
        name="GPULightMaskedDrizzle"
        frustumCulled={false}
        renderOrder={12}
      />
    </group>
  );
}

export default RainStreaks;
