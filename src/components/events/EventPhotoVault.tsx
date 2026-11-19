"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { GALLERY_ALBUMS, PhotoItem } from "@/data/gallery";
import { GlyphMosaicImage } from "@/components/ui/GlyphMosaicImage";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { ParallaxScatter } from "./ParallaxScatter";
import {
  Eye,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Camera,
  Shuffle,
  Grid3X3,
  Sparkles,
} from "lucide-react";

interface EventPhotoVaultProps {
  eventSlug: string;
  eventTitle: string;
  scatterPhotos?: string[];
  googlePhotosUrl?: string;
}

export function EventPhotoVault({
  eventSlug,
  eventTitle,
  scatterPhotos = [],
  googlePhotosUrl,
}: EventPhotoVaultProps) {
  const { locale } = useLocale();
  const { playClick, playCardSlide } = useAudio();
  const reducedMotion = useReducedMotion();
  const { isLiteMode } = useLiteMode();

  // Find matching album from GALLERY_ALBUMS
  const album = GALLERY_ALBUMS.find(
    (a) => a.eventSlug === eventSlug || a.slug === eventSlug
  );

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [viewMode, setViewMode] = useState<"curated" | "scatter">("curated");
  const [randomizedScatter, setRandomizedScatter] = useState<string[]>(scatterPhotos);
  const [shuffleCount, setShuffleCount] = useState(0);

  const photos = album?.photos || [];
  const heroPhoto = photos[0];
  const supportingPhotos = photos.slice(1);

  // Lightbox Navigation index
  const currentPhotoIndex = selectedPhoto
    ? photos.findIndex((p) => p.id === selectedPhoto.id)
    : -1;

  const handlePrevPhoto = useCallback(() => {
    if (photos.length === 0) return;
    try {
      playClick();
    } catch {
      // Audio optional
    }
    if (currentPhotoIndex > 0) {
      setSelectedPhoto(photos[currentPhotoIndex - 1]);
    } else {
      setSelectedPhoto(photos[photos.length - 1]);
    }
  }, [photos, currentPhotoIndex, playClick]);

  const handleNextPhoto = useCallback(() => {
    if (photos.length === 0) return;
    try {
      playClick();
    } catch {
      // Audio optional
    }
    if (currentPhotoIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentPhotoIndex + 1]);
    } else {
      setSelectedPhoto(photos[0]);
    }
  }, [photos, currentPhotoIndex, playClick]);

  const handleCloseLightbox = useCallback(() => {
    try {
      playClick();
    } catch {
      // Audio optional
    }
    setSelectedPhoto(null);
  }, [playClick]);

  // Keyboard accessibility for Lightbox
  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseLightbox();
      } else if (e.key === "ArrowLeft") {
        handlePrevPhoto();
      } else if (e.key === "ArrowRight") {
        handleNextPhoto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, handleCloseLightbox, handlePrevPhoto, handleNextPhoto]);

  const shuffleScatter = () => {
    try {
      playClick();
      playCardSlide();
    } catch {
      // Audio optional
    }
    setRandomizedScatter((current) => {
      const next = [...current];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
    setShuffleCount((count) => count + 1);
  };

  const finalGooglePhotosUrl = album?.googlePhotosUrl || googlePhotosUrl;

  return (
    <section
      id="photo-vault"
      aria-label="Curated Photographic Dossier and Lightbox"
      className="mt-20 -mx-6 sm:-mx-10 lg:-mx-16 px-6 sm:px-10 lg:px-16 py-16 bg-[#25173B]/75 border-y border-[rgba(125,96,166,0.25)] shadow-[inset_0_2px_12px_rgba(0,0,0,0.2)] scroll-mt-24"
    >
      {/* Header bar with bilingual title and view switchers */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[rgba(125,96,166,0.25)] pb-5 mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-4 h-4 text-[#A6F0CF]" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#A6F0CF] font-semibold">
              CAMPUS PHOTO VAULT · ஆவணக் காப்பகம்
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#F4F0FA] flex items-baseline gap-3">
            <span>{album ? (locale === "ta" ? album.titleTa : album.titleEn) : "Photographic Archive"}</span>
            <span
              lang="ta"
              className="text-xl sm:text-2xl font-tamil text-[#F4F0FA]/50 font-normal"
              style={{ letterSpacing: 0 }}
            >
              தொகுப்பு
            </span>
            <span className="text-xs font-mono text-[#A6F0CF] font-semibold">
              ({album ? photos.length : randomizedScatter.length})
            </span>
          </h2>
        </div>

        {/* View Controls & Google Photos Shortcut */}
        <div className="flex items-center gap-3 flex-wrap">
          {album && scatterPhotos.length > 0 && (
            <div className="inline-flex rounded-lg border border-[rgba(125,96,166,0.35)] p-0.5 bg-[#140C20]">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setViewMode("curated");
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                  viewMode === "curated"
                    ? "bg-[#25173B] text-[#A6F0CF] font-bold"
                    : "text-[#C4B7D7] hover:text-[#F4F0FA]"
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Curated Story</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setViewMode("scatter");
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                  viewMode === "scatter"
                    ? "bg-[#25173B] text-[#A6F0CF] font-bold"
                    : "text-[#C4B7D7] hover:text-[#F4F0FA]"
                }`}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Scatter View</span>
              </button>
            </div>
          )}

          {viewMode === "scatter" && (
            <button
              type="button"
              onClick={shuffleScatter}
              className="inline-flex min-h-9 items-center gap-2 px-3 py-1.5 border border-[#A6F0CF]/40 text-[#A6F0CF] hover:border-[#A6F0CF] font-mono text-xs tracking-wider rounded-lg hover:text-[#F4F0FA] transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>SHUFFLE ARCHIVE</span>
            </button>
          )}

          {finalGooglePhotosUrl && (
            <a
              href={finalGooglePhotosUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-[#140C20] bg-[#A6F0CF] hover:bg-[#55CCA2] font-semibold rounded-lg transition-colors shadow-sm"
            >
              <span>Full Google Photos Vault</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Screen-reader announcement for shuffle */}
      <p role="status" className="sr-only">
        {shuffleCount > 0 ? `Archive reshuffled. ${randomizedScatter.length} selected samples.` : ""}
      </p>

      {/* View Mode 1: Curated Photographic Story with Hero & Grid */}
      {viewMode === "curated" && album && photos.length > 0 && (
        <div className="space-y-6">
          {/* Curated Hero Photo */}
          {heroPhoto && (
            <div className="mb-6">
              <motion.div
                layoutId={`photo-card-${heroPhoto.id}`}
                data-dossier-photo={heroPhoto.imageUrl}
                onClick={() => {
                  playClick();
                  setSelectedPhoto(heroPhoto);
                }}
                className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl group cursor-pointer transition-[box-shadow,transform] duration-200 bg-[#140C20] border border-[rgba(125,96,166,0.35)]"
              >
                <GlyphMosaicImage
                  src={heroPhoto.imageUrl}
                  alt={heroPhoto.titleEn}
                  aspectRatio="aspect-[21/9]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#140C20] via-[#140C20]/40 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#140C20]/80 border border-[#A6F0CF]/40 text-[10px] font-mono text-[#A6F0CF] uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-[#A6F0CF]" />
                      FEATURED ARCHIVE
                    </span>
                    <span className="p-2 rounded-full bg-[#140C20]/70 backdrop-blur-md text-[#F4F0FA] group-hover:bg-[#A6F0CF] group-hover:text-[#140C20] transition-colors">
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>
                  <h3
                    lang={locale === "ta" ? "ta" : "en"}
                    className="text-xl sm:text-3xl font-serif text-[#F4F0FA] mb-1"
                    style={{ letterSpacing: locale === "ta" ? 0 : undefined }}
                  >
                    {locale === "ta" ? heroPhoto.titleTa : heroPhoto.titleEn}
                  </h3>
                  <p
                    lang={locale === "ta" ? "ta" : "en"}
                    className="text-xs sm:text-sm text-[#C4B7D7] font-sans max-w-2xl line-clamp-2"
                    style={{
                      letterSpacing: locale === "ta" ? 0 : undefined,
                      lineHeight: locale === "ta" ? 1.6 : undefined,
                    }}
                  >
                    {locale === "ta" ? heroPhoto.captionTa : heroPhoto.captionEn}
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          {/* Supporting Grid of Photos */}
          {supportingPhotos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {supportingPhotos.map((photo) => (
                <motion.div
                  key={photo.id}
                  layoutId={`photo-card-${photo.id}`}
                  data-dossier-photo={photo.imageUrl}
                  onClick={() => {
                    playClick();
                    setSelectedPhoto(photo);
                  }}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl group cursor-pointer bg-[#140C20] border border-[rgba(125,96,166,0.35)] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-[box-shadow,transform] duration-200 flex flex-col justify-between"
                >
                  <GlyphMosaicImage
                    src={photo.imageUrl}
                    alt={photo.titleEn}
                    aspectRatio="aspect-[4/3]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#140C20] via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
                    <div className="flex items-center justify-end">
                      <span className="p-1.5 rounded-full bg-[#140C20]/70 backdrop-blur-md text-[#F4F0FA] group-hover:bg-[#A6F0CF] group-hover:text-[#140C20] transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#A6F0CF] block mb-0.5 uppercase tracking-wider">
                        {photo.eventDate}
                      </span>
                      <h4
                        lang={locale === "ta" ? "ta" : "en"}
                        className="text-sm font-serif text-[#F4F0FA] truncate"
                        style={{ letterSpacing: locale === "ta" ? 0 : undefined }}
                      >
                        {locale === "ta" ? photo.titleTa : photo.titleEn}
                      </h4>
                      <p
                        lang={locale === "ta" ? "ta" : "en"}
                        className="text-[11px] text-[#C4B7D7] line-clamp-1 font-sans mt-0.5"
                        style={{
                          letterSpacing: locale === "ta" ? 0 : undefined,
                          lineHeight: locale === "ta" ? 1.6 : undefined,
                        }}
                      >
                        {locale === "ta" ? photo.captionTa : photo.captionEn}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Mode 2 (Scatter) or Fallback when no curated album exists */}
      {(viewMode === "scatter" || !album || photos.length === 0) && (
        <div>
          {randomizedScatter.length > 0 ? (
            <ParallaxScatter photos={randomizedScatter} eventTitle={eventTitle} />
          ) : (
            <div className="py-24 text-center font-serif text-xl text-[#F4F0FA]/75 italic">
              Photographic prints being cataloged in the local vault.
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Interactive Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090b14]/90 backdrop-blur-md"
            onClick={handleCloseLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Event Photograph Lightbox"
          >
            <motion.div
              layoutId={reducedMotion || isLiteMode ? undefined : `photo-card-${selectedPhoto.id}`}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-full max-w-5xl bg-[#1A1028] border border-[rgba(125,96,166,0.35)] rounded-2xl p-6 sm:p-8 shadow-2xl relative text-left"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Close Button (48x48px min hit target, accessible) */}
              <button
                type="button"
                onClick={handleCloseLightbox}
                className="absolute top-4 right-4 w-12 h-12 rounded-full bg-[#25173B] hover:bg-[#A6F0CF] hover:text-[#140C20] text-[#F4F0FA] border border-[rgba(125,96,166,0.35)] z-20 transition-colors active:scale-95 flex items-center justify-center cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-[#A6F0CF]"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Prev / Next Navigation Buttons */}
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#25173B]/90 hover:bg-[#A6F0CF] hover:text-[#140C20] text-[#F4F0FA] border border-[rgba(125,96,166,0.35)] z-20 active:scale-95 transition-colors flex items-center justify-center shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A6F0CF]"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#25173B]/90 hover:bg-[#A6F0CF] hover:text-[#140C20] text-[#F4F0FA] border border-[rgba(125,96,166,0.35)] z-20 active:scale-95 transition-colors flex items-center justify-center shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A6F0CF]"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Photo High-Res Container */}
                <div className="lg:col-span-8 relative h-80 sm:h-[480px] rounded-2xl bg-[#140C20] overflow-hidden border border-[rgba(125,96,166,0.25)]">
                  <Image
                    src={selectedPhoto.imageUrl}
                    alt={selectedPhoto.titleEn}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 850px"
                    priority
                  />
                </div>

                {/* Metadata & Captions Column */}
                <div className="lg:col-span-4 space-y-4 text-[#F4F0FA]">
                  <div className="text-xs font-mono text-[#A6F0CF] font-semibold uppercase tracking-wider">
                    Photo {currentPhotoIndex + 1} of {photos.length}
                  </div>

                  <h3
                    lang={locale === "ta" ? "ta" : "en"}
                    className="text-2xl font-normal text-[#F4F0FA] font-serif"
                    style={{ letterSpacing: locale === "ta" ? 0 : undefined }}
                  >
                    {locale === "ta" ? selectedPhoto.titleTa : selectedPhoto.titleEn}
                  </h3>

                  <p
                    lang={locale === "ta" ? "ta" : "en"}
                    className="text-sm text-[#C4B7D7] leading-relaxed font-sans"
                    style={{
                      letterSpacing: locale === "ta" ? 0 : undefined,
                      lineHeight: locale === "ta" ? 1.6 : undefined,
                    }}
                  >
                    {locale === "ta" ? selectedPhoto.captionTa : selectedPhoto.captionEn}
                  </p>

                  <div className="text-xs font-mono text-[#C4B7D7] space-y-1 pt-3 border-t border-[rgba(125,96,166,0.25)]">
                    <p>Photographer: {selectedPhoto.photographer}</p>
                    <p>Event Date: {selectedPhoto.eventDate}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedPhoto.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full bg-[#25173B] text-[11px] font-mono text-[#A6F0CF] border border-[rgba(125,96,166,0.35)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[rgba(125,96,166,0.25)] flex items-center justify-between gap-3">
                    <a
                      href={selectedPhoto.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#A6F0CF] hover:underline flex items-center gap-1.5 font-semibold uppercase tracking-wider"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Full Resolution ↗</span>
                    </a>

                    {finalGooglePhotosUrl && (
                      <a
                        href={finalGooglePhotosUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-[#C4B7D7] hover:text-[#A6F0CF] flex items-center gap-1.5 uppercase tracking-wider"
                      >
                        <span>Google Vault ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}