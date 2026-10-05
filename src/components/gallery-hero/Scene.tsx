// src/components/gallery-hero/Scene.tsx
"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { View } from "@react-three/drei";
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
import { useWarmup } from "@/components/gl/useWarmup";
import { useThree } from "@react-three/fiber";
import { registerScene } from "@/director/wireframe";

/**
 * Scene (§1, §3)
 *
 * Canvas-agnostic Scene rendered inside Drei <View> (Global Architecture PRD v2):
 * - Exactly ONE WebGL Canvas across the application lifetime
 * - 24 true 12-TET frets with procedural rosewood neck
 * - Follow-camera rig with subtle breath sway
 * - Dynamic lighting rig with 3-era palette transition
 * - 6-string physics-driven InstancedMesh with scroll vibration & pluck
 * - PropRig container anchored 14 su ahead
 */
function SceneWarmup() {
  useWarmup("gallery-fretboard");
  return null;
}

function SceneRegistrar() {
  const scene = useThree((s) => s.scene);
  React.useEffect(() => {
    if (scene) {
      return registerScene(scene);
    }
  }, [scene]);
  return null;
}

export default function Scene() {
  const propRigRef = useRef<THREE.Group>(null);

  return (
    <div className="w-full h-full relative">
      <View className="w-full h-full">
        <SceneWarmup />
        <SceneRegistrar />
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
      </View>
    </div>
  );
}
