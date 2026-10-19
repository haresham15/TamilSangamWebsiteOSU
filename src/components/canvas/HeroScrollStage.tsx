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
        if (stage.current) {
          // AWWWARDS Recessive Camera & Stage Push (p = 0.84 -> 1.00)
          if (progress >= 0.84) {
            const t = (progress - 0.84) / 0.16;
            const scale = 1.0 - 0.05 * t;
            const yOffset = -6 * t;
            const opacity = 1.0 - 0.75 * t;
            stage.current.style.transform = `scale(${scale.toFixed(3)}) translateY(${yOffset.toFixed(2)}vh)`;
            stage.current.style.opacity = opacity.toFixed(3);
          } else {
            stage.current.style.transform = "";
            stage.current.style.opacity = "";
          }
        }
      },
    });
    return () => {
      trigger.kill();
      if (stage.current) {
        stage.current.style.transform = "";
        stage.current.style.opacity = "";
      }
    };
  }, [effectiveStatic, progressRef]);

  return (
    <section ref={section} id={id} data-hero-stage data-tone={tone} className={`hero-scroll-stage ${className}`} style={{ minHeight: effectiveStatic ? "100dvh" : `${runway}dvh` }} suppressHydrationWarning>
      <div ref={stage} data-hero-viewport className={effectiveStatic ? "relative z-[1] min-h-dvh w-full overflow-hidden" : "sticky top-0 z-[1] h-dvh w-full overflow-hidden"} suppressHydrationWarning>
        <VisibilityContext.Provider value={!effectiveStatic && visible}>{children}</VisibilityContext.Provider>
      </div>
    </section>
  );
}
