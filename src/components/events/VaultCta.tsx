"use client";

import React, { useEffect, useId, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SITE_CONFIG } from "@/data/siteConfig";
import { useLiteMode } from "@/context/LiteModeContext";
import { CulturalSection } from "@/components/ui/CulturalSection";
import { Eyebrow } from "@/components/muttram/Eyebrow";

export interface VaultCtaProps {
  /** Google Photos album to open. Defaults to the shared archive album. */
  googlePhotosUrl?: string;
  totalPhotosCount?: number;
  className?: string;
}

/**
 * VaultCta — the single Google Photos call to action (peacock closing band).
 * A magnetic serif headline link; the pull is skipped for touch, reduced motion and Lite mode.
 */
export function VaultCta({
  googlePhotosUrl = SITE_CONFIG.googlePhotosAlbums.album2,
  totalPhotosCount = 300,
  className = "",
}: VaultCtaProps) {
  const headingId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { isLiteMode } = useLiteMode();
  const still = Boolean(reducedMotion) || isLiteMode;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 15, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || still) return;

    let rect = container.getBoundingClientRect();
    let isRectDirty = false;
    const markRectDirty = () => {
      isRectDirty = true;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (isRectDirty) {
        rect = container.getBoundingClientRect();
        isRectDirty = false;
      }
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const threshold = Math.max(rect.width / 2 + 80, 220);

      if (Math.hypot(dx, dy) < threshold) {
        mouseX.set(Math.max(-28, Math.min(28, dx * 0.22)));
        mouseY.set(Math.max(-24, Math.min(24, dy * 0.22)));
      } else {
        mouseX.set(0);
        mouseY.set(0);
      }
    };

    const reset = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", markRectDirty, { passive: true });
    window.addEventListener("resize", markRectDirty, { passive: true });
    container.addEventListener("pointerleave", reset);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", markRectDirty);
      window.removeEventListener("resize", markRectDirty);
      container.removeEventListener("pointerleave", reset);
      reset();
    };
  }, [mouseX, mouseY, still]);

  return (
    <CulturalSection
      variant="peacock-deep"
      aria-labelledby={headingId}
      className={`select-none ${className}`.trim()}
    >
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-32 sm:px-10 sm:py-28">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div ref={containerRef} className="md:col-span-8 space-y-5">
            <Eyebrow tone="peacock" tamil="புகைப்படப் பெட்டகம்">
              The raw archive
            </Eyebrow>
            <motion.div style={still ? undefined : { x: smoothX, y: smoothY }} className="inline-block">
              <h2 id={headingId} className="font-serif text-4xl font-normal leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
                <a
                  href={googlePhotosUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex flex-wrap items-baseline gap-x-4 rounded-md text-ink-alabaster transition-colors duration-300 hover:text-brand-teal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark focus-visible:ring-offset-8 focus-visible:ring-offset-bg-peacock-deep"
                >
                  <span>Open the Google Photos Vault</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-9 w-9 shrink-0 text-brand-teal-dark transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 sm:h-12 sm:w-12"
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </h2>
            </motion.div>
          </div>
          <p className="md:col-span-4 font-sans text-base leading-relaxed text-ink-sand md:border-l md:border-border-zari-muted md:pl-6">
            {totalPhotosCount}+ full-resolution photographs, straight from our camera rolls.
          </p>
        </div>
      </div>
    </CulturalSection>
  );
}

export default VaultCta;
