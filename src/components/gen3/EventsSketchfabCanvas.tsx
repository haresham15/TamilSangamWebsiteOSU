"use client";

import React, { useRef, useState } from "react";
import { useScrollCinematic } from "./useScrollCinematic";

export function EventsSketchfabCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Initiates Lenis smooth scroll tracking for this container
  useScrollCinematic("events-hero-trigger");

  return (
    <div 
      ref={containerRef}
      className="w-full h-full min-h-[100dvh] absolute top-0 left-0 bg-[#050200] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 
        Sketchfab iframe. We use URL parameters to hide the UI and autostart it.
        We also allow pointer events only when hovered to not block scrolling initially.
      */}
      <iframe
        title="Leo vijay pose"
        frameBorder="0"
        allowFullScreen
        // @ts-expect-error - Next/React might complain about non-standard attributes but they are fine on iframe
        mozallowfullscreen="true"
        webkitallowfullscreen="true"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src="https://sketchfab.com/models/7cb11c31ac1f45cba9440604b67bf616/embed?autostart=1&ui_controls=1&ui_infos=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_hint=0&ui_theme=dark&dnt=1"
        className={`w-full h-full absolute inset-0 scale-[1.15] transition-all duration-700 ${isHovered ? "opacity-100" : "opacity-80 grayscale-[20%]"}`}
      />
      
      {/* Cinematic Vignette Overlay to blend the iframe edges into our dark background */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#050200] via-transparent to-[#050200]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#050200] via-transparent to-[#050200]" />

      {/* Notice Overlay */}
      <div className="absolute bottom-8 left-8 p-4 bg-[#110e0c]/90 text-amber-100 font-mono text-sm border border-amber-500/40 rounded backdrop-blur z-50 max-w-sm pointer-events-none">
        <p className="text-amber-400 font-bold mb-1">SKETCHFAB EMBED ACTIVE</p>
        <p className="text-amber-200/80 text-xs">
          Because this is an iframe, we cannot apply custom 3D lighting, particle physics, or scroll-based camera movements. It acts as an interactive 3D window rather than a native part of the website&apos;s WebGL canvas.
        </p>
      </div>
    </div>
  );
}
