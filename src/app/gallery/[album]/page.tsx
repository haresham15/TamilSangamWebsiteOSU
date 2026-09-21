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
import { ArrowLeft, Eye, X } from "lucide-react";

export default function AlbumDetailPage() {
  const params = useParams();
  const albumSlug = params.album as string;
  const { locale } = useLocale();
  const { playClick } = useAudio();

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const album = GALLERY_ALBUMS.find((a) => a.slug === albumSlug) || GALLERY_ALBUMS[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      {/* Back Button */}
      <Link
        href="/gallery"
        onClick={playClick}
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Vaults</span>
      </Link>

      {/* Album Header */}
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
          {album.academicYear} · Curated Vault ({album.photos.length} Photos)
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold text-white font-display mb-4">
          {locale === "ta" ? album.titleTa : album.titleEn}
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          {locale === "ta" ? album.descriptionTa : album.descriptionEn}
        </p>
      </div>

      {/* Photos Grid with Shared Element Morph */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {album.photos.map((photo) => (
          <motion.div
            key={photo.id}
            layoutId={`album-photo-${photo.id}`}
            className="glass-glow-card rounded-3xl overflow-hidden border border-white/10 group cursor-pointer"
            onClick={() => {
              playClick();
              setSelectedPhoto(photo);
            }}
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <GlyphMosaicImage
                src={photo.imageUrl}
                alt={photo.titleEn}
                aspectRatio="aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-[var(--surface-sunken)]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <span className="px-4 py-2 rounded-full glass-panel text-xs text-white font-mono flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-[var(--accent-tint)]" />
                  <span>View Lightbox</span>
                </span>
              </div>
            </div>

            <div className="p-4">
              <h4 className="text-sm font-bold text-white mb-1 font-display">
                {locale === "ta" ? photo.titleTa : photo.titleEn}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2">
                {locale === "ta" ? photo.captionTa : photo.captionEn}
              </p>
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
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--surface-sunken)]/90 backdrop-blur-xl"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              layoutId={`album-photo-${selectedPhoto.id}`}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-full max-w-4xl rounded-3xl glass-panel-elevated p-6 border border-white/15 shadow-2xl relative text-left"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
                aria-label="Close album photo modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 relative h-80 sm:h-[450px] rounded-2xl overflow-hidden border border-white/10 bg-[var(--surface-sunken)]">
                  <Image
                    src={selectedPhoto.imageUrl}
                    alt={selectedPhoto.titleEn}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 700px"
                  />
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <h3 className="text-xl font-bold text-white font-display">
                    {locale === "ta" ? selectedPhoto.titleTa : selectedPhoto.titleEn}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {locale === "ta" ? selectedPhoto.captionTa : selectedPhoto.captionEn}
                  </p>
                  <div className="text-xs font-mono text-slate-400 space-y-1 pt-2 border-t border-white/10">
                    <p>Photo: {selectedPhoto.photographer}</p>
                    <p>Date: {selectedPhoto.eventDate}</p>
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
