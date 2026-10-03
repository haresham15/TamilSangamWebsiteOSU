"use client";

import React, { useState, useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getFretS, getStringSpacing, getStringHeight } from "../neck/fretMath";
import { stringY } from "../strings/stringMath";
import { globalStringEnergy } from "../strings/Strings";

/**
 * Visual Landmark Gizmos (§9)
 * Renders glowing indicator lines across the neck at key landmark boundaries:
 * - Fret 5 (s = 25.08 su, Era 2 boundary)
 * - Fret 12 (s = 50.00 su, Era 3 double-dot octave boundary)
 * - Fret 24 (s = 75.00 su, Finale)
 */
export function LandmarkGizmos() {
  const [active] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("debug") === "1";
    }
    return false;
  });

  if (!active) return null;

  const s5 = getFretS(5);
  const s12 = getFretS(12);
  const s24 = getFretS(24);

  return (
    <group>
      {/* Fret 5 Landmark Marker (Era 2 Boundary, p = 0.334) */}
      <mesh position={[0, 0.16, -s5]}>
        <boxGeometry args={[7.0, 0.04, 0.08]} />
        <meshBasicMaterial color="#55CCA2" />
      </mesh>

      {/* Fret 12 Octave Marker (Era 3 Boundary, p = 0.667) */}
      <mesh position={[0, 0.16, -s12]}>
        <boxGeometry args={[7.4, 0.04, 0.08]} />
        <meshBasicMaterial color="#FFB84D" />
      </mesh>

      {/* Fret 24 Journey End Marker (p = 1.000) */}
      <mesh position={[0, 0.16, -s24]}>
        <boxGeometry args={[7.6, 0.04, 0.08]} />
        <meshBasicMaterial color="#FF5E3A" />
      </mesh>
    </group>
  );
}

/**
 * CPU-vs-GPU String Overlay Gizmo (§7.4, §9)
 *
 * Samples the pure TypeScript stringY CPU mirror each frame across 128 points
 * along the Low E string and renders a neon line overlay.
 * Visibly confirms that GPU vertex displacement and CPU math coincide with zero drift.
 */
export function StringGizmo() {
  const [active] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("debug") === "1";
    }
    return false;
  });

  const lineRef = useRef<THREE.Line>(null);
  const SAMPLES = 128;

  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(SAMPLES * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!active) return;
    const mesh = lineRef.current;
    if (!mesh) return;

    const posAttr = mesh.geometry.attributes.position as THREE.BufferAttribute;
    if (!posAttr) return;
    const array = posAttr.array as Float32Array;
    const t = state.clock.getElapsedTime();

    // Query current physics state from global energy model
    const energy = globalStringEnergy.energy[0];
    const pluckT = globalStringEnergy.pluckT[0];
    const pluckAmp = globalStringEnergy.pluckAmp[0];
    const damperK = globalStringEnergy.damperK;
    const damperPos = globalStringEnergy.damperPos;
    const loadK = globalStringEnergy.loadK;
    const loadPos = globalStringEnergy.loadPos;

    for (let k = 0; k < SAMPLES; k++) {
      const s = (k / (SAMPLES - 1)) * 75.0; // From nut (0) to fret 24 (75 su)
      const x = -2.5 * getStringSpacing(s);
      // Sample CPU mirror
      const dispY = stringY(0, s, t, {
        energy,
        pluckT,
        pluckAmp,
        damperK,
        damperPos,
        loadK,
        loadPos,
      });
      const y = getStringHeight(s) + dispY;
      const z = -s;

      array[k * 3] = x;
      array[k * 3 + 1] = y;
      array[k * 3 + 2] = z;
    }

    posAttr.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <primitive
      object={
        new THREE.Line(
          lineGeo,
          new THREE.LineBasicMaterial({
            color: "#00FF66",
            linewidth: 2,
            depthTest: false,
            transparent: true,
            opacity: 0.85,
          })
        )
      }
      ref={lineRef}
      renderOrder={999}
    />
  );
}
