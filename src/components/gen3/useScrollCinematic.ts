"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

let scrollProgress = 0;

export function getScrollProgress() {
  return scrollProgress;
}

export function useScrollCinematic(triggerId: string = "events-hero-trigger") {
  useEffect(() => {
    // 1. Respect prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      scrollProgress = 1.0;
      return;
    }

    const triggerElement = document.getElementById(triggerId);
    if (!triggerElement) return;

    // 2. Create GSAP ScrollTrigger timeline pinned with ample scroll runway (1600px) and smooth scrub
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: triggerElement,
        start: "top top",
        end: "+=1600",
        pin: true,
        pinSpacing: true, // Smooth organic transition to catalogue below
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          scrollProgress = self.progress;
        },
      });

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
  }, [triggerId]);
}

