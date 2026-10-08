"use client";

import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import * as THREE from "three";
import { useTier } from "@/components/providers/TierProvider";
import { useLiteMode } from "@/context/LiteModeContext";
import { registerRenderer, unregisterRenderer } from "@/engine/renderer";
import { GradeStack } from "@/gl/grade/GradeStack";

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
      unregisterRenderer();
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
        dpr={[1, tier === "A" ? 1.75 : 1.25]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ width: "100%", height: "100%" }}
        onCreated={({ gl, advance, clock }) => {
          gl.setClearAlpha(0);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
          registerRenderer(gl, advance, clock);
        }}
      >
        <View.Port />
        <GradeStack tier={tier} />
      </Canvas>
    </div>
  );
}
export default GlobalCanvas;
