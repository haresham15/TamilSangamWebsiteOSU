"use client";

import React, { Suspense } from "react";
import { View } from "@react-three/drei";
import type { BoardProps } from "./Board";
import { governor } from "@/engine/governor";
import { useWarmup } from "@/components/gl/useWarmup";
import { StationScene } from "./station/StationScene";
import { getGuideStationProgress, getGuideStationTargetProgress, useGuideStationTimeline } from "./station/useGuideStationTimeline";

interface BoardViewProps extends Pick<BoardProps, "boardWidth" | "boardHeight" | "cols" | "rows"> {
  sequenceElement: React.RefObject<HTMLElement | null>;
}

function StationViewScene({ boardWidth, boardHeight, cols, rows }: Omit<BoardViewProps, "sequenceElement">) {
  useWarmup("guide-station");

  return (
    <Suspense fallback={null}>
      <StationScene
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

  React.useEffect(() => {
    governor.request("guide-station", 1);

    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => governor.request("guide-station", entry.isIntersecting ? 1 : 0),
      { threshold: 0.01 }
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      governor.request("guide-station", 0);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      {/* Index 2 deliberately renders after the global grade stack; see Phase 0B checkpoint. */}
      <View className="h-full w-full" index={2}>
        <StationViewScene {...boardProps} />
      </View>
    </div>
  );
}
