"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerSystem } from "@/engine/masterTick";
import { GUIDE_HERO_SCROLL_VH, sampleGuideRail } from "./guideRail";

const progressState = { current: 0, target: 0 };

export function getGuideStationProgress() {
  return progressState.current;
}

export function getGuideStationTargetProgress() {
  return progressState.target;
}

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
}

/** One ScrollTrigger owns the target value; the master tick performs critically damped following. */
export function useGuideStationTimeline(sequenceElement: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = sequenceElement.current;
    if (!element) return;

    gsap.registerPlugin(ScrollTrigger);
    progressState.current = 0;
    progressState.target = 0;
    const initialFrame = sampleGuideRail(0);
    window.__guideStationCamera = {
      progress: 0,
      targetProgress: 0,
      position: [...initialFrame.position],
      lookAt: [...initialFrame.lookAt],
    };

    const stopSystem = registerSystem({
      order: 45,
      step: (dt) => {
        const damping = 1 - Math.exp(-6 * dt);
        progressState.current += (progressState.target - progressState.current) * damping;
      },
    });

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: "top top",
      end: () => `+=${window.innerHeight * ((isMobileViewport() ? GUIDE_HERO_SCROLL_VH.mobile : GUIDE_HERO_SCROLL_VH.desktop) / 100)}`,
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progressState.target = self.progress;
        if (window.__guideStationCamera) {
          window.__guideStationCamera.targetProgress = self.progress;
        }
      },
    });

    return () => {
      trigger.kill();
      stopSystem();
      progressState.current = 0;
      progressState.target = 0;
      delete window.__guideStationCamera;
    };
  }, [sequenceElement]);
}
