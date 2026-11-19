"use client";

// Phone torches held up in the crowd (PRD §3.2), drawn as a bokeh field: each torch is a
// point sprite whose size and softness follow a thin-lens circle of confusion around the
// performer, so torches near the lens bloom into large soft discs and far ones stay pin
// sharp. Twinkle I(t) = I0 · [0.7 + 0.3 sin(ωt) cos(νt)] and the sway run in the vertex
// shader: one draw, no per-frame CPU work.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { seeded } from "@/gl/art/geometry";
import { useDisposeOnUnmount } from "@/gl/dispose";

export interface TorchSpot {
  x: number;
  y: number;
  z: number;
}

const VERT = /* glsl */ `
  attribute vec4 aSeed; // phase, omega, nu, warmth
  uniform float uTime;
  uniform float uSize;
  uniform float uFocus;
  uniform float uAperture;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vWarm;
  varying float vSoft;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 1.3 + aSeed.x * 6.283) * 0.06;
    p.y += cos(uTime * 1.9 + aSeed.x * 4.1) * 0.035;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = max(-mv.z, 0.2);
    // Circle of confusion (pixels) for a lens focused at uFocus.
    float coc = uAperture * abs(depth - uFocus) / depth;
    float sharp = uSize * (0.55 + 1.1 * fract(aSeed.x * 13.7)) / depth;
    float size = min(sharp + coc, 46.0);
    gl_PointSize = size * uPixelRatio;
    // Energy spreads over the disc: dimmer as it grows.
    float spread = sharp / size;
    float twinkle = 0.7 + 0.3 * sin(uTime * aSeed.y + aSeed.x * 6.283) * cos(uTime * aSeed.z);
    vAlpha = twinkle * (0.07 + 0.93 * spread) * smoothstep(2.5, 6.0, depth);
    vWarm = aSeed.w;
    vSoft = clamp(coc / size, 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform float uIntensity;
  varying float vAlpha;
  varying float vWarm;
  varying float vSoft;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    // Sharp torches: a hot core. Defocused ones: a flat disc with a faint brighter rim.
    float core = exp(-d * d * 7.0);
    float disc = smoothstep(1.0, 0.45, d) * (0.6 + 0.4 * exp(-d * d * 2.0));
    float shape = mix(core, disc, vSoft);
    vec3 cool = vec3(1.0, 0.86, 0.66);
    vec3 warm = vec3(1.0, 0.68, 0.38);
    float a = shape * vAlpha * uIntensity;
    gl_FragColor = vec4(mix(cool, warm, vWarm) * a, 1.0);
  }
`;

export function PhoneTorches({ spots, focus = 9, intensity = 3.6 }: { spots: TorchSpot[]; focus?: number; intensity?: number }) {
  const { geometry, material } = useMemo(() => {
    const rand = seeded(53);
    const pos = new Float32Array(spots.length * 3);
    const seed = new Float32Array(spots.length * 4);
    spots.forEach((s, i) => {
      pos.set([s.x, s.y, s.z], i * 3);
      seed.set([rand(), 1.2 + rand() * 2.4, 0.6 + rand() * 1.6, rand() < 0.75 ? rand() * 0.25 : 0.6 + rand() * 0.4], i * 4);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 26 },
        uFocus: { value: focus },
        uAperture: { value: 18 },
        uPixelRatio: { value: 1 },
        uIntensity: { value: intensity },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return { geometry, material };
  }, [spots, focus, intensity]);
  useDisposeOnUnmount(geometry, material);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    material.uniforms.uTime.value += dt;
    material.uniforms.uPixelRatio.value = state.viewport.dpr;
    // Keep the performer in focus as the crane moves.
    material.uniforms.uFocus.value = state.camera.position.length();
  });

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={6} />;
}
