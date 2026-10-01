"use client";

import React, { memo } from "react";

interface CinematicFrameProps {
  children: React.ReactNode;
  /** Aspect ratio class (default: aspect-[21/9] or aspect-[2.35/1]) */
  aspectRatio?: string;
  /** Technical production label (e.g. "FOCAL: 35MM · APERTURE: T1.5 · COLUMBUS, OH") */
  slateLabel?: string;
  /** Custom container class */
  className?: string;
}

/**
 * CinematicFrame (Cinematic Framing & Aspect Ratios)
 * Breaks standard max-w-7xl containers into ultra-wide 2.35:1 anamorphic formats.
 * Includes viewfinder corner marks and technical director's slate metadata.
 */
export const CinematicFrame = memo(function CinematicFrame({
  children,
  aspectRatio = "aspect-[16/9] md:aspect-[2.35/1]",
  className = "",
}: CinematicFrameProps) {
  return (
    <div className={`relative w-full overflow-hidden border border-white/15 bg-black ${className}`}>
      {/* Media Viewport */}
      <div className={`relative w-full ${aspectRatio} overflow-hidden`}>
        {children}
      </div>
    </div>
  );
});
