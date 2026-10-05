// src/engine/parallax.ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * initParallax (§7.3)
 * ScrollTrigger-based transform-only parallax for decorative layers.
 * - Bound to data-speed attribute (e.g. data-speed="0.8" or data-speed="1.2")
 * - Scoped via data-parallax-scope container
 * - Transform-only (y translation) to prevent layout recalculation
 * - Max 8 animated layers per page for frame budget integrity
 * - Disabled on coarse pointers (touch), reduced motion, and Tier B/C
 * - Returns cleanup function to revert GSAP context on route unmount
 */
export function initParallax(scope?: HTMLElement | string): () => void {
  if (typeof window === "undefined") return () => {};

  // Disable on coarse pointers and reduced motion (§7.3)
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (isCoarse || prefersReducedMotion) {
    return () => {};
  }

  const ctx = gsap.context(() => {
    gsap.registerPlugin(ScrollTrigger);

    const elements = gsap.utils.toArray<HTMLElement>("[data-speed]");
    // Hard cap at ~8 active layers per page (§7.3)
    const activeElements = elements.slice(0, 8);

    activeElements.forEach((el) => {
      // Must be decorative only (aria-hidden)
      el.setAttribute("aria-hidden", "true");

      const speed = parseFloat(el.dataset.speed ?? "1");
      if (isNaN(speed) || speed === 1) return;

      const range = () => (1 - speed) * window.innerHeight * 0.4;

      gsap.fromTo(
        el,
        { y: () => -range() },
        {
          y: () => range(),
          ease: "none",
          scrollTrigger: {
            trigger: el.closest("[data-parallax-scope]") ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    });
  }, scope);

  return () => {
    ctx.revert();
  };
}

export default initParallax;
