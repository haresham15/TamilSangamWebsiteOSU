"use client";

// Air for the art pass, from the kit's linear-safe layers at low intensity: a few sun
// shafts slanting through the ironwork along the real sun direction, dust in the gateway,
// and two lit haze sheets that push the avenue and the hall back.
import React, { useMemo, useRef } from "react";
import type * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { DustMotes, HazeLayer, LightShaft } from "@/gl/art/Atmosphere";
import { SUN_DIR } from "../env/sun";

type V3 = [number, number, number];

/** A shaft passing through `p`: starts `back` metres up-sun, ends where it meets the ground. */
function shaftThrough(p: V3, back: number): { from: V3; to: V3 } {
  const down = p[1] / SUN_DIR.y;
  return {
    from: [p[0] + SUN_DIR.x * back, p[1] + SUN_DIR.y * back, p[2] + SUN_DIR.z * back],
    to: [p[0] - SUN_DIR.x * down, 0, p[2] - SUN_DIR.z * down],
  };
}

export function MorningAir({
  tier = "A",
  intensity = 1,
  gateProgressRef,
}: {
  tier?: "A" | "B" | "C";
  intensity?: number;
  gateProgressRef?: React.RefObject<number>;
}) {
  const shaftGroup = useRef<THREE.Group>(null);
  const shafts = useMemo(
    () => [
      { ...shaftThrough([0.9, 3.7, 0], 5), width: 0.45, i: 0.08 },
      { ...shaftThrough([-0.7, 3.0, 0], 5), width: 0.35, i: 0.065 },
      { ...shaftThrough([2.2, 4.3, 0], 6), width: 0.55, i: 0.055 },
      { ...shaftThrough([-1.9, 3.9, 0], 6), width: 0.4, i: 0.045 },
    ],
    []
  );

  // Shafts strengthen as the leaves swing clear of the light (the kit material exposes
  // uIntensity; the base value is restored from the shaft config each frame).
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0 || !shaftGroup.current) return;
    const open = Math.min(Math.max(((gateProgressRef?.current ?? 0) - 0.2) / 0.6, 0), 1);
    const gain = 0.55 + 0.45 * open;
    shaftGroup.current.children.forEach((child, k) => {
      const mat = (child as THREE.Mesh).material as THREE.ShaderMaterial | undefined;
      const u = mat?.uniforms?.uIntensity;
      if (u && shafts[k]) u.value = shafts[k].i * intensity * gain;
    });
  });

  return (
    <group name="MorningAir">
      <group ref={shaftGroup}>
        {tier === "A" &&
          shafts.map((s, k) => (
            <LightShaft key={k} from={s.from} to={s.to} width={s.width} spread={2.6} color="#ffd9a6" intensity={s.i * intensity} />
          ))}
      </group>
      <DustMotes
        position={[0.4, 2.3, 1.2]}
        size={[7, 4.2, 7]}
        count={tier === "A" ? 240 : 110}
        color="#ffe4bf"
        intensity={0.28 * intensity}
        pointSize={20}
        drift={[-0.03, -0.01, 0.025]}
      />
      <HazeLayer position={[0, 3.2, -13]} size={[34, 9]} color="#f1d9b0" intensity={0.06 * intensity} />
      <HazeLayer position={[0, 4.2, -21]} size={[50, 12]} color="#f2d8ab" intensity={0.08 * intensity} />
      <HazeLayer position={[0, 5.5, -29]} size={[70, 18]} color="#f3e1c0" intensity={0.11 * intensity} />
    </group>
  );
}
