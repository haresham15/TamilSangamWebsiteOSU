import type Lenis from "lenis";
import type gsap from "gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
    __ARENA_TIMELINE__?: gsap.core.Timeline;
    __CAMERA_STATE__?: unknown;
  }
}

export {};
