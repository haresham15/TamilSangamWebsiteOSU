"use client";

import React, { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { GALLERY_ALBUMS, PhotoItem } from "@/data/gallery";
import { GlyphMosaicImage } from "@/components/ui/GlyphMosaicImage";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { ArrowLeft, Eye } from "lucide-react";

export default function AlbumDetailPage() {
  const params = useParams();
  const albumSlug = params?.album as string;
  const { locale } = useLocale();
  const { playClick } = useAudio();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const album = GALLERY_ALBUMS.find((a) => a.slug === albumSlug);
  if (!album) {
    return notFound();
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      <Link
        href="/gallery"
        onClick={playClick}
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white mb-8 glass-panel px-3.5 py-1.5 rounded-full border border-white/10"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Albums</span>
      </Link>

      {/* Album Header */}
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-mono text-[var(--accent-tint)] uppercase tracking-widest block mb-2">
          {album.academicYear} · {album.photoCount} High-Res Photos
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold text-white font-serif tracking-tight mb-3">
          {locale === "ta" ? album.titleTa : album.titleEn}
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          {locale === "ta" ? album.descriptionTa : album.descriptionEn}
        </p>
      </div>

      {/* Photos Masonry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {album.photos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => {
              playClick();
              setSelectedPhoto(photo);
            }}
            className="glass-glow-card rounded-3xl overflow-hidden border border-white/10 cursor-pointer group"
          >
            <div className="relative w-full aspect-[4/3]">
              <GlyphMosaicImage
                src={photo.imageUrl}
                alt={photo.titleEn}
                aspectRatio="aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="px-4 py-2 rounded-full glass-panel text-xs text-white font-mono flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-[var(--accent-tint)]" />
                  <span>View Full Photo</span>
                </span>
              </div>
            </div>

            <div className="p-4">
              <h4 className="text-sm font-bold text-white mb-1">
                {locale === "ta" ? photo.titleTa : photo.titleEn}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2">
                {locale === "ta" ? photo.captionTa : photo.captionEn}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-4xl rounded-3xl glass-panel-elevated p-6 border border-white/15 shadow-2xl relative text-left">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-mono z-10"
            >
              ✕ Close
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 relative h-80 sm:h-[450px] rounded-2xl overflow-hidden border border-white/10">
                <Image
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.titleEn}
                  fill
                  className="object-contain bg-black/60"
                  sizes="(max-width: 1024px) 100vw, 700px"
                />
              </div>

              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-xl font-bold text-white font-serif">
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
          </div>
        </div>
      )}
    </div>
  );
}
