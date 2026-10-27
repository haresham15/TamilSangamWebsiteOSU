"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { FIREBALLS, evaluateFireball, PORTRAIT_STANDOFF_SCALE } from "./gamesRail";

interface MissilePyroSystemProps {
  scrollP: number;
  portrait?: boolean;
}

const FX_COLORS = {
  head: new THREE.Color("#FFF6B0"),
  debris: new THREE.Color("#1E1A16"),
  dustSun: new THREE.Color("#E8CA7E"),
  dustShadow: new THREE.Color("#B8964E"),
};

const LAUNCHES = [0.540, 0.550, 0.560];
const PATHS = [
  [[-0.01, 0.07], [0.10, 0.19], [0.20, 0.325], [0.30, 0.47], [0.376, 0.585], [0.425, 0.70]],
  [[-0.01, 0.415], [0.108, 0.483], [0.215, 0.56], [0.323, 0.648], [0.403, 0.693], [0.508, 0.70]],
  [[1.02, -0.10], [0.806, 0.273], [0.753, 0.368], [0.699, 0.438], [0.645, 0.508], [0.608, 0.572], [0.591, 0.70]],
];

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vLocalPos;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vLocalPos = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

/**
 * Core Contrail Spline Ribbon Shader
 */
const contrailRibbonShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uProgress;

  void main() {
    if (vUv.x > uProgress) discard;
    float curl = sin(vUv.x * 183.0) * sin(vUv.x * 51.0) * 0.12;
    float edge = 1.0 - smoothstep(0.25, 0.5, abs(vUv.y - 0.5 + curl));
    float head = smoothstep(0.0, 0.012, uProgress - vUv.x);
    vec3 col = mix(vec3(0.68, 0.72, 0.75), vec3(0.98, 0.98, 0.96), vUv.y);
    col = mix(col, vec3(0.95, 0.88, 0.76), smoothstep(0.72, 1.0, vUv.x) * 0.35);
    gl_FragColor = vec4(col, edge * head * 0.85);
  }
`;

/**
 * Billowing Cumulus Rocket Contrail Puff Shader (Helical billow + FBM edge erosion)
 */
const contrailPuffShader = /* glsl */ `
  uniform float uProgress;
  uniform float uSeed;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash2(i), hash2(i + vec2(1,0)), f.x),
               mix(hash2(i + vec2(0,1)), hash2(i + vec2(1,1)), f.x), f.y);
  }

  float fbm2(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * noise2(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float noiseEdge = fbm2(vUv * 5.0 + uSeed);
    float edge = smoothstep(0.95, 0.25, r + (noiseEdge - 0.5) * 0.55);
    if (edge < 0.01) discard;

    vec3 sunlit = vec3(0.98, 0.97, 0.95); // Crisp sunlit white #FAF8F2
    vec3 midtone = vec3(0.78, 0.82, 0.84); // Cloud grey #C8D2D6
    vec3 coolBounce = vec3(0.48, 0.56, 0.60); // Cool slate #7C9099
    vec3 fireBounce = vec3(0.91, 0.54, 0.27); // Fireball bounce #E88A45

    float sunGrad = clamp((vUv.x - 0.2) * 0.5 + (1.0 - vUv.y) * 0.5, 0.0, 1.0);
    vec3 col = mix(midtone, sunlit, sunGrad);

    float impactProximity = smoothstep(-15.0, -28.0, vWorldPos.z);
    vec3 shadowCol = mix(coolBounce, fireBounce, impactProximity * 0.55);
    col = mix(shadowCol, col, smoothstep(0.1, 0.6, sunGrad));

    gl_FragColor = vec4(col, edge * 0.88);
  }
`;

/**
 * Domain-Warped Multi-Octave Volumetric Napalm & Soot Plume Shader
 * Matches image_60b8d8.jpg practical pyrotechnics: boiling napalm + black soot curls
 */
const practicalPyroShader = /* glsl */ `
  uniform float uAge;
  uniform float uBrightness;
  uniform float uSoot;
  uniform float uSeed;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vLocalPos;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  float fbm3(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * noise3(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // 2-stage FBM Domain Warping for realistic boiling napalm & soot curls
    vec3 pWarp = vec3((vUv - 0.5) * 2.5, vLocalPos.z) * 1.65 - vec3(0.0, uAge * 2.4, 0.0) + vec3(uSeed, 0.0, 0.0);
    vec3 q = vec3(
      fbm3(pWarp + vec3(0.0, 0.0, 0.0)),
      fbm3(pWarp + vec3(5.2, 1.3, 2.8)),
      fbm3(pWarp + vec3(1.7, 9.2, 4.1))
    );
    float turb = fbm3(pWarp + 2.4 * q);

    // Radial + vertical plume density with shredded high-frequency edge erosion
    float radialDist = length(vUv - 0.5) * 2.0;
    float plumeShape = smoothstep(1.0, 0.18, radialDist + (turb - 0.5) * 0.65);
    if (plumeShape < 0.01) discard;

    // Temperature field: white-hot core at base -> rolling black/ochre soot at top
    float heightFactor = clamp((vWorldPos.y - 1.0) / 7.5, 0.0, 1.0);
    float temp = clamp(plumeShape * (1.15 - heightFactor * 0.55) + (turb - 0.45) * 0.5, 0.0, 1.0);

    // Beer-Lambert directional sun self-shadowing on smoke/soot outer shell
    vec3 sunDir = normalize(vec3(12.0, 24.0, 14.0));
    float sunShadow = clamp(0.35 + 0.65 * dot(normalize(vec3(0.0, 0.0, 1.0) + (q - 0.5) * 0.8), sunDir), 0.2, 1.0);

    // Physically inspired practical-pyro color ramp (matching image_60b8d8.jpg)
    vec3 sootColor = mix(vec3(0.14, 0.11, 0.09), vec3(0.58, 0.52, 0.44), sunShadow);
    vec3 crimsonFire = vec3(0.75, 0.12, 0.01);
    vec3 orangeFire  = vec3(1.00, 0.48, 0.04);
    vec3 whiteCore   = vec3(1.00, 0.96, 0.78) * (2.2 + uBrightness * 2.5);

    vec3 col = sootColor;
    col = mix(col, crimsonFire, smoothstep(0.22, 0.42, temp));
    col = mix(col, orangeFire,  smoothstep(0.42, 0.68, temp));
    col = mix(col, whiteCore,   smoothstep(0.68, 0.92, temp));

    float alpha = clamp(plumeShape * (0.85 + uBrightness * 0.35), 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

/**
 * Dual-Layer Volumetric Contrail (Core Ribbon + 140 Billowing Puff Cards)
 */
function DualLayerContrail({
  index,
  scrollP,
  portrait,
}: {
  index: number;
  scrollP: number;
  portrait: boolean;
}) {
  const head = useRef<THREE.Mesh>(null);
  const puffsMesh = useRef<THREE.InstancedMesh>(null);

  const { curve, ribbonGeometry, ribbonUniforms, puffUniforms } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(PATHS[index].map(([u, v]) => new THREE.Vector3(u, v, 0)));
    const ribbonGeometry = new THREE.BufferGeometry();
    ribbonGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(65 * 6), 3));
    const uv = new Float32Array(65 * 4);
    const triangles: number[] = [];
    for (let i = 0; i <= 64; i++) {
      uv.set([i / 64, 0, i / 64, 1], i * 4);
      if (i < 64) triangles.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    ribbonGeometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    ribbonGeometry.setIndex(triangles);

    const ribbonUniforms = { uProgress: { value: 0 } };
    const puffUniforms = { uProgress: ribbonUniforms.uProgress, uSeed: { value: index * 41.7 } };
    return { curve, ribbonGeometry, ribbonUniforms, puffUniforms };
  }, [index]);

  useEffect(() => () => ribbonGeometry.dispose(), [ribbonGeometry]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const point = useMemo(() => new THREE.Vector3(), []);
  const next = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const q = Math.pow(THREE.MathUtils.clamp((scrollP - LAUNCHES[index]) / (FIREBALLS[index].hit - LAUNCHES[index]), 0, 1), 1.3);
    ribbonUniforms.uProgress.value = q;

    const positions = ribbonGeometry.getAttribute("position");
    const k = portrait ? PORTRAIT_STANDOFF_SCALE : 1;
    const project = (t: number, out: THREE.Vector3) => {
      curve.getPointAt(t, out);
      const depth = THREE.MathUtils.lerp(index === 2 ? 12 : 14, 37, t * t * (3 - 2 * t));
      out.set(
        0.43 + ((2 * out.x - 1) * depth * 0.7307 - 0.43) * k,
        1.65 + (1 - 2 * out.y + 0.35) * depth * Math.tan((17 * Math.PI) / 180),
        6 - depth
      );
      return depth;
    };

    // 1. Update Core Spline Ribbon
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      const depth = project(t, point);
      project(Math.min(1, t + 0.001), next);
      const dx = next.x - point.x;
      const dy = next.y - point.y;
      const len = Math.hypot(dx, dy) || 1;
      const age = Math.max(0, scrollP - LAUNCHES[index] - t * (FIREBALLS[index].hit - LAUNCHES[index]));
      const width = (0.015 + 0.028 * Math.min(age / 0.1, 1)) * depth * Math.tan((17 * Math.PI) / 180);
      positions.setXYZ(i * 2, point.x - (dy / len) * width, point.y + (dx / len) * width, point.z);
      positions.setXYZ(i * 2 + 1, point.x + (dy / len) * width, point.y - (dx / len) * width, point.z);
    }
    positions.needsUpdate = true;

    // 2. Update 140 Billowing Puff Cards along Helical Corkscrew
    if (puffsMesh.current) {
      const numPuffs = 140;
      for (let i = 0; i < numPuffs; i++) {
        const t = (i / numPuffs) * q;
        const depth = project(t, point);
        const age = Math.max(0, scrollP - LAUNCHES[index] - t * (FIREBALLS[index].hit - LAUNCHES[index]));

        const spiralAngle = i * 0.48 + index * 2.1;
        const corkscrewRadius = (0.06 + 0.38 * Math.min(1.0, age * 12.0)) * (depth / 30.0);
        const offsetX = Math.cos(spiralAngle) * corkscrewRadius;
        const offsetY = Math.sin(spiralAngle) * corkscrewRadius;

        dummy.position.set(point.x + offsetX, point.y + offsetY, point.z);
        dummy.quaternion.copy(camera.quaternion);

        const puffSize = (0.22 + 0.75 * Math.min(1.0, age * 12.0)) * (depth / 28.0);
        dummy.scale.set(puffSize, puffSize, puffSize);
        dummy.updateMatrix();
        puffsMesh.current.setMatrixAt(i, dummy.matrix);
      }
      puffsMesh.current.instanceMatrix.needsUpdate = true;
      puffsMesh.current.visible = scrollP >= LAUNCHES[index];
    }

    if (head.current) {
      project(q, head.current.position);
      head.current.visible = scrollP >= LAUNCHES[index] && scrollP < FIREBALLS[index].hit;
    }
  });

  return (
    <group>
      {/* Core Spline Ribbon */}
      <mesh geometry={ribbonGeometry} frustumCulled={false}>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={contrailRibbonShader}
          uniforms={ribbonUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 140 Billowing Camera-Facing Puff Cards */}
      <instancedMesh ref={puffsMesh} args={[undefined, undefined, 140]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={contrailPuffShader}
          uniforms={puffUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
      <mesh ref={head} visible={false}>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshBasicMaterial color={FX_COLORS.head} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * Instanced Volumetric Fireball Plume Cluster:
 * 22 depth-sorted camera-facing billboard quads per blast with domain-warped napalm & soot shader
 */
function PracticalFireballCluster({
  index,
  scrollP,
  portrait,
}: {
  index: number;
  scrollP: number;
  portrait: boolean;
}) {
  const clusterMesh = useRef<THREE.InstancedMesh>(null);
  const coreFlame = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uAge: { value: 0 },
      uBrightness: { value: 0 },
      uSoot: { value: 0 },
      uSeed: { value: index * 23.7 },
    }),
    [index]
  );

  const clusterOffsets = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const phi = (i / 22) * Math.PI * 2 * 3.0;
        const r = Math.pow(i / 21, 0.65);
        const y = Math.pow(i / 21, 0.85) * 1.8;
        return {
          dx: Math.cos(phi) * r * 0.9,
          dy: y,
          dz: Math.sin(phi) * r * 0.5,
          scale: 0.65 + (1.0 - r * 0.3) * 0.6,
        };
      }),
    []
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ camera }) => {
    const fx = evaluateFireball(scrollP, index);
    const baseX = 0.43 + (FIREBALLS[index].x - 0.43) * (portrait ? PORTRAIT_STANDOFF_SCALE : 1);
    const isVisible = scrollP > FIREBALLS[index].hit;

    uniforms.uAge.value = fx.age;
    uniforms.uBrightness.value = fx.brightness;
    uniforms.uSoot.value = fx.soot;

    if (clusterMesh.current) {
      clusterMesh.current.visible = isVisible;
      if (isVisible) {
        clusterOffsets.forEach((offset, i) => {
          dummy.position.set(
            baseX + offset.dx * fx.radius * 0.8,
            fx.height + offset.dy * fx.radius * 0.9,
            -31 + offset.dz * fx.radius * 0.8
          );
          dummy.quaternion.copy(camera.quaternion);
          const s = fx.radius * offset.scale * 1.8;
          dummy.scale.set(s, s * 1.1, s);
          dummy.updateMatrix();
          clusterMesh.current?.setMatrixAt(i, dummy.matrix);
        });
        clusterMesh.current.instanceMatrix.needsUpdate = true;
      }
    }

    if (coreFlame.current) {
      coreFlame.current.visible = isVisible;
      if (isVisible) {
        coreFlame.current.position.set(baseX, fx.height, -30.8);
        coreFlame.current.quaternion.copy(camera.quaternion);
        coreFlame.current.scale.setScalar(fx.radius * 2.8);
      }
    }
  });

  return (
    <group>
      {/* 22 Depth-Sorted Billow Impostor Quads */}
      <instancedMesh ref={clusterMesh} args={[undefined, undefined, 22]} frustumCulled={false} renderOrder={index + 2}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={practicalPyroShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
      {/* White-Hot HDR Emissive Core for Bloom */}
      <mesh ref={coreFlame} visible={false} renderOrder={index + 3}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={practicalPyroShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function MissilePyroSystem({ scrollP, portrait = false }: MissilePyroSystemProps) {
  const debris = useRef<THREE.InstancedMesh>(null);
  const smokeCrown = useRef<THREE.Mesh>(null);
  const groundShockwave = useRef<THREE.InstancedMesh>(null);

  // 45 dark tumbling shrapnel fragments above Blast 2 (Centre SUV)
  const shrapnelData = useMemo(
    () =>
      Array.from({ length: 45 }, (_, i) => {
        const a = ((i * 137.5) % 360) * (Math.PI / 180);
        const r = 0.3 + (i / 45) * 0.7;
        return {
          vx: Math.cos(a) * r * 4.8,
          vz: Math.sin(a) * r * 3.5,
          vy: 8.5 + (i % 7) * 1.4,
          spinX: 6 + (i % 5) * 2,
          spinY: 8 + (i % 4) * 3,
          scaleX: 0.12 + (i % 3) * 0.15,
          scaleY: 0.04 + (i % 2) * 0.04,
          scaleZ: 0.22 + (i % 4) * 0.18,
        };
      }),
    []
  );

  // 28 low-lying 3D advected ground dust puffs hugging y = 0.0..1.5 m
  const shockwaveData = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const angle = (i / 28) * Math.PI * 2;
        return {
          cosA: Math.cos(angle),
          sinA: Math.sin(angle),
          jitterY: (i % 3) * 0.25,
          scaleMult: 0.8 + (i % 5) * 0.2,
        };
      }),
    []
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ camera }) => {
    const centreBlast = FIREBALLS[1];
    const tShrapnel = Math.max(0, 10.5 * (scrollP - centreBlast.hit));
    const k = portrait ? PORTRAIT_STANDOFF_SCALE : 1;
    const centreX = 0.43 + (centreBlast.x - 0.43) * k;

    // 1. High-Altitude Shrapnel above Blast 2 (u ≈ 0.49..0.53, v ≈ 0.40..0.49)
    if (debris.current) {
      debris.current.visible = tShrapnel > 0;
      if (tShrapnel > 0) {
        shrapnelData.forEach((item, i) => {
          dummy.position.set(
            centreX + item.vx * tShrapnel,
            Math.max(0.1, 2.2 + item.vy * tShrapnel - 5.5 * tShrapnel * tShrapnel),
            -31 + item.vz * tShrapnel
          );
          dummy.rotation.set(item.spinX * tShrapnel, item.spinY * tShrapnel, item.spinX * 0.5 * tShrapnel);
          dummy.scale.set(item.scaleX, item.scaleY, item.scaleZ);
          dummy.updateMatrix();
          debris.current?.setMatrixAt(i, dummy.matrix);
        });
        debris.current.instanceMatrix.needsUpdate = true;
      }
    }

    // 2. Rising Translucent Grey-White Smoke Crown above Blast 2 (y = 4.5 m to 7.8 m)
    if (smokeCrown.current) {
      const crownAge = Math.max(0, (scrollP - centreBlast.hit) / 0.2);
      smokeCrown.current.visible = crownAge > 0;
      if (crownAge > 0) {
        smokeCrown.current.position.set(centreX, 4.5 + crownAge * 3.3, -31.2);
        smokeCrown.current.scale.set(2.4 + crownAge * 4.2, 1.8 + crownAge * 3.0, 1);
        smokeCrown.current.quaternion.copy(camera.quaternion);
      }
    }

    // 3. 3D Advected Ground Sand-Dust Wave from z = -31 m forward to z = +4 m
    const qShock = THREE.MathUtils.clamp((scrollP - 0.642) / 0.208, 0, 1);
    const shockRadius = 38 * Math.pow(qShock, 0.82);

    if (groundShockwave.current) {
      groundShockwave.current.visible = qShock > 0;
      if (qShock > 0) {
        shockwaveData.forEach((item, i) => {
          dummy.position.set(
            centreX + item.cosA * shockRadius * 0.9,
            0.35 + item.jitterY + qShock * 0.6,
            -31 + item.sinA * shockRadius
          );
          dummy.quaternion.copy(camera.quaternion);
          const s = (0.9 + qShock * 2.4) * item.scaleMult;
          dummy.scale.set(s * 1.6, s * 0.75, s);
          dummy.updateMatrix();
          groundShockwave.current?.setMatrixAt(i, dummy.matrix);
        });
        groundShockwave.current.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group name="MissilePyroSystemGroup">
      {/* 3 Calibrated Volumetric Missile Contrails & Fireball Clusters */}
      {FIREBALLS.map((_, index) => (
        <group key={`trail-${index}`}>
          <DualLayerContrail index={index} scrollP={scrollP} portrait={portrait} />
          <PracticalFireballCluster index={index} scrollP={scrollP} portrait={portrait} />
        </group>
      ))}

      {/* High-Altitude Smoke Crown above Nose Bridge (y = 4.5 to 7.8 m) */}
      <mesh ref={smokeCrown} visible={false} renderOrder={10}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#D8E0E4"
          transparent
          opacity={0.32}
          depthWrite={false}
          blending={THREE.NormalBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 45 Sharp Tumbling Shrapnel Fragments */}
      <instancedMesh ref={debris} args={[undefined, undefined, 45]} frustumCulled={false} visible={false}>
        <boxGeometry />
        <meshStandardMaterial color={FX_COLORS.debris} roughness={0.92} metalness={0.75} />
      </instancedMesh>

      {/* 28 3D Advected Sand-Dust Ground Shockwave Billows */}
      <instancedMesh ref={groundShockwave} args={[undefined, undefined, 28]} frustumCulled={false} visible={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color={FX_COLORS.dustSun} transparent opacity={0.22} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}
