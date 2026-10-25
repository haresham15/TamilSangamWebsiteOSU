"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { heroState } from "./state";

/**
 * LAYER 1: RATHNAVELU 35MM GOLDEN-HOUR TWILIGHT DOME & BOKEH LIGHT FIELD
 * 
 * Inspired by Rathnavelu's 35mm cinematography in Vaaranam Aayiram (Nenjukkul Peithidum).
 * 1. Coastal Sunset & Twilight Gradient Dome:
 *    - Zenith (y = 1.0): Deep Midnight Indigo (#0B0E1A)
 *    - Upper Mid (y = 0.65): Warm Twilight Plum (#1F1528)
 *    - Lower Mid (y = 0.35): Burnt Terracotta Sienna (#6E2A1E)
 *    - Horizon Glow (y = 0.0 - 0.22): Radiant Golden-Hour Amber (#E8923E -> #FFB85C bloom at [-2.5, 1.2, -12.0])
 *    - Procedural 35mm film grain hash to guarantee zero color banding on OLED/HDR displays.
 * 2. Out-of-Focus 35mm Cinema Bokeh Field (90 Orbs):
 *    - Custom ShaderMaterial with authentic camera aperture bokeh disc + optical spherical aberration ring.
 *    - 60% Warm Tungsten Amber (#FFB84D), 25% Sunset Coral (#E86F52), 15% Anamorphic Cyan-Teal (#55B8B0).
 *    - Sinusoidal lateral & vertical drift with sympathetic Easter Egg reverie shimmer.
 */

const TwilightSkyShader = {
  uniforms: {
    uTime: { value: 0.0 },
    uReverieGlow: { value: 0.0 },
    uSunPos: { value: new THREE.Vector3(-2.5, 1.2, -12.0).normalize() },
    uZenith: { value: new THREE.Color("#0B0E1A") },
    uUpperMid: { value: new THREE.Color("#1F1528") },
    uLowerMid: { value: new THREE.Color("#6E2A1E") },
    uHorizonAmber: { value: new THREE.Color("#E8923E") },
    uSunBloom: { value: new THREE.Color("#FFB85C") },
    uGroundObsidian: { value: new THREE.Color("#0E0A0C") },
  },
  vertexShader: `
    varying vec3 vWorldDir;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldDir = normalize(worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uReverieGlow;
    uniform vec3 uSunPos;
    uniform vec3 uZenith;
    uniform vec3 uUpperMid;
    uniform vec3 uLowerMid;
    uniform vec3 uHorizonAmber;
    uniform vec3 uSunBloom;
    uniform vec3 uGroundObsidian;
    varying vec3 vWorldDir;
    varying vec2 vUv;

    // Subtle 35mm film grain to prevent 8-bit banding
    float grainHash(vec2 p, float t) {
      return fract(sin(dot(p, vec2(12.9898, 78.233)) + fract(t * 0.15)) * 43758.5453);
    }

    void main() {
      vec3 dir = vWorldDir;
      float y = dir.y; // -1.0 to 1.0

      vec3 sky;
      if (y >= 0.0) {
        // Upper hemisphere 4-stop gradient
        if (y < 0.22) {
          float t = smoothstep(0.0, 0.22, y);
          sky = mix(uHorizonAmber, uLowerMid, t);
        } else if (y < 0.65) {
          float t = smoothstep(0.22, 0.65, y);
          sky = mix(uLowerMid, uUpperMid, t);
        } else {
          float t = smoothstep(0.65, 1.0, y);
          sky = mix(uUpperMid, uZenith, t);
        }
      } else {
        // Lower ground fade
        float t = smoothstep(0.0, -0.45, y);
        sky = mix(uHorizonAmber * 0.6, uGroundObsidian, t);
      }

      // Soft directional golden-hour sun bloom
      float sunDot = max(0.0, dot(dir, uSunPos));
      float sunGlow = pow(sunDot, 18.0) * 0.65 + pow(sunDot, 6.0) * 0.25;
      sky += uSunBloom * sunGlow;

      // Vaaranam Aayiram Easter Egg golden reverie swell
      vec3 reverieWarmth = vec3(1.0, 0.76, 0.38);
      sky = mix(sky, sky * 1.35 + reverieWarmth * 0.30, uReverieGlow);

      // 35mm film grain (0.018 amplitude)
      float grain = (grainHash(vUv * 650.0, uTime) - 0.5) * 0.018;
      sky += vec3(grain);

      gl_FragColor = vec4(sky, 1.0);
    }
  `,
};

// 35mm Camera Aperture Bokeh Disc Shader Material
const BokehDiscShader = {
  uniforms: {
    uTime: { value: 0.0 },
    uReverie: { value: 0.0 },
  },
  vertexShader: `
    attribute float aSize;
    attribute vec3 aColor;
    attribute float aPhase;
    attribute float aSpeed;
    uniform float uTime;
    uniform float uReverie;
    varying vec3 vColor;
    varying float vOpacity;

    void main() {
      vColor = aColor;

      // Gentle vertical & lateral harmonic drift
      vec3 pos = position;
      pos.y += sin(uTime * aSpeed + aPhase) * 0.45;
      pos.x += cos(uTime * (aSpeed * 0.8) + aPhase) * 0.35;

      // Subtle pulse and Easter egg bloom
      float pulse = 0.85 + 0.15 * sin(uTime * 1.8 + aPhase);
      float reverieBoost = 1.0 + uReverie * 0.45;
      vOpacity = pulse * (0.38 + uReverie * 0.42);

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = (aSize * pulse * reverieBoost) * (260.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uReverie;
    varying vec3 vColor;
    varying float vOpacity;

    void main() {
      // Point coord is (0,0) to (1,1)
      vec2 coord = gl_PointCoord - vec2(0.5);
      float r = length(coord) * 2.0;
      if (r > 1.0) discard;

      // Soft inner disc + brighter spherical aberration outer ring (r = 0.78..0.96)
      float disc = smoothstep(1.0, 0.78, r);
      float ring = smoothstep(0.68, 0.88, r) * smoothstep(1.0, 0.88, r) * 0.75;
      float alpha = (disc * 0.60 + ring) * vOpacity;

      vec3 col = vColor;
      if (uReverie > 0.01) {
        col = mix(col, vec3(1.0, 0.88, 0.55), uReverie * 0.4);
      }

      gl_FragColor = vec4(col, alpha);
    }
  `,
};

export function SunsetSkyDome() {
  const skyMatRef = useRef<THREE.ShaderMaterial>(null);
  const bokehMatRef = useRef<THREE.ShaderMaterial>(null);
  const bokehGroupRef = useRef<THREE.Points>(null);

  // Inverted sphere dome geometry
  const domeGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(220, 32, 24);
    geo.scale(-1, 1, 1);
    return geo;
  }, []);

  // 90 Out-of-Focus 35mm Cinema Bokeh Orbs
  const bokehGeo = useMemo(() => {
    const count = 90;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);

    // Deterministic PRNG for pure hook execution
    const prng = (s: number) => {
      const v = Math.sin(s * 12.9898 + 78.233) * 43758.5453;
      return v - Math.floor(v);
    };

    // Color swatches: 60% Amber, 25% Coral, 15% Teal
    const amber = new THREE.Color("#FFB84D");
    const coral = new THREE.Color("#E86F52");
    const teal = new THREE.Color("#55B8B0");

    for (let i = 0; i < count; i++) {
      // Scatter in Z-space between z = -3.0 and z = -22.0
      const spreadX = (prng(i * 5 + 1) - 0.5) * 28.0;
      const spreadY = -1.5 + prng(i * 5 + 2) * 14.0;
      const spreadZ = -3.0 - prng(i * 5 + 3) * 19.0;

      positions[i * 3 + 0] = spreadX;
      positions[i * 3 + 1] = spreadY;
      positions[i * 3 + 2] = spreadZ;

      sizes[i] = 1.4 + prng(i * 5 + 4) * 2.8;
      phases[i] = prng(i * 7 + 1) * Math.PI * 2.0;
      speeds[i] = 0.25 + prng(i * 7 + 2) * 0.45;

      // Color selection
      const colorRoll = prng(i * 7 + 3);
      let chosenColor = amber;
      if (colorRoll > 0.85) {
        chosenColor = teal;
      } else if (colorRoll > 0.60) {
        chosenColor = coral;
      }

      colors[i * 3 + 0] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    return geo;
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    const targetReverie = heroState.easterEggActive ? 1.0 : 0.0;

    if (skyMatRef.current) {
      skyMatRef.current.uniforms.uTime.value = t;
      skyMatRef.current.uniforms.uReverieGlow.value = THREE.MathUtils.damp(
        skyMatRef.current.uniforms.uReverieGlow.value,
        targetReverie,
        3.5,
        dt
      );
    }

    if (bokehMatRef.current) {
      bokehMatRef.current.uniforms.uTime.value = t;
      bokehMatRef.current.uniforms.uReverie.value = THREE.MathUtils.damp(
        bokehMatRef.current.uniforms.uReverie.value,
        targetReverie,
        4.0,
        dt
      );
    }

    if (bokehGroupRef.current) {
      // Subtle ambient orbital drift
      bokehGroupRef.current.rotation.y = Math.sin(t * 0.04) * 0.03;
    }
  });

  return (
    <group name="rathnavelu-twilight-sky">
      {/* 1. Filmic Coastal Sunset Sky Dome */}
      <mesh geometry={domeGeo} position={[0, 0, 0]}>
        <shaderMaterial
          ref={skyMatRef}
          args={[TwilightSkyShader]}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2. 90 Out-of-Focus Cinema Aperture Bokeh Orbs */}
      <points ref={bokehGroupRef} geometry={bokehGeo}>
        <shaderMaterial
          ref={bokehMatRef}
          args={[BokehDiscShader]}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default SunsetSkyDome;
