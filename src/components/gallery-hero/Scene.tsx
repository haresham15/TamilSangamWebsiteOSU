// src/components/gallery-hero/Scene.tsx
"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { SceneView as View } from "@/components/canvas/SceneView";
import { CameraRig } from "./CameraRig";
import { LightingRig } from "./fx/LightingRig";
import { Frets } from "./neck/Frets";
import { Strings } from "./strings/Strings";
import { Pick } from "./props/Pick";
import { GoldDustBurst } from "./fx/GoldDustBurst";
import { ArchivalPlanes } from "./ArchivalPlanes";
import { SangamStudioEnvironment } from "@/components/canvas/SangamStudioEnvironment";
import { useWarmup } from "@/components/gl/useWarmup";
import { useThree, useFrame } from "@react-three/fiber";
import { registerScene } from "@/director/wireframe";
import { setHeroProgress } from "./state";

function ScrollProgressSync({ progressRef }: { progressRef?: React.MutableRefObject<number> }) {
  useFrame(() => {
    if (progressRef && typeof progressRef.current === "number") {
      setHeroProgress(progressRef.current);
    }
  });
  return null;
}

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

export default function Scene({ progressRef }: { progressRef?: React.MutableRefObject<number> }) {
  const propRigRef = useRef<THREE.Group>(null);

  return (
    <div className="w-full h-full relative">
      <View className="w-full h-full pointer-events-auto" index={2}>
        <SceneWarmup />
        <SceneRegistrar />
        <ScrollProgressSync progressRef={progressRef} />
        {/* Warm Obsidian Scene Background & Atmospheric Fog */}
        <color attach="background" args={["#14110F"]} />
        <fogExp2 attach="fog" args={["#14110F", 0.015]} />

        {/* Studio Lighting & Zero-Cost Procedural Reflections */}
        <SangamStudioEnvironment />
        <LightingRig />

        {/* Drifting Archival Photos in Z-Space */}
        <ArchivalPlanes />

        {/* Camera Kinematics Rig */}
        <CameraRig propRigRef={propRigRef} />

        {/* Sleek Phosphor-Bronze Acoustic Strings & Delicate Frets */}
        <group position={[0, 0, 0]}>
          <Frets />
          <Strings />
        </group>

        {/* Guitar Pick Strum Assembly */}
        <Pick />

        {/* Gold Dust Burst Particle Simulation */}
        <GoldDustBurst />
      </View>
    </div>
  );
}
