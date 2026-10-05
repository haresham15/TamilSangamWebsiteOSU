"use client";

import * as THREE from "three";

/**
 * Creates a single merged Cell BufferGeometry with 5 distinct parts (PRD §4.3).
 *
 * Cell Dimensions: width = 0.62 su, height = 0.92 su
 * Split line (hinge): y = 0, z = 0
 *
 * Part mapping:
 *   0: Static top quad (z = -0.003, shows nxt glyph top half)
 *   1: Static bottom quad (z = -0.003, shows cur glyph bottom half)
 *   2: Flap front face (z = 0, hinged about y = 0, shows cur glyph top half)
 *   3: Flap back face (z = 0, hinged about y = 0, shows nxt glyph bottom half)
 *   4: Cell housing frame and hinge pins (solid dark dielectric finish)
 */
export function createCellGeometry(): THREE.BufferGeometry {
  const w = 0.62;
  const h = 0.92;
  const hw = w / 2;   // 0.31
  const hh = h / 2;   // 0.46
  const eps = 0.003;  // Static recess offset behind hinge plane (PRD §4.3)

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const parts: number[] = [];
  const indices: number[] = [];

  let vertexOffset = 0;

  function addQuad(
    v0: [number, number, number],
    v1: [number, number, number],
    v2: [number, number, number],
    v3: [number, number, number],
    norm: [number, number, number],
    uv0: [number, number],
    uv1: [number, number],
    uv2: [number, number],
    uv3: [number, number],
    partId: number
  ) {
    // 4 vertices
    positions.push(...v0, ...v1, ...v2, ...v3);
    normals.push(...norm, ...norm, ...norm, ...norm);
    uvs.push(...uv0, ...uv1, ...uv2, ...uv3);
    parts.push(partId, partId, partId, partId);

    // 2 triangles: (0, 1, 2) and (0, 2, 3)
    indices.push(
      vertexOffset,
      vertexOffset + 1,
      vertexOffset + 2,
      vertexOffset,
      vertexOffset + 2,
      vertexOffset + 3
    );
    vertexOffset += 4;
  }

  // --- Part 0: Static Top Quad (y ∈ [0, hh], z = -eps) ---
  addQuad(
    [-hw, 0, -eps],
    [hw, 0, -eps],
    [hw, hh, -eps],
    [-hw, hh, -eps],
    [0, 0, 1],
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    0
  );

  // --- Part 1: Static Bottom Quad (y ∈ [-hh, 0], z = -eps) ---
  addQuad(
    [-hw, -hh, -eps],
    [hw, -hh, -eps],
    [hw, 0, -eps],
    [-hw, 0, -eps],
    [0, 0, 1],
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    1
  );

  // --- Part 2: Moving Flap Front Face (y ∈ [0, hh], z = 0, normal +Z) ---
  addQuad(
    [-hw, 0, 0],
    [hw, 0, 0],
    [hw, hh, 0],
    [-hw, hh, 0],
    [0, 0, 1],
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    2
  );

  // --- Part 3: Moving Flap Back Face (y ∈ [0, hh], z = 0, normal -Z) ---
  // uv.y = 1.0 - (y/hh) so it reads upright after 180-deg flip around X axis (PRD §4.3)
  addQuad(
    [hw, 0, 0],
    [-hw, 0, 0],
    [-hw, hh, 0],
    [hw, hh, 0],
    [0, 0, -1],
    [1, 1], // at y=0, uv.y = 1
    [0, 1],
    [0, 0], // at y=hh, uv.y = 0
    [1, 0],
    3
  );

  // --- Part 4: Cell Housing Bezel & Hinge Pins ---
  const frameThickness = 0.02;
  const frameDepth = 0.04;
  const frameZ = -eps - frameDepth / 2;

  // Top Housing Rim
  addQuad(
    [-hw - frameThickness, hh, frameZ],
    [hw + frameThickness, hh, frameZ],
    [hw + frameThickness, hh + frameThickness, frameZ],
    [-hw - frameThickness, hh + frameThickness, frameZ],
    [0, 0, 1],
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    4
  );

  // Bottom Housing Rim
  addQuad(
    [-hw - frameThickness, -hh - frameThickness, frameZ],
    [hw + frameThickness, -hh - frameThickness, frameZ],
    [hw + frameThickness, -hh, frameZ],
    [-hw - frameThickness, -hh, frameZ],
    [0, 0, 1],
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    4
  );

  // Left Housing Rim
  addQuad(
    [-hw - frameThickness, -hh, frameZ],
    [-hw, -hh, frameZ],
    [-hw, hh, frameZ],
    [-hw - frameThickness, hh, frameZ],
    [0, 0, 1],
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    4
  );

  // Right Housing Rim
  addQuad(
    [hw, -hh, frameZ],
    [hw + frameThickness, -hh, frameZ],
    [hw + frameThickness, hh, frameZ],
    [hw, hh, frameZ],
    [0, 0, 1],
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    4
  );

  // Left & Right Hinge Pin Discs (at y = 0)
  const pinRadius = 0.022;
  const pinSegments = 8;
  const pinPositions: [number, number][] = [
    [-hw - frameThickness / 2, 0],
    [hw + frameThickness / 2, 0],
  ];

  pinPositions.forEach(([px, py]) => {
    const centerIdx = vertexOffset;
    positions.push(px, py, 0.01);
    normals.push(0, 0, 1);
    uvs.push(0.5, 0.5);
    parts.push(4);
    vertexOffset++;

    for (let s = 0; s <= pinSegments; s++) {
      const theta = (s / pinSegments) * Math.PI * 2;
      const sx = px + Math.cos(theta) * pinRadius;
      const sy = py + Math.sin(theta) * pinRadius;
      positions.push(sx, sy, 0.01);
      normals.push(0, 0, 1);
      uvs.push(0.5 + Math.cos(theta) * 0.5, 0.5 + Math.sin(theta) * 0.5);
      parts.push(4);

      if (s > 0) {
        indices.push(centerIdx, vertexOffset - 1, vertexOffset);
      }
      vertexOffset++;
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("aPart", new THREE.Float32BufferAttribute(parts, 1));
  geometry.setIndex(indices);

  return geometry;
}
