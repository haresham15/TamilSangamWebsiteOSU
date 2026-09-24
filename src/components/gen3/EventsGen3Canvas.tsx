"use client";

import React, { Component, ErrorInfo, useMemo, createContext, useContext } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SceneLighting } from "./SceneLighting";
import { MinimalPlatform } from "./MinimalPlatform";
import { SangamLogo3D } from "./SangamLogo3D";
import { CameraChoreography } from "./CameraChoreography";
import { useScrollCinematic } from "./useScrollCinematic";
import { VolumetricCones } from "./VolumetricCones";
import { DustCloud } from "./DustCloud";
import { LeoFactoryEnvironment } from "./LeoFactoryEnvironment";
import { JumpingCrowdSilhouettes } from "./JumpingCrowdSilhouettes";

// The strict blueprint mandate: magenta error state on failure, no silent fallbacks.
class CanvasErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[EventsGen3Canvas] Critical render failure:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[100dvh] bg-[#FF00FF] flex flex-col items-center justify-center p-8 text-black font-mono text-sm text-center">
          <h1 className="text-2xl font-bold mb-4">CRITICAL RENDER FAILURE</h1>
          <p className="max-w-xl">
            The Phase 1 human deliverable prerequisite was not met.
            <br /><br />
            <strong>Error:</strong> {this.state.errorMsg}
            <br /><br />
            Ensure `public/models/performer.glb` is present and valid. Silent placeholder meshes are forbidden by the Gen 3 architecture rules.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export const DepthContext = createContext<THREE.WebGLRenderTarget | null>(null);

export function useDepthTarget() {
  return useContext(DepthContext);
}

// Global Depth Target configuration for Phase 5 (Volumetrics) and Phase 6 (Prepass)
function DepthTextureProvider({ children }: { children: React.ReactNode }) {
  const { gl, size } = useThree();
  
  const depthTarget = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio());
    target.depthTexture = new THREE.DepthTexture(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio());
    target.depthTexture.format = THREE.DepthFormat;
    target.depthTexture.type = THREE.UnsignedShortType; // Sufficient for most depth needs, better mobile compat
    return target;
  }, [size, gl]);

  // Dispose WebGL render target and depth texture to prevent GPU memory accumulation
  React.useEffect(() => {
    return () => {
      depthTarget.dispose();
      depthTarget.depthTexture?.dispose();
    };
  }, [depthTarget]);

  return <DepthContext.Provider value={depthTarget}>{children}</DepthContext.Provider>;
}

export function EventsGen3Canvas() {
  // Initialize scroll tracking (does not cause react re-renders inside useFrame)
  useScrollCinematic("events-hero-trigger");

  return (
    <div className="w-full h-full min-h-[100dvh] absolute top-0 left-0 bg-[#050200]">
      <CanvasErrorBoundary>
        <Canvas
          dpr={[1, 2]}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            toneMappingExposure: 1.15,
          }}
          shadows={{ type: THREE.PCFShadowMap }}
        >
          <color attach="background" args={["#0c0a08"]} />
          <fogExp2 attach="fog" args={["#14100c", 0.016]} />
          
          <DepthTextureProvider>
            <React.Suspense fallback={null}>
              <CameraChoreography />
              <LeoFactoryEnvironment />
              <VolumetricCones />
              <DustCloud />
              <SceneLighting />
              <MinimalPlatform />
              <SangamLogo3D />
              <JumpingCrowdSilhouettes />
            </React.Suspense>
          </DepthTextureProvider>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
