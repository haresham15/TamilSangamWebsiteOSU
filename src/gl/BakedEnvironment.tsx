// src/gl/BakedEnvironment.tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface BakedEnvironmentProps {
  /** Lightformers / meshes that light the environment (rendered once, never shown). */
  children: ReactNode;
  /** PMREM cube face size. */
  resolution?: number;
  near?: number;
  far?: number;
}

/**
 * Drop-in for drei `<Environment frames={1} background={false}>{lightformers}</Environment>`.
 *
 * drei renders the children into a cube render target, and three then converts that
 * render-target texture to PMREM inside WebGLRenderer. That conversion path
 * (getPMREM → isRenderTargetTexture branch, three r186) never registers a dispose
 * listener, so each mount leaked one PMREM target. Here the children are baked straight
 * to PMREM with PMREMGenerator.fromScene, and this component owns and frees the result.
 */
// near/far match drei EnvironmentPortal's CubeCamera(1, 1000) so the bake sees the same lightformers.
export function BakedEnvironment({ children, resolution = 256, near = 1, far = 1000 }: BakedEnvironmentProps) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const [envScene] = useState(() => {
    const s = new THREE.Scene();
    s.background = new THREE.Color(0x000000);
    return s;
  });
  const target = useRef<THREE.WebGLRenderTarget | null>(null);
  const baked = useRef(false);

  // Bake on the first frame after the portal children have mounted (priority 0 runs
  // before GlobalCanvas's clear and the View renders).
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0 || baked.current) return;
    baked.current = true;
    const pmrem = new THREE.PMREMGenerator(gl);
    target.current = pmrem.fromScene(envScene, 0, near, far, { size: resolution });
    pmrem.dispose();
    scene.environment = target.current.texture;
  });

  useEffect(() => {
    return () => {
      if (target.current && scene.environment === target.current.texture) scene.environment = null;
      target.current?.dispose();
      target.current = null;
      baked.current = false;
    };
  }, [scene]);

  return createPortal(children, envScene);
}
