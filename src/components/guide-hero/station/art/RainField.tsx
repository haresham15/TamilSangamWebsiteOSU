"use client";

// Rain for the art pass: one instanced draw of camera-facing streaks in three depth layers
// (between canopy and coach, over the tracks and far platform, open platform behind the
// camera path), each at least a pixel wide so far drops do not vanish or alias; brightness
// comes from the lights they fall through (sodium lamps, the window, the board spill).
// Plus one draw of procedural splash rings on the uncovered platform strips.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { seeded } from "@/gl/art/geometry";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { CANOPY, PLATFORM, SODIUM_LAMPS, SODIUM_LAMP_Y, SODIUM_LAMP_Z } from "./layout";

const LIT_LAMPS = SODIUM_LAMPS.filter((l) => l.lit).map((l) => new THREE.Vector3(l.x, SODIUM_LAMP_Y, SODIUM_LAMP_Z));

const LIGHTING_GLSL = /* glsl */ `
  uniform vec3 uLamps[2];
  uniform float uWindowX;
  vec3 rainLight(vec3 p) {
    vec3 warm = vec3(1.0, 0.62, 0.28);
    vec3 cool = vec3(0.42, 0.6, 0.85);
    float lamp = 0.0;
    for (int i = 0; i < 2; i++) {
      vec3 d = p - uLamps[i];
      lamp += 1.0 / (1.0 + dot(d, d) * 0.35);
    }
    // Window cone: from the hero window toward +z, widening.
    vec3 w = p - vec3(uWindowX, 1.65, 0.0);
    float cone = w.z > 0.0 ? max(0.0, 1.0 - length(vec2(w.x, w.y * 1.3)) / (0.6 + w.z * 0.7)) : 0.0;
    // Board spill pool under the board.
    vec3 b = p - vec3(0.0, 6.0, -5.5);
    float board = 1.0 / (1.0 + dot(b.xz, b.xz) * 0.03 + b.y * b.y * 0.01);
    return cool * 0.16 + warm * (lamp * 0.9 + cone * 0.8) + vec3(1.0, 0.85, 0.65) * board * 0.35;
  }
`;

export interface RainFieldProps {
  count: number;
  /** World x of the hero window (follows the departing train). */
  getWindowX: () => number;
  /** 0–1 drizzle density curve from the rail. */
  getDensity: () => number;
}

export function RainField({ count, getWindowX, getDensity }: RainFieldProps) {
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-0.5, 0, 0, 0.5, 0, 0, -0.5, 1, 0, 0.5, 1, 0]), 3));
    geo.setIndex([0, 1, 2, 2, 1, 3]);
    const origins = new Float32Array(count * 3);
    const params = new Float32Array(count * 3); // speed, length, fall height
    const rand = seeded(7);
    for (let i = 0; i < count; i++) {
      const r = rand();
      let x: number, y: number, z: number, h: number;
      if (r < 0.42) {
        // Between the canopy eave and the coach: the drops seen against the window.
        x = (rand() - 0.5) * 12;
        z = PLATFORM.edgeZ - 0.15 + rand() * (CANOPY.nearZ - PLATFORM.edgeZ + 0.1);
        h = 4.3;
        y = rand() * h;
      } else if (r < 0.78) {
        // Over the coach roof, tracks and far platform, up into the hall.
        x = (rand() - 0.5) * 30;
        z = PLATFORM.farBackZ * 0.55 + rand() * (0 - PLATFORM.farBackZ * 0.55);
        h = 16;
        y = rand() * h;
      } else {
        // Open platform beyond the canopy, around the crane path.
        x = (rand() - 0.5) * 18;
        z = CANOPY.farZ + 0.3 + rand() * 9;
        h = 10;
        y = rand() * h;
      }
      origins.set([x, y, z], i * 3);
      params.set([6.2 + rand() * 2.2, 0.16 + rand() * 0.16, h], i * 3);
    }
    geo.setAttribute("aOrigin", new THREE.InstancedBufferAttribute(origins, 3));
    geo.setAttribute("aParams", new THREE.InstancedBufferAttribute(params, 3));
    geo.instanceCount = count;

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      uniforms: {
        uTime: { value: 0 },
        uDensity: { value: 1 },
        uPixel: { value: 0.001 },
        uLamps: { value: LIT_LAMPS },
        uWindowX: { value: 0 },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aOrigin;
        attribute vec3 aParams;
        uniform float uTime;
        uniform float uPixel;
        varying float vV;
        varying float vFade;
        varying vec3 vLight;
        ${LIGHTING_GLSL}
        void main() {
          float fall = mod(uTime * aParams.x, aParams.z);
          float y = aOrigin.y - fall;
          if (y < 0.0 && aOrigin.z > ${PLATFORM.edgeZ.toFixed(2)}) y += aParams.z;
          if (y < ${PLATFORM.trackY.toFixed(2)}) y += aParams.z;
          // Slight wind slant toward -x.
          vec3 top = vec3(aOrigin.x - y * 0.06, y + aParams.y, aOrigin.z);
          vec3 bot = vec3(aOrigin.x - (y - aParams.y) * 0.06, y, aOrigin.z);
          vec3 p = mix(bot, top, position.y);
          vec4 mv = viewMatrix * vec4(p, 1.0);
          float dist = -mv.z;
          // At least ~1.2 px wide; thinner-than-pixel drops trade width for alpha.
          float baseW = 0.0018;
          float w = max(baseW, dist * uPixel * 1.2);
          mv.x += position.x * w;
          gl_Position = projectionMatrix * mv;
          vV = position.y;
          vFade = clamp(baseW / w, 0.18, 1.0) * smoothstep(0.4, 1.4, dist) * (1.0 - smoothstep(26.0, 40.0, dist));
          vLight = rainLight(p);
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vV;
        varying float vFade;
        varying vec3 vLight;
        uniform float uDensity;
        void main() {
          float tail = smoothstep(0.0, 0.35, vV) * (1.0 - smoothstep(0.75, 1.0, vV));
          float a = tail * vFade * uDensity * 0.42;
          if (a < 0.002) discard;
          gl_FragColor = vec4(vLight * a, a);
        }
      `,
    });
    return { geometry: geo, material: mat };
  }, [count]);
  useDisposeOnUnmount(geometry, material);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const u = material.uniforms;
    u.uTime.value += dt;
    u.uWindowX.value = getWindowX();
    u.uDensity.value = 0.35 + 0.65 * Math.min(1, getDensity() / 0.35);
    const cam = state.camera as THREE.PerspectiveCamera;
    const fov = cam.isPerspectiveCamera ? cam.fov : 35;
    u.uPixel.value = (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2)) / Math.max(1, state.size.height);
  });

  if (count <= 0) return null;
  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={12} name="RainField" />;
}

/** Splash rings on the uncovered strips of both platforms (one draw, procedural). */
export function SplashRings({ getWindowX }: { getWindowX: () => number }) {
  const { geometry, material } = useMemo(() => {
    const strips: [number, number, number, number][] = [
      // [x0, x1, z0, z1]
      [-18, 18, PLATFORM.edgeZ, CANOPY.nearZ],
      [-18, 18, CANOPY.farZ, CANOPY.farZ + 10],
      [-24, 24, PLATFORM.farBackZ, PLATFORM.farEdgeZ],
    ];
    const pos: number[] = [];
    for (const [x0, x1, z0, z1] of strips) {
      const y = 0.008;
      pos.push(x0, y, z0, x1, y, z0, x0, y, z1, x0, y, z1, x1, y, z0, x1, y, z1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
      uniforms: { uTime: { value: 0 }, uLamps: { value: LIT_LAMPS }, uWindowX: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec3 vWorld;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vWorld;
        uniform float uTime;
        ${LIGHTING_GLSL}
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main() {
          vec2 q = vWorld.xz / 0.42;
          float ring = 0.0;
          for (int i = 0; i < 2; i++) {
            vec2 id = floor(q - float(i) * 0.5);
            float h1 = hash(id + float(i) * 7.3);
            float h2 = hash(id + 3.7);
            vec2 centre = id + 0.25 + 0.5 * vec2(h1, h2) + float(i) * 0.5;
            float t = fract(uTime * (0.9 + 0.6 * h1) + h2);
            float r = t * 0.42;
            float d = length(q - centre);
            float width = 0.035 + t * 0.03;
            ring += (1.0 - smoothstep(0.0, width, abs(d - r))) * (1.0 - t) * (1.0 - t) * step(0.35, h2);
          }
          float aa = fwidth(q.x);
          ring *= 1.0 - smoothstep(0.08, 0.25, aa);
          vec3 light = rainLight(vWorld + vec3(0.0, 0.25, 0.0));
          float a = ring * 0.35;
          if (a < 0.002) discard;
          gl_FragColor = vec4(light * a, a);
        }
      `,
    });
    return { geometry: geo, material: mat };
  }, []);
  useDisposeOnUnmount(geometry, material);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    material.uniforms.uTime.value += dt;
    material.uniforms.uWindowX.value = getWindowX();
  });

  return <mesh geometry={geometry} material={material} renderOrder={6} name="SplashRings" />;
}
