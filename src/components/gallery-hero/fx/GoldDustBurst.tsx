"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getStringWorldPosition } from "../neck/anchors";
import { registerDustBurstHandler, unregisterDustBurstHandler } from "../props/types";

const BURST_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uBurstTime;     // Timestamp of last burst trigger
  uniform float uBurstDuration; // Burst duration (~3.2 seconds)
  uniform vec3 uBurstOrigin;    // World position of string 0 contact
  uniform float uBurstActive;   // 1.0 = active, 0.0 = idle
  uniform float uReducedMotion; // 1.0 = prefers-reduced-motion

  attribute vec3 aVelocity;     // Initial explosive burst velocity
  attribute float aSize;        // Particle point size
  attribute float aSpeed;       // Drift & sparkle speed multiplier
  attribute float aPhase;       // Individual random phase offset
  attribute float aType;        // 0.0 = burst particle, 1.0 = ambient sunset mote

  varying float vAlpha;
  varying float vType;
  varying vec3 vColor;

  void main() {
    vType = aType;
    vec3 pos = position;

    if (aType > 0.5) {
      // ── 1. AMBIENT SUNSET DUST MOTES (Continuous atmosphere) ──
      // Suspended motes drifting in the warm sunset light along the neck
      pos.y += sin(uTime * 0.35 * aSpeed + aPhase) * 0.28;
      pos.x += cos(uTime * 0.28 * aSpeed + aPhase) * 0.22;
      pos.z += sin(uTime * 0.22 * aSpeed + aPhase) * 0.35;

      // Twinkle shimmer
      float twinkle = sin(uTime * 2.8 * aSpeed + aPhase) * 0.35 + 0.65;
      vAlpha = twinkle * 0.45;
      vColor = vec3(1.0, 0.82, 0.48); // Solar gold #FFE07D / #F59E0B
    } else {
      // ── 2. GOLD DUST BURST PARTICLES (Exploding on string 0 contact) ──
      float dt = max(0.0, uTime - uBurstTime);
      float normT = clamp(dt / uBurstDuration, 0.0, 1.0);

      // If inactive or burst expired, hide particle offscreen
      if (uBurstActive < 0.5 || dt > uBurstDuration) {
        gl_PointSize = 0.0;
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        return;
      }

      if (uReducedMotion > 0.5) {
        // Reduced motion: stationary soft cloud expanding gently
        pos = uBurstOrigin + position * (0.4 + 0.6 * normT);
        pos.y += sin(uTime * 0.4 + aPhase) * 0.08;
      } else {
        // Realistic ballistic drag: v(t) = v0 * exp(-gamma * t)
        // Integrated displacement: s(t) = v0 * (1 - exp(-gamma * t)) / gamma
        float drag = 1.25;
        float dragFactor = (1.0 - exp(-drag * dt)) / drag;
        vec3 displacement = aVelocity * dragFactor;

        // Thermal buoyant updraft (convective heat rising from struck bronze string)
        displacement.y += 0.35 * dt * dt * (1.0 - normT * 0.35);

        // Fluid curling turbulence in the sunset air
        displacement.x += sin(dt * 3.2 * aSpeed + aPhase) * 0.22 * normT;
        displacement.z += cos(dt * 2.8 * aSpeed + aPhase) * 0.18 * normT;

        pos = uBurstOrigin + displacement;
      }

      // High-frequency glitter sparkle
      float sparkle = sin(dt * 22.0 * aSpeed + aPhase) * 0.4 + 0.6;

      // Opacity envelope: snappy 80ms attack, sparkling sustain, smooth 1.4s tail
      float attack = smoothstep(0.0, 0.08, dt);
      float decay = smoothstep(1.0, 0.45, normT);
      vAlpha = attack * decay * sparkle * 0.95;

      // Radiant color progression: white-gold core (#FFF8E1) -> saturated solar gold (#F59E0B)
      vec3 coreColor = vec3(1.0, 0.96, 0.82);
      vec3 amberColor = vec3(0.96, 0.62, 0.04);
      vColor = mix(coreColor, amberColor, smoothstep(0.0, 0.75, normT));
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (155.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const BURST_FRAGMENT_SHADER = /* glsl */ `
  varying float vAlpha;
  varying float vType;
  varying vec3 vColor;

  void main() {
    // Soft radial circular particle falloff
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    // Dual-lobe Gaussian profile: intense glowing nucleus + soft atmospheric aura
    float nucleus = smoothstep(0.18, 0.0, dist) * 0.65;
    float aura = smoothstep(0.5, 0.0, dist) * 0.35;
    float alpha = (nucleus + aura) * vAlpha;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

// Default contact origin at String 0 (Low E), s = 53.0 su (14 su ahead of p = 0.52)
function getDefaultContactOrigin(): THREE.Vector3 {
  const worldPos = getStringWorldPosition(0, 53.0);
  return new THREE.Vector3(worldPos.x, worldPos.y, worldPos.z);
}

/**
 * Procedural pseudo-random generator with deterministic seed.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const BURST_COUNT = 250;
const AMBIENT_COUNT = 150;
const TOTAL_COUNT = BURST_COUNT + AMBIENT_COUNT;

export interface GoldDustBurstProps {
  burstDuration?: number;
}

/**
 * Gold Dust Burst & Ambient Sunset Particle System (Phase 6, §5.4, §6)
 *
 * Implements:
 * - 250-particle explosive radial burst triggered synchronously on String 0 contact (p = 0.52)
 * - 150-particle ambient golden atmospheric motes suspended along the neck highway
 * - Ballistic drag decelerating explosion into floating convective updraft
 * - Additive blending with distance-attenuated circular Gaussian nucleus & aura
 * - Graceful fallback for prefers-reduced-motion and adaptive mobile tiers
 */
export function GoldDustBurst({ burstDuration = 3.2 }: GoldDustBurstProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // Runtime burst state
  const burstStateRef = useRef({
    burstTime: -999.0,
    active: false,
    origin: getDefaultContactOrigin(),
  });

  const triggerBurstPending = useRef<THREE.Vector3 | null | false>(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      prefersReducedMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
  }, []);

  // Wire event listener for onRoseContact dispatch
  useEffect(() => {
    const handleBurst = (customOrigin?: THREE.Vector3) => {
      triggerBurstPending.current = customOrigin || null;
    };

    registerDustBurstHandler(handleBurst);
    return () => {
      unregisterDustBurstHandler();
    };
  }, []);

  // Geometry and custom attributes
  const { geometry, uniforms } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(TOTAL_COUNT * 3);
    const velocities = new Float32Array(TOTAL_COUNT * 3);
    const sizes = new Float32Array(TOTAL_COUNT);
    const speeds = new Float32Array(TOTAL_COUNT);
    const phases = new Float32Array(TOTAL_COUNT);
    const types = new Float32Array(TOTAL_COUNT);

    const defaultOrigin = getDefaultContactOrigin();

    for (let i = 0; i < TOTAL_COUNT; i++) {
      const isAmbient = i >= BURST_COUNT;
      const r1 = seededRandom(i * 7 + 1);
      const r2 = seededRandom(i * 7 + 2);
      const r3 = seededRandom(i * 7 + 3);
      const r4 = seededRandom(i * 7 + 4);
      const r5 = seededRandom(i * 7 + 5);
      const r6 = seededRandom(i * 7 + 6);
      const r7 = seededRandom(i * 7 + 7);

      if (isAmbient) {
        // Ambient motes spread across the neck runway (x: [-4, 4], y: [0.3, 4.0], z: [-20, -75])
        positions[i * 3 + 0] = (r1 - 0.5) * 8.0;
        positions[i * 3 + 1] = 0.3 + r2 * 3.7;
        positions[i * 3 + 2] = -20.0 - r3 * 55.0;

        velocities[i * 3 + 0] = 0;
        velocities[i * 3 + 1] = 0;
        velocities[i * 3 + 2] = 0;

        sizes[i] = 1.4 + r4 * 2.2;
        speeds[i] = 0.7 + r5 * 0.8;
        phases[i] = r6 * Math.PI * 2.0;
        types[i] = 1.0; // Ambient
      } else {
        // Burst particles: initial tight cluster around contact point
        positions[i * 3 + 0] = (r1 - 0.5) * 0.2;
        positions[i * 3 + 1] = (r2 - 0.5) * 0.15;
        positions[i * 3 + 2] = (r3 - 0.5) * 0.2;

        // Radial explosive velocity with strong upward convective lift
        const theta = r4 * Math.PI * 2.0; // Horizontal angle
        const phi = r5 * Math.PI * 0.5;   // Upward hemisphere angle
        const speed = 1.5 + r6 * 2.8;     // Speed: 1.5 to 4.3 su/s

        velocities[i * 3 + 0] = Math.cos(theta) * Math.sin(phi) * speed * 1.1; // Lateral
        velocities[i * 3 + 1] = Math.cos(phi) * speed * 1.35 + 0.8;             // Upward lift
        velocities[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * speed * 0.9; // Forward/backward

        sizes[i] = 1.8 + r7 * 3.4;
        speeds[i] = 0.8 + r1 * 1.2;
        phases[i] = r2 * Math.PI * 2.0;
        types[i] = 0.0; // Burst
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aVelocity", new THREE.BufferAttribute(velocities, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aType", new THREE.BufferAttribute(types, 1));

    const uni = {
      uTime: { value: 0 },
      uBurstTime: { value: -999.0 },
      uBurstDuration: { value: burstDuration },
      uBurstOrigin: { value: defaultOrigin },
      uBurstActive: { value: 0.0 },
      uReducedMotion: { value: 0.0 },
    };

    return { geometry: geo, uniforms: uni };
  }, [burstDuration]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: BURST_VERTEX_SHADER,
        fragmentShader: BURST_FRAGMENT_SHADER,
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

  // Per-frame uniform updates
  useFrame((state) => {
    if (matRef.current) {
      const u = matRef.current.uniforms;
      const t = state.clock.getElapsedTime();
      u.uTime.value = t;

      const bs = burstStateRef.current;

      // Check if burst trigger is pending
      if (triggerBurstPending.current !== false) {
        const origin = triggerBurstPending.current;
        triggerBurstPending.current = false;
        bs.burstTime = t;
        bs.active = true;
        if (origin) {
          bs.origin.copy(origin);
        } else {
          bs.origin.copy(getDefaultContactOrigin());
        }
      }

      // Burst activation & timing sync
      u.uBurstActive.value = bs.active ? 1.0 : 0.0;
      u.uBurstTime.value = bs.burstTime;
      u.uBurstOrigin.value.copy(bs.origin);
      u.uReducedMotion.value = prefersReducedMotion.current ? 1.0 : 0.0;

      // Deactivate burst when elapsed time exceeds duration
      if (bs.active && t - bs.burstTime > burstDuration + 0.2) {
        bs.active = false;
      }
    }
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      name="gold-dust-burst-particles"
      onUpdate={(self) => {
        matRef.current = self.material as THREE.ShaderMaterial;
      }}
    />
  );
}
