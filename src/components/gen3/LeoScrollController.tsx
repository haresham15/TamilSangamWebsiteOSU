"use client";

import { useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils } from "three";
import { leoKinematics } from "@/store/leoHeroStore";
import { updateEventCamera } from "./eventCameraPath";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { setScrollProgress } from "./useScrollCinematic";

export function LeoScrollController({ progressRef }: { progressRef: RefObject<number> }) {
  const { size } = useThree();
  const progress = useRef(0);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const rawP = progressRef.current ?? 0;
    setScrollProgress(rawP);
    const cinematic = isHeroCinematicEnabled("events");
    if (cinematic) {
      // In cinematic mode, cinemaCameraDamper in LeoCameraRig performs dual-channel damping.
      // We pass the raw target progress with Hermite C1 interpolation so the damper responds instantaneously without lag.
      progress.current = rawP;
      updateEventCamera(progress.current, size.width < size.height, leoKinematics.targetPosition, leoKinematics.targetLookAt, true);
    } else {
      progress.current = MathUtils.damp(progress.current, rawP, 16, dt);
      updateEventCamera(progress.current, size.width < size.height, leoKinematics.targetPosition, leoKinematics.targetLookAt, false);
    }
  }, -1);
  return null;
}
