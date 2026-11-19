// src/gl/art/Atmosphere.tsx
"use client";

// Air between the camera and the set: light shafts, drifting dust, haze layers.
//
// All three are additive. Under the grade pass the scene is summed in linear HDR before
// tone mapping, so additive layers read much brighter than they do ungraded: keep
// intensities low (the defaults are tuned for the graded path) and compare `?grade=0`.

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { seeded } from "./geometry";

type Vec3 = [number, number, number];

const SHAFT_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vViewDir;
  varying vec3 vNormalW;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - wp.xyz);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const SHAFT_FRAG = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vViewDir;
  varying vec3 vNormalW;
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    // Soft across the width, strongest at the source (v = 1), gone before the far end.
    // Clamp before pow(): interpolated UVs can land a hair below 0, and pow(negative)
    // is NaN, which the HDR grade target keeps and bloom smears into dark streaks.
    float across = pow(max(sin(clamp(vUv.x, 0.0, 1.0) * 3.14159), 0.0), 1.5);
    float vy = clamp(vUv.y, 0.0, 1.0);
    float along = smoothstep(0.0, 0.25, vy) * pow(vy, 0.8);
    // Streaks drifting slowly along the beam.
    float streak = 0.65 + 0.35 * noise(vec2(vUv.x * 14.0, vUv.y * 1.5 - uTime * 0.03));
    // Fade when seen edge-on so the card never shows as a plane.
    float facing = smoothstep(0.05, 0.6, abs(dot(vViewDir, vNormalW)));
    float a = across * along * streak * facing * uIntensity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

export interface LightShaftProps {
  /** Source end of the beam (e.g. the window or gap the light comes through). */
  from: Vec3;
  /** Where the beam dies out (usually on the floor). */
  to: Vec3;
  width?: number;
  /** Beam spreads to `width * spread` at the far end. */
  spread?: number;
  color?: THREE.ColorRepresentation;
  intensity?: number;
}

/** One volumetric-looking beam: two crossed tapered cards, one draw. */
export function LightShaft({ from, to, width = 0.6, spread = 2.2, color = "#ffd9a0", intensity = 0.12 }: LightShaftProps) {
  const { geometry, material, quaternion, position } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const length = a.distanceTo(b);
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    // Local frame: +Y points to the source, cards span X and Z.
    [0, Math.PI / 2].forEach((yaw, c) => {
      const cx = Math.cos(yaw);
      const cz = Math.sin(yaw);
      const base = c * 4;
      const near = width / 2;
      const far = (width * spread) / 2;
      const corners: [number, number, number, number, number][] = [
        [-far * cx, -length / 2, -far * cz, 0, 0],
        [far * cx, -length / 2, far * cz, 1, 0],
        [near * cx, length / 2, near * cz, 1, 1],
        [-near * cx, length / 2, -near * cz, 0, 1],
      ];
      for (const [x, y, z, u, v] of corners) {
        positions.push(x, y, z);
        normals.push(-cz, 0, cx);
        uvs.push(u, v);
      }
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    const material = new THREE.ShaderMaterial({
      vertexShader: SHAFT_VERT,
      fragmentShader: SHAFT_FRAG,
      uniforms: { uColor: { value: new THREE.Color(color) }, uIntensity: { value: intensity }, uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), a.clone().sub(b).normalize());
    const position = a.clone().add(b).multiplyScalar(0.5);
    return { geometry, material, quaternion, position };
    // Vector contents, not identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from[0], from[1], from[2], to[0], to[1], to[2], width, spread, color, intensity]);
  useDisposeOnUnmount(geometry, material);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    material.uniforms.uTime.value += dt;
  });

  return <mesh geometry={geometry} material={material} position={position} quaternion={quaternion} renderOrder={5} frustumCulled={false} />;
}

const DUST_VERT = /* glsl */ `
  attribute vec4 aSeed; // phase, speed, size, twinkle
  uniform float uTime;
  uniform float uSize;
  uniform vec3 uBox;
  uniform vec3 uDrift;
  varying float vAlpha;
  void main() {
    // Wrap each mote inside the box so the field never empties.
    vec3 p = position + uDrift * uTime * aSeed.y;
    p.x += sin(uTime * 0.21 * aSeed.y + aSeed.x * 6.283) * 0.18;
    p.y += sin(uTime * 0.17 * aSeed.y + aSeed.x * 4.1) * 0.12;
    p = mod(p + uBox * 0.5, uBox) - uBox * 0.5;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;
    gl_PointSize = uSize * aSeed.z / max(depth, 0.1);
    // Fade at the box faces (no popping at the wrap) and very near the lens.
    vec3 edge = 1.0 - smoothstep(vec3(0.38), vec3(0.5), abs(p) / uBox);
    float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed.w) + aSeed.x * 31.0);
    vAlpha = edge.x * edge.y * edge.z * twinkle * smoothstep(0.3, 1.2, depth);
    gl_Position = projectionMatrix * mv;
  }
`;

const DUST_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha * uIntensity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

export interface DustMotesProps {
  /** Centre and size of the volume the motes live in. */
  position?: Vec3;
  size?: Vec3;
  count?: number;
  color?: THREE.ColorRepresentation;
  intensity?: number;
  /** Point size in pixels at 1 m (scaled by device pixel ratio by the caller if needed). */
  pointSize?: number;
  /** Drift velocity in m/s. */
  drift?: Vec3;
  seed?: number;
}

/** Dust or pollen catching the light. One draw, animated entirely in the vertex shader. */
export function DustMotes({
  position = [0, 1.5, 0],
  size = [6, 3, 6],
  count = 300,
  color = "#ffe2b8",
  intensity = 0.35,
  pointSize = 26,
  drift = [0.02, 0.012, 0.0],
  seed = 7,
}: DustMotesProps) {
  const { geometry, material } = useMemo(() => {
    const rand = seeded(seed);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * size[0];
      positions[i * 3 + 1] = (rand() - 0.5) * size[1];
      positions[i * 3 + 2] = (rand() - 0.5) * size[2];
      seeds[i * 4] = rand();
      seeds[i * 4 + 1] = 0.5 + rand();
      seeds[i * 4 + 2] = 0.4 + rand() * rand() * 1.6;
      seeds[i * 4 + 3] = rand() * 1.5;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
    const material = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: pointSize },
        uBox: { value: new THREE.Vector3(...size) },
        uDrift: { value: new THREE.Vector3(...drift) },
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return { geometry, material };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, seed, size[0], size[1], size[2], color, intensity, pointSize, drift[0], drift[1], drift[2]]);
  useDisposeOnUnmount(geometry, material);

  const points = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    material.uniforms.uTime.value += dt;
  });

  return <points ref={points} geometry={geometry} material={material} position={position} frustumCulled={false} renderOrder={6} />;
}

const HAZE_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    vec2 c = vUv - 0.5;
    float falloff = smoothstep(0.5, 0.05, length(c * vec2(1.0, 1.25)));
    float n = noise(vUv * 3.0 + vec2(uTime * 0.012, 0.0)) * 0.6 + noise(vUv * 7.0 - vec2(uTime * 0.02, 0.0)) * 0.4;
    float a = falloff * (0.45 + 0.55 * n) * uIntensity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const HAZE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export interface HazeLayerProps {
  position: Vec3;
  rotation?: Vec3;
  size?: [number, number];
  color?: THREE.ColorRepresentation;
  intensity?: number;
}

/**
 * A soft sheet of lit haze. Place two or three at different depths behind foreground
 * objects to separate the planes; fog alone only darkens with distance.
 */
export function HazeLayer({ position, rotation = [0, 0, 0], size = [8, 4], color = "#c9a074", intensity = 0.08 }: HazeLayerProps) {
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(size[0], size[1]);
    const material = new THREE.ShaderMaterial({
      vertexShader: HAZE_VERT,
      fragmentShader: HAZE_FRAG,
      uniforms: { uColor: { value: new THREE.Color(color) }, uIntensity: { value: intensity }, uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    return { geometry, material };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size[0], size[1], color, intensity]);
  useDisposeOnUnmount(geometry, material);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    material.uniforms.uTime.value += dt;
  });

  return <mesh geometry={geometry} material={material} position={position} rotation={rotation} renderOrder={4} />;
}
