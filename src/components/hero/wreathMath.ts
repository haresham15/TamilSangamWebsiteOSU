/**
 * Home Hero v3: "The Wreath Split" CPU Reference & Shader Math
 * Pure functional mathematical implementation of the zipper deformation,
 * annular wreath mapping, and Bézier mid-pose trajectory (§PRD 7).
 */

import type { WreathParams } from "./homeHero.constants.ts";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

/**
 * Quintic C2-continuous smootherstep: 6x^5 - 15x^4 + 10x^3
 * Guarantees zero velocity and zero acceleration at boundary points (0 and 1).
 */
export function smootherstep(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

/**
 * Standard cubic smoothstep: 3x^2 - 2x^3
 */
export function smoothstep(min: number, max: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - min) / (max - min)));
  return t * t * (3 - 2 * t);
}

/**
 * Zipper stagger progression.
 * At t = 0 (top): unzips from q = 0 to q = (1 - delta).
 * At t = 1 (bottom): unzips from q = delta to q = 1.0.
 */
export function zipperOpenness(t: number, q: number, delta = 0.5): number {
  const clampedQ = Math.max(0, Math.min(1, q));
  const rawG = (clampedQ - delta * t) / (1 - delta);
  const g = Math.max(0, Math.min(1, rawG));
  return smootherstep(g);
}

/**
 * Evaluates the 3D Wreath target position W(s, t).
 * Tied at bottom: when t = 1, phi = PI => sin(PI) = 0 => W.x = Cx = 0 for both halves!
 */
export function evalWreathTarget(
  s: number,
  t: number,
  params: WreathParams,
  center: Vec2 = { x: 0, y: 0 }
): Vec3 {
  const phi = params.phiGap + t * (Math.PI - params.phiGap);
  const safeS = Math.max(s, 1e-5);
  const r = params.rIn + Math.pow(safeS, 0.85) * (params.rOut - params.rIn);

  // Depth curling: tips curl toward camera (+Z), belly bows back (-Z)
  const wz = params.zTip * Math.pow(1 - t, 2) - params.zBelly * Math.sin(Math.PI * t);

  return {
    x: center.x + r * Math.sin(phi),
    y: center.y + params.eps * r * Math.cos(phi),
    z: wz,
  };
}

/**
 * Evaluates the Bézier mid-pose M(s, t) that prevents inner-collapse
 * and pushes the half outward (+X) and backward (-Z).
 */
export function evalMidPose(
  F: Vec3,
  s: number,
  t: number,
  halfWidth: number,
  viewHeight: number,
  params: WreathParams
): Vec3 {
  const safeS = Math.max(s, 1e-5);
  const pushX = params.ax * halfWidth * Math.pow(safeS, 1.2) * Math.sqrt(Math.max(0, 1 - t));
  const pushZ = -params.az * viewHeight * Math.sin(Math.PI * Math.min(1, 1.2 * t)) * (0.4 + 0.6 * safeS);

  return {
    x: F.x + pushX,
    y: F.y,
    z: F.z + pushZ,
  };
}

/**
 * Composite Quadratic Bézier Deformation P(s, t, e).
 * Smoothly blends F -> M -> W as local openness e advances from 0 -> 1.
 */
export function evalDeformedCenterline(
  F: Vec3,
  s: number,
  t: number,
  q: number,
  halfWidth: number,
  viewHeight: number,
  params: WreathParams,
  center: Vec2 = { x: 0, y: 0 }
): Vec3 {
  const e = zipperOpenness(t, q, params.delta);
  const W = evalWreathTarget(s, t, params, center);
  const M = evalMidPose(F, s, t, halfWidth, viewHeight, params);

  const u = 1 - e;
  // Quadratic Bézier: P = (1-e)^2 * F + 2(1-e)e * M + e^2 * W
  return {
    x: u * u * F.x + 2 * u * e * M.x + e * e * W.x,
    y: u * u * F.y + 2 * u * e * M.y + e * e * W.y,
    z: u * u * F.z + 2 * u * e * M.z + e * e * W.z,
  };
}

/**
 * Rigid cross-section tangent rotation & radius scaling.
 */
export function evalDeformedTubeVertex(
  position: Vec3,
  centerline: Vec3,
  s: number,
  t: number,
  q: number,
  halfWidth: number,
  viewHeight: number,
  params: WreathParams,
  isSeamCap = false
): { position: Vec3; normalMatrix: { cosB: number; sinB: number } } {
  const e = zipperOpenness(t, q, params.delta);
  const phi = params.phiGap + t * (Math.PI - params.phiGap);
  
  // Tangent rotation from horizontal/flat to annular tangent
  const beta = smootherstep(e) * (Math.PI * 0.5 - phi);
  const cosB = Math.cos(beta);
  const sinB = Math.sin(beta);

  // Local offset from centerline
  const offX = position.x - centerline.x;
  const offY = position.y - centerline.y;
  const offZ = position.z - centerline.z;

  // 2D rotation of tube cross-section
  const rotOffX = cosB * offX - sinB * offY;
  const rotOffY = sinB * offX + cosB * offY;

  // Radius scaling: thin during annular compression and fade outer columns
  const outerFade = 1.0 - e * params.fOut * smoothstep(0.55, 1.0, s);
  let k = (1.0 + e * (params.kw - 1.0)) * outerFade;

  // Seam bead caps expand from 0 as zipper opens
  if (isSeamCap) {
    k *= smoothstep(0.0, 0.2, e);
  }

  const P = evalDeformedCenterline(centerline, s, t, q, halfWidth, viewHeight, params);

  return {
    position: {
      x: P.x + k * rotOffX,
      y: P.y + k * rotOffY,
      z: P.z + k * offZ,
    },
    normalMatrix: { cosB, sinB },
  };
}
