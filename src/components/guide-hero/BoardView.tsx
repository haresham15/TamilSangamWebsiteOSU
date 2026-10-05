// src/components/guide-hero/BoardView.tsx
"use client";

import React, { Suspense } from "react";
import { View, PerspectiveCamera } from "@react-three/drei";
import Board, { BoardProps } from "./Board";
import { governor } from "@/engine/governor";
import { useWarmup } from "@/components/gl/useWarmup";

function BoardScene({ ...boardProps }: BoardProps) {
  useWarmup("guide-board");

  return (
    <>
      <color attach="background" args={["#070504"]} />
      <PerspectiveCamera makeDefault fov={28} position={[0, 0, 18]} near={0.1} far={50} />
      <Suspense fallback={null}>
        <Board {...boardProps} />
      </Suspense>
    </>
  );
}

export default function BoardView({ ...boardProps }: BoardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Immediately declare level 1 on mount so initial render occurs
    governor.request("guide-board", 1);

    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        governor.request("guide-board", entry.isIntersecting ? 1 : 0);
      },
      { threshold: 0.01 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      governor.request("guide-board", 0);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <View className="w-full h-full">
        <BoardScene {...boardProps} />
      </View>
    </div>
  );
}
