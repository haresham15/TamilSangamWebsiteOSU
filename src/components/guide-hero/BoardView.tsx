"use client";

import React, { Suspense } from "react";
import { SceneView as View } from "@/components/canvas/SceneView";
import type { BoardProps } from "./Board";
import { governor } from "@/engine/governor";
import { useWarmup } from "@/components/gl/useWarmup";
import { useRenderMode } from "@/components/providers/useRenderMode";
import { StationScene } from "./station/StationScene";
import { getGuideStationProgress, getGuideStationTargetProgress, useGuideStationTimeline } from "./station/useGuideStationTimeline";

interface BoardViewProps extends Pick<BoardProps, "boardWidth" | "boardHeight" | "cols" | "rows"> {
  sequenceElement: React.RefObject<HTMLElement | null>;
}

interface StationViewSceneProps extends Omit<BoardViewProps, "sequenceElement"> {
  rainCount: number;
  crowdCount: number;
}

function StationViewScene({ boardWidth, boardHeight, cols, rows, rainCount, crowdCount }: StationViewSceneProps) {
  useWarmup("guide-station");

  return (
    <Suspense fallback={null}>
      <StationScene
        rainCount={rainCount}
        crowdCount={crowdCount}
        getProgress={getGuideStationProgress}
        getTargetProgress={getGuideStationTargetProgress}
        board={{ boardWidth, boardHeight, cols, rows }}
      />
    </Suspense>
  );
}

/** Production station view: one View, one ScrollTrigger input, one master-tick progress follower. */
export default function BoardView({ sequenceElement, ...boardProps }: BoardViewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  useGuideStationTimeline(sequenceElement);
  // PRD §8.1 tiers: rain 500 / 250 and crowd 12 / 8 (static mode never mounts this view).
  const { mode } = useRenderMode();
  const rainCount = mode === "A" ? 500 : 250;
  const crowdCount = mode === "A" ? 12 : 8;

  React.useEffect(() => {
    governor.request("guide-station", 2);

    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => governor.request("guide-station", entry.isIntersecting ? 2 : 0),
      { threshold: 0.01 }
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      governor.request("guide-station", 0);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full pointer-events-none">
      {/* Index 2 deliberately renders after the global grade stack; see Phase 0B checkpoint. */}
      <View className="h-full w-full pointer-events-auto" index={2} grade={{ hero: "guide", profile: "alaipayuthey-bluehour" }}>
        <StationViewScene {...boardProps} rainCount={rainCount} crowdCount={crowdCount} />
      </View>
    </div>
  );
}
