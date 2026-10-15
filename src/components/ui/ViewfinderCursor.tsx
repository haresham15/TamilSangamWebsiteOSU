"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function ViewfinderCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)", () => {
      const dot = dotRef.current, ring = ringRef.current, label = labelRef.current;
      if (!dot || !ring || !label) return;
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
      const dx = gsap.quickTo(dot, "x", { duration: 0.06 });
      const dy = gsap.quickTo(dot, "y", { duration: 0.06 });
      const rx = gsap.quickTo(ring, "x", { duration: 0.22, ease: "power3.out" });
      const ry = gsap.quickTo(ring, "y", { duration: 0.22, ease: "power3.out" });
      let viewing = false;
      const move = (event: PointerEvent) => {
        dx(event.clientX); dy(event.clientY); rx(event.clientX); ry(event.clientY);
        gsap.set([dot, ring], { opacity: 1 });
      };
      const over = (event: PointerEvent) => {
        const next = event.target instanceof Element && !!event.target.closest('[data-cursor="view"]');
        if (viewing === next) return;
        viewing = next;
        gsap.to(ring, { width: next ? 68 : 36, height: next ? 68 : 36, duration: 0.2, overwrite: true });
        gsap.to(label, { opacity: next ? 1 : 0, duration: 0.15, overwrite: true });
      };
      const leave = () => gsap.set([dot, ring], { opacity: 0 });
      window.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerover", over, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
      return () => {
        window.removeEventListener("pointermove", move);
        document.removeEventListener("pointerover", over);
        document.documentElement.removeEventListener("pointerleave", leave);
        [dx, dy, rx, ry].forEach((setter) => setter.tween.kill());
        gsap.killTweensOf([dot, ring, label]);
        gsap.set([dot, ring], { opacity: 0 });
      };
    });
    return () => media.revert();
  }, []);
  return <>
    <div ref={dotRef} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-hearth-terracotta opacity-0" />
    <div ref={ringRef} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[100] flex h-9 w-9 items-center justify-center rounded-full border border-hearth-terracotta text-hearth-terracotta opacity-0">
      <span ref={labelRef} className="text-center font-mono text-[9px] opacity-0">VIEW<br /><span lang="ta" className="font-tamil tracking-normal">பார்</span></span>
    </div>
  </>;
}
