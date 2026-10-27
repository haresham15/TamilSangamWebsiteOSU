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
  debris: new THREE.Color("#2A2420"),
  dust: new THREE.Color("#E5C478"),
};
const LAUNCHES = [0.540, 0.550, 0.560];
const PATHS = [
  [[-0.01, 0.07], [0.10, 0.19], [0.20, 0.325], [0.30, 0.47], [0.376, 0.585], [0.425, 0.70]],
  [[-0.01, 0.415], [0.108, 0.483], [0.215, 0.56], [0.323, 0.648], [0.403, 0.693], [0.508, 0.70]],
  [[1.02, -0.10], [0.806, 0.273], [0.753, 0.368], [0.699, 0.438], [0.645, 0.508], [0.608, 0.572], [0.591, 0.70]],
];
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const contrailShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uProgress;
  void main() {
    if (vUv.x > uProgress) discard;
    float curl = sin(vUv.x * 183.0) * sin(vUv.x * 51.0) * 0.12;
    float edge = 1.0 - smoothstep(0.25, 0.5, abs(vUv.y - 0.5 + curl));
    float head = smoothstep(0.0, 0.012, uProgress - vUv.x);
    vec3 col = mix(vec3(0.62, 0.65, 0.66), vec3(0.957, 0.965, 0.957), vUv.y);
    col = mix(col, vec3(0.91, 0.875, 0.784), smoothstep(0.72, 1.0, vUv.x) * 0.3);
    gl_FragColor = vec4(col, edge * head * 0.78);
  }
`;
const plumeShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uAge;
  uniform float uBrightness;
  uniform float uSoot;
  uniform float uSmoke;
  uniform float uSeed;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  void main() {
    vec2 xy = (vUv - 0.5) * 2.7;
    float density = 0.0, heat = 0.0;
    for (int i = 0; i < 18; i++) {
      vec3 p = vec3(xy, -1.0 + float(i) / 8.5);
      float n = noise(p * 3.8 + vec3(uSeed, -uAge * 3.0, 0.0));
      n += 0.5 * noise(p * 8.0 + vec3(0.0, -uAge * 5.0, uSeed));
      float d = max(0.0, 1.0 - length(p) + (n - 0.65) * 0.7);
      density += d * 0.22;
      heat += d * n * 0.12;
    }
    float alpha = 1.0 - exp(-density * 2.3);
    if (alpha < 0.005) discard;
    vec3 soot = mix(vec3(0.165, 0.118, 0.09), vec3(0.35, 0.31, 0.26), clamp(heat, 0.0, 1.0));
    vec3 flame = mix(vec3(0.62, 0.106, 0.0), vec3(1.0, 0.416, 0.0), smoothstep(0.06, 0.36, heat));
    flame = mix(flame, vec3(1.0, 0.965, 0.69), smoothstep(0.36, 0.78, heat));
    gl_FragColor = uSmoke > 0.5
      ? vec4(soot, alpha * uSoot)
      : vec4(flame * (1.0 + uBrightness), alpha * uBrightness);
  }
`;

function MissileTrail({ index, scrollP, portrait }: { index: number; scrollP: number; portrait: boolean }) {
  const head = useRef<THREE.Mesh>(null);
  const { curve, geometry, uniforms } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(PATHS[index].map(([u, v]) => new THREE.Vector3(u, v, 0)));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(65 * 6), 3));
    const uv = new Float32Array(65 * 4);
    const triangles: number[] = [];
    for (let i = 0; i <= 64; i++) {
      uv.set([i / 64, 0, i / 64, 1], i * 4);
      if (i < 64) triangles.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geometry.setIndex(triangles);
    return { curve, geometry, uniforms: { uProgress: { value: 0 } } };
  }, [index]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const point = useMemo(() => new THREE.Vector3(), []);
  const next = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const q = Math.pow(THREE.MathUtils.clamp((scrollP - LAUNCHES[index]) / (FIREBALLS[index].hit - LAUNCHES[index]), 0, 1), 1.3);
    uniforms.uProgress.value = q;
    const positions = geometry.getAttribute("position");
    const k = portrait ? PORTRAIT_STANDOFF_SCALE : 1;
    const project = (t: number, out: THREE.Vector3) => {
      curve.getPointAt(t, out);
      const depth = THREE.MathUtils.lerp(index === 2 ? 12 : 14, 37, t * t * (3 - 2 * t));
      out.set(0.43 + ((2 * out.x - 1) * depth * 0.7307 - 0.43) * k,
        1.65 + (1 - 2 * out.y + 0.35) * depth * Math.tan(17 * Math.PI / 180), 6 - depth);
      return depth;
    };
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      const depth = project(t, point);
      project(Math.min(1, t + 0.001), next);
      const dx = next.x - point.x, dy = next.y - point.y;
      const length = Math.hypot(dx, dy) || 1;
      const age = Math.max(0, scrollP - LAUNCHES[index] - t * (FIREBALLS[index].hit - LAUNCHES[index]));
      const width = (0.012 + 0.023 * Math.min(age / 0.1, 1)) * depth * Math.tan(17 * Math.PI / 180);
      positions.setXYZ(i * 2, point.x - dy / length * width, point.y + dx / length * width, point.z);
      positions.setXYZ(i * 2 + 1, point.x + dy / length * width, point.y - dx / length * width, point.z);
    }
    positions.needsUpdate = true;
    if (head.current) {
      project(q, head.current.position);
      head.current.visible = scrollP >= LAUNCHES[index] && scrollP < FIREBALLS[index].hit;
    }
  });
  return <group>
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial vertexShader={vertexShader} fragmentShader={contrailShader} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
    <mesh ref={head} visible={false}>
      <sphereGeometry args={[0.12, 8, 6]} />
      <meshBasicMaterial color={FX_COLORS.head} toneMapped={false} />
    </mesh>
  </group>;
}

function Fireball({ index, scrollP, portrait }: { index: number; scrollP: number; portrait: boolean }) {
  const flame = useRef<THREE.Mesh>(null);
  const smoke = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({ uAge: { value: 0 }, uBrightness: { value: 0 }, uSoot: { value: 0 }, uSmoke: { value: 0 }, uSeed: { value: index * 17.3 } }), [index]);
  const smokeUniforms = useMemo(() => ({ ...uniforms, uSmoke: { value: 1 } }), [uniforms]);
  useFrame(({ camera }) => {
    const fx = evaluateFireball(scrollP, index);
    const x = 0.43 + (FIREBALLS[index].x - 0.43) * (portrait ? PORTRAIT_STANDOFF_SCALE : 1);
    uniforms.uAge.value = fx.age;
    uniforms.uBrightness.value = fx.brightness;
    uniforms.uSoot.value = fx.soot;
    if (flame.current) {
      flame.current.visible = scrollP > FIREBALLS[index].hit;
      flame.current.position.set(x, fx.height, -31);
      flame.current.scale.setScalar(fx.radius * 2.7);
      flame.current.quaternion.copy(camera.quaternion);
    }
    if (smoke.current) {
      smoke.current.visible = scrollP > FIREBALLS[index].hit;
      smoke.current.position.set(x, fx.height + fx.column * 0.48, -31.3);
      smoke.current.scale.set(fx.radius * 2.3, Math.max(0.001, fx.column) * 1.35, 1);
      smoke.current.quaternion.copy(camera.quaternion);
    }
  });
  return <group>
    <mesh ref={smoke} visible={false} renderOrder={1}>
      <planeGeometry />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={plumeShader} uniforms={smokeUniforms} transparent depthWrite={false} />
    </mesh>
    <mesh ref={flame} visible={false} renderOrder={2}>
      <planeGeometry />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={plumeShader} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  </group>;
}

export function MissilePyroSystem({ scrollP, portrait = false }: MissilePyroSystemProps) {
  const debris = useRef<THREE.InstancedMesh>(null);
  const dust = useRef<THREE.InstancedMesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const data = useMemo(() => Array.from({ length: 80 }, (_, i) => {
    const random = (n: number) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
    const a = random(i + 1), b = random(i + 31), c = random(i + 71);
    return { index: i < 24 ? 0 : i < 56 ? 1 : 2, vx: Math.cos(a * Math.PI * 2) * b * 4, vz: Math.sin(a * Math.PI * 2) * b * 4, vy: 6 + c * 8, scale: 0.15 + a * 0.35, spin: a * 8 };
  }), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    data.forEach((item, i) => {
      const source = FIREBALLS[item.index];
      const t = Math.max(0, 12 * (scrollP - source.hit));
      dummy.position.set(0.43 + (source.x - 0.43) * (portrait ? PORTRAIT_STANDOFF_SCALE : 1) + item.vx * t,
        Math.max(0.12, 1.2 + item.vy * t - 4.9 * t * t), -31 + item.vz * t);
      dummy.rotation.set(item.spin * t, item.spin * 0.7 * t, item.spin * 1.3 * t);
      dummy.scale.setScalar(t > 0 ? item.scale : 0);
      if (i === 24 && t > 0) dummy.scale.set(0.9, 0.08, 0.65);
      dummy.updateMatrix();
      debris.current?.setMatrixAt(i, dummy.matrix);
    });
    if (debris.current) debris.current.instanceMatrix.needsUpdate = true;
    const q = THREE.MathUtils.clamp((scrollP - 0.642) / 0.208, 0, 1);
    const radius = 38 * Math.pow(q, 0.85);
    if (ring.current) { ring.current.visible = q > 0; ring.current.scale.setScalar(radius); }
    for (let i = 0; i < 78; i++) {
      const fence = i >= 60;
      const a = i / 60 * Math.PI * 2;
      const age = Math.max(0, scrollP - (0.664 + (i - 60) / 17 * 0.036));
      dummy.position.set(fence ? -9.5 : 0.43 + Math.cos(a) * radius, fence ? age * 12 : 0.25 + q * 0.45, fence ? -34 + (i - 60) / 17 * 24 : -31 + Math.sin(a) * radius);
      dummy.rotation.set(0, a, 0);
      const size = fence ? Math.min(0.8, age * 18) : q > 0 ? 0.6 + q * 0.8 : 0;
      dummy.scale.set(size * 1.5, size * 0.7, size);
      dummy.updateMatrix();
      dust.current?.setMatrixAt(i, dummy.matrix);
    }
    if (dust.current) dust.current.instanceMatrix.needsUpdate = true;
  });
  return <group name="MissilePyroSystemGroup">
    {FIREBALLS.map((_, index) => <group key={index}>
      <MissileTrail index={index} scrollP={scrollP} portrait={portrait} />
      <Fireball index={index} scrollP={scrollP} portrait={portrait} />
    </group>)}
    <mesh ref={ring} position={[0.43, 0.08, -31]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.94, 1, 64]} />
      <meshBasicMaterial color={FX_COLORS.dust} transparent opacity={0.65} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
    <instancedMesh ref={debris} args={[undefined, undefined, 80]} frustumCulled={false}>
      <boxGeometry />
      <meshStandardMaterial color={FX_COLORS.debris} roughness={0.9} />
    </instancedMesh>
    <instancedMesh ref={dust} args={[undefined, undefined, 78]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color={FX_COLORS.dust} transparent opacity={0.18} depthWrite={false} />
    </instancedMesh>
  </group>;
}
