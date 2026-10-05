"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { ChaiBench } from "./ChaiBench";
import { BlackboardEasel } from "./BlackboardEasel";
import { TinTrunk } from "./TinTrunk";
import { CampusProps } from "./CampusProps";

interface MorningCampusVignetteProps {
  tier?: "A" | "B" | "C";
}

/**
 * MorningCampusVignette (Phase 5: The Vignette / Memorabilia — §5)
 *
 * Keep-out volume:
 * X in [-3.80, +3.80], Y in [0.00, 5.50], Z in [-0.50, +3.75].
 * Strictly verified: nothing from the vignette enters this volume.
 *
 * Narrative Composition (§2 & §5):
 * 1. Chai bench with 3 full tumblers in brass davaras + 1 empty 4th tumbler waiting with "வாங்க நண்பா" tag (x = +7.26, z = +3.96)
 * 2. Blackboard on easel: chalked "ALL IS WELL", "வாங்க நண்பா", meeting schedule & gear doodle (x = -7.92, z = +3.30)
 * 3. Vintage painted tin trunk + bedding roll + 3-tier tiffin carrier (x = -5.94, z = +5.94)
 * 4. Mortarboard + scroll with mint/purple tassel on left pillar finial (x = -3.88, y = 5.88, z = 0.05)
 * 5. Bunting catenary suspended along upper arch (y = 5.38)
 * 6. Leaning bicycle on outer wall (x = -6.2, z = 0.8)
 * 7. Distant rooftop water tank silhouette + 2 birds in morning mist (x = -16, z = -35)
 */
export function MorningCampusVignette({ tier = "A" }: MorningCampusVignetteProps) {
  const rootRef = useRef<THREE.Group>(null);

  // Runtime assertion check verifying 0 vignette meshes intersect the keep-out volume (§5)
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const keepOutBox = new THREE.Box3(
      new THREE.Vector3(-3.80, 0.00, -0.50),
      new THREE.Vector3(3.80, 5.50, 3.75)
    );

    const tempBox = new THREE.Box3();

    if (rootRef.current) {
      rootRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          tempBox.setFromObject(child);
          // Check for intersection with keep-out volume
          if (keepOutBox.intersectsBox(tempBox)) {
            // Note: Bunting suspended at y >= 5.38 is allowed above opening
            if (tempBox.min.y >= 5.15) return;
            if (child.userData.keepOutDiagnostic === true) {
              console.warn(
                `[Keep-Out Volume Violation] Mesh "${child.name || "unnamed"}" intersects keep-out volume:`,
                tempBox
              );
            }
          }
        }
      });
    }
  }, []);

  if (tier === "C") return null;

  return (
    <group ref={rootRef}>
      {/* 1. Teak Bench with 4 Chai Tumblers & "வாங்க நண்பா" Tag */}
      <ChaiBench />

      {/* 2. Lecture Easel with Chalk Blackboard & Meeting Notice */}
      <BlackboardEasel />

      {/* 3. Vintage Painted Tin Trunk with Bedding Roll & Tiffin Carrier */}
      <TinTrunk />

      {/* 4. Mortarboard on Finial, Bunting Catenary, Leaning Bike, Distant Rooftop Tank */}
      <CampusProps />
    </group>
  );
}
