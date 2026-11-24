"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRenderMode } from "@/components/providers/useRenderMode";
import { useBootStore } from "@/engine/bootStore";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { BlueprintPin, BLUEPRINT_PINS, BlueprintSVG } from "./BlueprintSVG";
import type { EphemeralPin } from "./BlueprintSceneGL";

// The 3D scenes are separate chunks so the static fallback (Tier C, Lite, reduced motion)
// never downloads or initialises three.js.
const BlueprintSceneGL = dynamic(() => import("./BlueprintSceneGL").then((m) => m.BlueprintSceneGL), {
  ssr: false,
  loading: () => null,
});
const BlueprintSceneLegacy = dynamic(() => import("./BlueprintSceneLegacy").then((m) => m.BlueprintSceneLegacy), {
  ssr: false,
  loading: () => null,
});

interface BlueprintScene3DProps {
  scrollProgress: React.MutableRefObject<number>; // 0 to 1
  /** Forces the static SVG (the page's own Lite / Tier C / reduced-motion decision). */
  isLiteMode?: boolean;
  newPin?: EphemeralPin | null;
  onSelectPin?: (pin: BlueprintPin) => void;
  className?: string;
}

export function BlueprintScene3D({ scrollProgress, isLiteMode = false, newPin = null, onSelectPin, className = "" }: BlueprintScene3DProps) {
  const { mode, qualityLevel } = useRenderMode();
  const [cinematic] = useState(() => isHeroCinematicEnabled("suggestions"));
  const showStaticSvg = isLiteMode || mode === "static";

  useEffect(() => {
    if (showStaticSvg) {
      useBootStore.getState().markReady("ideas-blueprint");
    }
  }, [showStaticSvg]);

  if (showStaticSvg) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <BlueprintSVG
          progress={1}
          onSelectCategory={(cat) => {
            const found = BLUEPRINT_PINS.find((p) => p.category === cat);
            if (found && onSelectPin) onSelectPin(found);
          }}
          className="max-w-4xl mx-auto shadow-[6px_6px_0px_#090d20] rounded-none border border-[#415682]"
        />
      </div>
    );
  }

  if (!cinematic) {
    return <BlueprintSceneLegacy scrollProgress={scrollProgress} newPin={newPin} onSelectPin={onSelectPin} className={className} />;
  }

  return (
    <BlueprintSceneGL
      scrollProgress={scrollProgress}
      newPin={newPin}
      onSelectPin={onSelectPin}
      className={className}
      mode={mode}
      qualityLevel={qualityLevel}
    />
  );
}
