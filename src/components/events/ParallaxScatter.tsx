"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { LayoutGroup, motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useLiteMode } from "@/context/LiteModeContext";
import { CinemaLightbox, LightboxPhoto } from "@/components/ui/CinemaLightbox";

interface ParallaxScatterProps {
  photos: string[];
  eventTitle: string;
}

// Preset editorial angles and aspect ratios to give physical print texture
const PRINT_PROFILES = [
  { tilt: -1.2, aspect: "aspect-[4/3]", widthClass: "w-full" },
  { tilt: 1.5, aspect: "aspect-[3/4]", widthClass: "w-full sm:w-[90%]" },
  { tilt: -0.8, aspect: "aspect-[16/10]", widthClass: "w-full" },
  { tilt: 2.0, aspect: "aspect-[4/5]", widthClass: "w-full sm:w-[95%]" },
  { tilt: -1.5, aspect: "aspect-[3/2]", widthClass: "w-full" },
  { tilt: 0.9, aspect: "aspect-[4/3]", widthClass: "w-full sm:w-[92%]" },
  { tilt: -1.8, aspect: "aspect-[1/1]", widthClass: "w-full sm:w-[85%]" },
  { tilt: 1.1, aspect: "aspect-[16/10]", widthClass: "w-full" },
];

/**
 * ReactBits Parallax Scatter component.
 * Sunlit magazine spread on Warm Ivory (#FAF9F6) with 0px border-radius,
 * zero shadows, zero card frames, and differential parallax column drift.
 */
export function ParallaxScatter({ photos, eventTitle }: ParallaxScatterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { isLiteMode } = useLiteMode();
  const shouldReduceMotion = reducedMotion || isLiteMode;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Three differential parallax drift speeds (slow, counter-speed, fast)
  const yCol1 = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, -40]);
  const yCol2 = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [20, -80]);
  const yCol3 = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-10, -50]);

  // Distribute photos into 3 columns for desktop, 2 for tablet
  const col1 = photos.filter((_, idx) => idx % 3 === 0);
  const col2 = photos.filter((_, idx) => idx % 3 === 1);
  const col3 = photos.filter((_, idx) => idx % 3 === 2);

  const lightboxPhotos: LightboxPhoto[] = photos.map((src, i) => ({
    src,
    titleEn: eventTitle,
    plateNumber: i + 1,
  }));

  const renderPhotoItem = (photoSrc: string, globalIndex: number) => {
    const profile = PRINT_PROFILES[globalIndex % PRINT_PROFILES.length];

    return (
      <motion.figure
        key={photoSrc}
        data-dossier-photo={photoSrc}
        layout={shouldReduceMotion ? false : "position"}
        layoutId={`dossier-print-${photoSrc}`}
        onClick={() => setLightboxIndex(globalIndex)}
        className={`group relative flex flex-col ${profile.widthClass} mb-16 sm:mb-24 lg:mb-32 cursor-pointer`}
        animate={{ rotate: shouldReduceMotion ? 0 : profile.tilt }}
        whileHover={shouldReduceMotion ? undefined : { rotate: 0, scale: 1.02 }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 230, damping: 27 }}
      >
        {/* Naked Photograph with 0px radius, zero border, zero drop shadow */}
        <div
          className={`relative w-full ${profile.aspect} bg-sunbaked-sand overflow-hidden rounded-none shadow-none border-0`}
        >
          <Image
            src={photoSrc}
            alt={`${eventTitle} — Document ${String(globalIndex + 1).padStart(2, "0")}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover rounded-none transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Minimal Colophon Caption (Distilled: No repeated red italic labels) */}
        <figcaption className="mt-3 flex items-baseline justify-between text-[11px] font-mono tracking-widest text-hearth-espresso/75 uppercase">
          <span>PLATE {String(globalIndex + 1).padStart(2, "0")}</span>
          <span className="text-[10px] text-hearth-terracotta opacity-0 group-hover:opacity-100 transition-opacity">
            INSPECT ↗
          </span>
        </figcaption>
      </motion.figure>
    );
  };

  return (
    <div ref={containerRef} className="w-full relative py-8">
      {/* 3-Column Asymmetrical Scatter for Desktop, 2 for Mobile */}
      <LayoutGroup id="dossier-prints">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-16 lg:gap-24 items-start">
          {/* Track 1 */}
          <motion.div style={{ y: yCol1 }} className="flex flex-col max-md:[transform:none!important]">
            {col1.map((photo, i) => renderPhotoItem(photo, i * 3))}
          </motion.div>

          {/* Track 2 */}
          <motion.div style={{ y: yCol2 }} className="flex flex-col pt-0 sm:pt-16 lg:pt-28 max-md:[transform:none!important]">
            {col2.map((photo, i) => renderPhotoItem(photo, i * 3 + 1))}
          </motion.div>

          {/* Track 3 */}
          <motion.div style={{ y: yCol3 }} className="flex flex-col pt-0 sm:pt-8 lg:pt-12 max-md:[transform:none!important]">
            {col3.map((photo, i) => renderPhotoItem(photo, i * 3 + 2))}
          </motion.div>
        </div>
      </LayoutGroup>

      {/* Cinema Lightbox */}
      <CinemaLightbox
        isOpen={lightboxIndex !== null}
        photos={lightboxPhotos}
        currentIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />
    </div>
  );
}

export default ParallaxScatter;
