// Masonry for the Join gate and its flanking walls: dressed limestone gate piers built
// course by course (real V-jointed mortar lines, moulded base and cornice, turned ball
// finial), brick perimeter piers, a coped dwarf wall, and a world-space brick-course
// shader layer for surfaces too large to build block by block.
import * as THREE from "three";
import { chamferedBox, latheProfile, mergeParts, seeded, type Part } from "@/gl/art/geometry";
import { bakeVertexAO } from "@/gl/art/vertexAO";

export const PIER_X = 3.85;
/** Top of the ball finial; the mortarboard prop sits here (CampusProps). */
export const PIER_FINIAL_TOP = 5.91;

/**
 * Dressed limestone gate pier, base at y = 0, centred on x/z. Ashlar courses alternate the
 * position of their vertical joint; every block is chamfered so joints read as cut V-grooves.
 */
export function buildGatePier(seed = 1) {
  const rand = seeded(seed);
  const parts: Part[] = [];
  const add = (g: THREE.BufferGeometry, p: [number, number, number]) => parts.push({ geometry: g, position: p });

  // Plinth and base moulding.
  add(chamferedBox(1.38, 0.44, 1.38, 0.03), [0, 0.22, 0]);
  add(chamferedBox(1.27, 0.1, 1.27, 0.025), [0, 0.49, 0]);
  add(chamferedBox(1.18, 0.06, 1.18, 0.015), [0, 0.57, 0]);

  // Shaft courses.
  const shaftBottom = 0.6;
  const shaftTop = 4.78;
  const courses = 11;
  const ch = (shaftTop - shaftBottom) / courses;
  const W = 1.1;
  for (let c = 0; c < courses; c++) {
    const y = shaftBottom + ch * (c + 0.5);
    const split = c % 2 === 0 ? 0.6 : 0.5;
    const inset = (rand() - 0.5) * 0.008;
    const w = W + inset;
    // Two blocks across the front/back faces; joints staggered course to course.
    const a = w * split;
    const b = w - a;
    const flip = c % 2 === 0 ? 1 : -1;
    add(chamferedBox(a - 0.006, ch - 0.012, w, 0.022), [flip * (-w / 2 + a / 2), y, 0]);
    add(chamferedBox(b - 0.006, ch - 0.012, w, 0.022), [flip * (w / 2 - b / 2), y, 0]);
  }
  // Recessed core so the joints never show light through.
  add(new THREE.BoxGeometry(W - 0.04, shaftTop - shaftBottom, W - 0.04), [0, (shaftTop + shaftBottom) / 2, 0]);

  // Cornice: necking, fascia, projecting corona, blocking course.
  add(chamferedBox(1.16, 0.07, 1.16, 0.012), [0, 4.815, 0]);
  add(chamferedBox(1.27, 0.12, 1.27, 0.02), [0, 4.91, 0]);
  add(chamferedBox(1.42, 0.17, 1.42, 0.028), [0, 5.055, 0]);
  add(chamferedBox(1.34, 0.08, 1.34, 0.015), [0, 5.18, 0]);
  add(chamferedBox(1.12, 0.17, 1.12, 0.02), [0, 5.305, 0]);

  // Turned ball finial on a square-ish plinth.
  add(chamferedBox(0.5, 0.06, 0.5, 0.012), [0, 5.42, 0]);
  add(
    latheProfile(
      [
        [0.21, 0],
        [0.21, 0.035],
        [0.14, 0.06],
        [0.095, 0.1],
        [0.1, 0.13],
        [0.17, 0.18],
        [0.215, 0.255],
        [0.2, 0.34],
        [0.13, 0.415],
        [0.0, 0.44],
      ],
      { radialSegments: 28, smooth: true, samples: 28 }
    ),
    [0, 5.45, 0]
  );

  return bakeVertexAO(mergeParts(parts), {
    ground: { y: 0, height: 0.9, strength: 0.55 },
    bands: [
      { y: 0.44, width: 0.06, strength: 0.6 },
      { y: 0.6, width: 0.06, strength: 0.6 },
      { y: 4.78, width: 0.07, strength: 0.65 },
      { y: 5.39, width: 0.05, strength: 0.6 },
    ],
    smooth: 1,
  });
}

/** Small bronze dedication plate set into the left pier's front face (no inscription). */
export function buildPierPlaque() {
  return mergeParts([
    { geometry: chamferedBox(0.78, 0.5, 0.03, 0.008), position: [0, 0, 0] },
    { geometry: chamferedBox(0.7, 0.42, 0.02, 0.004), position: [0, 0, 0.018] },
    ...[-0.29, 0.29].flatMap((x) => [-0.17, 0.17].map((y) => ({ geometry: latheProfile([[0.016, 0], [0.012, 0.012], [0, 0.016]], { radialSegments: 10 }), position: [x, y, 0.016] as [number, number, number], rotation: [Math.PI / 2, 0, 0] as [number, number, number] }))),
  ]);
}

/** Brick perimeter pier body (brick only), base at y = 0. */
export function buildBrickPierBody(height = 2.6) {
  return mergeParts([{ geometry: chamferedBox(0.78, height, 0.78, 0.012), position: [0, 0.3 + height / 2, 0] }]);
}

/** Limestone trim for a brick pier: plinth, cap and ball finial, base at y = 0. */
export function buildPierTrim(height = 2.6) {
  const top = 0.3 + height;
  return mergeParts([
    { geometry: chamferedBox(0.9, 0.3, 0.9, 0.02), position: [0, 0.15, 0] },
    { geometry: chamferedBox(0.84, 0.06, 0.84, 0.012), position: [0, top + 0.03, 0] },
    { geometry: chamferedBox(0.98, 0.12, 0.98, 0.02), position: [0, top + 0.12, 0] },
    { geometry: chamferedBox(0.86, 0.06, 0.86, 0.012), position: [0, top + 0.21, 0] },
    { geometry: latheProfile([[0.12, 0], [0.08, 0.05], [0.07, 0.08], [0.13, 0.15], [0.14, 0.22], [0.09, 0.29], [0, 0.31]], { radialSegments: 20, smooth: true, samples: 18 }), position: [0, top + 0.24, 0] },
  ]);
}

/** Dwarf wall with a projecting coping between x0 and x1 (world), base at y = 0. */
export function wallParts(x0: number, x1: number, height = 0.95): Part[] {
  const len = x1 - x0;
  const cx = (x0 + x1) / 2;
  return [
    { geometry: chamferedBox(len, height, 0.42, 0.015), position: [cx, height / 2, 0] },
    { geometry: chamferedBox(len + 0.02, 0.1, 0.52, 0.02), position: [cx, height + 0.05, 0] },
  ];
}

// ---------------------------------------------------------------------------
// Brick courses as a shader layer (stretcher bond, world space), chained after the kit's
// withSurfaceDetail patch. Joints fade out where a brick covers too few pixels.
// ---------------------------------------------------------------------------
const BRICK_PARS = /* glsl */ `
  uniform vec4 uBrick;      // brick length, course height, mortar width, colour jitter
  uniform vec3 uMortar;
  float jnBrickJoint;
  float jnBrickHash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
`;

const BRICK_COLOR = /* glsl */ `
  {
    vec3 wN = normalize((vec4(vNormal, 0.0) * viewMatrix).xyz);
    vec2 bp = abs(wN.x) > abs(wN.z) ? vArtPos.zy : vArtPos.xy;
    if (abs(wN.y) > 0.7) bp = vArtPos.xz;
    float row = floor(bp.y / uBrick.y);
    float u = bp.x / uBrick.x + mod(row, 2.0) * 0.5;
    vec2 cell = vec2(floor(u), row);
    vec2 f = vec2(fract(u) * uBrick.x, fract(bp.y / uBrick.y) * uBrick.y);
    float m = uBrick.z;
    float jx = min(f.x, uBrick.x - f.x);
    float jy = min(f.y, uBrick.y - f.y);
    float aa = max(fwidth(bp.x), fwidth(bp.y));
    float joint = 1.0 - smoothstep(m * 0.5 - aa, m * 0.5 + aa, min(jx, jy));
    joint *= 1.0 - smoothstep(0.01, 0.03, aa);
    float h = jnBrickHash(cell);
    diffuseColor.rgb *= 1.0 + (h - 0.5) * uBrick.w;
    diffuseColor.rgb = mix(diffuseColor.rgb, uMortar, joint);
    jnBrickJoint = joint;
  }
`;

/** Adds stretcher-bond brick courses on top of a withSurfaceDetail material (in place). */
export function withBrickCourses<T extends THREE.MeshStandardMaterial>(
  material: T,
  { length = 0.215, course = 0.075, mortar = 0.011, jitter = 0.28, mortarColor = "#b8ab95" } = {}
) {
  const base = material.onBeforeCompile;
  const uniforms = {
    uBrick: { value: new THREE.Vector4(length, course, mortar, jitter) },
    uMortar: { value: new THREE.Color(mortarColor) },
  };
  material.onBeforeCompile = (shader, renderer) => {
    base.call(material, shader, renderer);
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${BRICK_PARS}`)
      // Runs before the kit's colour block, so its noise and grime sit over the bricks.
      .replace("#include <color_fragment>", `#include <color_fragment>\n${BRICK_COLOR}`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 1.0, jnBrickJoint * 0.6);`);
  };
  material.customProgramCacheKey = () => "join-brick-v1";
  material.needsUpdate = true;
  return material;
}
