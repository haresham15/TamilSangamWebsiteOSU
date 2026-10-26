"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  createKajiyaKayStringMaterial,
  AnamorphicStreakShader,
  type SingleStringUniforms,
} from "./stringMaterial";
import { heroState, registerPluckHandlers, recordStringPluck } from "../state";
import { soundEngine } from "@/lib/soundEngine";
import { StringEnergyModel } from "./energy";

export const globalStringEnergy = new StringEnergyModel();

if (typeof window !== "undefined") {
  (window as unknown as { __globalStringEnergy: StringEnergyModel }).__globalStringEnergy = globalStringEnergy;
}

/**
 * LAYER 3: 6 KAJIYA-KAY ANISOTROPIC PHOSPHOR-BRONZE STRINGS
 * 
 * - True graduated gauges: [0.020, 0.017, 0.014, 0.011, 0.0085, 0.007]
 * - 0: E2 (146.83Hz D-tuned), 1: A2, 2: D3, 3: G3 (Wound Phosphor Bronze)
 * - 4: B3, 5: E4 (Plain High-Carbon Steel-Gold)
 * - Anti-Aliased Micro-Helical Winding with fwidth() — ZERO sawtooth serrated blades
 * - Anamorphic Horizontal Lens Streak Billboards flashing on pluck
 * - Interactive pointer strumming & sympathetic scroll pluck
 */

const STRING_CONFIG = [
  { index: 0, name: "E2", radius: 0.020, isWound: true, hz: 146.83 },
  { index: 1, name: "A2", radius: 0.017, isWound: true, hz: 220.25 },
  { index: 2, name: "D3", radius: 0.014, isWound: true, hz: 293.66 },
  { index: 3, name: "G3", radius: 0.011, isWound: true, hz: 367.08 },
  { index: 4, name: "B3", radius: 0.0085, isWound: false, hz: 440.49 },
  { index: 5, name: "E4", radius: 0.007, isWound: false, hz: 659.25 },
];

export function Strings() {
  const prevPointerX = useRef<number | null>(null);

  // Pluck physics state arrays
  const pluckAmps = useRef<number[]>([0, 0, 0, 0, 0, 0]);
  const streakMats = useRef<THREE.ShaderMaterial[]>([]);
  const stringMeshes = useRef<(THREE.Mesh | null)[]>([]);

  // 1. Create memoized geometries and materials for all 6 strings
  const stringAssets = useMemo(() => {
    // Speaking length L = distance from z = -5.35 (bridge saddle) to z = +4.8 (nut)
    const length = 10.15;

    return STRING_CONFIG.map((cfg, i) => {
      // High-resolution cylinder geometry (radial 32, height 140)
      const geo = new THREE.CylinderGeometry(cfg.radius, cfg.radius, length, 32, 140);
      // Pivot at center, oriented along Y axis (0 to length)
      geo.translate(0, length / 2, 0);

      const { material, uniforms } = createKajiyaKayStringMaterial(cfg.isWound, cfg.hz);

      // Anamorphic Lens Streak Billboard geometry & material
      const streakGeo = new THREE.PlaneGeometry(2.5, 0.06);
      const streakMat = new THREE.ShaderMaterial({
        ...AnamorphicStreakShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      return {
        geo,
        material,
        uniforms,
        streakGeo,
        streakMat,
        config: cfg,
        index: i,
      };
    });
  }, []);

  useEffect(() => {
    return () => {
      stringAssets.forEach((asset) => {
        asset.geo.dispose();
        asset.material.dispose();
        asset.streakGeo.dispose();
        asset.streakMat.dispose();
      });
    };
  }, [stringAssets]);

  // 2. Compute string 3D endpoint vectors in guitar group space
  // Bridge saddle: z = -5.35, y = 0.18. Spacing: (i - 2.5) * 0.22
  // Nut: z = 4.8, y = 0.16. Spacing: (i - 2.5) * 0.14
  const stringTransforms = useMemo(() => {
    const up = new THREE.Vector3(0, 1, 0);

    return STRING_CONFIG.map((_, i) => {
      const xBridge = (i - 2.5) * 0.22;
      const xNut = (i - 2.5) * 0.14;

      const pBridge = new THREE.Vector3(xBridge, 0.18, -5.35);
      const pNut = new THREE.Vector3(xNut, 0.16, 4.8);

      const dir = new THREE.Vector3().subVectors(pNut, pBridge).normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);

      const midpoint = new THREE.Vector3().addVectors(pBridge, pNut).multiplyScalar(0.5);

      return {
        pBridge,
        pNut,
        quat,
        midpoint,
      };
    });
  }, []);

  // Trigger pluck helper
  const triggerPluck = (i: number, amp = 0.8) => {
    const clamped = Math.min(1.0, Math.max(0.2, amp));
    pluckAmps.current[i] = clamped;
    globalStringEnergy.triggerPluck(i, clamped);
    recordStringPluck(i);
    soundEngine.playAcousticString(i, clamped);
  };

  // Register external pluck handlers
  useEffect(() => {
    registerPluckHandlers(
      (idx, amp) => triggerPluck(idx, amp ?? 0.8),
      () => {
        for (let i = 0; i < 6; i++) {
          setTimeout(() => triggerPluck(i, 0.85 - i * 0.05), i * 55);
        }
      }
    );

    return () => {
      stringAssets.forEach((asset) => {
        asset.geo.dispose();
        asset.material.dispose();
        asset.streakGeo.dispose();
        asset.streakMat.dispose();
      });
    };
  }, [stringAssets]);

  // Per-frame physics simulation and uniform animation
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    const camPos = state.camera.position;
    const scrollVel = heroState.rawVelocity;

    // Advance globalStringEnergy model
    globalStringEnergy.update(dt, scrollVel, heroState.stringsDamperK);

    // Decay pluck amplitudes exponentially (tau ~ 0.35s)
    for (let i = 0; i < 6; i++) {
      pluckAmps.current[i] *= Math.exp(-dt * 2.8);
      if (pluckAmps.current[i] < 0.001) pluckAmps.current[i] = 0.0;
      heroState.stringEnergies[i] = pluckAmps.current[i];
    }

    // Interactive pointer strumming
    const ptrX = state.pointer.x;
    if (prevPointerX.current !== null) {
      const pDelta = ptrX - prevPointerX.current;
      if (Math.abs(pDelta) > 0.0015) {
        const minX = Math.min(prevPointerX.current, ptrX);
        const maxX = Math.max(prevPointerX.current, ptrX);

        for (let i = 0; i < 6; i++) {
          // Approximate normalized screen space line for each string
          const screenX = (i - 2.5) * 0.12 - 0.05;
          if (screenX >= minX && screenX <= maxX) {
            const velocity = Math.min(1.0, Math.max(0.3, Math.abs(pDelta) * 14.0));
            triggerPluck(i, velocity);
          }
        }
      }
    }
    prevPointerX.current = ptrX;

    // Update string materials & anamorphic streaks
    stringAssets.forEach((asset, i) => {
      const u = asset.uniforms as SingleStringUniforms;
      u.uTime.value = t;
      u.uPluckAmp.value = pluckAmps.current[i];
      u.uScrollVel.value = scrollVel;
      u.uCameraPos.value.copy(camPos);

      // Streak billboard opacity
      const streakMat = asset.streakMat;
      if (streakMat) {
        streakMat.uniforms.uOpacity.value = THREE.MathUtils.damp(
          streakMat.uniforms.uOpacity.value,
          pluckAmps.current[i] * 0.85,
          12.0,
          dt
        );
      }
    });
  });

  return (
    // Strings assembly anchored inside the same guitar stage coordinate frame:
    // position={[0.15, -0.15, -1.0]} rotation={[0.18, -0.28, -0.12]}
    <group
      name="kajiya-kay-strings-assembly"
      position={[0.15, -0.15, -1.0]}
      rotation={[0.18, -0.28, -0.12]}
    >
      {stringAssets.map((asset, i) => {
        const tf = stringTransforms[i];

        return (
          <group key={i}>
            {/* 1. Main High-Resolution Cylinder String */}
            <mesh
              ref={(el) => {
                stringMeshes.current[i] = el;
              }}
              geometry={asset.geo}
              material={asset.material}
              position={tf.pBridge}
              quaternion={tf.quat}
              castShadow
            />

            {/* 2. Anamorphic Horizontal Lens Streak Billboard at Midpoint */}
            <mesh
              geometry={asset.streakGeo}
              material={asset.streakMat}
              position={tf.midpoint}
              ref={(el) => {
                if (el) {
                  // Keep billboard facing camera
                  el.lookAt(stateCameraPosFallback(tf.midpoint));
                }
              }}
            />
          </group>
        );
      })}
    </group>
  );
}

function stateCameraPosFallback(midpoint: THREE.Vector3) {
  return new THREE.Vector3(midpoint.x - 1.5, midpoint.y + 1.2, midpoint.z + 4.0);
}

export default Strings;
