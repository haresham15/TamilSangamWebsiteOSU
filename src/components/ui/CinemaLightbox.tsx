"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DialogShell } from "@/components/ui/DialogShell";

export interface LightboxPhoto {
  id?: string;
  src: string;
  titleEn?: string;
  titleTa?: string;
  captionEn?: string;
  captionTa?: string;
  date?: string;
  plateNumber?: string | number;
}

interface CinemaLightboxProps {
  isOpen: boolean;
  photos: LightboxPhoto[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function CinemaLightbox({
  isOpen,
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: CinemaLightboxProps) {
  const reduced = useReducedMotion();
  const currentPhoto = photos[currentIndex];
  const open = isOpen && Boolean(currentPhoto);

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    onNavigate((currentIndex + 1) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  // Keyboard arrow navigation (Escape, focus trap and scroll lock come from DialogShell)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handlePrev, handleNext]);

  const plateLabel = currentPhoto?.plateNumber
    ? String(currentPhoto.plateNumber).padStart(2, "0")
    : String(currentIndex + 1).padStart(2, "0");

  const stepButton =
    "absolute z-20 w-12 h-12 rounded-full bg-bg-sangam-deep/60 hover:bg-brand-teal-dark hover:text-ink-on-teal border border-accent-zari/25 text-ink-alabaster flex items-center justify-center transition-colors cursor-pointer backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark";

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      tone="media"
      size="full"
      ariaLabel={currentPhoto?.titleEn ? `Photo lightbox: ${currentPhoto.titleEn}` : "Photo lightbox"}
      eyebrow={`Plate ${plateLabel} · ${currentIndex + 1} of ${photos.length}`}
      closeLabel="Close lightbox"
      bodyClassName="flex flex-col select-none"
    >
      {currentPhoto && (
        <>
          {/* Center Stage Photograph */}
          <div className="relative w-full h-[60dvh] sm:h-[70dvh] flex items-center justify-center overflow-hidden px-2 py-4">
            {photos.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous photograph (Left Arrow)"
                className={`${stepButton} left-2 sm:left-4`}
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
            )}

            <div className="relative w-full h-full max-w-6xl" onClick={onClose}>
              <motion.div
                key={currentPhoto.src}
                initial={{ opacity: 0, scale: reduced ? 1 : 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduced ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={currentPhoto.src}
                  alt={currentPhoto.titleEn || `Archive Plate ${plateLabel}`}
                  fill
                  sizes="(max-width: 1280px) 100vw, 1200px"
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>

            {photos.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next photograph (Right Arrow)"
                className={`${stepButton} right-2 sm:right-4`}
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Colophon */}
          <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 pb-5 pt-3 sm:px-7 border-t border-accent-zari/15 text-left">
            <div className="space-y-1">
              <div className="flex flex-wrap items-baseline gap-3">
                {currentPhoto.titleEn && (
                  <h3 className="font-serif text-lg sm:text-xl text-ink-alabaster">{currentPhoto.titleEn}</h3>
                )}
                {currentPhoto.titleTa && (
                  <span lang="ta" className="font-tamil text-sm leading-[1.6] text-brand-lavender">
                    {currentPhoto.titleTa}
                  </span>
                )}
                {currentPhoto.date && (
                  <span className="font-sans text-xs text-ink-sand tabular-nums">· {currentPhoto.date}</span>
                )}
              </div>
              {(currentPhoto.captionEn || currentPhoto.captionTa) && (
                <p
                  lang={currentPhoto.captionEn ? undefined : "ta"}
                  className="text-xs sm:text-sm text-ink-sand font-sans max-w-2xl leading-[1.6]"
                >
                  {currentPhoto.captionEn || currentPhoto.captionTa}
                </p>
              )}
            </div>

            {photos.length > 1 && (
              <div className="flex items-center gap-2 shrink-0 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-sand">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="min-h-12 px-3 rounded-full hover:text-brand-teal-dark transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
                >
                  ← Prev
                </button>
                <span aria-hidden="true" className="text-accent-zari/40">/</span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="min-h-12 px-3 rounded-full hover:text-brand-teal-dark transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </DialogShell>
  );
}

export default CinemaLightbox;
