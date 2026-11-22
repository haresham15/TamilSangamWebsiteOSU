import React from "react";
import { KOLAM_PATHS, PULLI_DOTS } from "@/components/navigation/SikkuKolamToggle";

export type ThresholdSeamSurface = "sandstone" | "ivory" | "sangam-deep" | "peacock-deep";
export type ThresholdSeamVariant = "full" | "knot";

export interface ThresholdSeamProps {
  surface: ThresholdSeamSurface;
  variant: ThresholdSeamVariant;
  className?: string;
}

const SURFACE_TOKEN: Record<ThresholdSeamSurface, string> = {
  ivory: "--color-bg-ivory",
  sandstone: "--color-bg-sandstone",
  "sangam-deep": "--color-bg-sangam-deep",
  "peacock-deep": "--color-bg-peacock-deep",
};

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")";

/**
 * ThresholdSeam ("Vaasal")
 * Hero-to-content handoff: pulli dots, a sikku-kolam strand, then zari hairlines
 * at the sheet's top edge. Absolutely positioned; adds no layout height.
 * Default render is fully drawn; scroll-driven motion lives in globals.css.
 */
export function ThresholdSeam({ surface, variant, className = "" }: ThresholdSeamProps) {
  const style = { "--seam-surface": `var(${SURFACE_TOKEN[surface]})` } as React.CSSProperties;

  return (
    <div
      aria-hidden="true"
      data-threshold-seam=""
      data-variant={variant}
      className={`threshold-seam pointer-events-none absolute inset-x-0 top-0 z-20 h-0 ${className}`.trim()}
      style={style}
    >
      {/* Shared scroll-timeline anchor, centered on the sheet's top edge */}
      <div className="threshold-seam__anchor absolute inset-x-0 top-[-12vh] h-[24vh]" />

      {variant === "full" && (
        <div className="absolute inset-x-0 bottom-full h-[10vh] md:h-[14vh]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(in oklch to bottom, transparent, color-mix(in oklch, var(--seam-surface) 60%, transparent))",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
            style={{ backgroundImage: GRAIN, backgroundRepeat: "repeat", backgroundSize: "160px 160px" }}
          />
        </div>
      )}

      <span className="threshold-seam__rule threshold-seam__rule--l absolute top-0 left-0 h-px w-[calc(50%-34px)] md:w-[calc(50%-40px)]" />
      <span className="threshold-seam__rule threshold-seam__rule--r absolute top-0 right-0 h-px w-[calc(50%-34px)] md:w-[calc(50%-40px)]" />

      <div className="absolute top-0 left-1/2 size-11 -translate-x-1/2 -translate-y-1/2 md:size-14">
        <span className="absolute inset-[6%] rounded-full" style={{ backgroundColor: "var(--seam-surface)" }} />
        <svg viewBox="0 0 32 32" className="relative size-full overflow-visible" focusable="false">
          {[KOLAM_PATHS.loopA_woven, KOLAM_PATHS.loopB_woven].map((d) => (
            <path
              key={d}
              d={d}
              pathLength={1}
              fill="none"
              stroke="var(--color-accent-zari)"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="threshold-seam__strand"
            />
          ))}
          {PULLI_DOTS.map((dot) => (
            <circle
              key={dot.id}
              cx={dot.closed.cx}
              cy={dot.closed.cy}
              r={1.5}
              fill="var(--color-accent-zari)"
              className="threshold-seam__dot"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

export default ThresholdSeam;
