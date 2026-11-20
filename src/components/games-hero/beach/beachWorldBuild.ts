// src/components/games-hero/beach/beachWorldBuild.ts
// Geometry and materials for the real-time beach compound (BeachWorld.tsx). Everything here is
// plain three.js the caller owns: build once (useMemo), dispose on unmount.
import * as THREE from "three";
import { chamferedBox, latheProfile, mergeParts, roundedBox, seeded, type Part, type Vec3 } from "@/gl/art/geometry";
import { bakeVertexAO } from "@/gl/art/vertexAO";
import { createSurfaceMaterial, withSurfaceDetail } from "@/gl/art/surface";
import {
  BREACH_MASONRY,
  BREACH_RUBBLE,
  BREACH_XS,
  FENCE,
  FOUNTAIN,
  GROUND,
  GROUND_TOP,
  OCEAN,
  OCEAN_TOP,
  PALETTE,
  PALMS,
  PALM_FROND,
  PALM_TRUNK,
  PARASOL,
  RETAINING_WALL,
  SKY_SUN,
  SUN_POSITION,
  SUN_STRENGTH,
  SUV_XS,
  SUV_Z,
  WALL,
  fencePicketXs,
  type RGB,
} from "./beachLayout";

const lerp = THREE.MathUtils.lerp;
const linear = (c: RGB) => new THREE.Color().setRGB(c[0], c[1], c[2]);

// ---------------------------------------------------------------------------------------------
// Light and air. Scene-linear values fitted to the offline poster (inverse of the plate's AgX
// −0.7 EV view transform), so the live render lands where the baked plates did.
// ---------------------------------------------------------------------------------------------

export const SUN_DIRECTION = new THREE.Vector3(...SUN_POSITION).normalize();
/** three.js DirectionalLight intensity matching Blender sun strength 2.5 (see beachLayout). */
export const SUN_INTENSITY = SUN_STRENGTH * Math.PI;
export const SUN_COLOR = "#fff3e6";

/** Direction of the sky's glow (the Nishita sun, up and to the left of the view). */
export function skyGlowDirection(target = new THREE.Vector3()) {
  const az = -SKY_SUN.rotation;
  return target.set(-Math.cos(SKY_SUN.elevation) * Math.sin(az), Math.sin(SKY_SUN.elevation), -Math.cos(SKY_SUN.elevation) * Math.cos(az));
}

/** Least-squares fit of the poster sky (rms error 3.4% over 150 samples). */
const SKY = {
  horizon: [1.52, 1.98, 1.91] as RGB,
  zenith: [0.2, 0.27, 0.0] as RGB,
  falloff: [0.145, 0.197, 0.64] as RGB,
  glowAmount: 12.6,
  glowWidth: 0.4,
  glowTint: [1, 0.657, 0.45] as RGB,
};
/** Aerial haze, kept light: the offline render has no volume, so the sand stays sand to the horizon. */
export const FOG_COLOR = new THREE.Color().setRGB(1.62, 1.7, 1.5);
export const FOG_DENSITY = 0.0022;
/** Lower hemisphere of the baked environment: sunlit sand radiance. */
const ENV_GROUND = [0.42, 0.36, 0.28] as RGB;

const SKY_VERT = /* glsl */ `
  varying vec3 vSkyDir;
  void main() {
    vSkyDir = position;
    vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 100.0, 1.0);
    // Pin to the far plane: the dome is infinitely far whatever the camera's near/far.
    gl_Position = vec4(p.xy, p.w * 0.999999, p.w);
  }
`;

const SKY_FRAG = /* glsl */ `
  uniform vec3 uHorizon;
  uniform vec3 uZenith;
  uniform vec3 uFalloff;
  uniform vec3 uGlowDir;
  uniform vec3 uGlowTint;
  uniform vec2 uGlow;     // amount, angular width (radians)
  uniform vec4 uGround;   // rgb, weight (1 for the environment bake, 0 for the visible dome)
  varying vec3 vSkyDir;
  void main() {
    vec3 d = normalize(vSkyDir);
    float e = max(d.y, 0.0);
    vec3 base = uZenith + (uHorizon - uZenith) * exp(-e / uFalloff);
    float g = acos(clamp(dot(d, uGlowDir), -1.0, 1.0));
    vec3 col = base * (1.0 + uGlow.x * exp(-g / uGlow.y) * uGlowTint);
    // Below the horizon the visible dome continues the horizon haze; the bake sees sand.
    col = mix(col, uGround.rgb, uGround.a * smoothstep(0.0, 0.06, -d.y));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createSkyMaterial(bake = false) {
  return new THREE.ShaderMaterial({
    name: bake ? "BeachSkyBake" : "BeachSky",
    vertexShader: SKY_VERT,
    fragmentShader: SKY_FRAG,
    uniforms: {
      uHorizon: { value: linear(SKY.horizon) },
      uZenith: { value: linear(SKY.zenith) },
      uFalloff: { value: new THREE.Vector3(...SKY.falloff) },
      uGlowDir: { value: skyGlowDirection() },
      uGlowTint: { value: new THREE.Vector3(...SKY.glowTint) },
      uGlow: { value: new THREE.Vector2(SKY.glowAmount, SKY.glowWidth) },
      uGround: { value: new THREE.Vector4(...ENV_GROUND, bake ? 1 : 0) },
    },
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    fog: false,
  });
}

/** Bakes the sky (with a sand floor) into a small PMREM for reflections and sky fill. */
export function bakeSkyEnvironment(gl: THREE.WebGLRenderer, dome: THREE.BufferGeometry) {
  const scene = new THREE.Scene();
  const material = createSkyMaterial(true);
  scene.add(new THREE.Mesh(dome, material));
  const pmrem = new THREE.PMREMGenerator(gl);
  const target = pmrem.fromScene(scene, 0, 0.1, 10, { size: 128 });
  pmrem.dispose();
  material.dispose();
  return target;
}

// ---------------------------------------------------------------------------------------------
// Static architecture
// ---------------------------------------------------------------------------------------------

/** Wall segments, retaining wall and fence piers: one plaster draw. */
export function buildPlaster() {
  const parts: Part[] = WALL.segments.map((s) => ({
    geometry: roundedBox(s.width, WALL.height, WALL.depth, WALL.bevel, 2),
    position: [s.x, WALL.height / 2, WALL.z],
  }));
  parts.push({
    geometry: roundedBox(...RETAINING_WALL.size, RETAINING_WALL.bevel, 2),
    position: [...RETAINING_WALL.center],
  });
  for (const x of FENCE.piers.xs) {
    parts.push({ geometry: roundedBox(...FENCE.piers.size, FENCE.piers.bevel, 2), position: [x, FENCE.piers.y, FENCE.z] });
  }
  return bakeVertexAO(mergeParts(parts), { cavity: 1, edges: 1 });
}

/** Limestone: breach masonry, rubble, copings, fountain and parasol pole. One draw. */
export function buildStone() {
  const rand = seeded(3187);
  const r = () => rand() * 2 - 1;
  const parts: Part[] = [];
  const m = BREACH_MASONRY;
  const rb = BREACH_RUBBLE;
  for (const x of BREACH_XS) {
    for (const side of [-1, 1]) {
      for (let j = 0; j < m.perSide; j++) {
        const offset = m.offset + lerp(m.offsetJitter[0], m.offsetJitter[1], rand());
        const w = m.size[0] * (0.85 + 0.3 * rand());
        parts.push({
          geometry: chamferedBox(w, m.size[1], m.size[2] * (0.9 + 0.15 * rand()), m.bevel),
          position: [x + side * offset, m.y0 + j * m.step, WALL.z + r() * 0.04],
          rotation: [0, r() * 0.06, r() * m.roll],
        });
      }
    }
    for (let j = 0; j < rb.count; j++) {
      const w = lerp(rb.width[0], rb.width[1], rand());
      const h = rb.height * (0.6 + 0.6 * rand());
      const d = rb.depth * (0.7 + 0.7 * rand());
      const chunk = j % 3 === 0;
      parts.push({
        geometry: chunk ? new THREE.IcosahedronGeometry(0.5, 0) : chamferedBox(w, h, d, rb.bevel),
        position: [x + r() * rb.spreadX, (chunk ? h * 0.35 : h * 0.45) + GROUND_TOP, rb.z + r() * rb.spreadZ],
        rotation: [r() * 0.25, rand() * Math.PI, r() * 0.25],
        scale: chunk ? [w, h, d] : 1,
      });
    }
  }
  const c = RETAINING_WALL.coping;
  parts.push({ geometry: chamferedBox(...c.size, c.bevel), position: [...c.center] });
  const pc = FENCE.piers.coping;
  for (const x of FENCE.piers.xs) {
    parts.push({ geometry: chamferedBox(...pc.size, pc.bevel), position: [x, pc.y, FENCE.z] });
  }
  const f = FOUNTAIN;
  parts.push({ geometry: roundedBox(...f.plinth.size, f.plinth.bevel, 2), position: [f.x, f.plinth.y, f.z] });
  f.stones.forEach((s, i) => {
    parts.push({
      geometry: new THREE.SphereGeometry(1, 28, 14),
      position: [f.x, s.y, f.z],
      rotation: [0, i * 0.7, 0],
      scale: [s.r, f.stoneHalfHeight, s.r],
    });
  });
  parts.push({
    geometry: new THREE.CylinderGeometry(PARASOL.poleRadius * 0.85, PARASOL.poleRadius, PARASOL.poleHeight + 0.25, 12),
    position: [PARASOL.x, (PARASOL.poleHeight + 0.25) / 2, PARASOL.z],
  });
  parts.push({ geometry: new THREE.SphereGeometry(0.07, 10, 6), position: [PARASOL.x, PARASOL.canopy.y + PARASOL.canopy.depth / 2 + 0.03, PARASOL.z] });
  return bakeVertexAO(mergeParts(parts), { cavity: 1, edges: 1, ground: { y: GROUND_TOP, height: 0.35, strength: 0.55 } });
}

/** Wrought-iron pickets with spear finials and two rails. One draw. */
export function buildFence() {
  const [y0, y1] = FENCE.picketY;
  const parts: Part[] = [];
  for (const x of fencePicketXs()) {
    parts.push({ geometry: new THREE.CylinderGeometry(FENCE.picketRadius, FENCE.picketRadius, y1 - y0, 6), position: [x, (y0 + y1) / 2, FENCE.z] });
    parts.push({ geometry: new THREE.ConeGeometry(FENCE.picketRadius * 2, 0.13, 4), position: [x, y1 + 0.06, FENCE.z], rotation: [0, Math.PI / 4, 0] });
  }
  const { from, to, radius, ys } = FENCE.rails;
  for (const y of ys) {
    parts.push({ geometry: new THREE.CylinderGeometry(radius, radius, to - from, 6), position: [(from + to) / 2, y, FENCE.z], rotation: [0, 0, Math.PI / 2] });
  }
  return mergeParts(parts);
}

/** Cream canvas canopy: a shallow curved cone with eight scalloped panels. */
export function buildCanopy() {
  const { radius, depth, y } = PARASOL.canopy;
  const g = latheProfile(
    [[radius, -depth / 2], [radius * 0.78, -depth * 0.18], [radius * 0.4, depth * 0.3], [0.04, depth / 2]],
    { radialSegments: PARASOL.canopy.segments, smooth: true, samples: 10, capped: false }
  );
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const a = Math.atan2(z, x);
    // Ribs hold the canvas up; the panels sag a little between them.
    const sag = 1 - Math.abs(Math.cos(4 * a));
    pos.setY(i, pos.getY(i) - 0.05 * sag * (Math.hypot(x, z) / radius));
  }
  g.computeVertexNormals();
  return mergeParts([{ geometry: g, position: [PARASOL.x, y, PARASOL.z] }]);
}

// ---------------------------------------------------------------------------------------------
// SUVs: three unbranded 4x4s, nose to camera, merged per material (4 draws in all).
// ---------------------------------------------------------------------------------------------

interface SuvParts {
  body: Part[];
  glass: Part[];
  dark: Part[];
  chrome: Part[];
}

/** Side profile of the cabin (z, y), extruded across the car. The windscreen is raked. */
const CABIN_PROFILE: [number, number][] = [[0.95, 1.3], [0.62, 2.12], [-1.42, 2.12], [-1.5, 1.3]];
const CABIN_HALF = 0.86;
const CABIN_BEVEL = 0.07;

function cabinGeometry() {
  const shape = new THREE.Shape(CABIN_PROFILE.map(([z, y]) => new THREE.Vector2(z, y)));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: CABIN_HALF * 2,
    bevelEnabled: true,
    bevelThickness: CABIN_BEVEL,
    bevelSize: CABIN_BEVEL,
    bevelSegments: 3,
    curveSegments: 1,
  });
  g.translate(0, 0, -CABIN_HALF);
  g.rotateY(-Math.PI / 2);
  return g;
}

function tireGeometry() {
  return latheProfile(
    [[0.25, -0.115], [0.4, -0.13], [0.45, -0.118], [0.47, -0.065], [0.47, 0.065], [0.45, 0.118], [0.4, 0.13], [0.25, 0.115]],
    { radialSegments: 22, capped: false }
  );
}

function suvParts(): SuvParts {
  const body: Part[] = [];
  const glass: Part[] = [];
  const dark: Part[] = [];
  const chrome: Part[] = [];

  // Bodywork: tub, wheel-arch flares, bonnet bulge, cabin, mirrors.
  body.push({ geometry: roundedBox(2.04, 0.78, 4.3, 0.14, 3), position: [0, 0.93, 0] });
  for (const z of [-1.3, 1.3]) body.push({ geometry: roundedBox(2.22, 0.26, 1.15, 0.1, 2), position: [0, 0.86, z] });
  body.push({ geometry: roundedBox(1.86, 0.14, 1.7, 0.06, 2), position: [0, 1.35, 1.2] });
  body.push({ geometry: cabinGeometry() });
  for (const s of [-1, 1]) {
    body.push({ geometry: roundedBox(0.12, 0.16, 0.25, 0.04, 2), position: [s * 1.12, 1.6, 0.62] });
    dark.push({ geometry: roundedBox(0.18, 0.04, 0.05, 0.015, 1), position: [s * 1.0, 1.58, 0.62] });
  }

  // Glazing: raked windscreen sits on the cabin's front face; side glass with a body B-pillar.
  const [[zb, yb], [zt, yt]] = CABIN_PROFILE;
  const rake = Math.atan2(zb - zt, yt - yb);
  const nz = Math.cos(rake);
  const ny = Math.sin(rake);
  const t = 0.55;
  const off = CABIN_BEVEL + 0.012;
  glass.push({
    geometry: roundedBox(1.6, 0.66, 0.02, 0.008, 1),
    position: [0, lerp(yb, yt, t) + ny * off, lerp(zb, zt, t) + nz * off],
    rotation: [-rake, 0, 0],
  });
  const sideX = CABIN_HALF + CABIN_BEVEL + 0.006;
  for (const s of [-1, 1]) {
    glass.push({ geometry: roundedBox(0.02, 0.5, 1.8, 0.008, 1), position: [s * sideX, 1.78, -0.45] });
    body.push({ geometry: roundedBox(0.03, 0.54, 0.11, 0.01, 1), position: [s * (sideX + 0.008), 1.78, -0.42] });
  }

  // Nose: dark grille panel with chrome bars, headlamp housings and reflectors, bumper, skid plate.
  dark.push({ geometry: roundedBox(1.12, 0.32, 0.05, 0.015, 1), position: [0, 0.97, 2.155] });
  for (let i = 0; i < 8; i++) chrome.push({ geometry: roundedBox(0.045, 0.24, 0.03, 0.01, 1), position: [(i - 3.5) * 0.14, 0.97, 2.18] });
  for (const s of [-1, 1]) {
    dark.push({ geometry: roundedBox(0.42, 0.22, 0.05, 0.02, 1), position: [s * 0.78, 1.02, 2.155] });
    chrome.push({ geometry: roundedBox(0.34, 0.15, 0.03, 0.012, 1), position: [s * 0.78, 1.02, 2.18] });
  }
  dark.push({ geometry: roundedBox(2.25, 0.22, 0.26, 0.05, 2), position: [0, 0.63, 2.2] });
  dark.push({ geometry: roundedBox(1.5, 0.12, 0.5, 0.03, 1), position: [0, 0.42, 1.95] });

  // Running gear: chassis, running boards, tyres, rims, hubs; roof rails.
  dark.push({ geometry: new THREE.BoxGeometry(1.76, 0.3, 3.5), position: [0, 0.5, 0] });
  for (const s of [-1, 1]) {
    dark.push({ geometry: roundedBox(0.18, 0.05, 1.4, 0.015, 1), position: [s * 1.06, 0.5, 0] });
    for (const z of [-1.3, 1.3]) {
      dark.push({ geometry: tireGeometry(), position: [s * 1.03, 0.47, z], rotation: [0, 0, Math.PI / 2] });
      chrome.push({ geometry: new THREE.CylinderGeometry(0.25, 0.25, 0.05, 18), position: [s * 1.13, 0.47, z], rotation: [0, 0, Math.PI / 2] });
      chrome.push({ geometry: new THREE.CylinderGeometry(0.07, 0.09, 0.05, 10), position: [s * 1.17, 0.47, z], rotation: [0, 0, -s * Math.PI / 2] });
    }
    dark.push({ geometry: roundedBox(0.045, 0.045, 1.85, 0.012, 1), position: [s * 0.7, 2.255, -0.28] });
    for (const z of [-1.1, 0.55]) dark.push({ geometry: new THREE.BoxGeometry(0.04, 0.07, 0.05), position: [s * 0.7, 2.21, z] });
  }
  return { body, glass, dark, chrome };
}

export interface SuvGeometries {
  body: THREE.BufferGeometry;
  glass: THREE.BufferGeometry;
  dark: THREE.BufferGeometry;
  chrome: THREE.BufferGeometry;
}

/** All three SUVs, merged per material. A small seeded yaw keeps them from reading as clones. */
export function buildSuvs(): SuvGeometries {
  const rand = seeded(4211);
  const suvs = SUV_XS.map((x) => ({
    parts: suvParts(),
    position: [x, GROUND_TOP, SUV_Z] as Vec3,
    rotation: [0, (rand() * 2 - 1) * 0.03, 0] as Vec3,
  }));
  const merge = (key: keyof SuvParts) =>
    mergeParts(suvs.map(({ parts, position, rotation }) => ({ geometry: mergeParts(parts[key]), position, rotation })));
  const body = bakeVertexAO(merge("body"), { cavity: 1, edges: 1, ground: { y: 0.5, height: 0.35, strength: 0.4 } });
  return { body, glass: merge("glass"), dark: merge("dark"), chrome: merge("chrome") };
}

// ---------------------------------------------------------------------------------------------
// Palms. `uv` carries sway data (x = per-palm phase, y = 0–1 up the trunk, 1–2 out along a frond),
// so trunks and fronds bend together in the vertex shader. No textures read the uv.
// ---------------------------------------------------------------------------------------------

function palmPhase(seed: number) {
  return seed * 1.7;
}

function trunkCurve(p: (typeof PALMS)[number]) {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(p.x, GROUND_TOP, p.z),
    new THREE.Vector3(p.x + PALM_TRUNK.mid.dx, p.height * PALM_TRUNK.mid.yFrac, p.z + PALM_TRUNK.mid.dz),
    new THREE.Vector3(p.x + PALM_TRUNK.top.dx, p.height, p.z + PALM_TRUNK.top.dz),
  ]);
}

/** Tapered, ring-scarred trunks plus coconuts. One bark draw. */
export function buildTrunks() {
  const parts: Part[] = [];
  const centre = new THREE.Vector3();
  const tubular = 28;
  const radial = 8;
  for (const palm of PALMS) {
    const curve = trunkCurve(palm);
    const tube = new THREE.TubeGeometry(curve, tubular, PALM_TRUNK.radius, radial, false);
    const pos = tube.attributes.position as THREE.BufferAttribute;
    const uv = tube.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i <= tubular; i++) {
      const t = i / tubular;
      curve.getPointAt(t, centre);
      const radius = 0.2 - 0.075 * t + 0.11 * Math.exp(-t * 22) + 0.008 * Math.sin(t * palm.height * 9);
      const k = radius / PALM_TRUNK.radius;
      for (let j = 0; j <= radial; j++) {
        const v = i * (radial + 1) + j;
        pos.setXYZ(v, centre.x + (pos.getX(v) - centre.x) * k, centre.y + (pos.getY(v) - centre.y) * k, centre.z + (pos.getZ(v) - centre.z) * k);
        uv.setXY(v, palmPhase(palm.seed), t);
      }
    }
    tube.computeVertexNormals();
    parts.push({ geometry: tube });
    const top = curve.getPointAt(1);
    for (let c = 0; c < 5; c++) {
      const a = (c / 5) * Math.PI * 2 + palm.seed;
      const nut = new THREE.SphereGeometry(0.12, 8, 6);
      const nutUv = nut.attributes.uv as THREE.BufferAttribute;
      for (let v = 0; v < nutUv.count; v++) nutUv.setXY(v, palmPhase(palm.seed), 1);
      parts.push({ geometry: nut, position: [top.x + Math.cos(a) * 0.2, top.y - 0.28, top.z + Math.sin(a) * 0.2] });
    }
  }
  return mergeParts(parts);
}

/** Pinnate fronds: rachis ribbons with tapered leaflet pairs (port of py:340-363). One draw. */
export function buildFronds() {
  const f = PALM_FROND;
  const positions: number[] = [];
  const uvs: number[] = [];
  const stem = Array.from({ length: f.samples }, () => new THREE.Vector3());
  const base = new THREE.Vector3();
  const tip = new THREE.Vector3();
  const bend = new THREE.Vector3();
  const push = (v: THREE.Vector3, phase: number, along: number) => {
    positions.push(v.x, v.y, v.z);
    uvs.push(phase, 1 + along);
  };
  for (const palm of PALMS) {
    const rand = seeded(palm.seed * 7919);
    const phase = palmPhase(palm.seed);
    const crown = trunkCurve(palm).getPointAt(1);
    for (let k = 0; k < f.count; k++) {
      const angle = (k * Math.PI * 2) / f.count + (rand() * 2 - 1) * f.angleJitter;
      const extent = lerp(f.extent[0], f.extent[1], rand());
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      for (let j = 0; j < f.samples; j++) {
        const t = j / (f.samples - 1);
        stem[j].set(crown.x + ca * extent * t, crown.y + Math.sin(t * Math.PI) * f.arch - f.droop * t * t, crown.z + sa * extent * t);
      }
      // Rachis: a narrow ribbon, wide side up.
      for (let j = 0; j < f.samples - 1; j++) {
        const t0 = j / (f.samples - 1);
        const t1 = (j + 1) / (f.samples - 1);
        const w0 = f.rachisRadius * 1.6 * (1 - 0.6 * t0);
        const w1 = f.rachisRadius * 1.6 * (1 - 0.6 * t1);
        const a0 = stem[j];
        const a1 = stem[j + 1];
        const quad = [
          [a0.x - sa * w0, a0.y, a0.z + ca * w0, t0], [a1.x - sa * w1, a1.y, a1.z + ca * w1, t1], [a1.x + sa * w1, a1.y, a1.z - ca * w1, t1],
          [a0.x - sa * w0, a0.y, a0.z + ca * w0, t0], [a1.x + sa * w1, a1.y, a1.z - ca * w1, t1], [a0.x + sa * w0, a0.y, a0.z - ca * w0, t0],
        ];
        for (const [x, y, z, a] of quad) {
          positions.push(x, y, z);
          uvs.push(phase, 1 + a);
        }
      }
      // Leaflets: kite-shaped pairs, longest mid-frond, drooping (py:348-358).
      for (let j = 1; j <= f.leaflets; j++) {
        const t = j / (f.samples - 1);
        base.copy(stem[j]);
        for (const side of [-1, 1]) {
          const spread = f.spread * Math.sin(t * Math.PI) * lerp(f.spreadJitter[0], f.spreadJitter[1], rand());
          const drop = f.leafletDrop[0] + rand() * (f.leafletDrop[1] - f.leafletDrop[0]);
          tip.set(base.x - sa * side * spread + ca * spread * 0.35, base.y - drop, base.z + ca * side * spread + sa * spread * 0.35);
          bend.copy(base).lerp(tip, 0.55);
          bend.y += f.bendLift;
          const w = f.leafletHalfWidth * 1.5;
          const tx = ca * w;
          const tz = sa * w;
          const tipAlong = Math.min(1, t + 0.04);
          push(base, phase, t);
          bend.x += tx; bend.z += tz;
          push(bend, phase, t + 0.02);
          push(tip, phase, tipAlong);
          push(base, phase, t);
          push(tip, phase, tipAlong);
          bend.x -= 2 * tx; bend.z -= 2 * tz;
          push(bend, phase, t + 0.02);
        }
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.computeVertexNormals();
  // Lean the face normals toward the sky: a crown is lit as a canopy, not as scattered cards.
  const n = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < n.count; i++) {
    let x = n.getX(i);
    let y = n.getY(i);
    let z = n.getZ(i);
    if (y < 0) { x = -x; y = -y; z = -z; }
    const l = Math.hypot(x * 0.6, y * 0.6 + 0.4, z * 0.6) || 1;
    n.setXYZ(i, (x * 0.6) / l, (y * 0.6 + 0.4) / l, (z * 0.6) / l);
  }
  g.computeBoundingSphere();
  return g;
}

// ---------------------------------------------------------------------------------------------
// Ground and sea
// ---------------------------------------------------------------------------------------------

export function buildSand() {
  const g = new THREE.PlaneGeometry(GROUND.size[0], GROUND.size[2]);
  g.rotateX(-Math.PI / 2);
  g.translate(GROUND.center[0], GROUND_TOP, GROUND.center[2]);
  return g;
}

export function buildOcean() {
  const g = new THREE.PlaneGeometry(OCEAN.size[0], OCEAN.size[2]);
  g.rotateX(-Math.PI / 2);
  // The sea box overlaps the far sand; lift it clear of depth fighting at 100+ m.
  g.translate(OCEAN.center[0], OCEAN_TOP + 0.04, OCEAN.center[2]);
  return g;
}

// ---------------------------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------------------------

/** Shared animation clock (seconds). Ocean and palm sway read it; it only advances when animated. */
export type TimeUniform = { value: number };

const SAND_PARS = /* glsl */ `
  varying vec3 vSandPos;
  uniform vec3 uSandSun;      // world direction toward the sun
  uniform vec3 uSandSunColor; // glint radiance
  uniform float uSandSunScale; // expected direct diffuse per unit albedo on flat sand
  uniform float uSandDetail;  // 1 = ripples and glints, 0 = albedo only
  float sandHash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  float sandNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(sandHash(i), sandHash(i + vec2(1.0, 0.0)), f.x), mix(sandHash(i + vec2(0.0, 1.0)), sandHash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float sandFbm(vec2 p) {
    float s = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) { s += a * sandNoise(p); p = p * 2.07 + 13.1; a *= 0.5; }
    return s / 0.9375;
  }
  float sandPx;
  float sandGrainFade;
`;

const SAND_COLOR = /* glsl */ `
  {
    vec2 sp = vSandPos.xz;
    sandPx = length(fwidth(sp));
    sandGrainFade = 1.0 - smoothstep(0.01, 0.045, sandPx);
    float broad = sandFbm(sp * 0.22);
    float mid = sandFbm(sp * 1.4 + 3.0);
    float grain = (sandNoise(sp * 48.0) - 0.5) * sandGrainFade + (sandNoise(sp * 9.0) - 0.5) * 0.5;
    diffuseColor.rgb *= 0.8 + 0.36 * broad + 0.16 * (mid - 0.5) + 0.3 * grain;
    // Compacted, slightly cooler patches where the sand was driven over and dried.
    float packed = smoothstep(0.52, 0.76, sandFbm(sp * 0.05 + 7.0));
    diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.84, 0.85, 0.88), packed * 0.75);
    // Pebbles and shell grit (the offline coast-sand scan): sparse dark and pale specks, faded before they alias.
    float gritFade = 1.0 - smoothstep(0.05, 0.16, sandPx);
    float dark = smoothstep(0.6, 0.76, sandNoise(sp * 7.0 + 41.0)) * smoothstep(0.35, 0.6, sandNoise(sp * 3.1 + 5.0));
    float pale = smoothstep(0.68, 0.84, sandNoise(sp * 11.0 + 9.0));
    diffuseColor.rgb *= 1.0 + gritFade * (0.2 * pale - 0.3 * dark);
  }
`;

const SAND_NORMAL = /* glsl */ `
  if (uSandDetail > 0.5) {
    vec2 sp = vSandPos.xz;
    vec2 rd = vec2(0.96, 0.28);
    float phase = dot(sp, rd) * 17.95 + sandNoise(sp * 0.45) * 4.0;
    // Fade by phase change per pixel, so foreshortened ripples never alias into moiré.
    float rippleFade = 1.0 - smoothstep(0.3, 0.9, fwidth(phase));
    // Wind ripples (0.35 m): long gentle stoss, short steep lee.
    float slope = cos(phase) * 0.6 + 0.4 * cos(2.0 * phase);
    vec2 grad = rd * slope * 0.2 * rippleFade
      + (vec2(sandNoise(sp * 3.3), sandNoise(sp * 3.3 + 19.0)) - 0.5) * 0.16 * sandGrainFade;
    vec3 sandN = normalize(vec3(-grad.x, 1.0, -grad.y));
    normal = normalize((viewMatrix * vec4(sandN, 0.0)).xyz);
  }
`;

const SAND_GLINT = /* glsl */ `
  if (uSandDetail > 0.5) {
    // Mica and quartz facets: sparse cells whose random facet catches the sun.
    vec2 cell = floor(vSandPos.xz * 70.0);
    vec3 facet = normalize(vec3(sandHash(cell + 3.1) - 0.5, 1.2, sandHash(cell + 7.7) - 0.5));
    vec3 sandV = normalize(cameraPosition - vSandPos);
    vec3 sandH = normalize(uSandSun + sandV);
    float glint = step(0.94, sandHash(cell)) * pow(max(dot(facet, sandH), 0.0), 120.0) * sandGrainFade;
    // Only where the sun reaches: the direct term already carries the shadow.
    float lit = dot(reflectedLight.directDiffuse, vec3(0.333)) / max(dot(diffuseColor.rgb, vec3(0.333)) * uSandSunScale, 1e-4);
    outgoingLight += uSandSunColor * glint * smoothstep(0.2, 0.7, lit);
  }
`;

export function createSandMaterial(detail: boolean) {
  const material = new THREE.MeshStandardMaterial({ name: "BeachSand", color: new THREE.Color().setRGB(0.136, 0.112, 0.08), roughness: 0.94 });
  const uniforms = {
    uSandSun: { value: SUN_DIRECTION.clone() },
    uSandSunColor: { value: new THREE.Color(SUN_COLOR).multiplyScalar(3) },
    uSandSunScale: { value: (SUN_INTENSITY * SUN_DIRECTION.y) / Math.PI },
    uSandDetail: { value: detail ? 1 : 0 },
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSandPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSandPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${SAND_PARS}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n${SAND_COLOR}`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>\n${SAND_NORMAL}`)
      // Matte grains: at grazing angles the GGX Fresnel lobe mirrors the bright horizon, which dry
      // sand does not do (the offline sand stays flat all the way to the horizon).
      .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\nreflectedLight.indirectSpecular *= 0.12;")
      .replace("#include <opaque_fragment>", `${SAND_GLINT}\n#include <opaque_fragment>`);
  };
  material.customProgramCacheKey = () => "beach-sand-v1";
  return material;
}

export function createOceanMaterial(time: TimeUniform) {
  const p = PALETTE.ocean;
  const material = new THREE.MeshPhysicalMaterial({
    name: "BeachOcean",
    color: linear(p.color),
    roughness: p.roughness,
    metalness: p.metalness,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -4,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vOceanPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvOceanPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vOceanPos;\nuniform float uTime;")
      .replace(
        "#include <normal_fragment_maps>",
        /* glsl */ `#include <normal_fragment_maps>
        {
          vec2 op = vOceanPos.xz;
          // Swell normals fade once a pixel spans a wavelength (the sea is a far sliver).
          float fade = 1.0 - smoothstep(0.6, 4.0, length(fwidth(op)));
          vec2 g = vec2(0.8, 0.6) * cos(dot(op, vec2(0.8, 0.6)) * 0.55 + uTime * 0.9) * 0.09;
          g += vec2(-0.5, 0.85) * cos(dot(op, vec2(-0.5, 0.85)) * 1.1 + uTime * 1.4) * 0.06;
          g += vec2(0.2, -0.98) * cos(dot(op, vec2(0.2, -0.98)) * 2.3 + uTime * 2.1) * 0.035;
          vec3 oceanN = normalize(vec3(-g.x * fade, 1.0, -g.y * fade));
          normal = normalize((viewMatrix * vec4(oceanN, 0.0)).xyz);
        }`
      );
  };
  material.customProgramCacheKey = () => "beach-ocean-v1";
  return material;
}

/** Wind sway for palms: trunks bend from the base, fronds flutter toward their tips. */
function withPalmSway<T extends THREE.MeshStandardMaterial>(material: T, time: TimeUniform, amount: { value: number }) {
  const previous = material.onBeforeCompile;
  const previousKey = material.customProgramCacheKey();
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    shader.uniforms.uTime = time;
    shader.uniforms.uSway = amount;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;\nuniform float uSway;")
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `#include <begin_vertex>
        {
          float trunkW = clamp(uv.y, 0.0, 1.0);
          trunkW *= trunkW;
          float frondW = max(uv.y - 1.0, 0.0);
          float ph = uv.x;
          float gust = sin(uTime * 0.85 + ph) + 0.35 * sin(uTime * 2.05 + ph * 1.7);
          float flutter = sin(uTime * 2.9 + ph * 3.1 + frondW * 4.0);
          transformed.x += uSway * (0.12 * trunkW * gust + 0.06 * frondW * gust);
          transformed.z += uSway * 0.04 * trunkW * gust;
          transformed.y += uSway * 0.05 * frondW * frondW * flutter;
        }`
      );
  };
  material.customProgramCacheKey = () => `${previousKey}|palm-sway`;
  return material;
}

/** Lime render over the plaster preset: faint trowel courses and darker rain streaks. */
function withPlasterWeathering<T extends THREE.MeshStandardMaterial>(material: T) {
  const previous = material.onBeforeCompile;
  const previousKey = material.customProgramCacheKey();
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      /* glsl */ `#include <color_fragment>
      {
        float course = artNoise(vec3(vArtPos.x * 0.35, vArtPos.y * 7.0, vArtPos.z * 0.35));
        float streak = artNoise(vec3(vArtPos.x * 3.5, vArtPos.y * 0.22, vArtPos.z * 3.5));
        diffuseColor.rgb *= (0.92 + 0.16 * course) * (1.0 - 0.2 * smoothstep(0.55, 0.85, streak));
      }`
    );
  };
  material.customProgramCacheKey = () => `${previousKey}|plaster-weathering`;
  return material;
}

export interface BeachMaterials {
  plaster: THREE.MeshStandardMaterial;
  stone: THREE.MeshStandardMaterial;
  iron: THREE.MeshStandardMaterial;
  suvBody: THREE.MeshStandardMaterial;
  suvGlass: THREE.MeshStandardMaterial;
  suvDark: THREE.MeshStandardMaterial;
  suvChrome: THREE.MeshStandardMaterial;
  bark: THREE.MeshStandardMaterial;
  fronds: THREE.MeshStandardMaterial;
  canvas: THREE.MeshStandardMaterial;
  sand: THREE.MeshStandardMaterial;
  ocean: THREE.MeshPhysicalMaterial;
  sky: THREE.ShaderMaterial;
}

export function createBeachMaterials(time: TimeUniform, sway: { value: number }, detail: boolean): BeachMaterials {
  const pal = PALETTE;
  const dust = "#7d6a52";
  return {
    // Weathered lime plaster over terracotta: warm, chalky, dirt rising from the sand.
    plaster: withPlasterWeathering(
      createSurfaceMaterial(
        "plaster",
        { color: new THREE.Color().setRGB(0.13, 0.086, 0.062), roughness: 0.94 },
        { cavity: true, scale: 1.3, albedoVariation: 0.24, tint: "#c98f6e", tintAmount: 0.3, grimeColor: "#4a3a2c", grimeAmount: 0.45, grimeTo: 0.9 }
      )
    ),
    stone: createSurfaceMaterial(
      "stone",
      { color: linear(pal.limestone.color), roughness: pal.limestone.roughness },
      { cavity: true, scale: 4, tint: "#d8c4a0", tintAmount: 0.25, grimeColor: "#5a4a38", grimeAmount: 0.35, grimeTo: 0.6 }
    ),
    iron: new THREE.MeshStandardMaterial({ name: "BeachIron", color: linear(pal.ironRubber.color), roughness: 0.62, metalness: 0.35 }),
    suvBody: withSurfaceDetail(
      new THREE.MeshStandardMaterial({ name: "SuvOlive", color: linear(pal.olive.color), roughness: pal.olive.roughness, metalness: pal.olive.metalness }),
      { cavity: true, scale: 5, albedoVariation: 0.06, roughnessVariation: 0.1, bump: 0, grimeColor: dust, grimeAmount: 0.55, grimeFrom: 0.5, grimeTo: 1.05, cavityStrength: 0.5 }
    ),
    suvGlass: new THREE.MeshStandardMaterial({ name: "SuvGlass", color: linear(pal.glass.color), roughness: 0.08, metalness: pal.glass.metalness }),
    suvDark: withSurfaceDetail(
      new THREE.MeshStandardMaterial({ name: "SuvRubber", color: new THREE.Color().setRGB(0.024, 0.025, 0.023), roughness: 0.82 }),
      { scale: 6, albedoVariation: 0.1, bump: 0, grimeColor: dust, grimeAmount: 0.5, grimeFrom: 0, grimeTo: 0.45 }
    ),
    suvChrome: new THREE.MeshStandardMaterial({ name: "SuvChrome", color: linear(pal.chrome.color), roughness: pal.chrome.roughness, metalness: pal.chrome.metalness }),
    bark: withPalmSway(
      withSurfaceDetail(new THREE.MeshStandardMaterial({ name: "PalmBark", color: linear(pal.bark.color), roughness: pal.bark.roughness }), {
        scale: 3, albedoVariation: 0.22, tint: "#5e4c3c", tintAmount: 0.55, bump: 0.004,
      }),
      time,
      sway
    ),
    fronds: withPalmSway(
      withSurfaceDetail(
        new THREE.MeshStandardMaterial({ name: "PalmFronds", color: linear(pal.frond.color), roughness: pal.frond.roughness, side: THREE.DoubleSide }),
        { scale: 1.5, albedoVariation: 0.28, tint: "#b8b860", tintAmount: 0.45, roughnessVariation: 0.1, bump: 0 }
      ),
      time,
      sway
    ),
    canvas: new THREE.MeshStandardMaterial({ name: "ParasolCanvas", color: linear(pal.canvas.color), roughness: pal.canvas.roughness, side: THREE.DoubleSide }),
    sand: createSandMaterial(detail),
    ocean: createOceanMaterial(time),
    sky: createSkyMaterial(false),
  };
}
