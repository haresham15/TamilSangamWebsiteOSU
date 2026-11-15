"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { View } from "@react-three/drei";
import * as THREE from "three";
import { useTier } from "@/components/providers/TierProvider";
import { useLiteMode } from "@/context/LiteModeContext";
import { registerRenderer, unregisterRenderer } from "@/engine/renderer";
import { SceneRegistrar } from "@/director/wireframe";
import { dprCapFor, qualityGovernor, type QualityLevel } from "@/engine/qualityGovernor";

const serverLevel = (): QualityLevel => 0;

/** Adaptive quality level 2 caps device pixel ratio at 1.25 (src/engine/qualityGovernor.ts). */
function DprGovernor({ tierCap }: { tierCap: number }) {
  const setDpr = useThree((s) => s.setDpr);
  const level = useSyncExternalStore(qualityGovernor.subscribe, qualityGovernor.getLevel, serverLevel);
  useEffect(() => {
    const cap = dprCapFor(level, tierCap);
    setDpr([1, cap]);
  }, [level, tierCap, setDpr]);
  return null;
}

/**
 * Resolves after the first largest-contentful-paint entry (plus one idle slot), so
 * WebGL context creation and shader compiles never compete with LCP. Falls back after 2.5 s.
 */
function useAfterLcp(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let done = false;
    let idleId: number | null = null;
    const finish = () => {
      if (done) return;
      done = true;
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (ric) idleId = ric(() => setReady(true), { timeout: 300 });
      else setReady(true);
    };
    const fallback = window.setTimeout(finish, 2500);
    let observer: PerformanceObserver | null = null;
    try {
      observer = new PerformanceObserver((list) => {
        if (list.getEntries().length > 0) finish();
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      finish();
    }
    return () => {
      done = true;
      window.clearTimeout(fallback);
      observer?.disconnect();
      const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (idleId !== null && cic) cic(idleId);
    };
  }, []);
  return ready;
}

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
 * - Mounts only after LCP (sangam-motion: WebGL init deferred until after LCP)
 */
export function GlobalCanvas() {
  const tier = useTier();
  const { isLiteMode } = useLiteMode();
  const [source, setSource] = useState<HTMLElement | null>(null);
  const afterLcp = useAfterLcp();
  const tierCap = tier === "A" ? 1.75 : 1.5;

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setSource(document.getElementById("app-root") ?? document.body);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (!source || !afterLcp || tier === "C" || isLiteMode) {
    return null; // Lite: no canvas at all (§2, §3.1)
  }

  return (
    <div id="gl-root" aria-hidden="true" className="fixed inset-0 w-full h-[100dvh] pointer-events-none z-[1] bg-transparent">
      <Canvas
        eventSource={source}
        eventPrefix="client"
        frameloop="never"
        shadows
        dpr={[1, tierCap]}
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
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <RendererBridge />
        <DprGovernor tierCap={tierCap} />
        <SceneRegistrar />
        <View.Port />
      </Canvas>
    </div>
  );
}
export default GlobalCanvas;
