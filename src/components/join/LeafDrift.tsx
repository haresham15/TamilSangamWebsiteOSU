"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const LEAF_COLORS = [
  new THREE.Color("#4a6b32"), // Ivy green
  new THREE.Color("#5d853e"), // Bright leaf green
  new THREE.Color("#a66d2c"), // Amber autumn bronze
  new THREE.Color("#b8863b"), // Golden elm
  new THREE.Color("#824927"), // Deep terracotta brown
];

const leafVertexShader = `
uniform float uTime;
attribute vec3 aInitialPos;
attribute vec3 aDynamics; // x = speedY, y = speedX, z = rotSpeed
attribute float aPhase;
attribute float aScale;
attribute vec3 aColor;

varying vec3 vColor;
varying vec3 vNormal;

void main() {
  vColor = aColor;
  vec3 localPos = position;

  // Scale leaf geometry
  localPos *= vec3(aScale, aScale * 1.4, aScale);

  // Tumble rotations on GPU
  float roll = uTime * aDynamics.z + aPhase;
  float pitch = sin(uTime * 0.8 + aPhase) * 1.8;
  float yaw = uTime * aDynamics.z * 0.7;

  float cr = cos(roll), sr = sin(roll);
  float cp = cos(pitch), sp = sin(pitch);
  float cy = cos(yaw), sy = sin(yaw);

  mat3 rotZ = mat3(cr, -sr, 0.0, sr, cr, 0.0, 0.0, 0.0, 1.0);
  mat3 rotX = mat3(1.0, 0.0, 0.0, 0.0, cp, -sp, 0.0, sp, cp);
  mat3 rotY = mat3(cy, 0.0, sy, 0.0, 1.0, 0.0, -sy, 0.0, cy);
  mat3 rot = rotZ * rotY * rotX;

  localPos = rot * localPos;
  vNormal = normalize(normalMatrix * (rot * normal));

  // GPU downward drift with modulo wrap
  float totalHeight = 5.5;
  float yWorld = aInitialPos.y - mod(uTime * aDynamics.x, totalHeight);
  if (yWorld < 0.05) yWorld += totalHeight;

  float xWorld = aInitialPos.x + sin(uTime * 1.8 + aPhase) * aDynamics.y;
  float zWorld = aInitialPos.z + cos(uTime * 1.2 + aPhase) * 0.25;

  vec3 worldPos = localPos + vec3(xWorld, yWorld, zWorld);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
}
`;

const leafFragmentShader = `
varying vec3 vColor;
varying vec3 vNormal;

void main() {
  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
  float diffuse = max(dot(vNormal, lightDir), 0.35);
  vec3 finalColor = vColor * (diffuse + 0.15);
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function LeafDrift({ count = 120 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.InstancedBufferGeometry();
    const plane = new THREE.PlaneGeometry(1, 1, 2, 2);
    geo.index = plane.index;
    geo.attributes.position = plane.attributes.position;
    geo.attributes.normal = plane.attributes.normal;
    geo.attributes.uv = plane.attributes.uv;

    const initialPos = new Float32Array(count * 3);
    const dynamics = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const scales = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      initialPos[i * 3 + 0] = (pseudoRandom(i * 5 + 1) - 0.5) * 14;
      initialPos[i * 3 + 1] = pseudoRandom(i * 5 + 2) * 5.4 + 0.1;
      initialPos[i * 3 + 2] = (pseudoRandom(i * 5 + 3) - 0.5) * 16 + 2;

      dynamics[i * 3 + 0] = 0.28 + pseudoRandom(i * 5 + 4) * 0.42; // speedY
      dynamics[i * 3 + 1] = 0.15 + pseudoRandom(i * 5 + 5) * 0.3;  // speedX
      dynamics[i * 3 + 2] = 0.8 + pseudoRandom(i * 5 + 6) * 1.5;   // rotSpeed

      phases[i] = pseudoRandom(i * 5 + 7) * Math.PI * 2;
      scales[i] = 0.08 + pseudoRandom(i * 5 + 8) * 0.07;

      const col = LEAF_COLORS[i % LEAF_COLORS.length];
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute("aInitialPos", new THREE.InstancedBufferAttribute(initialPos, 3));
    geo.setAttribute("aDynamics", new THREE.InstancedBufferAttribute(dynamics, 3));
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
    geo.setAttribute("aScale", new THREE.InstancedBufferAttribute(scales, 1));
    geo.setAttribute("aColor", new THREE.InstancedBufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader: leafVertexShader,
      fragmentShader: leafFragmentShader,
      uniforms: {
        uTime: { value: 0 },
      },
      side: THREE.DoubleSide,
    });

    return { geometry: geo, material: mat };
  }, [count]);

  // Clean unmount disposal
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Zero CPU matrix writes: only advance clock uniform on GPU
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef as unknown as React.Ref<THREE.Mesh>} geometry={geometry} material={material} />
  );
}
