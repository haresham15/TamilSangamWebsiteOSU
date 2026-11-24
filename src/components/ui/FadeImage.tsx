"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

function getSrcKey(src: ImageProps["src"]): string {
  if (typeof src === "string") return src;
  if ("src" in src) return src.src;
  return src.default.src;
}

export interface FadeImageProps extends ImageProps {
  /**
   * Optional dark tonal placeholder class applied while the image loads
   * (removed once loaded so transparent images reveal cleanly).
   */
  placeholderClassName?: string;
}

/**
 * Non-destructive `next/image` wrapper for below-the-fold and interactive
 * media that eliminates abrupt image popping with a GPU-composited opacity fade
 * over a dark tonal placeholder and async decoding.
 */
export function FadeImage({
  src,
  alt,
  className = "",
  priority,
  loading,
  decoding = "async",
  placeholderClassName = "bg-[#140C20]",
  onLoad,
  onError,
  ...rest
}: FadeImageProps) {
  const srcKey = getSrcKey(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  const isLoaded = loadedSrc === srcKey;

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoadedSrc(srcKey);
    }
  }, [srcKey]);

  return (
    <Image
      ref={imgRef}
      src={src}
      alt={alt}
      priority={priority}
      loading={loading ?? (priority ? undefined : "lazy")}
      decoding={decoding}
      onLoad={(e) => {
        setLoadedSrc(srcKey);
        onLoad?.(e);
      }}
      onError={(e) => {
        // Reveal fallback/alt cleanly instead of staying invisible on broken src
        setLoadedSrc(srcKey);
        onError?.(e);
      }}
      className={`transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
        isLoaded ? "opacity-100" : `opacity-0 ${placeholderClassName}`
      } ${className}`}
      {...rest}
    />
  );
}
