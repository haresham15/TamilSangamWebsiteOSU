"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useThree, useFrame } from "@react-three/fiber";

interface UseArenaScrollTimelineOptions {
  triggerRef: React.RefObject<HTMLDivElement | null>;
  isMobile?: boolean;
  isTransitioning?: boolean;
  onProgress?: (progress: number) => void;
  onTransitionComplete?: () => void;
}

/**
 * useArenaScrollTimeline:
 * High-altitude downward spiral crane shot & cinematic push-through transition.
 *
 * Trajectory:
 * - State A (0%): High-altitude crane (0, 36.0, 0.01), looking straight down.
 * - State B (50%): Sweeping spiral descent curving to (2.5, 12.0, 7.5).
 * - State C (100%): Ground hero position (0, 1.95, 4.2), looking directly at the backlit silhouette.
 * - Transition: Rapid Z-axis push forward flying directly through the silhouette into the God Light.
 */
export function useArenaScrollTimeline({
  triggerRef,
  isMobile = false,
  isTransitioning = false,
  onProgress,
  onTransitionComplete,
}: UseArenaScrollTimelineOptions) {
  const { camera } = useThree();

  // Camera animation proxy state
  const cameraState = useRef({
    x: 0,
    y: 36.0,
    z: 0.01,
    targetX: 0,
    targetY: 1.2,
    targetZ: 0,
  });

  // Impact micro-shake state upon landing
  const shakeRef = useRef({
    active: false,
    startTime: 0,
    duration: 0.4,
    amplitude: 0.12,
  });

  const lastProgressRef = useRef(0);
  const transitionFiredRef = useRef(false);

  // 1. GSAP ScrollTrigger Crane Timeline
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!triggerRef.current) return;

    const state = cameraState.current;

    // Build scrubbed timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerRef.current,
        start: "top top",
        end: "+=3000", // 300vh duration
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;

          // Trigger landing impact when reaching ground state from above
          if (p >= 0.98 && lastProgressRef.current < 0.98) {
            shakeRef.current.active = true;
            shakeRef.current.startTime = performance.now();
          }
          lastProgressRef.current = p;
          onProgress?.(p);
        },
      },
    });

    if (typeof window !== "undefined") {
      window.__ARENA_TIMELINE__ = tl;
      window.__CAMERA_STATE__ = cameraState;
    }

    // Segment 1: From High-Altitude Crane to 50% Spiral Descent
    tl.to(
      state,
      {
        x: isMobile ? 1.5 : 2.5,
        y: 12.0,
        z: 7.5,
        targetX: 0,
        targetY: 1.2,
        targetZ: 0,
        ease: "power2.inOut",
        duration: 0.5,
      },
      0
    );

    // Segment 2: From 50% Spiral Descent down to 100% Ground Hero Position
    tl.to(
      state,
      {
        x: 0,
        y: isMobile ? 2.15 : 1.95,
        z: isMobile ? 5.2 : 4.5,
        targetX: 0,
        targetY: 2.25,
        targetZ: 0,
        ease: "power2.out",
        duration: 0.5,
      },
      0.5
    );

    // Refresh ScrollTrigger and update Lenis limit for pin spacer
    ScrollTrigger.refresh();
    if (typeof window !== "undefined" && window.__lenis) {
      window.__lenis.resize();
    }

    const triggerEl = triggerRef.current;
    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === triggerEl) st.kill();
      });
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.resize();
      }
    };
  }, [triggerRef, isMobile, onProgress]);

  // 2. Cinematic Z-Axis Camera Fly-Through Push on Click Transition
  useEffect(() => {
    if (isTransitioning && !transitionFiredRef.current) {
      transitionFiredRef.current = true;
      const state = cameraState.current;

      gsap.to(state, {
        z: -2.5, // Fly straight through the silhouette (z=0) into the God Light (z=-2.0)
        y: 2.1,
        targetY: 2.1,
        targetZ: -10,
        duration: 1.1,
        ease: "power3.in",
        onComplete: () => {
          onTransitionComplete?.();
        },
      });
    }
  }, [isTransitioning, onTransitionComplete]);

  // 3. Frame loop: Apply interpolated coordinates & landing micro-shake
  useFrame(() => {
    const s = cameraState.current;
    let shakeOffset = 0;

    if (shakeRef.current.active) {
      const elapsed = (performance.now() - shakeRef.current.startTime) / 1000;
      if (elapsed < shakeRef.current.duration) {
        // Damped sinusoidal decay on camera position.y
        const decay = Math.exp(-8.0 * elapsed);
        shakeOffset =
          Math.sin(elapsed * 38.0) * decay * shakeRef.current.amplitude;
      } else {
        shakeRef.current.active = false;
      }
    }

    camera.position.set(s.x, s.y + shakeOffset, s.z);
    camera.lookAt(s.targetX, s.targetY, s.targetZ);
  });
}
