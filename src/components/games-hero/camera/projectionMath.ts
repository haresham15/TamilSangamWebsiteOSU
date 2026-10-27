// src/components/games-hero/camera/projectionMath.ts
/**
 * Pure Mathematical Projection & Camera Model for Beach Blast Hero
 * Resolves D-01 (horizon lens shift s = -0.350), D-02 (locked camera),
 * D-03 (real 1:1 scale at 0.36m), D-05 (screen-anchored solver).
 *
 * Implements:
 * u = 0.5 * (1 + x_c / (d * T_h))
 * v = 0.5 * (1 - s - y_c / (d * T_v))
 */

export const DESIGN_ASPECT = 2.39;
export const DESIGN_VFOV_DEG = 34;
export const DESIGN_HALF_VFOV_RAD = (17 * Math.PI) / 180;
export const DESIGN_LENS_SHIFT = -0.350; // puts horizon at v = (1 - (-0.350)) / 2 = 0.675
export const DESIGN_CAMERA_POS: readonly [number, number, number] = [0, 1.65, 6.0];

export const PORTRAIT_HFOV_DEG = 44;
export const PORTRAIT_HALF_HFOV_RAD = (22 * Math.PI) / 180;
export const PORTRAIT_LENS_SHIFT = -0.12; // puts horizon at v = (1 - (-0.12)) / 2 = 0.56
export const PORTRAIT_CAMERA_X = 6.7;
export const PORTRAIT_STANDOFF_SCALE = 0.36 / 0.243;

export interface HeroOptics {
  portrait: boolean;
  aspect: number;
  tanV: number;
  tanH: number;
  fov: number;
  fovDeg: number;
  lensShift: number;
  cameraX: number;
  cameraPos: [number, number, number];
}

/**
 * Calculates focal tangents, effective FOV and lens shift based on aspect ratio policy:
 * - >= 2.0: Full-bleed design composition (vFOV = 34°, s = -0.350)
 * - 1.3..2.0: 2.39:1 letterbox stage with Deep Espresso bars
 * - < 1.3: Portrait recomposition (hFOV = 44°, s = -0.12, cameraX = 6.7)
 */
export function heroProjection(viewportAspect: number = DESIGN_ASPECT): HeroOptics {
  const portrait = viewportAspect < 1.3;
  const aspect = (!portrait && viewportAspect < 2.0) ? DESIGN_ASPECT : viewportAspect;

  const tanV = portrait
    ? Math.tan(PORTRAIT_HALF_HFOV_RAD) / aspect
    : Math.tan(DESIGN_HALF_VFOV_RAD);
  const tanH = tanV * aspect;
  const fovDeg = (2 * Math.atan(tanV) * 180) / Math.PI;
  const lensShift = portrait ? PORTRAIT_LENS_SHIFT : DESIGN_LENS_SHIFT;
  const cameraPos: [number, number, number] = portrait
    ? [PORTRAIT_CAMERA_X, 1.65, 6.0]
    : [0, 1.65, 6.0];

  return {
    portrait,
    aspect,
    tanV,
    tanH,
    fov: fovDeg,
    fovDeg,
    lensShift,
    cameraX: cameraPos[0],
    cameraPos,
  };
}

/**
 * Projects a 3D world coordinate (x, y, z) into 2D normalized screen coordinates (u, v).
 * u in [0, 1] left to right; v in [0, 1] top to bottom.
 */
export function projectWorldToScreen(
  point: { x: number; y: number; z: number },
  optics: HeroOptics = heroProjection(DESIGN_ASPECT)
): { u: number; v: number; d: number } {
  const [camX, camY, camZ] = optics.cameraPos;
  const xc = point.x - camX;
  const yc = point.y - camY;
  const d = camZ - point.z; // view axis looking down -z

  const u = 0.5 * (1 + xc / (d * optics.tanH));
  const v = 0.5 * (1 - optics.lensShift - yc / (d * optics.tanV));

  return { u, v, d };
}

/**
 * Screen-Anchored Rig Solver:
 * Places a camera-anchored object at screen target (u, v) and distance d in meters.
 * Returns world coordinates (x, y, z).
 */
export function solveScreenAnchorToWorld(
  u: number,
  v: number,
  d: number,
  optics: HeroOptics = heroProjection(DESIGN_ASPECT)
): { x: number; y: number; z: number } {
  const xc = (2 * u - 1) * d * optics.tanH;
  const yc = (1 - 2 * v - optics.lensShift) * d * optics.tanV;

  const [camX, camY, camZ] = optics.cameraPos;
  return {
    x: camX + xc,
    y: camY + yc,
    z: camZ - d,
  };
}
