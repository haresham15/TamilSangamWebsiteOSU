"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { heroState } from "./state";

// Custom atmospheric twilight shader for the Vaaranam Aayiram coastal horizon
const SkyShader = {
  uniforms: {
    uColorZenith: { value: new THREE.Color("#120D18") }, // Deep Twilight Indigo
    uColorMid: { value: new THREE.Color("#6E2E26") },    // Warm Terracotta Rose
    uColorHorizon: { value: new THREE.Color("#E8984A") },// Golden-Hour Amber
    uColorGround: { value: new THREE.Color("#14100E") }, // Deep Warm Obsidian
    uReverieGlow: { value: 0.0 },
    uTime: { value: 0.0 },
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorZenith;
    uniform vec3 uColorMid;
    uniform vec3 uColorHorizon;
    uniform vec3 uColorGround;
    uniform float uReverieGlow;
    uniform float uTime;
    varying vec3 vWorldPosition;

    void main() {
      vec3 dir = normalize(vWorldPosition);
      float y = dir.y; // -1 to 1

      vec3 skyColor;
      if (y > 0.0) {
        // Sky hemisphere: Horizon -> Mid -> Zenith
        float tMid = smoothstep(0.0, 0.35, y);
        float tZenith = smoothstep(0.35, 0.95, y);
        vec3 lower = mix(uColorHorizon, uColorMid, tMid);
        skyColor = mix(lower, uColorZenith, tZenith);
      } else {
        // Ground hemisphere: Horizon -> Ground
        float tGround = smoothstep(0.0, -0.4, y);
        skyColor = mix(uColorHorizon, uColorGround, tGround);
      }

      // Subtle horizontal coastal haze shimmer
      float haze = sin(dir.x * 4.0 + uTime * 0.25) * 0.03 * exp(-abs(y) * 8.0);
      skyColor += vec3(0.08, 0.04, 0.01) * haze;

      // Golden-Hour Reverie Easter Egg bloom
      vec3 reverieWarmth = vec3(0.95, 0.65, 0.25);
      skyColor = mix(skyColor, skyColor * 1.3 + reverieWarmth * 0.25, uReverieGlow);

      gl_FragColor = vec4(skyColor, 1.0);
    }
  `,
};

export function SunsetSkyDome() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const bokehRef = useRef<THREE.Points>(null);

  // Memoized dome geometry (inward facing sphere)
  const domeGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(180, 32, 24);
    geo.scale(-1, 1, 1); // Invert normals so interior is visible
    return geo;
  }, []);

  // Procedural soft circular bokeh texture for points
  const bokehTexture = useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, "rgba(255, 220, 150, 1.0)");
      grad.addColorStop(0.35, "rgba(235, 145, 65, 0.65)");
      grad.addColorStop(0.7, "rgba(180, 75, 45, 0.2)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Floating horizon bokeh orbs (THREE.Points)
  const [bokehGeo, bokehMat] = useMemo(() => {
    const count = 90;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    // Pure deterministic pseudo-random generator to satisfy react-hooks/purity
    const prng = (s: number) => {
      const v = Math.sin(s * 12.9898 + 78.233) * 43758.5453;
      return v - Math.floor(v);
    };

    for (let i = 0; i < count; i++) {
      // Distribute in a wide arc behind the bridge along the coastal horizon
      const angle = (prng(i * 3 + 1) - 0.5) * Math.PI * 0.95;
      const radius = 60 + prng(i * 3 + 2) * 50;
      positions[i * 3 + 0] = Math.sin(angle) * radius;
      positions[i * 3 + 1] = -2.0 + prng(i * 3 + 3) * 16.0; // Near horizon line
      positions[i * 3 + 2] = -Math.cos(angle) * radius - 20;

      scales[i] = 2.0 + prng(i * 5 + 4) * 4.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

    const mat = new THREE.PointsMaterial({
      size: 3.5,
      map: bokehTexture,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: "#FFB066",
    });

    return [geo, mat];
  }, [bokehTexture]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
      // Animate reverie glow
      const targetGlow = heroState.easterEggActive ? 1.0 : 0.0;
      materialRef.current.uniforms.uReverieGlow.value = THREE.MathUtils.damp(
        materialRef.current.uniforms.uReverieGlow.value,
        targetGlow,
        3.5,
        dt
      );
    }

    if (bokehRef.current) {
      bokehRef.current.rotation.y = Math.sin(t * 0.03) * 0.04;
      bokehMat.opacity = heroState.easterEggActive
        ? THREE.MathUtils.damp(bokehMat.opacity, 0.75, 4.0, dt)
        : THREE.MathUtils.damp(bokehMat.opacity, 0.42, 2.0, dt);
    }
  });

  return (
    <group name="sunset-skydome">
      <mesh geometry={domeGeo} position={[0, 0, -40]}>
        <shaderMaterial
          ref={materialRef}
          args={[SkyShader]}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <points ref={bokehRef} geometry={bokehGeo} material={bokehMat} />
    </group>
  );
}
