"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GuitarString } from "./GuitarString";
import { pluckBus } from "./pluckBus";
import { galleryScrollState } from "./galleryStore";

// 6 Strings Configuration (Bass E to Treble E - realistic delicate acoustic gauge)
const STRINGS_CONFIG = [
  { index: 0, radius: 0.0022, y:  0.38, isWound: true,  baseColor: "#b36829" }, // 6th String (Low E - thick bronze)
  { index: 1, radius: 0.0018, y:  0.23, isWound: true,  baseColor: "#ba7533" }, // 5th String (A - bronze)
  { index: 2, radius: 0.0015, y:  0.07, isWound: true,  baseColor: "#c4833e" }, // 4th String (D - bronze)
  { index: 3, radius: 0.0012, y: -0.09, isWound: false, baseColor: "#ded7cf" }, // 3rd String (G - plain steel)
  { index: 4, radius: 0.0010, y: -0.24, isWound: false, baseColor: "#e6ded6" }, // 2nd String (B - plain steel)
  { index: 5, radius: 0.0008, y: -0.39, isWound: false, baseColor: "#ede7e0" }, // 1st String (High E - thin steel)
];

export function Strings() {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, pointer } = useThree();
  const prevPointerY = useRef(0);
  const prevTime = useRef(0);

  // 1. Autoplay opening arpeggio on load (PRD Section 5.3.3)
  useEffect(() => {
    const timer = setTimeout(() => {
      pluckBus.playIntroArpeggio();
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, 0.1);
    const time = state.clock.getElapsedTime();

    // 2. Advance pluck energy model decay (e *= exp(-dt/τ))
    pluckBus.update(clampedDelta);

    // 3. Handle scroll velocity strums
    pluckBus.handleScrollVelocity(galleryScrollState.velocity, performance.now());

    // 4. Synchronize strings group directly in front of camera
    if (groupRef.current) {
      // Keep strings in front of camera at z = -1.35m
      groupRef.current.position.copy(camera.position);
      groupRef.current.rotation.copy(camera.rotation);

      // Tilt group -4° on Z for organic musical perspective
      groupRef.current.rotateZ(-0.07); // ~ -4.0°
      groupRef.current.translateZ(-1.35); // 1.35m in front of lens
    }

    // 5. Interactive Pointer / Touch Cross Pluck Trigger (PRD Section 5.3.3)
    const currentPointerY = pointer.y; // -1.0 to +1.0
    const dt = time - prevTime.current;

    if (dt > 0.005 && dt < 0.2) {
      const pointerSpeed = Math.abs(currentPointerY - prevPointerY.current) / dt;

      // Check if pointer crossed any string's screen Y band
      STRINGS_CONFIG.forEach((str) => {
        // Map 3D y (-0.43 to +0.42) to approximate normalized screen space (-0.75 to +0.75)
        const screenStringY = str.y * 1.7;
        const crossed =
          (prevPointerY.current <= screenStringY && currentPointerY >= screenStringY) ||
          (prevPointerY.current >= screenStringY && currentPointerY <= screenStringY);

        if (crossed && pointerSpeed > 0.4) {
          const strength = Math.min(1.0, Math.max(0.2, pointerSpeed * 0.25));
          pluckBus.pluck(str.index, strength);
        }
      });
    }

    prevPointerY.current = currentPointerY;
    prevTime.current = time;
  });

  return (
    <group ref={groupRef} name="guitar-strings-rig">
      {STRINGS_CONFIG.map((str) => (
        <GuitarString
          key={str.index}
          index={str.index}
          radius={str.radius}
          y={str.y}
          isWound={str.isWound}
          baseColor={str.baseColor}
        />
      ))}
    </group>
  );
}
