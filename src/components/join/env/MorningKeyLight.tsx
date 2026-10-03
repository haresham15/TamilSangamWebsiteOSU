"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { SUN_POS, SUN_COLOR } from "./sun";

interface MorningKeyLightProps {
  tier?: "A" | "B" | "C";
  reducedMotion?: boolean;
}

/**
 * Key Directional Light & Physical Shadow Frustum (§3.4)
 *
 * Grounded in the single shared SUN_POS ([26.24, 15.00, -26.24]).
 * Tight shadow-camera bounds fitted specifically to the measured gate envelope (W = 6.6 su, H = 5.9 su)
 * so fine iron filigree bars receive maximum shadow texel density without detaching.
 */
export function MorningKeyLight({ tier = "A" }: MorningKeyLightProps) {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  React.useEffect(() => {
    const light = lightRef.current;
    if (!light) return;
    light.target.position.set(0, 2.3, 0);
    if (light.parent) {
      light.parent.add(light.target);
    }
    return () => {
      if (light.target.parent) {
        light.target.parent.remove(light.target);
      }
    };
  }, []);

  const shadowMapSize = tier === "A" ? 2048 : 1024;

  return (
    <directionalLight
      ref={lightRef}
      color={SUN_COLOR}
      intensity={3.5}
      position={SUN_POS}
      castShadow={tier !== "C"}
      shadow-mapSize-width={shadowMapSize}
      shadow-mapSize-height={shadowMapSize}
      // Tightened frustum to measured gate bounds: X in [-5.8, 5.8], Y in [0, 6.2]
      shadow-camera-left={-5.8}
      shadow-camera-right={5.8}
      shadow-camera-top={6.2}
      shadow-camera-bottom={-0.5}
      shadow-camera-near={1}
      shadow-camera-far={70}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
    />
  );
}
