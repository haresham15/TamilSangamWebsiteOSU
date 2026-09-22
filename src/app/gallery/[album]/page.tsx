"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GALLERY_ALBUMS, PhotoItem } from "@/data/gallery";
import { GlyphMosaicImage } from "@/components/ui/GlyphMosaicImage";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import {
  ArrowLeft,
  Eye,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  Camera,
} from "lucide-react";

export default function AlbumDetailPage() {
  const params = useParams();
  const albumSlug = params.album as string;
  const { locale } = useLocale();
  const { playClick } = useAudio();

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const album =
    GALLERY_ALBUMS.find((a) => a.slug === albumSlug) || GALLERY_ALBUMS[0];

  // Lightbox Navigation
  const currentPhotoIndex = selectedPhoto
    ? album.photos.findIndex((p) => p.id === selectedPhoto.id)
    : -1;

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      setSelectedPhoto(album.photos[currentPhotoIndex - 1]);
    } else {
      setSelectedPhoto(album.photos[album.photos.length - 1]);
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex < album.photos.length - 1) {
      setSelectedPhoto(album.photos[currentPhotoIndex + 1]);
    } else {
      setSelectedPhoto(album.photos[0]);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left font-body">
      {/* Back Button */}
      <Link
        href="/gallery"
        onClick={playClick}
        className="inline-flex items-center gap-2 text-xs font-mono text-[#4c2472] font-bold hover:text-[#250d38] mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-[#55CCA2]" />
        <span>Back to All Vaults</span>
      </Link>

      {/* Album Header */}
      <div className="max-w-3xl mb-12">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="box-badge-dark text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#55CCA2]">
            <Calendar className="w-3 h-3 text-[#55CCA2]" />
            <span>{album.academicYear} Academic Year</span>
          </span>
          <span className="box-badge text-xs font-mono text-[#250d38] font-bold shadow-[2px_2px_0px_#4c2472]">
            [{album.photos.length} Photographs]
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#250d38] font-display mb-4">
          {locale === "ta" ? album.titleTa : album.titleEn}
        </h1>
        <p className="text-base sm:text-lg text-purple-950/85 leading-relaxed mb-6 font-body">
          {locale === "ta" ? album.descriptionTa : album.descriptionEn}
        </p>

        {album.googlePhotosUrl && (
          <a
            href={album.googlePhotosUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 btn-sangam-white text-xs font-mono font-bold uppercase tracking-wider"
          >
            <span>Open Original Album on Google Photos</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#55CCA2]" />
          </a>
        )}
      </div>

      {/* Seamless Other Collections Switcher: Segmented Console */}
      <div className="flex flex-wrap items-center gap-1.5 mb-8 pb-6 border-b-2 border-purple-200">
        <span className="text-xs font-mono text-purple-950/80 font-bold mr-1 uppercase tracking-wider">Collections:</span>
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-purple-50 border-2 border-[#250d38] shadow-[2px_2px_0px_#4c2472]">
          {GALLERY_ALBUMS.map((other) => (
            <Link
              key={other.slug}
              href={`/gallery/${other.slug}`}
              onClick={playClick}
              className={`px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                other.slug === album.slug
                  ? "bg-[#250d38] text-[#55CCA2] border-b-2 border-b-[#55CCA2] shadow-sm"
                  : "text-[#3c1959] hover:text-[#250d38] hover:bg-purple-100"
              }`}
            >
              {locale === "ta" ? other.titleTa : other.titleEn} ({other.photoCount})
            </Link>
          ))}
        </div>
      </div>

      {/* Seamless Photos Grid with Shared Element Morph */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {album.photos.map((photo) => (
          <motion.div
            key={photo.id}
            layoutId={`album-photo-${photo.id}`}
            className="relative aspect-[4/3] overflow-hidden group cursor-pointer bg-purple-950/10 border-2 border-[#250d38] shadow-[2px_2px_0px_#4c2472] hover:shadow-[4px_4px_0px_#55CCA2] hover:border-[#55CCA2] transition-all duration-200"
            onClick={() => {
              playClick();
              setSelectedPhoto(photo);
            }}
          >
            <GlyphMosaicImage
              src={photo.imageUrl}
              alt={photo.titleEn}
              aspectRatio="aspect-[4/3]"
            />
            {/* Subtle, seamless hover overlay showing title and expand icon */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#250d38]/90 via-[#250d38]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 sm:p-3.5 pointer-events-none">
              <div className="flex justify-end">
                <span className="p-1 bg-[#250d38] border border-[#55CCA2] text-white">
                  <Eye className="w-3.5 h-3.5 text-[#55CCA2]" />
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono text-[#55CCA2] font-semibold block truncate">
                  {photo.eventDate}
                </span>
                <span className="text-xs font-bold text-white font-display block truncate">
                  {locale === "ta" ? photo.titleTa : photo.titleEn}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox with layoutId & spring physics */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#250d38]/90 backdrop-blur-xl"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              layoutId={`album-photo-${selectedPhoto.id}`}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-full max-w-5xl bg-[#1c082b] border-2 border-[#55CCA2] p-6 shadow-[8px_8px_0px_#55CCA2] relative text-left"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-8 h-8 border border-white/40 bg-white/10 hover:bg-white/25 text-white z-20 transition-colors flex items-center justify-center"
                aria-label="Close album photo modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Prev / Next Navigation Buttons */}
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 hover:bg-[#250d38] text-white border-2 border-[#55CCA2] z-20 transition-all flex items-center justify-center shadow-[2px_2px_0px_#55CCA2]"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5 text-[#55CCA2]" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 hover:bg-[#250d38] text-white border-2 border-[#55CCA2] z-20 transition-all flex items-center justify-center shadow-[2px_2px_0px_#55CCA2]"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5 text-[#55CCA2]" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 relative h-80 sm:h-[480px] border-2 border-white/20 bg-black/60 overflow-hidden shadow-inner">
                  <Image
                    src={selectedPhoto.imageUrl}
                    alt={selectedPhoto.titleEn}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 850px"
                    priority
                  />
                </div>

                <div className="lg:col-span-4 space-y-4 text-white">
                  <div className="box-badge-dark text-[10px] font-mono text-[#55CCA2] font-bold uppercase tracking-wider">
                    Photo {currentPhotoIndex + 1} of {album.photos.length}
                  </div>

                  <h3 className="text-2xl font-bold text-white font-display">
                    {locale === "ta" ? selectedPhoto.titleTa : selectedPhoto.titleEn}
                  </h3>
                  <p className="text-xs text-purple-100/80 leading-relaxed font-body">
                    {locale === "ta" ? selectedPhoto.captionTa : selectedPhoto.captionEn}
                  </p>

                  <div className="text-xs font-mono text-purple-200/70 space-y-1 pt-2 border-t border-white/10">
                    <p>Photographer: {selectedPhoto.photographer}</p>
                    <p>Event Date: {selectedPhoto.eventDate}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedPhoto.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 border border-purple-400/40 bg-purple-950/70 text-[10px] font-mono text-[#55CCA2] font-bold uppercase"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <a
                      href={selectedPhoto.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#55CCA2] hover:underline flex items-center gap-1.5 font-bold uppercase tracking-wider"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Full Resolution →</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
