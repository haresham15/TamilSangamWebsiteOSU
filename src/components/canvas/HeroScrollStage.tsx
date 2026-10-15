"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { governor } from "@/engine/governor";

const VisibilityContext = createContext(false);
export const useHeroStageVisibility = () => useContext(VisibilityContext);

export function HeroScrollStage({ children, className = "", id, runway = 280, progressRef, tone = "indigo", static: isStatic = false }: {
  children: ReactNode;
  className?: string;
  id?: string;
  runway?: number;
  progressRef?: MutableRefObject<number>;
  tone?: "indigo" | "espresso";
  static?: boolean;
}) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const melt = useRef<HTMLDivElement>(null);
  const key = useId();
  const governorKey = id || key;
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveStatic = mounted && isStatic;

  useEffect(() => {
    const target = stage.current;
    if (!target || effectiveStatic) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      governor.request(governorKey, entry.isIntersecting ? 2 : 0);
    }, { rootMargin: "200px 0px" });
    observer.observe(target);
    return () => { observer.disconnect(); governor.request(governorKey, 0); };
  }, [governorKey, effectiveStatic]);

  useEffect(() => {
    if (effectiveStatic || !section.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: section.current,
      start: "top top",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: ({ progress }) => {
        if (progressRef) progressRef.current = progress;
        if (melt.current) melt.current.style.opacity = String(Math.max(0, (progress - 0.85) / 0.15));
      },
    });
    return () => trigger.kill();
  }, [effectiveStatic, progressRef]);

  return (
    <section ref={section} id={id} data-hero-stage data-tone={tone} className={`hero-scroll-stage ${className}`} style={{ minHeight: effectiveStatic ? "100dvh" : `${runway}dvh` }} suppressHydrationWarning>
      <div ref={stage} data-hero-viewport className={effectiveStatic ? "relative z-[2] min-h-dvh w-full overflow-hidden" : "sticky top-0 z-[2] h-dvh w-full overflow-hidden"} suppressHydrationWarning>
        <VisibilityContext.Provider value={!effectiveStatic && visible}>{children}</VisibilityContext.Provider>
        {!effectiveStatic && <div ref={melt} aria-hidden="true" className="hero-stage-melt" />}
      </div>
    </section>
  );
}
