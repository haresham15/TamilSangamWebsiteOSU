"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLiteMode } from "@/context/LiteModeContext";

interface GlyphMosaicImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  priority?: boolean;
}

// Dense Tamil characters ordered by glyph visual ink density
const GLYPH_ATLAS = ["·", "ஃ", "ி", "ு", "த", "க", "ம", "வ", "ழ", "ள", "ண", "ஐ", "ஓம்", "தமிழ்"];

const getInitialMosaicChars = () =>
  Array.from({ length: 48 }, (_, i) => GLYPH_ATLAS[i % GLYPH_ATLAS.length]);

export const GlyphMosaicImage: React.FC<GlyphMosaicImageProps> = ({
  src,
  alt,
  className = "",
  aspectRatio = "aspect-[4/3]",
  priority = false,
}) => {
  const { isLiteMode } = useLiteMode();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mosaicChars, setMosaicChars] = useState<string[]>(getInitialMosaicChars);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  useEffect(() => {
    if (isLiteMode || isLoaded) return;

    // Subtle character flicker effect strictly before image finishes loading
    const interval = setInterval(() => {
      setMosaicChars((prev) =>
        prev.map((c) => (Math.random() > 0.7 ? GLYPH_ATLAS[Math.floor(Math.random() * GLYPH_ATLAS.length)] : c))
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isLiteMode, isLoaded]);

  return (
    <div className={`relative overflow-hidden rounded-2xl group-data-[gl-ready=true]:bg-transparent bg-[#090b14] ${aspectRatio} ${className}`}>
      {/* Glyph-Mosaic Layer (Active while loading) */}
      {!isLoaded && !isLiteMode && (
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 p-4 gap-1 items-center justify-items-center select-none pointer-events-none z-10 transition-opacity duration-700 font-mono text-xs sm:text-sm text-[var(--accent-tint)] opacity-70">
          {mosaicChars.map((char, idx) => (
            <span key={idx} className="transition-all duration-150">
              {char}
            </span>
          ))}
        </div>
      )}

      {/* Actual High-Res Next.js Image */}
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        className={`object-cover transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105 bg-[#140C20]"
        }`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};
