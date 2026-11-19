"use client";

// Ambient crowd: soft standing/walking silhouettes in the haze, for scale (PRD §5.5).
// One instanced draw that reuses the man's SDF (cached by silhouetteSdf.ts), softened and
// pushed toward the fog colour with distance so they read as figures in wet air, not cut-outs.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { seeded } from "@/gl/art/geometry";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { getSilhouetteSdfTexture } from "../silhouetteSdf";
import { PLATFORM } from "./layout";

interface Figure {
  x: number;
  z: number;
  scale: number;
  speed: number;
  phase: number;
}

/** Positions avoid the window shot (|x| < 4 on the near platform). */
function figures(count: number): Figure[] {
  const rand = seeded(23);
  const out: Figure[] = [];
  for (let i = 0; i < count; i++) {
    const far = i % 3 === 2;
    const side = rand() < 0.5 ? -1 : 1;
    const walking = rand() < 0.55;
    // Standing figures sit just outside the F1 frustum (|x| > 2.5) so the F4 wide shot has scale cues.
    const x = far ? (rand() - 0.5) * 30 : walking ? side * (4.5 + rand() * 15) : side * (2.6 + rand() * 7);
    // Near-platform walkers stay behind the F1 camera (desktop and portrait) so they never cross the window shot.
    const z = far ? PLATFORM.farEdgeZ - 1.2 - rand() * 7 : walking ? 7.2 + rand() * 3 : 1.4 + rand() * 4.5;
    out.push({
      x,
      z,
      scale: 0.92 + rand() * 0.16,
      speed: walking ? (rand() < 0.5 ? -1 : 1) * (0.5 + rand() * 0.5) : 0,
      phase: rand() * 100,
    });
  }
  return out;
}

export function Crowd({ count, fogColor, animate }: { count: number; fogColor: THREE.ColorRepresentation; animate: boolean }) {
  const resources = useMemo(() => {
    const sdf = getSilhouetteSdfTexture("man", "B");
    if (!sdf || count <= 0) return null;
    const list = figures(count);
    const base = new THREE.PlaneGeometry(0.9, 1.75);
    base.translate(0, 0.875, 0);
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.index = base.index;
    geometry.setAttribute("position", base.attributes.position);
    geometry.setAttribute("uv", base.attributes.uv);
    const a = new Float32Array(count * 4);
    const b = new Float32Array(count);
    list.forEach((f, i) => {
      a.set([f.x, f.z, f.scale, f.speed], i * 4);
      b[i] = f.phase;
    });
    geometry.setAttribute("aFig", new THREE.InstancedBufferAttribute(a, 4));
    geometry.setAttribute("aPhase", new THREE.InstancedBufferAttribute(b, 1));
    geometry.instanceCount = count;
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uSdf: { value: null },
          uTime: { value: 0 },
          uInk: { value: new THREE.Color("#0b1119") },
          uHaze: { value: new THREE.Color(fogColor).lerp(new THREE.Color("#3b5068"), 0.6) },
        },
      ]),
      vertexShader: /* glsl */ `
        attribute vec4 aFig;
        attribute float aPhase;
        uniform float uTime;
        varying vec2 vUv;
        varying float vDist;
        #include <fog_pars_vertex>
        void main() {
          float span = 30.0;
          float x = aFig.x;
          if (aFig.w != 0.0) x = mod(aFig.x + aFig.w * uTime + span * 0.5 + aPhase, span) - span * 0.5 + sign(aFig.x) * 2.0;
          float bob = aFig.w != 0.0 ? abs(sin(uTime * 5.2 * abs(aFig.w) + aPhase)) * 0.025 : sin(uTime * 0.7 + aPhase) * 0.004;
          vec3 p = position * aFig.z;
          vUv = vec2(aFig.w < 0.0 ? 1.0 - uv.x : uv.x, uv.y);
          vec3 world = vec3(x + p.x, p.y + bob, aFig.y);
          vec4 mvPosition = viewMatrix * vec4(world, 1.0);
          vDist = -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uSdf;
        uniform vec3 uInk;
        uniform vec3 uHaze;
        varying vec2 vUv;
        varying float vDist;
        #include <fog_pars_fragment>
        void main() {
          float d = texture2D(uSdf, vUv).r;
          // Soft edge: wider than a pixel so they sit in the air, not on it.
          float body = smoothstep(0.43, 0.56, d);
          if (body < 0.01) discard;
          // Lit wet air between the figure and the camera lifts it off the dark coach behind.
          vec3 col = mix(uInk, uHaze, clamp(0.35 + vDist * 0.015, 0.0, 0.75));
          gl_FragColor = vec4(col, body * 0.92);
          #include <fog_fragment>
        }
      `,
    });
    material.uniforms.uSdf.value = sdf;
    return { geometry, material, base };
  }, [count, fogColor]);
  // The SDF texture is a session cache owned by silhouetteSdf.ts: dispose geometry and the
  // shader program only, never the texture (disposeMaterial would free uniform textures).
  useDisposeOnUnmount(resources?.geometry, resources?.base);
  React.useEffect(() => {
    const material = resources?.material;
    return () => material?.dispose();
  }, [resources]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!resources || !animate) return;
    resources.material.uniforms.uTime.value += dt;
  });

  if (!resources) return null;
  return <mesh geometry={resources.geometry} material={resources.material} frustumCulled={false} renderOrder={6} name="Crowd" />;
}
