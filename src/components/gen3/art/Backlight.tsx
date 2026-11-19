"use client";

// The "god light": a sodium lamp array in a steel ring behind the performer, the real spot
// that throws the performer's rim and shadow toward the camera, and the lens flare that
// swells into the blowout at the end of the scroll (PRD §3, p 0.82 → 1).
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { BACKLIGHT, BACKLIGHT_RADIUS } from "./forgeGeometry";
import { getScrollProgress } from "../useScrollCinematic";

const DISC_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uBoost;
  // Hex-packed lamp cells (a blinder array), each with its own hot core and flicker.
  vec2 hexCell(vec2 p, out vec2 id) {
    vec2 r = vec2(1.0, 1.7320508);
    vec2 h = r * 0.5;
    vec2 a = mod(p, r) - h;
    vec2 b = mod(p - h, r) - h;
    vec2 g = dot(a, a) < dot(b, b) ? a : b;
    id = p - g;
    return g;
  }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
  void main() {
    vec2 c = (vUv - 0.5) * 2.0;
    float r = length(c);
    vec2 id;
    vec2 g = hexCell(c * 2.6, id);
    float d = length(g);
    float flick = 0.9 + 0.1 * sin(uTime * (7.0 + hash(id) * 5.0) + hash(id) * 30.0);
    float cell = exp(-d * d * 22.0) * flick;
    float reflector = smoothstep(0.5, 0.2, d) * 0.22;
    float body = cell + reflector;
    // Whole array falls off toward the rim of the housing.
    float edge = smoothstep(1.0, 0.82, r);
    vec3 hot = vec3(4.2, 3.1, 1.9);
    vec3 amber = vec3(2.2, 0.95, 0.28);
    vec3 col = mix(amber, hot, clamp(cell * 1.1, 0.0, 1.0)) * body * edge;
    col += vec3(0.5, 0.18, 0.04) * edge * 0.35; // warm haze glowing inside the ring
    col *= uBoost;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const FLARE_VERT = /* glsl */ `
  varying vec2 vUv;
  uniform float uScale;
  void main() {
    vUv = uv;
    // Camera-facing quad centred on the object origin.
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * uScale;
    gl_Position = projectionMatrix * mv;
  }
`;

const FLARE_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float uIntensity;
  void main() {
    vec2 c = (vUv - 0.5) * 2.0;
    float r = length(c);
    float glow = exp(-r * r * 9.0) * 0.9 + exp(-r * 3.2) * 0.22;
    // Thin anamorphic streak through the source.
    float streak = exp(-abs(c.y) * 90.0) * exp(-abs(c.x) * 2.2) * 0.45;
    float a = (glow + streak) * smoothstep(1.0, 0.7, r) * uIntensity;
    gl_FragColor = vec4(vec3(1.0, 0.62, 0.3) * a, 1.0);
  }
`;

const smooth = (x: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function Backlight({ shadowMapSize }: { shadowMapSize: number }) {
  const spot = useRef<THREE.SpotLight>(null);
  const time = useRef(0);

  const { disc, discMaterial, flare, flareMaterial, target } = useMemo(() => {
    const disc = new THREE.CircleGeometry(BACKLIGHT_RADIUS, 64);
    const discMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uBoost: { value: 1 } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: DISC_FRAG,
      toneMapped: false,
    });
    const flare = new THREE.PlaneGeometry(1, 1);
    const flareMaterial = new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 6 }, uIntensity: { value: 0.3 } },
      vertexShader: FLARE_VERT,
      fragmentShader: FLARE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const target = new THREE.Object3D();
    target.position.set(0, 2.6, 8);
    return { disc, discMaterial, flare, flareMaterial, target };
  }, []);
  useDisposeOnUnmount(disc, discMaterial, flare, flareMaterial);

  useEffect(() => {
    const light = spot.current;
    if (!light) return;
    light.target = target;
    target.updateMatrixWorld();
    const cam = light.shadow.camera;
    cam.near = 0.5;
    cam.far = 26;
    cam.updateProjectionMatrix();
  }, [target]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    time.current += dt;
    const p = getScrollProgress();
    // Blowout: the array and the flare swell together over the last stretch of the scroll.
    const blow = smooth(p, 0.8, 1.0);
    discMaterial.uniforms.uTime.value = time.current;
    discMaterial.uniforms.uBoost.value = 1 + blow * blow * 4;
    flareMaterial.uniforms.uScale.value = 7 + blow * blow * 42;
    flareMaterial.uniforms.uIntensity.value = 0.28 + blow * blow * 1.3;
    if (spot.current) spot.current.intensity = 190 * (1 + blow * 2);
  });

  const [bx, by, bz] = BACKLIGHT;
  return (
    <group>
      <mesh geometry={disc} material={discMaterial} position={[bx, by, bz + 0.03]} />
      <mesh geometry={flare} material={flareMaterial} position={[bx, by, bz + 0.25]} renderOrder={8} frustumCulled={false} />
      <primitive object={target} />
      <spotLight
        ref={spot}
        position={[bx, by, bz + 0.5]}
        color="#ffae5c"
        intensity={190}
        angle={0.56}
        penumbra={0.55}
        decay={2}
        castShadow={shadowMapSize > 0}
        shadow-mapSize={[shadowMapSize || 1, shadowMapSize || 1]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        userData={{ gradeRole: "key" }}
      />
    </group>
  );
}
