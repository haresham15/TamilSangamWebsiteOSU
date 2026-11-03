"use client";

import React, { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GALLERY_ALBUMS, PhotoItem } from "@/data/gallery";
import { GlyphMosaicImage } from "@/components/ui/GlyphMosaicImage";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  MapPin,
  Users,
  Camera,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";

export default function EventInfoAndGalleryPage() {
  const params = useParams();
  const albumSlug = params?.album as string;
  const { locale } = useLocale();
  const { playClick } = useAudio();

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const album = GALLERY_ALBUMS.find((a) => a.slug === albumSlug);

  if (!album) {
    return notFound();
  }

  // Other albums in 2025-2026
  const otherAlbums = GALLERY_ALBUMS.filter((a) => a.slug !== album.slug);

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

  const heroPhoto = album.photos[0];
  const gridPhotos = album.photos.slice(1);

  return (
    <div className="min-h-screen bg-[#140C20] text-[#F4F0FA] font-sans selection:bg-[#452C6D] selection:text-[#A6F0CF]">
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-28 text-left overflow-hidden">
        {/* Structural Watermark */}
        <WatermarkGlyph text="நிழற்படம்" position="top-right" theme="light" opacity={0.03} />

        {/* Top Breadcrumb Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-[rgba(125,96,166,0.25)]">
          <Link
            href="/events"
            onClick={playClick}
            className="inline-flex items-center gap-2 text-xs font-sans text-[#A6F0CF] font-semibold hover:text-[#F4F0FA] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#A6F0CF]" />
            <span>Back to The Canvas Archives</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-sans font-medium text-[#C4B7D7]">
              {album.academicYear} Academic Year
            </span>
          </div>
        </div>

        {/* Main Event Header */}
        <div className="relative z-10 mb-12">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-[#F4F0FA] font-serif tracking-tight mb-3">
            {locale === "ta" ? album.titleTa : album.titleEn}
          </h1>

          <p className="text-lg sm:text-xl font-tamil text-[#C4B7D7] mb-6">
            {album.titleTa}
          </p>

          {/* Architectural Metadata Ribbon in Sunbaked Sand */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-3xl bg-[#25173B] border border-[rgba(125,96,166,0.25)] shadow-sm mb-8">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-[#A6F0CF] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[11px] font-sans uppercase font-medium text-[#C4B7D7]">
                  Event Date
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#F4F0FA] font-sans">
                  {album.eventDate}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#A6F0CF] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[11px] font-sans uppercase font-medium text-[#C4B7D7]">
                  Venue Location
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#F4F0FA] font-sans">
                  {album.location}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-[#A6F0CF] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[11px] font-sans uppercase font-medium text-[#C4B7D7]">
                  Event Format
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#F4F0FA] font-sans">
                  {album.attendance}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Camera className="w-4 h-4 text-[#A6F0CF] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[11px] font-sans uppercase font-medium text-[#C4B7D7]">
                  Selected Photos
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#F4F0FA] font-sans">
                  5 Curated Memories
                </span>
              </div>
            </div>
          </div>

          {/* Narrative & Highlights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-xl sm:text-2xl font-normal text-[#F4F0FA] font-serif">
                {locale === "ta" ? "நிகழ்ச்சி பின்னணி & சங்கம தருணங்கள்" : "Event Story & Community Highlights"}
              </h2>
              <p className="text-base text-[#C4B7D7] leading-relaxed font-sans">
                {locale === "ta" ? album.descriptionTa : album.descriptionEn}
              </p>
              <div className="p-5 rounded-2xl bg-[#25173B] border-l-4 border-l-[#A6F0CF] text-xs text-[#F4F0FA] leading-relaxed">
                <span className="font-semibold uppercase tracking-wider block mb-1 text-[#A6F0CF]">
                  Open Student Community
                </span>
                OSU Tamil Sangam brings together students of all backgrounds and languages. From campus picnics and street food dinners to festive sparkler nights and dances, events are open to everyone.
              </div>
            </div>

            {/* Highlights List */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-[rgba(125,96,166,0.25)] shadow-sm">
              <span className="text-xs font-sans uppercase font-semibold tracking-wider text-[#A6F0CF] block mb-3 border-b border-[rgba(125,96,166,0.25)] pb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#A6F0CF]" />
                <span>Key Event Highlights</span>
              </span>
              <ul className="space-y-3">
                {album.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#F4F0FA] font-medium leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#A6F0CF] shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 4-5 Curated Photos Section */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-2 border-b border-[rgba(125,96,166,0.25)]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-normal text-[#F4F0FA] font-serif">
                {locale === "ta" ? "நிகழ்ச்சி புகைப்படக் கதை" : "Curated Photo Story"}
              </h2>
            </div>
          </div>

          {/* Hero Photo: The Main Event Feature */}
          {heroPhoto && (
            <div className="mb-6">
              <motion.div
                layoutId={`album-photo-${heroPhoto.id}`}
                onClick={() => {
                  playClick();
                  setSelectedPhoto(heroPhoto);
                }}
                className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden rounded-3xl shadow-md shadow-stone-900/5 hover:shadow-xl hover:shadow-stone-900/10 group cursor-pointer transition-all duration-300 bg-[#25173B]"
              >
                <GlyphMosaicImage
                  src={heroPhoto.imageUrl}
                  alt={heroPhoto.titleEn}
                  aspectRatio="aspect-[21/9]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/25 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
                  <div className="flex items-center justify-end mb-2">
                    <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white group-hover:bg-[#A6F0CF] group-hover:text-[#1E1B18] transition-colors">
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-serif text-white mb-1">
                    {locale === "ta" ? heroPhoto.titleTa : heroPhoto.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-200 font-sans max-w-2xl line-clamp-2">
                    {locale === "ta" ? heroPhoto.captionTa : heroPhoto.captionEn}
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          {/* 4-Grid Supporting Photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {gridPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                layoutId={`album-photo-${photo.id}`}
                onClick={() => {
                  playClick();
                  setSelectedPhoto(photo);
                }}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl group cursor-pointer bg-[#25173B] shadow-sm shadow-stone-900/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <GlyphMosaicImage
                  src={photo.imageUrl}
                  alt={photo.titleEn}
                  aspectRatio="aspect-[4/3]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
                  <div className="flex items-center justify-end">
                    <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-md text-white group-hover:bg-[#A6F0CF] group-hover:text-[#1E1B18] transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-sans text-stone-300 block mb-0.5">
                      {photo.eventDate}
                    </span>
                    <h4 className="text-sm font-serif text-white truncate">
                      {locale === "ta" ? photo.titleTa : photo.titleEn}
                    </h4>
                    <p className="text-[11px] text-stone-300 line-clamp-1 font-sans mt-0.5">
                      {locale === "ta" ? photo.captionTa : photo.captionEn}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Google Photos Album Link in Sunbaked Sand */}
        {album.googlePhotosUrl && (
          <div className="p-8 sm:p-12 rounded-3xl bg-[#25173B] text-[#F4F0FA] border border-[rgba(125,96,166,0.25)] shadow-sm mb-16 relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#A6F0CF]">
                  Complete High-Resolution Archive
                </span>
                <span className="text-xs font-sans text-[#C4B7D7]">
                  Google Photos Vault
                </span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-normal font-serif text-[#F4F0FA] mb-3">
                Explore the Complete {album.titleEn} Album
              </h3>

              <p className="text-sm text-[#C4B7D7] font-sans leading-relaxed mb-8">
                While our site highlights these curated photographs encompassing the event narrative, the full collection containing all high-resolution captures, candid group memories, and student snapshots is preserved in our Google Photos archive.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={album.googlePhotosUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClick}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#A6F0CF] hover:bg-[#A6F0CF] text-[#140C20] hover:text-[#140C20] font-sans font-semibold text-xs uppercase tracking-wider rounded-full shadow-md transition-all duration-200 cursor-pointer"
                >
                  <span>Open Full Album on Google Photos</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <Link
                  href="/events"
                  onClick={playClick}
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-white border border-[rgba(125,96,166,0.25)] text-[#F4F0FA] hover:bg-[#140C20] font-sans font-medium text-xs uppercase tracking-wider rounded-full shadow-sm transition-all"
                >
                  <span>Browse Other Event Archives</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Explore Other Academic Year Event Info Pages */}
        <div className="border-t border-[rgba(125,96,166,0.25)] pt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-sans uppercase font-semibold text-[#A6F0CF]">
                {album.academicYear} Academic Year
              </span>
              <h3 className="text-xl sm:text-2xl font-normal text-[#F4F0FA] font-serif">
                {locale === "ta" ? "இதர 2025–2026 விழா பக்கங்கள்" : "More Event Photo Stories"}
              </h3>
            </div>
            <Link
              href="/events"
              onClick={playClick}
              className="text-xs font-sans font-medium text-[#A6F0CF] hover:underline uppercase tracking-wider"
            >
              View All Vaults →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherAlbums.map((other) => (
              <Link
                key={other.slug}
                href={`/gallery/${other.slug}`}
                onClick={playClick}
                className="rounded-3xl border border-[rgba(125,96,166,0.25)] bg-white p-5 flex flex-col justify-between group hover:border-[#A6F0CF]/35 hover:shadow-lg shadow-sm transition-all duration-300"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#25173B] mb-4">
                    <Image
                      src={other.coverImage}
                      alt={other.titleEn}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>

                  <h4 className="text-base font-serif text-[#F4F0FA] mb-1 group-hover:text-[#A6F0CF] transition-colors line-clamp-1">
                    {locale === "ta" ? other.titleTa : other.titleEn}
                  </h4>
                  <p className="text-xs text-[#C4B7D7] font-sans mb-2">
                    {other.eventDate} · {other.location.split(",")[0]}
                  </p>
                  <p className="text-xs text-[#C4B7D7] font-sans line-clamp-2 leading-relaxed">
                    {locale === "ta" ? other.descriptionTa : other.descriptionEn}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-[rgba(125,96,166,0.25)] flex items-center justify-between text-xs font-sans font-semibold text-[#A6F0CF]">
                  <span>Read Event Story →</span>
                  <span className="text-[11px] text-[#C4B7D7] font-normal">5 Photos</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Lightbox with layoutId & spring physics */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md"
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.div
                layoutId={`album-photo-${selectedPhoto.id}`}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="w-full max-w-5xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 w-11 h-11 rounded-full bg-[#140C20] hover:bg-[#A6F0CF] hover:text-[#140C20] text-[#F4F0FA] z-20 transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-sm"
                  aria-label="Close album photo modal"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Prev / Next Navigation Buttons */}
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-[#A6F0CF] hover:text-[#140C20] text-[#F4F0FA] border border-[rgba(125,96,166,0.25)] z-20 active:scale-95 transition-all flex items-center justify-center shadow-md cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-[#A6F0CF] hover:text-[#140C20] text-[#F4F0FA] border border-[rgba(125,96,166,0.25)] z-20 active:scale-95 transition-all flex items-center justify-center shadow-md cursor-pointer"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 relative h-80 sm:h-[480px] rounded-2xl bg-[#25173B] overflow-hidden">
                    <Image
                      src={selectedPhoto.imageUrl}
                      alt={selectedPhoto.titleEn}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 850px"
                      priority
                    />
                  </div>

                  <div className="lg:col-span-4 space-y-4 text-[#F4F0FA]">
                    <div className="text-xs font-sans text-[#A6F0CF] font-semibold uppercase tracking-wider">
                      Photo {currentPhotoIndex + 1} of {album.photos.length}
                    </div>

                    <h3 className="text-2xl font-normal text-[#F4F0FA] font-serif">
                      {locale === "ta" ? selectedPhoto.titleTa : selectedPhoto.titleEn}
                    </h3>
                    <p className="text-sm text-[#C4B7D7] leading-relaxed font-sans">
                      {locale === "ta" ? selectedPhoto.captionTa : selectedPhoto.captionEn}
                    </p>

                    <div className="text-xs font-sans text-[#C4B7D7] space-y-1 pt-3 border-t border-[rgba(125,96,166,0.25)]">
                      <p>Photographer: {selectedPhoto.photographer}</p>
                      <p>Event Date: {selectedPhoto.eventDate}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedPhoto.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-[#25173B] text-[11px] font-sans text-[#F4F0FA]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-[rgba(125,96,166,0.25)] flex items-center justify-between">
                      <a
                        href={selectedPhoto.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-sans text-[#A6F0CF] hover:underline flex items-center gap-1.5 font-semibold uppercase tracking-wider"
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
    </div>
  );
}
