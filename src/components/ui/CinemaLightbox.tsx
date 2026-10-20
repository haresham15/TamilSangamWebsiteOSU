"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";

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
  const [mounted, setMounted] = useState(false);
  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    setMounted(true);
  }, []);

  useModalScrollLock(isOpen, onClose);

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    onNavigate((currentIndex + 1) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  // Keyboard arrow navigation
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, handlePrev, handleNext]);

  if (!isOpen || !currentPhoto || !mounted) return null;

  const plateLabel = currentPhoto.plateNumber
    ? String(currentPhoto.plateNumber).padStart(2, "0")
    : String(currentIndex + 1).padStart(2, "0");

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#120D0B]/95 backdrop-blur-md text-[#FAF7F2] select-none p-4 sm:p-6 lg:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Top Control Bar */}
          <header className="w-full flex items-center justify-between z-20 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#B85C38] font-bold">
                PLATE {plateLabel}
              </span>
              <span className="text-white/20">/</span>
              <span className="font-mono text-xs text-white/50 tracking-wider">
                {currentIndex + 1} OF {photos.length}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close lightbox (ESC)"
              className="group flex items-center gap-2 px-3.5 py-2 min-w-[48px] min-h-[48px] rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-[#B85C38] text-white/80 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
            >
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 group-hover:text-white/90">
                ESC
              </span>
              <X className="w-4 h-4 text-white/80 group-hover:text-white" />
            </button>
          </header>

          {/* Center Stage Photograph */}
          <main className="relative flex-1 w-full flex items-center justify-center my-4 overflow-hidden">
            {/* Prev Button */}
            {photos.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous photograph (Left Arrow)"
                className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-[#B85C38] border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Photo Container */}
            <div
              className="relative w-full h-full max-w-6xl max-h-[75vh] flex items-center justify-center"
              onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
              }}
            >
              <motion.div
                key={currentPhoto.src}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full"
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

            {/* Next Button */}
            {photos.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next photograph (Right Arrow)"
                className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-[#B85C38] border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </main>

          {/* Bottom Architectural Colophon Bar */}
          <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-white/10 z-20 shrink-0 text-left">
            <div className="space-y-1">
              <div className="flex flex-wrap items-baseline gap-3">
                {currentPhoto.titleEn && (
                  <h3 className="font-serif text-lg sm:text-xl text-[#FAF7F2]">
                    {currentPhoto.titleEn}
                  </h3>
                )}
                {currentPhoto.titleTa && (
                  <span lang="ta" className="font-tamil text-sm text-[#D4AF37]/90">
                    {currentPhoto.titleTa}
                  </span>
                )}
                {currentPhoto.date && (
                  <span className="font-mono text-xs text-white/50 tracking-wider">
                    · {currentPhoto.date}
                  </span>
                )}
              </div>
              {(currentPhoto.captionEn || currentPhoto.captionTa) && (
                <p className="text-xs sm:text-sm text-white/70 font-sans max-w-2xl leading-relaxed">
                  {currentPhoto.captionEn || currentPhoto.captionTa}
                </p>
              )}
            </div>

            {photos.length > 1 && (
              <div className="flex items-center gap-4 shrink-0 font-mono text-xs uppercase tracking-widest text-white/50">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  ← PREV
                </button>
                <span className="text-white/20">/</span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  NEXT →
                </button>
              </div>
            )}
          </footer>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default CinemaLightbox;
