"use client";

import { useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils } from "three";
import { leoKinematics } from "@/store/leoHeroStore";
import { updateEventCamera } from "./eventCameraPath";

export function LeoScrollController({ progressRef }: { progressRef: RefObject<number> }) {
  const { size } = useThree();
  const progress = useRef(0);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    progress.current = MathUtils.damp(progress.current, progressRef.current, 16, dt);
    updateEventCamera(progress.current, size.width < size.height, leoKinematics.targetPosition, leoKinematics.targetLookAt);
  }, -1);
  return null;
}
