"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGalleryHeroStore } from "@/store/galleryHeroStore";

interface WhiteoutFinaleProps {
  scrollProgress: number;
  onFinaleTrigger?: () => void;
}

/**
 * §11: Whiteout Finale (Corrected)
 * - Detects p >= 0.98 on forward scroll pass.
 * - Triggers sun bloom ramp + DOM whiteout overlay fade (#FFF6E8).
 * - Guarded with hasFiredRef to ensure single execution per forward pass.
 * - Does NOT manipulate postprocessing Bloom thresholds.
 */
export function WhiteoutFinale({ scrollProgress, onFinaleTrigger }: WhiteoutFinaleProps) {
  const hasFiredRef = useRef(false);

  useFrame(() => {
    const p = scrollProgress;

    if (p >= 0.98 && !hasFiredRef.current) {
      hasFiredRef.current = true;
      useGalleryHeroStore.getState().setFinaleFired(true);
      if (onFinaleTrigger) {
        onFinaleTrigger();
      }
    }
  });

  return null;
}
