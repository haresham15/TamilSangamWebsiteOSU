import { MathUtils, Vector3 } from "three";
import { smootherstep } from "@/lib/cinemaCameraDamper";

export const EVENT_CAMERA_STOPS = [
  { p: 0, position: [0, 13.5, 21.8], lookY: 3.5 },
  { p: 0.3, position: [1.35, 10.6, 21.2], lookY: 3.35 },
  { p: 0.62, position: [-0.95, 8.2, 20.7], lookY: 3.2 },
  { p: 0.8, position: [0.15, 5.2, 18.5], lookY: 2.9 },
  { p: 1, position: [0, 3.8, 16.5], lookY: 2.6 },
];

export function updateEventCamera(
  progress: number,
  portrait: boolean,
  position: Vector3,
  look: Vector3,
  useHermite = false
) {
  const p = MathUtils.clamp(progress, 0, 1);
  const end = EVENT_CAMERA_STOPS.findIndex((stop, index) => index > 0 && p <= stop.p);
  const from = EVENT_CAMERA_STOPS[end - 1];
  const to = EVENT_CAMERA_STOPS[end];
  const segmentT = MathUtils.clamp((p - from.p) / (to.p - from.p), 0, 1);
  const t = useHermite ? smootherstep(segmentT) : MathUtils.smoothstep(p, from.p, to.p);
  position.set(
    portrait ? 0 : MathUtils.lerp(from.position[0], to.position[0], t),
    MathUtils.lerp(from.position[1], to.position[1], t),
    MathUtils.lerp(from.position[2], to.position[2], t),
  );
  if (portrait) {
    const exit = useHermite ? smootherstep(MathUtils.clamp((p - 0.8) / 0.2, 0, 1)) : MathUtils.smoothstep(p, 0.8, 1);
    position.y *= MathUtils.lerp(0.94, 1, exit);
    position.z *= MathUtils.lerp(1.36, 1, exit);
  }
  look.set(0, MathUtils.lerp(from.lookY, to.lookY, t), 0);
}
