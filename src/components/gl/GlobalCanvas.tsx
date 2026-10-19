"use client";

import React, { useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { View } from "@react-three/drei";
import * as THREE from "three";
import { useTier } from "@/components/providers/TierProvider";
import { useLiteMode } from "@/context/LiteModeContext";
import { registerRenderer, unregisterRenderer } from "@/engine/renderer";
import { SceneRegistrar } from "@/director/wireframe";

function RendererBridge() {
  const { gl, advance, clock } = useThree();
  useEffect(() => {
    registerRenderer(gl, advance, clock);
    return unregisterRenderer;
  }, [gl, advance, clock]);
  // Drei renders each portal at priority 2 with autoClear disabled.
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    gl.setScissorTest(false);
    gl.setClearColor(0, 0);
    gl.clear();
  }, 1);
  return null;
}

/**
 * GlobalCanvas (§3.1)
 * Exactly ONE persistent WebGL canvas mounted at the application root.
 * - frameloop="never": rendered strictly via masterTick -> advance() (§4.2)
 * - eventSource bound to #app-root so DOM children receive R3F pointer events (§3.2)
 * - View.Port renders all active Drei <View> scene viewports across routes
 * - Tier C (Lite) renders nothing
 */
export function GlobalCanvas() {
  const tier = useTier();
  const { isLiteMode } = useLiteMode();
  const [source, setSource] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setSource(document.getElementById("app-root"));
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  if (!source || tier === "C" || isLiteMode) {
    return null; // Lite: no canvas at all (§2, §3.1)
  }

  return (
    <div id="gl-root" aria-hidden="true">
      <Canvas
        eventSource={source}
        eventPrefix="client"
        frameloop="never"
        shadows
        dpr={[1, tier === "A" ? 1.75 : 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ width: "100%", height: "100%" }}
        onCreated={({ gl }) => {
          gl.setClearAlpha(0);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <RendererBridge />
        <SceneRegistrar />
        <View.Port />
      </Canvas>
    </div>
  );
}
export default GlobalCanvas;
