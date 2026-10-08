import type Lenis from "lenis";
import type gsap from "gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
    __ARENA_TIMELINE__?: gsap.core.Timeline;
    __CAMERA_STATE__?: unknown;
    __guideStationCamera?: {
      progress: number;
      targetProgress: number;
      position: [number, number, number];
      lookAt: [number, number, number];
    };
  }
}

export {};
