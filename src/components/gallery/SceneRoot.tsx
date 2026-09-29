"use client";

import React, { useState } from "react";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { Sky } from "./diorama/Sky";
import { Sun } from "./diorama/Sun";
import { Hills } from "./diorama/Hills";
import { Sea } from "./diorama/Sea";
import { Road } from "./diorama/Road";
import { Verge } from "./diorama/Verge";
import { Roadside } from "./diorama/Roadside";
import { DustMotes } from "./diorama/DustMotes";
import { PolaroidField } from "./PolaroidField";
import { Strings } from "./Strings";
import { PostFX } from "./PostFX";
import { HERO_PALETTE, HERO_CONSTANTS } from "./heroTimeline";

import { HeroMemory } from "@/data/gallery-hero";

export function SceneRoot({ onSelect }: { onSelect?: (memory: HeroMemory) => void }) {
  const [sunMesh, setSunMesh] = useState<THREE.Mesh | null>(null);

  return (
    <>
      {/* 1. Atmospheric Golden Hour Fog */}
      <fogExp2 attach="fog" args={[HERO_PALETTE.fogColor, HERO_CONSTANTS.fogDensity]} />

      {/* 2. Key Lighting */}
      <ambientLight intensity={0.45} color="#5c2466" />
      <directionalLight
        position={[16, 8, -380]}
        intensity={2.2}
        color="#ffc86b"
      />

      {/* 3. Camera Rig with Micro-Sway & Pointer Parallax */}
      <CameraRig />

      {/* 4. 2.5D Diorama Scenery Layers */}
      <Sky />
      <Sun ref={setSunMesh} position={[16.0, 7.0, -380]} />
      <Hills />
      <Sea />
      <Verge />
      <Road />
      <Roadside />
      <DustMotes />

      {/* 5. Drifting Polaroid Memories Stream */}
      <PolaroidField onSelect={onSelect} />

      {/* 6. 3D Acoustic Guitar Strings Rig */}
      <Strings />

      {/* 7. Cinematic Post-Processing */}
      <PostFX sunMesh={sunMesh} />
    </>
  );
}
