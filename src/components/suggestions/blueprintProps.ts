// Drafting-table props for the blueprint hero: the brass coin (PRD: the five-rupee coin at
// the feeder junction), a brass compass, rolled master scrolls, a pencil and a triangular
// scale. All are static, so every part is baked into world space and merged per material:
// five draws for the whole set, with vertex AO baked on the merged result.
import * as THREE from "three";
import { chamferedBox, latheProfile, mergeParts } from "@/gl/art/geometry";
import { bakeVertexAO } from "@/gl/art/vertexAO";
import type { ContactSpot } from "@/gl/art/ContactShadow";

type Vec3 = [number, number, number];

export type PropMaterialKey = "brass" | "steel" | "paper" | "lacquer" | "core";

interface Placement {
  position: Vec3;
  yaw: number;
  /** Uniform scale for the whole prop. */
  scale?: number;
}

const LOCAL = new THREE.Matrix4();
const GROUP = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const E = new THREE.Euler();
const V = new THREE.Vector3();
const ONE = new THREE.Vector3(1, 1, 1);
const S = new THREE.Vector3();

/** Applies a part's local transform, then its prop's placement. */
function place(geometry: THREE.BufferGeometry, group: Placement, position: Vec3 = [0, 0, 0], rotation: Vec3 = [0, 0, 0]) {
  LOCAL.compose(V.set(...position), Q.setFromEuler(E.set(...rotation)), ONE);
  GROUP.compose(V.set(...group.position), Q.setFromEuler(E.set(0, group.yaw, 0)), S.setScalar(group.scale ?? 1));
  geometry.applyMatrix4(LOCAL);
  geometry.applyMatrix4(GROUP);
  return geometry;
}

/** Narrows a bar along z (compass legs taper toward the points). */
function taperX(geometry: THREE.BufferGeometry, z0: number, z1: number, s0: number, s1: number) {
  const p = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const t = THREE.MathUtils.clamp((p.getZ(i) - z0) / (z1 - z0), 0, 1);
    p.setX(i, p.getX(i) * THREE.MathUtils.lerp(s0, s1, t));
  }
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * The visible end of a rolled sheet: an Archimedean spiral ribbon in the YZ plane. Inner
 * turns stand proud of the outer ones, as a hand-rolled drawing telescopes.
 */
function spiralEnd(r0: number, r1: number, turns: number, facing: 1 | -1, telescope = 0.05) {
  const steps = Math.round(turns * 26);
  const ribbon = ((r1 - r0) / turns) * 0.42;
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const a = f * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * f;
    const x = facing * telescope * (1 - f);
    const c = Math.cos(a), s = Math.sin(a);
    pos.push(x, c * (r - ribbon / 2), s * (r - ribbon / 2), x, c * (r + ribbon / 2), s * (r + ribbon / 2));
    if (i < steps) {
      const k = i * 2;
      if (facing > 0) idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
      else idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export interface PropLayout {
  coin: Placement;
  compass: Placement;
  scrolls: Placement;
  pencil: Placement;
  ruler: Placement;
}

export const PROP_LAYOUT: PropLayout = {
  // The coin marks the junction of the main feeder and the South Gate branch (PRD §2.1),
  // moved 1.8 m south of the PRD's [3.6, 4.4], which lies under the east stand.
  coin: { position: [3.6, 0.014, 6.2], yaw: 0.42, scale: 1.5 },
  // Foreground, south-west of the open end, legs reaching west.
  compass: { position: [-3.0, 0, 8.6], yaw: -Math.PI / 2 - 0.25, scale: 1.5 },
  scrolls: { position: [9.4, 0, -3.6], yaw: 0.62 },
  pencil: { position: [7.6, 0, 3.4], yaw: 0.28 },
  ruler: { position: [7.4, 0, 0.6], yaw: -0.12 },
};

export function buildProps(layout: PropLayout = PROP_LAYOUT, detail: 0 | 1 = 0) {
  const radial = detail === 0 ? 40 : 24;
  const parts: Record<PropMaterialKey, THREE.BufferGeometry[]> = { brass: [], steel: [], paper: [], lacquer: [], core: [] };

  // --- Coin: raised rim, recessed field, small central boss. ---
  parts.brass.push(
    place(
      latheProfile(
        [[0, 0], [0.52, 0], [0.55, 0.012], [0.55, 0.058], [0.53, 0.07], [0.49, 0.07], [0.475, 0.056], [0.2, 0.056], [0.185, 0.066], [0, 0.066]],
        { radialSegments: radial, capped: false }
      ),
      layout.coin
    )
  );

  // --- Compass: hinge head, handle, two tapered legs, needle and lead, spindle and wheel. ---
  const cp = layout.compass;
  const legLength = 2.2;
  const spread = 0.24;
  parts.brass.push(
    place(latheProfile([[0, 0], [0.2, 0], [0.22, 0.02], [0.22, 0.07], [0.2, 0.09], [0.1, 0.09], [0.09, 0.13], [0, 0.13]], { radialSegments: 28, capped: false }), cp),
    place(latheProfile([[0, 0], [0.05, 0], [0.066, 0.06], [0.05, 0.36], [0.034, 0.44], [0, 0.45]], { radialSegments: 14, smooth: true, samples: 16, capped: false }), cp, [0, 0.06, -0.14], [-Math.PI / 2, 0, 0])
  );
  for (const sign of [-1, 1] as const) {
    const leg = taperX(chamferedBox(0.11, 0.05, legLength, 0.012), -legLength / 2, legLength / 2, 1, 0.5);
    leg.translate(0, 0.045, legLength / 2 + 0.1);
    leg.rotateY(sign * spread);
    parts.brass.push(place(leg, cp));
    const collar = new THREE.CylinderGeometry(0.042, 0.042, 0.14, 12);
    collar.rotateX(Math.PI / 2);
    collar.translate(0, 0.045, legLength + 0.14);
    collar.rotateY(sign * spread);
    parts.brass.push(place(collar, cp));
    const point = new THREE.CylinderGeometry(sign < 0 ? 0.004 : 0.008, 0.017, 0.28, 8);
    point.rotateX(Math.PI / 2);
    point.translate(0, 0.04, legLength + 0.34);
    point.rotateY(sign * spread);
    parts[sign < 0 ? "steel" : "core"].push(place(point, cp));
  }
  const spindleZ = 1.0;
  const spindleHalf = Math.sin(spread) * spindleZ;
  const spindle = new THREE.CylinderGeometry(0.02, 0.02, spindleHalf * 2, 10);
  spindle.rotateZ(Math.PI / 2);
  parts.steel.push(place(spindle, cp, [0, 0.06, spindleZ]));
  parts.brass.push(
    place(latheProfile([[0, -0.04], [0.11, -0.04], [0.13, -0.025], [0.13, 0.025], [0.11, 0.04], [0, 0.04]], { radialSegments: 24, capped: false }), cp, [0, 0.13, spindleZ], [0, 0, Math.PI / 2])
  );
  parts.steel.push(place(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 16), cp, [0, 0.145, 0]));

  // --- Rolled master scrolls, tied with brass bands. ---
  const sp = layout.scrolls;
  const scrolls: { r: number; length: number; at: Vec3; twist: number }[] = [
    { r: 0.22, length: 4.2, at: [0, 0.22, 0], twist: 0 },
    { r: 0.18, length: 3.8, at: [0.3, 0.18, 0.44], twist: 1.3 },
    { r: 0.16, length: 3.5, at: [0.12, 0.52, 0.22], twist: 2.1 },
  ];
  for (const s of scrolls) {
    const tube = new THREE.CylinderGeometry(s.r, s.r, s.length, radial, 1, true);
    tube.rotateZ(Math.PI / 2);
    parts.paper.push(place(tube, sp, s.at));
    for (const facing of [-1, 1] as const) {
      const end = spiralEnd(s.r * 0.18, s.r * 0.99, 3.5, facing);
      end.rotateX(s.twist);
      parts.paper.push(place(end, sp, [s.at[0] + (facing * s.length) / 2, s.at[1], s.at[2]]));
      const core = new THREE.CircleGeometry(s.r * 0.97, 20);
      core.rotateY((facing * Math.PI) / 2);
      parts.core.push(place(core, sp, [s.at[0] + facing * (s.length / 2 - 0.02), s.at[1], s.at[2]]));
    }
    for (const t of [-0.3, 0.3]) {
      const band = new THREE.CylinderGeometry(s.r * 1.03, s.r * 1.03, 0.07, radial, 1, true);
      band.rotateZ(Math.PI / 2);
      parts.brass.push(place(band, sp, [s.at[0] + t * s.length, s.at[1], s.at[2]]));
    }
  }

  // --- Pencil: hexagonal lacquered barrel, sharpened cedar cone, graphite, brass ferrule. ---
  const pc = layout.pencil;
  const barrel = new THREE.CylinderGeometry(0.045, 0.045, 2.3, 6);
  barrel.rotateX(Math.PI / 2);
  parts.lacquer.push(place(barrel, pc, [0, 0.039, 0], [0, 0, Math.PI / 6]));
  const cone = new THREE.CylinderGeometry(0.014, 0.045, 0.2, 12);
  cone.rotateX(-Math.PI / 2);
  parts.paper.push(place(cone, pc, [0, 0.039, -1.25]));
  const lead = new THREE.CylinderGeometry(0.002, 0.014, 0.07, 8);
  lead.rotateX(-Math.PI / 2);
  parts.core.push(place(lead, pc, [0, 0.039, -1.385]));
  const ferrule = new THREE.CylinderGeometry(0.047, 0.047, 0.12, 16);
  ferrule.rotateX(Math.PI / 2);
  parts.brass.push(place(ferrule, pc, [0, 0.04, 1.21]));
  const eraser = new THREE.CylinderGeometry(0.043, 0.044, 0.09, 16);
  eraser.rotateX(Math.PI / 2);
  parts.core.push(place(eraser, pc, [0, 0.04, 1.315]));

  // --- Triangular architect's scale with eased arrises. ---
  const tri = new THREE.Shape();
  tri.moveTo(-0.14, 0);
  tri.lineTo(0.14, 0);
  tri.lineTo(0, 0.24);
  tri.closePath();
  const scale = new THREE.ExtrudeGeometry(tri, { depth: 3.8, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 1, curveSegments: 1 });
  scale.translate(0, 0.012, -1.9);
  parts.paper.push(place(scale, layout.ruler));

  const geometries = {} as Record<PropMaterialKey, THREE.BufferGeometry>;
  for (const key of Object.keys(parts) as PropMaterialKey[]) {
    const merged = mergeParts(parts[key].map((geometry) => ({ geometry })));
    bakeVertexAO(merged, { cavity: 0.6, edges: 0.5, ground: { y: 0, height: 0.16, strength: 0.8 } });
    geometries[key] = merged;
  }
  return geometries;
}

/** Soft contact shadows under each prop (one instanced draw). */
export function propContactSpots(layout: PropLayout = PROP_LAYOUT): ContactSpot[] {
  return [
    { position: [layout.coin.position[0], layout.coin.position[1], layout.coin.position[2]], size: [1.35 * (layout.coin.scale ?? 1), 1.35 * (layout.coin.scale ?? 1)], opacity: 0.7 },
    {
      // The legs run 2.6 m along the compass's local +z from the hinge.
      position: [
        layout.compass.position[0] + Math.sin(layout.compass.yaw) * 1.3 * (layout.compass.scale ?? 1),
        0,
        layout.compass.position[2] + Math.cos(layout.compass.yaw) * 1.3 * (layout.compass.scale ?? 1),
      ],
      size: [1.1 * (layout.compass.scale ?? 1), 3.0 * (layout.compass.scale ?? 1)],
      rotation: layout.compass.yaw,
      opacity: 0.55,
    },
    { position: [layout.scrolls.position[0] + 0.15, 0, layout.scrolls.position[2] + 0.2], size: [4.8, 1.5], rotation: layout.scrolls.yaw, opacity: 0.75 },
    { position: [layout.pencil.position[0], 0, layout.pencil.position[2]], size: [0.32, 2.9], rotation: layout.pencil.yaw, opacity: 0.6 },
    { position: [layout.ruler.position[0], 0, layout.ruler.position[2]], size: [0.6, 4.2], rotation: layout.ruler.yaw, opacity: 0.6 },
  ];
}
