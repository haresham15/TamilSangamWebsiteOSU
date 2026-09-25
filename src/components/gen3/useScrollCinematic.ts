import { useEffect, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let scrollProgress = 0;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getScrollProgress() {
  return scrollProgress;
}

export function useScrollCinematic(triggerId: string = "events-hero-trigger") {
  // 5. Bridge to useSyncExternalStore for any DOM elements that need scroll-awareness
  const progress = useSyncExternalStore(subscribe, getScrollProgress, () => 0);

  useEffect(() => {
    // 1. Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Skip ScrollTrigger/pin entirely, leave progress at 0 (static pose)
      return;
    }

    const triggerElement = document.getElementById(triggerId);
    if (!triggerElement) return;

    // 3. Ensure lagSmoothing(0) is explicitly set
    gsap.ticker.lagSmoothing(0);

    // 2. Create GSAP ScrollTrigger timeline pinned with natural pinSpacing
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "top top",
        end: "+=220vh",
        scrub: true,
        pin: true,
        pinSpacing: true, // Smooth organic transition to catalogue below
        anticipatePin: 1,
        onUpdate: (self) => {
          scrollProgress = self.progress;
          listeners.forEach((cb) => cb());
        },
      },
    });

    return () => {
      tl.kill();
    };
  }, [triggerId]);

  return progress;
}
