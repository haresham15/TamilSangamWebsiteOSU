"use client";

import React from "react";
import { useFrame } from "@react-three/fiber";
import { Ticket } from "./Ticket";
import { Compass } from "./Compass";
import { CameraBody } from "./CameraBody";
import { Rose } from "./Rose";
import { DogTags } from "./DogTags";
import { getSharedHeroRefs } from "./types";
import { globalStringEnergy } from "../strings/Strings";

/**
 * Prop Hierarchy (§5 & §6, Phase 7)
 *
 * Implements:
 * 1. Ticket (Era 1, 0–33%): Procedural vintage train ticket with parchment texture & dissolve
 * 2. Compass (Era 1, 0–33%): Procedural brass drafting compass with hinge & steel needle
 * 3. Camera Body (Era 2, 33–66%): Procedural mirrorless camera with magnesium chassis, dials & lens
 * 4. Rose (Era 2, 33–66%): Procedural dried red rose riding Low E string vibration
 * 5. Dog Tags (Era 3, 66–100%): Procedural stainless steel military dog tags with rubber silencer & ball chain
 */
export function PropPlaceholders() {
  // Per-frame string energy sync
  useFrame(() => {
    const liveRefs = getSharedHeroRefs();

    // Sync timeline string controls to energy model
    globalStringEnergy.damperK = liveRefs.strings.uDamperK.value;
    globalStringEnergy.loadK = liveRefs.strings.uLoadK.value;
    globalStringEnergy.driveGain = liveRefs.strings.driveGain.value;
  });

  return (
    <group name="phase7-props-complete">
      {/* 1. Procedural Vintage Train Ticket (Era 1: 0–33%) */}
      <Ticket />

      {/* 2. Procedural Brass Drafting Compass (Era 1: 0–33%) */}
      <Compass />

      {/* 3. Procedural Mirrorless Camera Body (Era 2: 33–66%) */}
      <CameraBody />

      {/* 4. Procedural Dried Red Rose (Era 2: 33–66%) */}
      <Rose />

      {/* 5. Procedural Stainless Steel Dog Tags (Era 3: 66–100%, Phase 7) */}
      <DogTags />
    </group>
  );
}
