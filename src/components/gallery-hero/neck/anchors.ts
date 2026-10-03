import { getStringSpacing, getStringHeight, getCameraS } from "./fretMath";

/**
 * World position of string i at distance s along the neck axis
 * String index: 0 = low E (screen left), 5 = high e (screen right)
 */
export function getStringWorldPosition(stringIndex: number, s: number) {
  const spacing = getStringSpacing(s);
  const x = (stringIndex - 2.5) * spacing;
  const y = getStringHeight(s);
  const z = -s;
  return { x, y, z };
}

/**
 * PropRig-local anchor coordinate of string i at progress p
 * PropRig is anchored 14.0 su ahead of camera along neck:
 * rigOrigin.z = -(s_cam + 14.0)
 */
export function anchorAt(stringIndex: number, progress: number) {
  const sCam = getCameraS(progress);
  const sTarget = sCam + 14.0; // Point 14 su ahead of camera
  const worldPos = getStringWorldPosition(stringIndex, sTarget);

  // In PropRig local space:
  // x is unchanged
  // y is unchanged (above board plane)
  // z is 0 at the rig origin
  return {
    x: worldPos.x,
    y: worldPos.y,
    z: 0.0,
    s: sTarget,
  };
}
