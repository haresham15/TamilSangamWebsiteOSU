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
import { SunsetSkyDome } from "./SunsetSkyDome";
import { AcousticSoundboard } from "./AcousticSoundboard";
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
        {/* Vaaranam Aayiram Golden-Hour Coastal Twilight Sky Dome & Shimmering Horizon Bokeh */}
        <color attach="background" args={["#120D18"]} />
        <fogExp2 attach="fog" args={["#180F16", 0.007]} />
        <SunsetSkyDome />

        {/* Studio Lighting & Zero-Cost Procedural Reflections */}
        <SangamStudioEnvironment />
        <LightingRig />

        {/* Warm Cedar & Rosewood Acoustic Soundboard, Kolam Rosette & Neck */}
        <AcousticSoundboard />

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
