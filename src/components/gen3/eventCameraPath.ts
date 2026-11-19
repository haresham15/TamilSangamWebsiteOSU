import { MathUtils, Vector3 } from "three";
import { smootherstep } from "@/lib/cinemaCameraDamper";

export const EVENT_CAMERA_STOPS: CameraStop[] = [
  { p: 0, position: [0, 13.5, 21.8], lookY: 3.5 },
  { p: 0.3, position: [1.35, 10.6, 21.2], lookY: 3.35 },
  { p: 0.62, position: [-0.95, 8.2, 20.7], lookY: 3.2 },
  { p: 0.8, position: [0.15, 5.2, 18.5], lookY: 2.9 },
  { p: 1, position: [0, 3.8, 16.5], lookY: 2.6 },
];

export type CameraStop = { p: number; position: number[]; lookY: number };

/**
 * Art pass: crane down from the roof trusses, over the crowd, to a low hero angle on the
 * performer against the backlight, then a push toward the light for the blowout.
 */
export const FORGE_CAMERA_STOPS: CameraStop[] = [
  { p: 0, position: [0, 11.5, 21], lookY: 3.0 },
  { p: 0.35, position: [2.6, 6.8, 16.5], lookY: 2.8 },
  { p: 0.7, position: [-0.9, 2.3, 13.0], lookY: 2.6 },
  { p: 0.86, position: [0, 2.1, 10.4], lookY: 2.8 },
  { p: 1, position: [0, 2.5, 8.2], lookY: 3.2 },
];

export function updateEventCamera(
  progress: number,
  portrait: boolean,
  position: Vector3,
  look: Vector3,
  useHermite = false,
  stops: CameraStop[] = EVENT_CAMERA_STOPS,
  portraitLift = 0
) {
  const p = MathUtils.clamp(progress, 0, 1);
  const end = stops.findIndex((stop, index) => index > 0 && p <= stop.p);
  const from = stops[end - 1];
  const to = stops[end];
  const segmentT = MathUtils.clamp((p - from.p) / (to.p - from.p), 0, 1);
  const t = useHermite ? smootherstep(segmentT) : MathUtils.smoothstep(p, from.p, to.p);
  position.set(
    portrait ? 0 : MathUtils.lerp(from.position[0], to.position[0], t),
    MathUtils.lerp(from.position[1], to.position[1], t),
    MathUtils.lerp(from.position[2], to.position[2], t),
  );
  if (portrait) {
    const exit = useHermite ? smootherstep(MathUtils.clamp((p - 0.8) / 0.2, 0, 1)) : MathUtils.smoothstep(p, 0.8, 1);
    position.y = position.y * MathUtils.lerp(0.94, 1, exit) + portraitLift * (1 - exit);
    position.z *= MathUtils.lerp(1.36, 1, exit);
  }
  look.set(0, MathUtils.lerp(from.lookY, to.lookY, t), 0);
}
