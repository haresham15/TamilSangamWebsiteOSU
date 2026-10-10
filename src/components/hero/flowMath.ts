/**
 * Peel & Flow — Core Mathematical Engine (§PRD Home Hero)
 * 
 * Implements pure, analytic, closed-form functions for:
 * 1. Feed schedule f_k(p) with seam-first stagger and arrival settle ripple
 * 2. Tail peel-lift kinematics out of the weave plane
 * 3. Wreath lane geometry (crossed wreath arcs) and bisection length-matching solver
 * 4. Zero-twist camera-aligned tube framing vectors
 * 5. Camera vertical descent truck
 * 
 * Strictly deterministic and reversible: pure functions of scroll progress p and time t.
 */

import * as THREE from "three";

export const WORLD_HV = 7.567; // 2 * 12 * tan(17.5 deg) at FOV 35, Z 12
export const STRAND_COUNT = 7; // Strands per hemisphere
export const WREATH_GAP_RAD = 14 * (Math.PI / 180); // 14 deg open gap at top (~0.2443 rad)
export const WREATH_CROSS_RAD = 8 * (Math.PI / 180); // 8 deg crossed tie (~0.1396 rad)
export const WREATH_CY = -1.2 * WORLD_HV; // -9.08 world units
export const WREATH_R_IN = 0.32 * WORLD_HV; // ~2.42 world units
export const WREATH_BAND_WIDTH = 0.20 * WORLD_HV; // ~1.51 world units

/**
 * Quintic C2 smootherstep: 6x^5 - 15x^4 + 10x^3
 */
export function smootherstep(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

/**
 * Arrival settle ripple: smootherstep with an elastic settling oscillation for x > 0.9 (§7.3)
 */
export function easeSettle(
  x: number,
  epsilon = 0.015,
  omega = 18,
  kappa = 7
): number {
  const c = Math.max(0, Math.min(1, x));
  const base = smootherstep(c);
  if (c <= 0.9) return base;
  if (c >= 1.0) return 1.0;
  const dx = c - 0.9;
  const windowEnd = (1.0 - c) / 0.1; // Tapers cleanly to 0 at c = 1.0
  const ripple = epsilon * Math.sin(omega * dx) * Math.exp(-kappa * dx) * windowEnd;
  return base + ripple;
}

/**
 * Per-strand feed distance f_k(p) (§7.3)
 * @param p Global hero scroll progress in [0, 1]
 * @param rank Normalized rank of strand: 0 (innermost at seam) to 1 (outermost flank)
 * @param totalFeed F_k total travel distance = laneStart + L_k
 * @param pA Base start progress (default 0.04)
 * @param gamma Seam-first stagger spread (default 0.16)
 * @param dP Duration of feed in scroll progress (default 0.42)
 * @param jitter Small per-strand offset (default 0)
 */
export function calcStrandFeed(
  p: number,
  rank: number,
  totalFeed: number,
  pA = 0.04,
  gamma = 0.16,
  dP = 0.42,
  jitter = 0
): { feed: number; normalizedX: number; p0: number } {
  const p0 = pA + gamma * rank + jitter;
  const normalizedX = Math.max(0, Math.min(1, (p - p0) / dP));
  const feed = totalFeed * easeSettle(normalizedX);
  return { feed, normalizedX, p0 };
}

/**
 * Tail peel-lift kinematics (§7.4)
 * While still inside the weave, the retreating tail of length ell lifts toward the camera and curls outward.
 * @param a Rope coordinate in [0, L] (a = 0 head, a = L tail)
 * @param sTail Tail position in path coordinates = feed - L
 * @param L Total strand length
 * @param xSign Hemisphere sign (+1 for right, -1 for left)
 * @param Hv Viewport world height
 */
export function calcPeelLift(
  a: number,
  sTail: number,
  L: number,
  xSign = 1,
  Hv = WORLD_HV,
  ell = 0.18 * WORLD_HV,
  Ax = 0.10 * WORLD_HV,
  Az = 0.07 * WORLD_HV
): { x: number; y: number; z: number } {
  // w(a) is 1 at the tail (a = L) and drops quadratically to 0 at ell distance from tail
  const distFromTail = Math.max(0, L - a);
  const wRaw = Math.max(0, Math.min(1, 1 - distFromTail / ell));
  const w = wRaw * wRaw;

  // g(sTail) activates as tail retreats through the weave
  const g =
    THREE.MathUtils.smoothstep(sTail, -ell, -0.02) *
    (1 - THREE.MathUtils.smoothstep(sTail, 0, 0.12));

  if (w <= 0 || g <= 0) {
    return { x: 0, y: 0, z: 0 };
  }

  const factor = w * g;
  // Curl outward (away from seam) and up toward camera (+Z)
  return {
    x: factor * Ax * xSign,
    y: 0,
    z: factor * Az,
  };
}

/**
 * Camera vertical glide descent (§5.2)
 * Returns world camera Y, Z, and pitch in degrees for scroll progress p.
 */
export function evalCamera(
  p: number,
  Hv = WORLD_HV,
  pC0 = 0.04,
  pC1 = 0.60
): { camY: number; camZ: number; pitchDeg: number } {
  const t = Math.max(0, Math.min(1, (p - pC0) / (pC1 - pC0)));
  const s = smootherstep(t);
  const camY = 0.35 + (-1.2 * Hv - 0.35) * s;
  const camZ = 12 + (11.2 - 12) * s;
  const pitchDeg = 0; // Pure level pitch eliminates keystoning
  return { camY, camZ, pitchDeg };
}

/**
 * Wreath Lane Radius at angle theta (§7.6)
 * @param theta Angle along ring arc: theta in [PI, 2*PI - phiGap]
 * @param laneRadius Base circular lane radius
 * @param Ak Ripple amplitude (solved via bisection)
 * @param nu Number of ripple waves per half ring
 * @param psi Phase offset
 */
export function evalLaneRadius(
  theta: number,
  laneRadius: number,
  Ak: number,
  nu: number,
  psi: number,
  phiGap = WREATH_GAP_RAD,
  phiCross = 0
): number {
  const startTheta = Math.PI - phiCross;
  const span = Math.PI - phiGap + phiCross;
  const normTheta = (theta - startTheta) / span; // 0 at cross start, 1 at gap
  // Bell window guarantees zero ripple at both ends
  const bell = Math.sin(normTheta * Math.PI);
  const bellWindow = bell * bell;
  return laneRadius + Ak * Math.sin(nu * theta + psi) * bellWindow;
}

/**
 * Point on Wreath Lane in world coordinates (§7.6)
 * Crossed wreath: Right-half strand climbs the LEFT arc (theta from PI - phiCross to 2*PI - phiGap).
 * In world coordinates, theta = PI is (0, -r, 0) relative to center, heading toward -X.
 */
export function evalWreathPoint(
  theta: number,
  laneRadius: number,
  Ak: number,
  nu: number,
  psi: number,
  Cy = WREATH_CY,
  zBias = 0.03,
  phiGap = WREATH_GAP_RAD,
  phiCross = 0
): THREE.Vector3 {
  const r = evalLaneRadius(theta, laneRadius, Ak, nu, psi, phiGap, phiCross);
  const x = r * Math.sin(theta);
  const y = Cy + r * Math.cos(theta);
  const z = zBias;
  return new THREE.Vector3(x, y, z);
}

/**
 * Numerically calculates the arc length of a wreath lane (§7.6)
 */
export function calcWreathLaneLength(
  laneRadius: number,
  Ak: number,
  nu: number,
  psi: number,
  phiGap = WREATH_GAP_RAD,
  phiCross = 0,
  samples = 256
): number {
  const startTheta = Math.PI - phiCross;
  const endTheta = 2 * Math.PI - phiGap;
  const dTheta = (endTheta - startTheta) / samples;

  let totalLength = 0;
  let prevPt = evalWreathPoint(startTheta, laneRadius, Ak, nu, psi, 0, 0, phiGap, phiCross);

  for (let i = 1; i <= samples; i++) {
    const theta = startTheta + i * dTheta;
    const pt = evalWreathPoint(theta, laneRadius, Ak, nu, psi, 0, 0, phiGap, phiCross);
    totalLength += prevPt.distanceTo(pt);
    prevPt = pt;
  }

  return totalLength;
}

/**
 * Bisection solver to find ripple amplitude A_k so that lane arc length == targetLength (§7.6)
 */
export function solveLaneRippleAmplitude(
  targetLength: number,
  laneRadius: number,
  nu: number,
  psi: number,
  maxRipple = 0.25,
  phiGap = WREATH_GAP_RAD,
  phiCross = 0,
  tolerance = 0.001,
  maxIter = 32
): { Ak: number; finalLength: number; iterations: number } {
  let low = 0;
  let high = maxRipple;

  const lenAtLow = calcWreathLaneLength(laneRadius, low, nu, psi, phiGap, phiCross);
  if (lenAtLow >= targetLength) {
    return { Ak: 0, finalLength: lenAtLow, iterations: 0 };
  }

  let bestAk = 0;
  let bestLen = lenAtLow;
  let it = 0;

  for (it = 0; it < maxIter; it++) {
    const mid = (low + high) * 0.5;
    const len = calcWreathLaneLength(laneRadius, mid, nu, psi, phiGap, phiCross);
    bestAk = mid;
    bestLen = len;

    if (Math.abs(len - targetLength) <= tolerance) {
      break;
    }

    if (len < targetLength) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return { Ak: bestAk, finalLength: bestLen, iterations: it };
}

/**
 * Camera-facing zero-twist reference frame (§8.2)
 * Eliminates Frenet-frame twist singularities when curvature reverses or vanishes.
 */
export function calcCameraAlignedFrame(tangent: THREE.Vector3): {
  normal: THREE.Vector3;
  binormal: THREE.Vector3;
} {
  const cameraRef = new THREE.Vector3(0, 0, 1);
  const dot = cameraRef.dot(tangent);
  const normal = new THREE.Vector3().copy(cameraRef).sub(tangent.clone().multiplyScalar(dot));

  if (normal.lengthSq() < 1e-6) {
    normal.set(1, 0, 0);
  } else {
    normal.normalize();
  }

  const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
  return { normal, binormal };
}
