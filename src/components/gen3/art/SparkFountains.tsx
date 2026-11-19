"use client";

// Stage gerbs: two spark fountains at the front corners of the deck. Every spark is a
// ballistic particle drawn as a velocity-aligned streak (motion blur at a 1/30 s shutter),
// cooling from white through orange to red. One draw, animated on the GPU.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { seeded, type Vec3 } from "@/gl/art/geometry";
import { useDisposeOnUnmount } from "@/gl/dispose";

const VERT = /* glsl */ `
  attribute vec3 aOrigin;
  attribute vec3 aVel;
  attribute vec4 aSeed; // phase, life, width, brightness
  uniform float uTime;
  uniform float uShutter;
  varying float vAlong;
  varying float vAcross;
  varying float vAge;
  varying float vBright;
  const vec3 G = vec3(0.0, -6.2, 0.0);
  void main() {
    float life = aSeed.y;
    float t = mod(uTime + aSeed.x * life, life);
    float age = t / life;
    // Light air drag: velocity decays, so arcs droop like real sparks rather than parabolas.
    float k = 0.9;
    float decay = (1.0 - exp(-k * t)) / k;
    vec3 p = aOrigin + aVel * decay + 0.5 * G * t * t;
    vec3 vel = aVel * exp(-k * t) + G * t;
    // Streak in world space: from the spark back along its velocity, widened sideways
    // (perpendicular to both the streak and the view ray). Locals only: reading back a
    // written varying in the vertex stage broke the streak on ANGLE/D3D.
    float along = position.y + 0.5;
    vec3 tailP = p - vel * uShutter;
    vec3 axis = tailP - p;
    vec3 toCam = cameraPosition - p;
    vec3 side = cross(axis, toCam);
    float sideLen = length(side);
    side = sideLen > 1e-6 ? side / sideLen : vec3(1.0, 0.0, 0.0);
    vec3 wp = mix(p, tailP, along) + side * position.x * aSeed.z;
    vAlong = along;
    vAcross = position.x * 2.0;
    vAge = age;
    // Hidden at respawn and once the spark reaches the floor.
    vBright = aSeed.w * smoothstep(0.0, 0.04, age) * (1.0 - smoothstep(0.75, 1.0, age)) * step(0.02, p.y);
    vec4 mv = viewMatrix * vec4(wp, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  varying float vAlong;
  varying float vAcross;
  varying float vAge;
  varying float vBright;
  uniform float uIntensity;
  void main() {
    float across = clamp(1.0 - vAcross * vAcross, 0.0, 1.0);
    float along = pow(clamp(1.0 - vAlong, 0.0, 1.0), 1.4);
    float a = across * along * vBright * uIntensity;
    vec3 white = vec3(3.0, 2.4, 1.5);
    vec3 orange = vec3(2.0, 0.7, 0.12);
    vec3 red = vec3(0.7, 0.12, 0.02);
    vec3 c = mix(white, orange, smoothstep(0.05, 0.35, vAge));
    c = mix(c, red, smoothstep(0.45, 0.95, vAge));
    // Additive with alpha 1: the colour itself carries the energy (no a² falloff).
    gl_FragColor = vec4(c * a, 1.0);
  }
`;

export function SparkFountains({ emitters, perEmitter }: { emitters: Vec3[]; perEmitter: number }) {
  const { mesh, geometry, material } = useMemo(() => {
    const count = emitters.length * perEmitter;
    // Plain quads (4 vertices per spark, per-vertex copies of the spark's constants): a few
    // thousand vertices, one draw, no instancing path to go wrong.
    const corners = [
      [-0.5, -0.5],
      [0.5, -0.5],
      [0.5, 0.5],
      [-0.5, 0.5],
    ];
    const position = new Float32Array(count * 4 * 3);
    const origin = new Float32Array(count * 4 * 3);
    const vel = new Float32Array(count * 4 * 3);
    const seed = new Float32Array(count * 4 * 4);
    const index = new Uint32Array(count * 6);
    const rand = seeded(29);
    emitters.forEach(([ex, ey, ez], e) => {
      for (let i = 0; i < perEmitter; i++) {
        const n = e * perEmitter + i;
        const o = [ex + (rand() - 0.5) * 0.06, ey, ez + (rand() - 0.5) * 0.06];
        // A narrow cone, leaning slightly outward and toward the audience.
        const speed = 6.2 + rand() * 2.8;
        const a = rand() * Math.PI * 2;
        const spread = Math.sqrt(rand()) * 0.2;
        const lean = Math.sign(ex) * 0.06;
        const v = [(Math.cos(a) * spread + lean) * speed, speed, (Math.sin(a) * spread + 0.04) * speed];
        const sd = [rand(), 1.3 + rand() * 1.0, 0.035 + rand() * 0.03, 0.5 + rand() * 0.9];
        for (let c = 0; c < 4; c++) {
          const vi = n * 4 + c;
          position.set([corners[c][0], corners[c][1], 0], vi * 3);
          origin.set(o, vi * 3);
          vel.set(v, vi * 3);
          seed.set(sd, vi * 4);
        }
        index.set([n * 4, n * 4 + 1, n * 4 + 2, n * 4, n * 4 + 2, n * 4 + 3], n * 6);
      }
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geometry.setAttribute("aOrigin", new THREE.BufferAttribute(origin, 3));
    geometry.setAttribute("aVel", new THREE.BufferAttribute(vel, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    geometry.setIndex(new THREE.BufferAttribute(index, 1));
    const material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uShutter: { value: 1 / 20 }, uIntensity: { value: 1.6 } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 7;
    return { mesh, geometry, material };
    // Emitter positions are constants of the layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perEmitter, emitters.length]);
  useDisposeOnUnmount(geometry, material);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    material.uniforms.uTime.value += dt;
  });

  return <primitive object={mesh} />;
}
