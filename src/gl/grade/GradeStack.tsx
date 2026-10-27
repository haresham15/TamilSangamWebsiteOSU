// src/gl/grade/GradeStack.tsx
"use client";

import type { HeroGradeProfileName } from "./gradeConfig";

export interface GradeStackProps {
  tier: "A" | "B" | "C";
  gradeOn?: boolean;
  intensity?: number;
  profile?: HeroGradeProfileName;
}

/**
 * GradeStack
 *
 * Notice: @react-three/postprocessing's EffectComposer is fundamentally incompatible
 * with Drei's multi-viewport <View> architecture on high-DPI displays (DPR > 1).
 * In multi-view mode, EffectComposer's passes calculate resolution using CSS pixels
 * (via gl.getSize()) instead of physical drawingBuffer dimensions, forcing a viewport
 * scissor mismatch that truncates/cuts off the right side of the canvas at 1/DPR width.
 *
 * Cinematic tone mapping and HDR lighting response are handled natively by Three.js on
 * the shared WebGLRenderer in GlobalCanvas (ACESFilmicToneMapping), ensuring 100% full-width
 * rendering with zero clipping across all 8 route heroes.
 */
export function GradeStack(_props: GradeStackProps) {
  return null;
}

export default GradeStack;
