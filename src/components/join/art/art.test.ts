import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { buildGateLeaf, buildOverthrow, mirrorX, LEAF_WIDTH, LEAF_HEIGHT, ARCH } from "./ironwork";
import { buildGatePier, PIER_FINIAL_TOP } from "./masonry";
import { buildHall } from "./hall";
import { buildCanopyCards } from "./foliage";
import { buildArchLetters } from "./CastLettering";
import { canopiesFor, TREES } from "./layout";

function allFinite(g: THREE.BufferGeometry) {
  const a = g.attributes.position.array as Float32Array;
  for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) return false;
  return true;
}

/** Share of triangles whose stored normal agrees with their winding. */
function windingAgreement(g: THREE.BufferGeometry) {
  const p = g.attributes.position as THREE.BufferAttribute;
  const n = g.attributes.normal as THREE.BufferAttribute;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), fn = new THREE.Vector3(), vn = new THREE.Vector3();
  let agree = 0;
  let total = 0;
  for (let t = 0; t < p.count; t += 3) {
    a.fromBufferAttribute(p, t);
    b.fromBufferAttribute(p, t + 1);
    c.fromBufferAttribute(p, t + 2);
    fn.subVectors(b, a).cross(c.clone().sub(a));
    if (fn.lengthSq() < 1e-14) continue;
    vn.fromBufferAttribute(n, t).add(c.fromBufferAttribute(n, t + 1)).add(b.fromBufferAttribute(n, t + 2));
    total++;
    if (fn.dot(vn) > 0) agree++;
  }
  return agree / total;
}

describe("Join art pass geometry", () => {
  it("builds a gate leaf inside its hinge-local envelope, one merged geometry", () => {
    const g = buildGateLeaf({ lock: true });
    expect(g.index).toBeNull();
    expect(allFinite(g)).toBe(true);
    g.computeBoundingBox();
    const bb = g.boundingBox!;
    expect(bb.min.x).toBeGreaterThan(-0.15);
    expect(bb.max.x).toBeLessThan(LEAF_WIDTH + 0.1);
    expect(bb.min.y).toBeGreaterThan(-0.05);
    // Finials may rise above the leaf, but must clear the transom (world y 5.15, leaf base 0.1).
    expect(bb.max.y).toBeLessThan(ARCH.transomY - 0.1 - 0.05);
    expect(bb.max.y).toBeGreaterThan(LEAF_HEIGHT * 0.95);
    g.dispose();
  });

  it("mirrors the right leaf without turning its faces inside out", () => {
    const left = buildGateLeaf();
    const right = mirrorX(buildGateLeaf());
    expect(windingAgreement(right)).toBeCloseTo(windingAgreement(left), 2);
    right.computeBoundingBox();
    expect(right.boundingBox!.max.x).toBeLessThan(0.15);
    left.dispose();
    right.dispose();
  });

  it("builds the overthrow, piers and hall as finite geometry", () => {
    const over = buildOverthrow();
    expect(allFinite(over)).toBe(true);
    const pier = buildGatePier(5);
    expect(pier.attributes.aCavity).toBeDefined();
    pier.computeBoundingBox();
    // The mortarboard prop is positioned on the finial top.
    expect(pier.boundingBox!.max.y).toBeCloseTo(PIER_FINIAL_TOP, 1);
    const hall = buildHall();
    for (const geo of Object.values(hall)) {
      expect(geo.attributes.position.count).toBeGreaterThan(0);
      expect(allFinite(geo)).toBe(true);
    }
  });

  it("emits one card instance per requested canopy card", () => {
    const g = buildCanopyCards(canopiesFor(TREES, 12));
    expect(g.instanceCount).toBe(TREES.length * 12);
    expect(g.boundingSphere!.radius).toBeGreaterThan(10);
  });

  it("sets the eleven letters of TAMIL SANGAM symmetrically on the arch", () => {
    const g = buildArchLetters(ARCH.outer + 0.06, ARCH.centerY);
    g.computeBoundingBox();
    const bb = g.boundingBox!;
    expect(Math.abs(bb.min.x + bb.max.x)).toBeLessThan(0.25);
    expect(bb.min.y).toBeGreaterThan(ARCH.transomY);
  });
});
