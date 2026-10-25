// src/components/gallery-hero/Scene.tsx
"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { SceneView as View } from "@/components/canvas/SceneView";
import { CameraRig } from "./CameraRig";
import { LightingRig } from "./fx/LightingRig";
import { Strings } from "./strings/Strings";
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

        {/* Vaaranam Aayiram Rathnavelu Coastal Twilight Sky & Bokeh Light Field */}
        <color attach="background" args={["#0B0E1A"]} />
        <fogExp2 attach="fog" args={["#0B0E1A", 0.0018]} />
        <SunsetSkyDome />

        {/* Studio Lighting & Zero-Cost Procedural Reflections */}
        <SangamStudioEnvironment />
        <LightingRig />

        {/* Sculpted Acoustic Guitar Soundboard, Soundhole Chamber, Kolam Rosette & Neck */}
        <AcousticSoundboard />

        {/* 6 Kajiya-Kay Anisotropic Phosphor-Bronze Strings & Anamorphic Streaks */}
        <Strings />

        {/* 8 Floating 35mm Kodachrome Memory Frames in Z-Space */}
        <ArchivalPlanes />

        {/* 3-Act 85mm Cinema Macro Camera Rig */}
        <CameraRig propRigRef={propRigRef} />

        {/* Golden Rosin & Dust Burst Particle Simulation */}
        <GoldDustBurst />
      </View>
    </div>
  );
}
