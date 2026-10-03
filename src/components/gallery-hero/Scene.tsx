"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { CameraRig } from "./CameraRig";
import { LightingRig } from "./fx/LightingRig";
import { Fretboard } from "./neck/Fretboard";
import { Frets } from "./neck/Frets";
import { Inlays } from "./neck/Inlays";
import { Strings } from "./strings/Strings";
import { LandmarkGizmos, StringGizmo } from "./debug/Gizmos";
import { PropPlaceholders } from "./props/Placeholders";
import { Pick } from "./props/Pick";
import { GoldDustBurst } from "./fx/GoldDustBurst";

/**
 * Scene (§3)
 *
 * WebGL 3D Canvas composition for the Fretboard Highway:
 * - 24 true 12-TET frets with procedural rosewood neck
 * - Follow-camera rig with subtle breath sway
 * - Dynamic lighting rig with 3-era palette transition
 * - 6-string physics-driven InstancedMesh with scroll vibration & pluck
 * - PropRig container anchored 14 su ahead
 */
export default function Scene() {
  const propRigRef = useRef<THREE.Group>(null);

  useEffect(() => {
    return () => {
      // Clean up Three.js global cache if necessary
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
        className="w-full h-full"
      >
        {/* Dynamic Scene Background & Exponential Squared Fog */}
        <color attach="background" args={["#F0C98A"]} />
        <fogExp2 attach="fog" args={["#F0C98A", 0.004]} />

        {/* Dynamic 3-Era Lighting System */}
        <LightingRig />

        {/* Camera Kinematics Rig */}
        <CameraRig propRigRef={propRigRef} />

        {/* Macro Guitar Neck & Strings Assembly (§3.1, §3.3) */}
        <group position={[0, 0, 0]}>
          <Fretboard />
          <Frets />
          <Inlays />
          <Strings />
        </group>

        {/* Visual Landmark Debug Lines & CPU String Gizmo */}
        <LandmarkGizmos />
        <StringGizmo />

        {/* Guitar Pick Strum Assembly (§5.3) */}
        <Pick />

        {/* Gold Dust Burst Particle Simulation (§5.4, Phase 6) */}
        <GoldDustBurst />

        {/* PropRig: Group following 14 su ahead of camera */}
        <group ref={propRigRef} name="prop-rig">
          <PropPlaceholders />
        </group>
      </Canvas>
    </div>
  );
}
