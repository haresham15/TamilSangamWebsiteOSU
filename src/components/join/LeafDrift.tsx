"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SUN_DIR } from "./env/sun";
import { createLeafAtlasTexture } from "./leafAtlas";

interface LeafDriftProps {
  count?: number;
  tier?: "A" | "B" | "C";
  reducedMotion?: boolean;
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// 1. Ohio Buckeye Leaves (90%): late summer greens to golden autumn hues
const BUCKEYE_COLORS = [
  new THREE.Color("#5E9B3A"), // Vibrant buckeye green
  new THREE.Color("#77A842"), // Warm meadow green
  new THREE.Color("#8DBF4A"), // Golden-green edge
  new THREE.Color("#C9B24A"), // Early autumn yellow-gold
  new THREE.Color("#B87A38"), // Warm bronze-amber
];

// 2. Jasmine Petals (10%): delicate white / cream malli poo
const JASMINE_COLORS = [
  new THREE.Color("#FAF6ED"),
  new THREE.Color("#F5EEDB"),
  new THREE.Color("#FFF8E7"),
];

const leafVertexShader = /* glsl */ `
uniform float uTime;
attribute vec3 aInitialPos;
attribute vec3 aDynamics; // x = speedY, y = speedX, z = rotSpeed
attribute float aPhase;
attribute float aScale;
attribute vec3 aColor;
attribute float aType; // 0.0 = buckeye, 1.0 = jasmine

varying vec3 vColor;
varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec2 vUv;
varying float vType;
varying float vFade;

void main() {
  vColor = aColor;
  vType = aType;
  
  // Tile UV: Buckeye leaf on left [0.0, 0.5], Jasmine petal on right [0.5, 1.0]
  vUv = vec2(uv.x * 0.5 + aType * 0.5, uv.y);

  vec3 localPos = position;

  // Aspect ratio adjustment per type
  if (aType > 0.5) {
    // Jasmine petal: slightly smaller, soft teardrop
    localPos *= vec3(aScale * 0.75, aScale * 1.1, aScale * 0.75);
  } else {
    // 5-leaflet Ohio buckeye leaf: broader palmate fan
    localPos *= vec3(aScale * 1.3, aScale * 1.4, aScale * 1.3);
  }

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
  vec3 worldNormal = normalize(mat3(modelMatrix) * (rot * normal));
  vWorldNormal = worldNormal;

  // Downward drift with wrap
  float totalHeight = 6.2;
  float yWorld = aInitialPos.y - mod(uTime * aDynamics.x, totalHeight);
  if (yWorld < 0.05) yWorld += totalHeight;

  float xWorld = aInitialPos.x + sin(uTime * 1.4 + aPhase) * aDynamics.y;
  float zWorld = aInitialPos.z + cos(uTime * 1.1 + aPhase) * 0.35;

  vec3 worldPos = localPos + vec3(xWorld, yWorld, zWorld);

  // Keep-Out Volume Fade (§5.3): X in [-3.8, 3.8], Y in [0, 5.5], Z in [-0.5, 3.75]
  float inX = smoothstep(4.4, 3.6, abs(worldPos.x));
  float inZ = smoothstep(-1.0, -0.4, worldPos.z) * smoothstep(4.2, 3.6, worldPos.z);
  float inY = smoothstep(0.0, 0.5, worldPos.y) * smoothstep(6.0, 5.4, worldPos.y);
  float keepOutMask = inX * inZ * inY;
  vFade = 1.0 - clamp(keepOutMask, 0.0, 1.0);

  vec4 viewPos = modelViewMatrix * vec4(worldPos, 1.0);
  vViewDir = -normalize(viewPos.xyz);

  gl_Position = projectionMatrix * viewPos;
}
`;

const leafFragmentShader = /* glsl */ `
uniform sampler2D uAtlas;
uniform vec3 uSunDir;

varying vec3 vColor;
varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec2 vUv;
varying float vType;
varying float vFade;

void main() {
  vec4 texColor = texture2D(uAtlas, vUv);
  if (texColor.a < 0.15) discard;

  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(vViewDir);
  vec3 L = normalize(uSunDir);

  // Two-sided normal handling for thin leaves
  if (!gl_FrontFacing) N = -N;

  // Direct sun diffuse
  float NdotL = max(dot(N, L), 0.0);

  // Thin-surface translucency / sub-surface forward scattering (§0 Item 7)
  // Glows brilliantly when backlit by morning sun
  float backScatter = pow(clamp(dot(-V, L), 0.0, 1.0), 3.0) * 0.75;
  
  // Wrap lighting for organic soft foliage
  float wrapLight = max(0.0, (dot(N, L) + 0.35) / 1.35);

  vec3 ambient = vec3(0.42, 0.44, 0.48); // Morning sky haze ambient
  vec3 sunLight = vec3(1.0, 0.94, 0.82) * (NdotL * 0.75 + wrapLight * 0.25);
  vec3 translucentGlow = vec3(1.0, 0.90, 0.65) * backScatter * (vType > 0.5 ? 0.95 : 1.2);

  vec3 finalColor = vColor * (ambient + sunLight) + translucentGlow;
  float alpha = texColor.a * vFade;

  if (alpha < 0.05) discard;

  gl_FragColor = vec4(finalColor, alpha);
}
`;

/**
 * LeafDrift (Phase 4: Leaves and Petals — §0 Items 7 & 8)
 *
 * Replaces generic paper confetti with:
 * - 90% Ohio buckeye leaves (palmate 5-leaflet shapes in late summer to autumn golds)
 * - 10% delicate white jasmine petals (malli poo)
 * - Cheap thin-surface backlight translucency patch (zero extra render pass)
 * - Automatic fade-out inside keep-out volume (§5.3)
 */
export function LeafDrift({
  count: propCount,
  tier = "A",
  reducedMotion = false,
}: LeafDriftProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Particle budget per tier (§0 & §6)
  const particleCount = useMemo(() => {
    if (reducedMotion || tier === "C") return 0;
    if (propCount !== undefined) return propCount;
    return tier === "A" ? 150 : 60;
  }, [propCount, tier, reducedMotion]);

  const atlasTexture = useMemo(() => createLeafAtlasTexture(), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAtlas: { value: atlasTexture },
      uSunDir: { value: SUN_DIR },
    }),
    [atlasTexture]
  );

  const geometry = useMemo(() => {
    if (particleCount <= 0) return null;

    const geo = new THREE.InstancedBufferGeometry();
    const plane = new THREE.PlaneGeometry(1, 1, 2, 2);
    geo.index = plane.index;
    geo.attributes.position = plane.attributes.position;
    geo.attributes.normal = plane.attributes.normal;
    geo.attributes.uv = plane.attributes.uv;

    const initialPos = new Float32Array(particleCount * 3);
    const dynamics = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);
    const scales = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const types = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Dispersed in front and around the collegiate gateway
      initialPos[i * 3 + 0] = (pseudoRandom(i * 5 + 1) - 0.5) * 16;
      initialPos[i * 3 + 1] = pseudoRandom(i * 5 + 2) * 5.8 + 0.2;
      initialPos[i * 3 + 2] = (pseudoRandom(i * 5 + 3) - 0.5) * 18 + 2;

      dynamics[i * 3 + 0] = 0.26 + pseudoRandom(i * 5 + 4) * 0.38; // speedY
      dynamics[i * 3 + 1] = 0.12 + pseudoRandom(i * 5 + 5) * 0.28; // speedX
      dynamics[i * 3 + 2] = 0.7 + pseudoRandom(i * 5 + 6) * 1.4;   // rotSpeed

      phases[i] = pseudoRandom(i * 5 + 7) * Math.PI * 2;
      scales[i] = 0.14 + pseudoRandom(i * 5 + 8) * 0.08;

      // 10% Jasmine petals, 90% Ohio buckeye leaves
      const isJasmine = pseudoRandom(i * 5 + 9) < 0.10;
      types[i] = isJasmine ? 1.0 : 0.0;

      const palette = isJasmine ? JASMINE_COLORS : BUCKEYE_COLORS;
      const col = palette[Math.floor(pseudoRandom(i * 5 + 10) * palette.length)];
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute("aInitialPos", new THREE.InstancedBufferAttribute(initialPos, 3));
    geo.setAttribute("aDynamics", new THREE.InstancedBufferAttribute(dynamics, 3));
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
    geo.setAttribute("aScale", new THREE.InstancedBufferAttribute(scales, 1));
    geo.setAttribute("aColor", new THREE.InstancedBufferAttribute(colors, 3));
    geo.setAttribute("aType", new THREE.InstancedBufferAttribute(types, 1));

    return geo;
  }, [particleCount]);

  useEffect(() => {
    return () => {
      geometry?.dispose();
      atlasTexture?.dispose();
    };
  }, [geometry, atlasTexture]);

  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (!reducedMotion && matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  if (particleCount <= 0 || !geometry || !atlasTexture) {
    return null;
  }

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={leafVertexShader}
        fragmentShader={leafFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
