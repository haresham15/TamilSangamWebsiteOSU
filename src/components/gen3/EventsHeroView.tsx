"use client";

// The live Events hero (loaded lazily by EventsGen3Canvas, never in static mode).
// Cinematic flag on: the art-pass forge arena. Off (`?cinematic_events=0`): the previous
// scene, kept for comparison.
import React, { Component, type ErrorInfo, type ReactNode, useMemo } from "react";
import { Environment } from "@react-three/drei";
import { SceneView as View } from "@/components/canvas/SceneView";
import { createBespokeEnvironmentTexture } from "@/components/shared/createCustomEnvironment";
import { useWarmup } from "@/components/gl/useWarmup";
import { useHeroStageVisibility } from "@/components/canvas/HeroScrollStage";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { useRenderMode } from "@/components/providers/useRenderMode";
import { useShadowUpdates } from "@/gl/shadows";
import { SceneLighting } from "./SceneLighting";
import { MinimalPlatform } from "./MinimalPlatform";
import { SangamLogo3D } from "./SangamLogo3D";
import { VolumetricCones } from "./VolumetricCones";
import { LeoCameraRig } from "./LeoCameraRig";
import { LeoScrollController } from "./LeoScrollController";
import { DustCloud } from "./DustCloud";
import { LeoFactoryEnvironment } from "./LeoFactoryEnvironment";
import { JumpingCrowdSilhouettes } from "./JumpingCrowdSilhouettes";
import { ForgeArena, type ForgeQuality } from "./art/ForgeArena";

// Legacy-only: kept lazy so cinematic mode never fetches the performer GLB.
const Performer = React.lazy(() => import("./Performer").then((m) => ({ default: m.Performer })));

/**
 * Catches errors thrown inside the View. drei's View renders its children in the shared
 * canvas's React root, so a DOM error boundary around <View> never sees them.
 */
class SceneErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[EventsHero] scene failed, showing the static poster:", error, info.componentStack);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Legacy scene (cinematic flag off). */
function LegacyConcertScene({ progressRef }: { progressRef: React.RefObject<number> }) {
  const bespokeEnv = useMemo(() => createBespokeEnvironmentTexture("arena-concert"), []);
  React.useEffect(() => () => bespokeEnv?.dispose(), [bespokeEnv]);
  // Shadows were baked once (drei BakeShadows); same behaviour, without freezing other heroes.
  useShadowUpdates({ mode: "static" });

  return (
    <>
      <color attach="background" args={["#0c0a08"]} />
      <fogExp2 attach="fog" args={["#0c0a08", 0.024]} />
      {bespokeEnv && <Environment map={bespokeEnv} background={false} />}
      <LeoCameraRig />
      <LeoScrollController progressRef={progressRef} />
      <LeoFactoryEnvironment />
      <VolumetricCones />
      <DustCloud />
      <SceneLighting />
      <MinimalPlatform />
      <React.Suspense fallback={null}>
        <Performer />
      </React.Suspense>
      <SangamLogo3D progressRef={progressRef} />
      <spotLight position={[0, 4.5, -2.5]} color="#4FD6E0" intensity={35} angle={0.45} penumbra={0.6} />
      <JumpingCrowdSilhouettes />
    </>
  );
}

function Warmup() {
  useWarmup("events-arena");
  return null;
}

export default function EventsHeroView({ progressRef, onError }: { progressRef: React.RefObject<number>; onError: () => void }) {
  const visible = useHeroStageVisibility();
  const { mode, qualityLevel } = useRenderMode();
  const [cinematic] = React.useState(() => isHeroCinematicEnabled("events"));
  // Fixed at mount: the arena's geometry is baked per quality, so it is not rebuilt mid-scroll
  // when the adaptive governor steps (that rebuild would itself cause a hitch).
  const [quality] = React.useState<ForgeQuality>(() => (mode === "B" ? 2 : (Math.min(qualityLevel, 2) as ForgeQuality)));

  return (
    <View
      className="w-full h-full pointer-events-auto"
      index={2}
      visible={visible}
      grade={cinematic ? { hero: "events", profile: "leo-forge" } : undefined}
    >
      <SceneErrorBoundary onError={onError}>
        <React.Suspense fallback={null}>
          <Warmup />
          {cinematic ? (
            <>
              <LeoCameraRig />
              <LeoScrollController progressRef={progressRef} />
              <ForgeArena quality={quality} />
            </>
          ) : (
            <LegacyConcertScene progressRef={progressRef} />
          )}
        </React.Suspense>
      </SceneErrorBoundary>
    </View>
  );
}
