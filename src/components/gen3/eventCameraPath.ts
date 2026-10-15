import { MathUtils, Vector3 } from "three";

const STOPS = [
  { p: 0, position: [0, 13.5, 21.8], lookY: 3.5 },
  { p: 0.3, position: [1.35, 10.6, 21.2], lookY: 3.35 },
  { p: 0.62, position: [-0.95, 8.2, 20.7], lookY: 3.2 },
  { p: 0.8, position: [0.3, 6.7, 20.45], lookY: 3.05 },
  { p: 1, position: [0, 4.5, 8.15], lookY: 0 },
];

export function updateEventCamera(progress: number, portrait: boolean, position: Vector3, look: Vector3) {
  const p = MathUtils.clamp(progress, 0, 1);
  const end = STOPS.findIndex((stop, index) => index > 0 && p <= stop.p);
  const from = STOPS[end - 1];
  const to = STOPS[end];
  const t = MathUtils.smoothstep(p, from.p, to.p);
  position.set(
    portrait ? 0 : MathUtils.lerp(from.position[0], to.position[0], t),
    MathUtils.lerp(from.position[1], to.position[1], t),
    MathUtils.lerp(from.position[2], to.position[2], t),
  );
  const exit = MathUtils.smoothstep(p, 0.8, 1);
  if (portrait) {
    position.y *= MathUtils.lerp(0.94, 1, exit);
    position.z *= MathUtils.lerp(1.36, 1, exit);
  }
  look.set(0, MathUtils.lerp(from.lookY, to.lookY, t), exit * 8);
}
