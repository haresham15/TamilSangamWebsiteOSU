// src/components/gallery/NleTimelineLightbox.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { PhotoItem } from "@/data/gallery";
import { audioLayer } from "@/utils/audioLayer";
import {
  X,
  Maximize2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Volume2,
} from "lucide-react";

interface NleTimelineLightboxProps {
  photo: PhotoItem;
  photos: PhotoItem[];
  onSelectPhoto: (photo: PhotoItem) => void;
  onClose: () => void;
  onRequestRemoval?: () => void;
}

export function NleTimelineLightbox({
  photo,
  photos,
  onSelectPhoto,
  onClose,
  onRequestRemoval,
}: NleTimelineLightboxProps) {
  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const trackRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [timecodeStr, setTimecodeStr] = useState("01:04:22:18");

  // 24FPS Timecode simulation
  useEffect(() => {
    let frame = 18;
    let sec = 22;
    let min = 4;
    let hr = 1;

    const interval = setInterval(() => {
      frame += 1;
      if (frame >= 24) {
        frame = 0;
        sec += 1;
        if (sec >= 60) {
          sec = 0;
          min += 1;
          if (min >= 60) {
            min = 0;
            hr += 1;
          }
        }
      }
      const pad = (n: number) => n.toString().padStart(2, "0");
      setTimecodeStr(`${pad(hr)}:${pad(min)}:${pad(sec)}:${pad(frame)}`);
    }, 1000 / 24);

    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        audioLayer.playTapeClack(0.4);
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIdx = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
        audioLayer.playTapeClack(0.5);
        onSelectPhoto(photos[prevIdx]);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIdx = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
        audioLayer.playTapeClack(0.5);
        onSelectPhoto(photos[nextIdx]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, photos, onClose, onSelectPhoto]);

  // Scrub handler based on cursor position across the timeline track
  const handleScrubAtClientX = useCallback(
    (clientX: number) => {
      if (!trackRef.current || photos.length === 0) return;
      const rect = trackRef.current.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = relativeX / rect.width;
      const targetIndex = Math.min(
        photos.length - 1,
        Math.floor(percentage * photos.length)
      );

      if (targetIndex !== currentIndex) {
        audioLayer.playTapeClack(0.4);
        onSelectPhoto(photos[targetIndex]);
      }

      // Move red playhead directly without React state lag
      if (playheadRef.current) {
        playheadRef.current.style.left = `${relativeX}px`;
      }
    },
    [currentIndex, photos, onSelectPhoto]
  );

  // Sync playhead position to current clip when index changes
  useEffect(() => {
    if (!trackRef.current || !playheadRef.current || photos.length === 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clipWidth = rect.width / photos.length;
    const centerPos = (currentIndex + 0.5) * clipWidth;
    playheadRef.current.style.left = `${centerPos}px`;
  }, [currentIndex, photos.length]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsScrubbing(true);
    handleScrubAtClientX(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isScrubbing) return;
    handleScrubAtClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isScrubbing) {
      setIsScrubbing(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <div
      role="dialog"
      aria-label="DaVinci Resolve NLE Timeline Lightbox"
      className="fixed inset-0 z-[100] bg-[#070504] text-white flex flex-col justify-between overflow-hidden select-none font-mono"
    >
      {/* 1. TOP NLE PRODUCTION HEADER */}
      <div className="h-12 border-b border-white/10 bg-[#0c0907] px-4 sm:px-6 flex items-center justify-between text-xs tracking-wider shrink-0 z-20">
        {/* Left: System Status & Coordinates */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#55CCA2] inline-block animate-pulse" />
            <span className="font-bold text-white tracking-widest hidden sm:inline">
              DAVINCI RESOLVE STUDIO // COLOR & EDIT
            </span>
            <span className="font-bold text-white tracking-widest sm:hidden">
              NLE TIMELINE
            </span>
          </div>
          <span className="text-white/20 hidden md:inline">|</span>
          <span className="text-[#FFB84D]/75 text-[10px] hidden md:inline">
            LAT 40.0067° N · LON 83.0305° W [COLUMBUS, OH]
          </span>
        </div>

        {/* Center: Running 24FPS Timecode Clock */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-black border border-white/20 text-[#55CCA2] font-mono text-xs sm:text-sm font-bold tracking-widest shadow-inner">
            TC: {timecodeStr}
          </div>
          <span className="text-[10px] text-white/50 hidden lg:inline">
            24.000 FPS · PRORES 4444 XQ
          </span>
        </div>

        {/* Right: Clip Navigation & Close Button */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/50 tracking-widest hidden sm:inline">
            CLIP [{currentIndex + 1}/{photos.length}]
          </span>
          <button
            type="button"
            onClick={() => {
              audioLayer.playTapeClack(0.4);
              onClose();
            }}
            data-cursor="bracket"
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1c120c] hover:bg-[#E11D48] text-white border border-white/20 hover:border-[#E11D48] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
            aria-label="Close NLE Lightbox"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ESC // CLOSE</span>
          </button>
        </div>
      </div>

      {/* 2. CENTER PREVIEW MONITOR CANVAS (1px BORDERS & TELEMETRY) */}
      <div className="relative flex-1 mx-3 sm:mx-6 my-2 bg-black border border-white/10 flex items-center justify-center overflow-hidden">
        {/* Alignment Crosshairs in 4 corners */}
        <div className="absolute top-3 left-3 text-white/25 text-xs pointer-events-none">+</div>
        <div className="absolute top-3 right-3 text-white/25 text-xs pointer-events-none">+</div>
        <div className="absolute bottom-3 left-3 text-white/25 text-xs pointer-events-none">+</div>
        <div className="absolute bottom-3 right-3 text-white/25 text-xs pointer-events-none">+</div>

        {/* Center 16:9 Broadcast Safe Guides */}
        <div className="absolute inset-8 sm:inset-12 border border-white/[0.04] pointer-events-none" />

        {/* Active Image */}
        <div className="relative w-full h-full p-4 flex items-center justify-center">
          <Image
            src={photo.imageUrl}
            alt={photo.titleEn}
            fill
            priority
            sizes="100vw"
            className="object-contain pointer-events-none select-none"
          />
        </div>

        {/* Corner Telemetry: Bottom-Left Metadata Badge */}
        <div className="absolute bottom-4 left-4 max-w-lg bg-black/85 backdrop-blur-md p-3 sm:p-4 border border-white/15 text-left pointer-events-auto">
          <div className="text-[9px] text-[#FFB84D] tracking-widest uppercase mb-1">
            CAM REEL 01 · {photo.eventDate} · SHOT BY {photo.photographer}
          </div>
          <h3 className="text-base sm:text-xl font-bold font-display text-white tracking-tight leading-snug">
            {photo.titleEn}
          </h3>
          <p className="text-xs text-neutral-300 font-body line-clamp-2 mt-1">
            {photo.captionEn}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {photo.tags.map((t) => (
              <span
                key={t}
                className="px-1.5 py-0.5 border border-white/15 bg-white/5 text-[9px] text-[#55CCA2] uppercase"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Corner Telemetry: Bottom-Right Actions Badge */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/85 backdrop-blur-md p-2 border border-white/15">
          <a
            href={photo.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => audioLayer.playTapeClack(0.3)}
            data-cursor="bracket"
            className="px-2.5 py-1 text-[10px] text-[#55CCA2] hover:bg-[#55CCA2]/20 border border-[#55CCA2]/40 uppercase tracking-wider flex items-center gap-1 transition-colors"
          >
            <Maximize2 className="w-3 h-3" />
            <span>FULL RES</span>
          </a>

          {onRequestRemoval && (
            <button
              type="button"
              onClick={() => {
                audioLayer.playTapeClack(0.4);
                onRequestRemoval();
              }}
              onMouseEnter={() => audioLayer.playTapeClack(0.3)}
              data-cursor="bracket"
              className="px-2.5 py-1 text-[10px] text-red-400 hover:bg-red-950/40 border border-red-500/40 uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>REQUEST REMOVAL</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. BOTTOM SCRUB TRACK & HORIZONTAL TIMELINE */}
      <div className="border-t border-white/10 bg-[#0b0806] px-4 py-2 shrink-0 z-20">
        {/* Timeline Header Strip */}
        <div className="flex items-center justify-between text-[10px] text-white/40 pb-1.5 tracking-wider">
          <div className="flex items-center gap-2">
            <span className="text-[#FFB84D] font-bold">TRACK V1</span>
            <span>TIMELINE SCRUBBER (CLICK & DRAG TO SCRUB)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const prev = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
                audioLayer.playTapeClack(0.4);
                onSelectPhoto(photos[prev]);
              }}
              onMouseEnter={() => audioLayer.playTapeClack(0.2)}
              data-cursor="bracket"
              className="p-1 hover:text-white transition-colors"
              aria-label="Previous clip"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>
              {currentIndex + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={() => {
                const next = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
                audioLayer.playTapeClack(0.4);
                onSelectPhoto(photos[next]);
              }}
              onMouseEnter={() => audioLayer.playTapeClack(0.2)}
              data-cursor="bracket"
              className="p-1 hover:text-white transition-colors"
              aria-label="Next clip"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* The Scrub Track (Relative Filmstrip Container) */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-full h-16 sm:h-20 bg-black border border-white/15 overflow-hidden cursor-ew-resize touch-none select-none"
        >
          {/* Vertical Red Playhead Line with Inverted Needle Badge */}
          <div
            ref={playheadRef}
            className="absolute top-0 bottom-0 w-[2px] bg-[#E11D48] shadow-[0_0_8px_#E11D48] z-30 pointer-events-none -translate-x-1/2 transition-[left] duration-75"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-[#E11D48]" />
            <div className="absolute top-1 left-1 px-1 bg-[#E11D48] text-white text-[8px] font-bold tracking-tight">
              PLAY
            </div>
          </div>

          {/* Filmstrip Clips */}
          <div className="absolute inset-0 flex">
            {photos.map((p, idx) => (
              <div
                key={p.id}
                style={{ width: `${100 / photos.length}%` }}
                className={`relative h-full border-r border-white/10 overflow-hidden transition-opacity ${
                  idx === currentIndex ? "opacity-100 ring-2 ring-[#E11D48] z-10" : "opacity-40 hover:opacity-75"
                }`}
              >
                <Image
                  src={p.imageUrl}
                  alt={p.titleEn}
                  fill
                  sizes="100px"
                  className="object-cover pointer-events-none select-none"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1 py-0.5 text-[7px] truncate text-white/70 pointer-events-none">
                  {p.titleEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
