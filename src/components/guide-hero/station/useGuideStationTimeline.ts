"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerSystem } from "@/engine/masterTick";
import { sampleGuideRail } from "./guideRail";
import { parseGuideStationDebug } from "./debug";

const progressState = { current: 0, target: 0 };

export function getGuideStationProgress() {
  return progressState.current;
}

export function getGuideStationTargetProgress() {
  return progressState.target;
}

/**
 * Single GSAP ScrollTrigger owns the target progress value;
 * the master tick performs critically damped following (λ ≈ 6).
 */
export function useGuideStationTimeline(sequenceElement: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = sequenceElement.current;
    if (!element) return;

    gsap.registerPlugin(ScrollTrigger);

    // Check for deterministic debug query param (?debug=p=0.00, etc.)
    const search = typeof window !== "undefined" ? window.location.search : "";
    const debug = parseGuideStationDebug(search);
    const isFrozen = debug.progress !== undefined;

    const initialProgress = isFrozen ? debug.progress! : 0;
    progressState.current = initialProgress;
    progressState.target = initialProgress;

    const initialFrame = sampleGuideRail(initialProgress);
    window.__guideStationCamera = {
      progress: initialProgress,
      targetProgress: initialProgress,
      position: [...initialFrame.position],
      lookAt: [...initialFrame.lookAt],
    };

    const stopSystem = registerSystem({
      order: 45,
      step: (dt) => {
        if (isFrozen) {
          progressState.current = initialProgress;
          progressState.target = initialProgress;
          return;
        }
        const damping = 1 - Math.exp(-6 * dt);
        progressState.current += (progressState.target - progressState.current) * damping;
      },
    });

    let trigger: ScrollTrigger | null = null;
    if (!isFrozen) {
      trigger = ScrollTrigger.create({
        trigger: element,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressState.target = self.progress;
          if (window.__guideStationCamera) {
            window.__guideStationCamera.targetProgress = self.progress;
          }
        },
      });
    }

    return () => {
      trigger?.kill();
      stopSystem();
      progressState.current = 0;
      progressState.target = 0;
      delete window.__guideStationCamera;
    };
  }, [sequenceElement]);
}
