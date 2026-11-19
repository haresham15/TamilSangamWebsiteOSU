"use client";

// Loaded on demand by GopuramZScroll only when the render mode is not static, so the
// static / Lite / reduced-motion path never fetches or builds any of the 3D hero.

import React from "react";
import { SceneView as View } from "@/components/canvas/SceneView";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import type { RenderMode } from "@/components/providers/useRenderMode";
import { GopuramArtScene } from "./GopuramArtScene";
import { LegacyGopuramScene } from "./LegacyGopuramScene";

export default function GopuramCanvas({ scrollProgressRef, isMobile, visible, mode, qualityLevel }: {
  scrollProgressRef: React.RefObject<number>;
  isMobile: boolean;
  visible: boolean;
  mode: Exclude<RenderMode, "static">;
  qualityLevel: number;
}) {
  const [cinematic] = React.useState(() => isHeroCinematicEnabled("about"));
  return (
    <View
      className="absolute inset-0 h-full w-full pointer-events-none"
      index={2}
      visible={visible}
      grade={cinematic ? { hero: "about", profile: "chola-gopuram" } : undefined}
    >
      {cinematic ? (
        <GopuramArtScene scrollProgressRef={scrollProgressRef} isMobile={isMobile} mode={mode} qualityLevel={qualityLevel} />
      ) : (
        <LegacyGopuramScene scrollProgressRef={scrollProgressRef} isMobile={isMobile} tier={mode} />
      )}
    </View>
  );
}
