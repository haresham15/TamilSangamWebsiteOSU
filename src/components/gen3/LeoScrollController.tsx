"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { leoKinematics } from "@/store/leoHeroStore";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface LeoScrollControllerProps {
  triggerId?: string;
}

/**
 * LeoScrollController (§Phase 2 Directive)
 * 
 * GSAP ScrollTrigger controller that animates the target vector (leoKinematics.targetPosition),
 * NOT the camera directly. Decouples DOM scroll physics from the WebGL render loop with scrub: 1.2.
 */
export function LeoScrollController({ triggerId = "events-hero-trigger" }: LeoScrollControllerProps) {
  const { size } = useThree();

  useEffect(() => {
    const targetPos = leoKinematics.targetPosition;
    const targetLook = leoKinematics.targetLookAt;

    // Reset initial targets
    const isPortrait = size.width < size.height;
    const startX = 0.0;
    const startY = isPortrait ? Math.min(12.5, 13.5 * 0.94) : 13.5;
    const startZ = isPortrait ? 21.8 * 1.36 : 21.8;
    const startLookY = isPortrait ? 3.3 : 3.5;

    targetPos.set(startX, startY, startZ);
    targetLook.set(0.0, startLookY, 0.0);

    // Respect prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      targetPos.set(0.0, isPortrait ? 6.0 * 0.94 : 6.0, isPortrait ? 20.4 * 1.36 : 20.4);
      targetLook.set(0.0, 3.0, 0.0);
      return;
    }

    const triggerElement = document.getElementById(triggerId);
    if (!triggerElement) return;

    // 2. Create GSAP ScrollTrigger timeline with scrub: 1.2 per Phase 2 mandate
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "top top",
          end: "+=1600",
          pin: true,
          pinSpacing: true,
          scrub: 1.2, // Native smooth scrub per directive
          anticipatePin: 1,
        },
      });

      // Phase 2 Step 3: Animate targetPosition pushing deeper into Z and lowering Y
      // Keyframe 1: Sweep right, descend (p = 0.30)
      tl.to(
        targetPos,
        {
          x: isPortrait ? 0.0 : 1.35,
          y: isPortrait ? 10.6 * 0.94 : 10.6,
          z: isPortrait ? 21.2 * 1.36 : 21.2,
          duration: 0.3,
          ease: "power1.inOut",
        },
        0.0
      );
      tl.to(
        targetLook,
        {
          y: isPortrait ? 3.3 : 3.35,
          duration: 0.3,
          ease: "power1.inOut",
        },
        0.0
      );

      // Keyframe 2: Counter-swing left, descend (p = 0.62)
      tl.to(
        targetPos,
        {
          x: isPortrait ? 0.0 : -0.95,
          y: isPortrait ? 8.2 * 0.94 : 8.2,
          z: isPortrait ? 20.7 * 1.36 : 20.7,
          duration: 0.32,
          ease: "power1.inOut",
        },
        0.3
      );
      tl.to(
        targetLook,
        {
          y: isPortrait ? 3.2 : 3.2,
          duration: 0.32,
          ease: "power1.inOut",
        },
        0.3
      );

      // Keyframe 3: Gentle deceleration and re-centering (p = 0.85)
      tl.to(
        targetPos,
        {
          x: isPortrait ? 0.0 : 0.3,
          y: isPortrait ? 6.7 * 0.94 : 6.7,
          z: isPortrait ? 20.45 * 1.36 : 20.45,
          duration: 0.23,
          ease: "power1.inOut",
        },
        0.62
      );
      tl.to(
        targetLook,
        {
          y: 3.05,
          duration: 0.23,
          ease: "power1.inOut",
        },
        0.62
      );

      // Keyframe 4: Final turntable hero lock (p = 1.0)
      tl.to(
        targetPos,
        {
          x: 0.0,
          y: isPortrait ? 6.0 * 0.94 : 6.0,
          z: isPortrait ? 20.4 * 1.36 : 20.4,
          duration: 0.15,
          ease: "power1.out",
        },
        0.85
      );
      tl.to(
        targetLook,
        {
          y: 3.0,
          duration: 0.15,
          ease: "power1.out",
        },
        0.85
      );

      ScrollTrigger.refresh();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.resize();
      }
    });

    return () => {
      ctx.revert();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.resize();
      }
    };
  }, [size, triggerId]);

  return null;
}

export default LeoScrollController;
