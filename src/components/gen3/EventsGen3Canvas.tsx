"use client";

import React, { Component, ErrorInfo, useMemo, createContext, useContext } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SceneLighting } from "./SceneLighting";
import { MinimalPlatform } from "./MinimalPlatform";
import { SangamLogo3D } from "./SangamLogo3D";
import { VolumetricCones } from "./VolumetricCones";
import { LeoCameraRig } from "./LeoCameraRig";
import { LeoScrollController } from "./LeoScrollController";
import { DustCloud } from "./DustCloud";
import { LeoFactoryEnvironment } from "./LeoFactoryEnvironment";
import { JumpingCrowdSilhouettes } from "./JumpingCrowdSilhouettes";
import { Environment, BakeShadows, View } from "@react-three/drei";
import { createBespokeEnvironmentTexture } from "@/components/shared/createCustomEnvironment";
import { useWarmup } from "@/components/gl/useWarmup";
import { governor } from "@/engine/governor";
import { SceneRegistrar } from "@/director/wireframe";

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

function EventsConcertScene({ bespokeEnv }: { bespokeEnv: THREE.Texture | null }) {
  useWarmup("events-arena");

  return (
    <>
      {/* Concert stadium dark backdrop */}
      <color attach="background" args={["#0c0a08"]} />

      {/* Distant atmospheric concert fog */}
      <fogExp2 attach="fog" args={["#0c0a08", 0.024]} />

      {/* Bespoke Scene-Matched Concert Arena Environment Map */}
      {bespokeEnv && <Environment map={bespokeEnv} background={false} />}

      <DepthTextureProvider>
        <React.Suspense fallback={null}>
          <BakeShadows />
          <LeoCameraRig />
          <LeoScrollController />
          <LeoFactoryEnvironment />
          <VolumetricCones />
          <DustCloud />
          <SceneLighting />
          <MinimalPlatform />
          <SangamLogo3D />
          <JumpingCrowdSilhouettes />
        </React.Suspense>
      </DepthTextureProvider>
    </>
  );
}

export function EventsGen3Canvas() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  // Bespoke scene-matched environment reflections (§1.1b PRD Mandate)
  const bespokeEnv = useMemo(() => createBespokeEnvironmentTexture("arena-concert"), []);
  const [inView, setInView] = React.useState(true);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    governor.request("events-arena", inView ? 2 : 0);
    return () => {
      governor.request("events-arena", 0);
      bespokeEnv?.dispose();
    };
  }, [inView, bespokeEnv]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[100dvh] absolute top-0 left-0 bg-transparent pointer-events-none">
      <CanvasErrorBoundary>
        <View className="w-full h-full pointer-events-auto" index={2}>
          <SceneRegistrar />
          <EventsConcertScene bespokeEnv={bespokeEnv} />
        </View>
      </CanvasErrorBoundary>
      {/* High-performance CSS Vignette overlay to crush corner bleeding (§Spike S3) */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: "radial-gradient(circle at center, transparent 40%, rgba(12,10,8,0.76) 100%)",
        }}
      />
    </div>
  );
}
