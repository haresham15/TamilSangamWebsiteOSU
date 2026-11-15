"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";
import { useTier, type Tier } from "@/components/providers/TierProvider";
import { useLiteMode } from "@/context/LiteModeContext";
import { qualityGovernor, type QualityLevel } from "@/engine/qualityGovernor";

export type RenderMode = "static" | "B" | "A";

export interface RenderModeState {
  /** static = no canvas (Tier C, Lite, reduced motion) → show the hero's static fallback. */
  mode: RenderMode;
  tier: Tier;
  lite: boolean;
  reducedMotion: boolean;
  /** Adaptive quality step (0 full … 3 = hero runs its Tier-B feature set). */
  qualityLevel: QualityLevel;
}

const serverLevel = (): QualityLevel => 0;

/**
 * Single source of truth for hero quality. Combines TierProvider, the Lite toggle,
 * prefers-reduced-motion and the measured quality governor. GlobalCanvas renders
 * nothing in Tier C / Lite, so any hero in "static" mode must render its fallback.
 */
export function useRenderMode(): RenderModeState {
  const tier = useTier();
  const { isLiteMode } = useLiteMode();
  const reducedMotion = Boolean(useReducedMotion());
  const qualityLevel = useSyncExternalStore(qualityGovernor.subscribe, qualityGovernor.getLevel, serverLevel);

  let mode: RenderMode;
  if (tier === "C" || isLiteMode || reducedMotion) mode = "static";
  else if (tier === "B" || qualityLevel >= 3) mode = "B";
  else mode = "A";

  return { mode, tier, lite: isLiteMode, reducedMotion, qualityLevel };
}
