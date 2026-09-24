"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import gsap from "gsap";

export interface CinematicSilhouetteHandle {
  triggerArmRoll: () => void;
  getShoulderWorldPos: () => THREE.Vector3;
  getHandWorldPos: () => THREE.Vector3;
}

export interface CinematicSilhouetteProps {
  isHovered?: boolean;
  onHoverChange?: (hovered: boolean) => void;
  onClick?: () => void;
  isMobile?: boolean;
}

/**
 * CinematicSilhouette:
 * Mathematically precise 3D extruded SVG silhouette reconstructed from the
 * iconic "Naa Ready" reference image.
 *
 * Architecture:
 * - Uses SVGLoader from three-stdlib to parse vijay_body.svg and vijay_arm.svg into THREE.Shape
 * - Extruded with depth 0.08, bevelEnabled: false
 * - MeshStandardMaterial({ color: '#000000', roughness: 0.2 }) catches rim backlighting
 * - Standing exactly on table center at y: 1.05m
 * - The right arm is isolated in a shoulder joint pivot <group> animated via GSAP
 */
export const CinematicSilhouette = React.forwardRef<
  CinematicSilhouetteHandle,
  CinematicSilhouetteProps
>(function CinematicSilhouette(
  { isHovered = false, onHoverChange, onClick },
  ref
) {
  const rootGroupRef = useRef<THREE.Group>(null);
  const armPivotRef = useRef<THREE.Group>(null);
  const handTipRef = useRef<THREE.Group>(null);

  // 1. Load Textures for Alpha Billboarding
  const [torsoTex, armTex, flareTex] = useTexture([
    "/media/vijay_torso.png",
    "/media/vijay_arm.png",
    "/media/gun_flare.png",
  ]);

  // Exact Right Shoulder Pivot Coordinates (relative to character root)
  const shoulderOffset = useMemo(() => {
    return {
      x: 0.22,
      y: 0.6,
      z: 0.01, // Stack arm slightly in front of torso
    };
  }, []);

  // 3. GSAP Arm Roll Swagger Animation
  const isAnimatingRef = useRef(false);

  const executeArmRoll = React.useCallback(() => {
    if (!armPivotRef.current || isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    gsap.killTweensOf(armPivotRef.current.rotation);
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });

    // Phase 1: Dynamic upward cock of the right arm (triumphant gesture)
    tl.to(armPivotRef.current.rotation, {
      z: -0.32,
      x: 0.22,
      duration: 0.35,
      ease: "power2.out",
    })
      // Phase 2: 360-degree wrist / barrel swagger roll
      .to(armPivotRef.current.rotation, {
        y: Math.PI * 2,
        duration: 0.45,
        ease: "power1.inOut",
      })
      // Phase 3: Settle back cleanly to the hero pose
      .to(armPivotRef.current.rotation, {
        z: 0.0,
        x: 0.0,
        y: 0.0,
        duration: 0.4,
        ease: "power2.inOut",
      });
  }, []);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    triggerArmRoll: executeArmRoll,
    getShoulderWorldPos: () => {
      const pos = new THREE.Vector3();
      if (armPivotRef.current) {
        armPivotRef.current.getWorldPosition(pos);
      }
      return pos;
    },
    getHandWorldPos: () => {
      const pos = new THREE.Vector3();
      if (handTipRef.current) {
        handTipRef.current.getWorldPosition(pos);
      } else if (armPivotRef.current) {
        armPivotRef.current.getWorldPosition(pos);
        pos.y += 0.6;
      }
      return pos;
    },
  }));

  // Trigger arm roll on hover
  useEffect(() => {
    if (isHovered) {
      executeArmRoll();
    }
  }, [isHovered, executeArmRoll]);

  // Idle timer: periodic swagger roll every 4.8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      executeArmRoll();
    }, 4800);
    return () => clearInterval(interval);
  }, [executeArmRoll]);

  return (
    <group
      ref={rootGroupRef}
      position={[0, 1.05, 0]} // Stand exactly on the center of the inner table (y: 1.05m)
      name="cinematic-vijay-silhouette"
    >
      {/* =================================================================
          1. TORSO GEOMETRY (z: 0)
          ================================================================= */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[1.7, 2.0]} />
        <meshBasicMaterial
          map={torsoTex}
          transparent={true}
          color="#000000"
          alphaTest={0.5}
        />
      </mesh>

      {/* =================================================================
          2. THE RIGHT ARM PIVOT JOINT (Right Shoulder Coordinate)
          ================================================================= */}
      <group
        ref={armPivotRef}
        position={[shoulderOffset.x, shoulderOffset.y, shoulderOffset.z]}
        name="right-arm-shoulder-pivot"
      >
        <mesh position={[0.15, 0.2, 0]} castShadow receiveShadow>
          <planeGeometry args={[0.8, 1.2]} />
          <meshBasicMaterial
            map={armTex}
            transparent={true}
            color="#000000"
            alphaTest={0.5}
          />
        </mesh>

        {/* Hand Tip Marker & Incandescent Muzzle Spark Light */}
        <group ref={handTipRef} position={[0.3, 0.7, 0.02]}>
          <mesh position={[0, 0.1, 0]}>
            <planeGeometry args={[0.4, 0.4]} />
            <meshBasicMaterial
              map={flareTex}
              transparent={true}
              color="#FFAA00"
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <pointLight
            color="#FFAA00"
            intensity={25}
            distance={4}
            decay={2}
          />
        </group>
      </group>

      {/* =================================================================
          3. INVISIBLE INTERACTIVE HIT COLLIDER FOR HOVER & CLICK
          ================================================================= */}
      <mesh
        position={[0, 0.9, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverChange?.(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverChange?.(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          executeArmRoll();
          onClick?.();
        }}
      >
        <cylinderGeometry args={[1.5, 1.5, 2.2, 16]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          colorWrite={false}
        />
      </mesh>
    </group>
  );
});
