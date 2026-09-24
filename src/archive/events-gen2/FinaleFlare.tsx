"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useScrollProgress } from "@/components/scroll/useScrollProgress";
import { debugStore } from "./debugState";

const flareStreakVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const flareStreakFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uProgress;
  varying vec2 vUv;

  void main() {
    // Core glow across the horizontal centerline per §9
    float core = smoothstep(0.5, 0.0, abs(vUv.y - 0.5) * 2.0);
    core = pow(core, 3.0);

    // Trailing falloff along streak length
    float tail = smoothstep(0.0, 1.0, vUv.x) * (1.0 - uProgress * 0.6);
    float alpha = core * tail;

    gl_FragColor = vec4(uColor * 1.6, alpha);
  }
`;

export interface FinaleFlareProps {
  onFlash?: (opacity: number) => void;
  onCrossfade?: () => void;
  onShowFinaleFX?: (show: boolean) => void;
}

/**
 * FinaleFlare:
 * Stylized energy burst sequence along the gesture's aim line per §9 of Master PRD.
 * - Triggered at p >= 0.92, guarded with hasFiredRef (runs exactly once per forward pass).
 * - Timeline (~1.1s total):
 *   0.00s: Muzzle flash sprite flashes 0->1 opacity, scale 0.2->1.4, additive blend, #FFD37A
 *   0.05s: Stretched quad streak animates scaleX 0->18 over 0.35s traveling along -Z toward camera
 *   0.30s: Camera micro-shake (z += 0.4, 0.15s, yoyo)
 *   0.40s: Fullscreen flash overlay fades 0->1 over 0.25s
 *   0.65s: Crossfade canvas 1->0 while DOM content fades 0->1 (frees GPU)
 */
export function FinaleFlare({
  onFlash,
  onCrossfade,
  onShowFinaleFX,
}: FinaleFlareProps) {
  const { camera } = useThree();
  const scrollStore = useScrollProgress();

  const muzzleRef = useRef<THREE.Mesh>(null);
  const muzzleMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const streakRef = useRef<THREE.Mesh>(null);
  const streakMatRef = useRef<THREE.ShaderMaterial>(null);

  const hasFiredRef = useRef(false);

  // Hand position relative to the 6.4m tall hero billboard
  const handPos = useMemo<[number, number, number]>(() => [0.28, 5.45, 0.08], []);

  const streakUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#FFD37A") },
      uProgress: { value: 0 },
    }),
    []
  );

  const executeFinaleSequence = React.useCallback(() => {
    if (hasFiredRef.current) return;
    hasFiredRef.current = true;
    debugStore.setFinaleFired(true);

    onShowFinaleFX?.(true);

    const tl = gsap.timeline();

    // 0.00s — Muzzle flash sprite expands and flashes
    if (muzzleRef.current && muzzleMatRef.current) {
      muzzleRef.current.visible = true;
      muzzleRef.current.scale.set(0.2, 0.2, 0.2);
      muzzleMatRef.current.opacity = 1;

      tl.to(muzzleRef.current.scale, {
        x: 1.4,
        y: 1.4,
        z: 1.4,
        duration: 0.25,
        ease: "power2.out",
      }, 0);

      tl.to(muzzleMatRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power1.in",
      }, 0.15);
    }

    // 0.05s — Streak quad animates scaleX 0->18 and travels forward
    if (streakRef.current && streakMatRef.current) {
      streakRef.current.visible = true;
      streakRef.current.scale.set(0, 1, 1);
      streakRef.current.position.set(handPos[0], handPos[1], handPos[2]);

      tl.to(streakRef.current.scale, {
        x: 18,
        duration: 0.35,
        ease: "power2.out",
      }, 0.05);

      tl.to(streakRef.current.position, {
        z: handPos[2] + 4.5,
        duration: 0.35,
        ease: "power2.inOut",
      }, 0.05);

      const progProxy = { val: 0 };
      tl.to(progProxy, {
        val: 1.0,
        duration: 0.35,
        ease: "power1.out",
        onUpdate: () => {
          if (streakMatRef.current) {
            streakMatRef.current.uniforms.uProgress.value = progProxy.val;
          }
        },
      }, 0.05);
    }

    // 0.30s — Camera micro-shake on impact
    tl.to(camera.position, {
      z: "+=0.4",
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
    }, 0.30);

    // 0.40s — Full-screen white flash overlay
    const flashProxy = { opacity: 0 };
    tl.to(flashProxy, {
      opacity: 1.0,
      duration: 0.25,
      ease: "power2.in",
      onUpdate: () => {
        onFlash?.(flashProxy.opacity);
      },
    }, 0.40);

    // 0.65s — Crossfade to DOM event details
    tl.call(() => {
      onCrossfade?.();
    }, undefined, 0.65);

    // 0.90s — Fade out white flash overlay
    tl.to(flashProxy, {
      opacity: 0,
      duration: 0.45,
      ease: "power2.out",
      onUpdate: () => {
        onFlash?.(flashProxy.opacity);
      },
    }, 0.90);
  }, [camera.position, handPos, onCrossfade, onFlash, onShowFinaleFX]);

  useEffect(() => {
    debugStore.registerFinaleTrigger(() => {
      hasFiredRef.current = false;
      executeFinaleSequence();
    });
  }, [executeFinaleSequence]);

  useFrame(() => {
    const p = scrollStore.current;
    if (p >= 0.92 && !hasFiredRef.current) {
      executeFinaleSequence();
    }
  });

  return (
    <group name="finale-flare-sequence">
      {/* 1. Muzzle Flash Sprite */}
      <mesh
        ref={muzzleRef}
        position={handPos}
        visible={false}
        renderOrder={10}
      >
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial
          ref={muzzleMatRef}
          color="#FFD37A"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 2. Aim Line Stretched Energy Streak */}
      <mesh
        ref={streakRef}
        position={handPos}
        rotation={[0, 0, 0.22]} // Angled along the aim gesture
        visible={false}
        renderOrder={9}
      >
        <planeGeometry args={[1.0, 0.3]} />
        <shaderMaterial
          ref={streakMatRef}
          vertexShader={flareStreakVertexShader}
          fragmentShader={flareStreakFragmentShader}
          uniforms={streakUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
