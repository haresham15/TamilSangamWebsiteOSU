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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-28 text-left font-body">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b-2 border-purple-200">
        <Link
          href="/gallery"
          onClick={playClick}
          className="inline-flex items-center gap-2 text-xs font-mono text-[#4c2472] font-bold hover:text-[#250d38] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#55CCA2]" />
          <span>Back to All Photo Archives</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#4c2472]">
            {album.academicYear} Academic Year
          </span>
        </div>
      </div>

      {/* Main Event Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#250d38] font-display tracking-tight mb-3">
          {locale === "ta" ? album.titleTa : album.titleEn}
        </h1>

        <p className="text-lg sm:text-xl font-tamil text-[#4c2472] font-semibold mb-6">
          {album.titleTa}
        </p>

        {/* Architectural Metadata Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-purple-50/70 border-2 border-[#250d38] shadow-[4px_4px_0px_#4c2472] mb-8">
          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-[#55CCA2] shrink-0 mt-0.5" />
            <div>
              <span className="block text-[10px] font-mono uppercase font-bold text-purple-900/60">
                Event Date
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#250d38] font-mono">
                {album.eventDate}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#55CCA2] shrink-0 mt-0.5" />
            <div>
              <span className="block text-[10px] font-mono uppercase font-bold text-purple-900/60">
                Venue Location
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#250d38]">
                {album.location}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Users className="w-4 h-4 text-[#55CCA2] shrink-0 mt-0.5" />
            <div>
              <span className="block text-[10px] font-mono uppercase font-bold text-purple-900/60">
                Event Format
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#250d38] font-mono">
                {album.attendance}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Camera className="w-4 h-4 text-[#55CCA2] shrink-0 mt-0.5" />
            <div>
              <span className="block text-[10px] font-mono uppercase font-bold text-purple-900/60">
                Selected Photos
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#250d38] font-mono">
                5 Curated Photos
              </span>
            </div>
          </div>
        </div>

        {/* Narrative & Highlights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#250d38] font-display">
              {locale === "ta" ? "நிகழ்ச்சி பின்னணி & சங்கம தருணங்கள்" : "Event Recap & Community Story"}
            </h2>
            <p className="text-base text-purple-950/90 leading-relaxed font-body">
              {locale === "ta" ? album.descriptionTa : album.descriptionEn}
            </p>
            <div className="p-4 bg-emerald-50/60 border-2 border-[#55CCA2] text-xs text-[#0e4835] leading-relaxed shadow-[2px_2px_0px_#55CCA2]">
              <span className="font-bold uppercase tracking-wider block mb-1 font-mono text-[#0b3c2c]">
                Open Student Community
              </span>
              OSU Tamil Sangam brings together students of all backgrounds and languages. From campus picnics and street food dinners to Diwali celebrations and games, events are open to everyone.
            </div>
          </div>

          {/* Highlights List */}
          <div className="lg:col-span-5 p-5 bg-white border-2 border-[#250d38] shadow-[4px_4px_0px_#4c2472]">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#4c2472] block mb-3 border-b-2 border-purple-200 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#55CCA2]" />
              <span>Key Event Highlights</span>
            </span>
            <ul className="space-y-2.5">
              {album.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[#250d38] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#11694c] shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4-5 Curated Photos Section (Encompassing the whole event) */}
      <div className="mb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-2 border-b-2 border-[#250d38]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#250d38] font-display">
              {locale === "ta" ? "நிகழ்ச்சி புகைப்படக் கதை" : "Curated Event Photo Story"}
            </h2>
          </div>
        </div>

        {/* Hero Photo: The Main Event Feature / Kickoff */}
        {heroPhoto && (
          <div className="mb-6">
            <motion.div
              layoutId={`album-photo-${heroPhoto.id}`}
              onClick={() => {
                playClick();
                setSelectedPhoto(heroPhoto);
              }}
              className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden border-2 border-[#250d38] shadow-[6px_6px_0px_#4c2472] hover:shadow-[8px_8px_0px_#55CCA2] hover:border-[#55CCA2] group cursor-pointer transition-all duration-200 bg-purple-950/10"
            >
              <GlyphMosaicImage
                src={heroPhoto.imageUrl}
                alt={heroPhoto.titleEn}
                aspectRatio="aspect-[21/9]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#250d38]/95 via-[#250d38]/40 to-transparent flex flex-col justify-end p-5 sm:p-8 text-white">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-[#250d38] border border-[#55CCA2] text-[10px] font-mono text-[#55CCA2] font-bold uppercase tracking-wider">
                    Moment 1 of 5 · Event Welcome
                  </span>
                  <span className="p-1.5 bg-[#250d38] border border-white/40 text-white group-hover:border-[#55CCA2] transition-colors">
                    <Eye className="w-4 h-4 text-[#55CCA2]" />
                  </span>
                </div>
                <h3 className="text-xl sm:text-3xl font-bold font-display text-white mb-1">
                  {locale === "ta" ? heroPhoto.titleTa : heroPhoto.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-purple-100/90 font-body max-w-2xl line-clamp-2">
                  {locale === "ta" ? heroPhoto.captionTa : heroPhoto.captionEn}
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* 4-Grid Supporting Photos (Activities, Food, Games, Finale) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gridPhotos.map((photo, idx) => (
            <motion.div
              key={photo.id}
              layoutId={`album-photo-${photo.id}`}
              onClick={() => {
                playClick();
                setSelectedPhoto(photo);
              }}
              className="relative aspect-[4/3] overflow-hidden group cursor-pointer bg-purple-950/10 border-2 border-[#250d38] shadow-[3px_3px_0px_#4c2472] hover:shadow-[5px_5px_0px_#55CCA2] hover:border-[#55CCA2] transition-all duration-200 flex flex-col justify-between"
            >
              <GlyphMosaicImage
                src={photo.imageUrl}
                alt={photo.titleEn}
                aspectRatio="aspect-[4/3]"
              />

              {/* Seamless Hover / Content Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#250d38]/95 via-[#250d38]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5 text-white">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 bg-[#250d38] border border-white/30 text-[9px] font-mono text-[#55CCA2] font-bold uppercase">
                    Moment {idx + 2} of 5
                  </span>
                  <span className="p-1 bg-[#250d38] border border-white/40 text-white">
                    <Eye className="w-3 h-3 text-[#55CCA2]" />
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-purple-200/80 block">
                    {photo.eventDate}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold font-display text-white truncate">
                    {locale === "ta" ? photo.titleTa : photo.titleEn}
                  </h4>
                  <p className="text-[11px] text-purple-100/75 line-clamp-1 font-body mt-0.5">
                    {locale === "ta" ? photo.captionTa : photo.captionEn}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Prominent Bottom Card: Google Photos Album Link */}
      {album.googlePhotosUrl && (
        <div className="box-ticket p-6 sm:p-10 bg-[#250d38] text-white border-2 border-[#55CCA2] shadow-[8px_8px_0px_#55CCA2] mb-16 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#55CCA2]">
                Complete High-Resolution Archive
              </span>
              <span className="text-xs font-mono text-purple-200">
                Google Photos Vault
              </span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold font-display text-white mb-3">
              Explore the Complete {album.titleEn} Album
            </h3>

            <p className="text-xs sm:text-sm text-purple-100/85 font-body leading-relaxed mb-6">
              While our site features these 5 curated photographs encompassing the event narrative, the full collection containing all high-resolution event captures, candid group memories, and student snapshots is preserved in our Google Photos archive.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href={album.googlePhotosUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClick}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#55CCA2] text-[#1b0d28] font-mono font-extrabold text-xs uppercase tracking-wider border-2 border-[#1b0d28] shadow-[4px_4px_0px_#ffffff] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <span>Open Full Album on Google Photos</span>
                <ExternalLink className="w-4 h-4 text-[#1b0d28]" />
              </a>

              <Link
                href="/gallery"
                onClick={playClick}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 border-2 border-white/30 text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all"
              >
                <span>Browse Other Event Archives</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Explore Other 2025–2026 Academic Year Event Info Pages */}
      <div className="border-t-2 border-purple-200 pt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-mono uppercase font-bold text-[#4c2472]">
              2025–2026 Academic Year
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#250d38] font-display">
              {locale === "ta" ? "இதர 2025–2026 விழா பக்கங்கள்" : "More 2025–2026 Event Info Pages"}
            </h3>
          </div>
          <Link
            href="/gallery"
            onClick={playClick}
            className="text-xs font-mono font-bold text-[#4c2472] hover:text-[#250d38] hover:underline uppercase tracking-wider"
          >
            View All Vaults →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {otherAlbums.map((other) => (
            <Link
              key={other.slug}
              href={`/gallery/${other.slug}`}
              onClick={playClick}
              className="border-2 border-[#250d38] bg-white p-4 flex flex-col justify-between group hover:border-[#55CCA2] hover:shadow-[5px_5px_0px_#55CCA2] shadow-[3px_3px_0px_#4c2472] transition-all duration-200"
            >
              <div>
                <div className="relative aspect-[16/10] w-full border border-[#250d38] overflow-hidden mb-3">
                  <Image
                    src={other.coverImage}
                    alt={other.titleEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#250d38] text-[9px] font-mono text-[#55CCA2] font-bold">
                    {other.academicYear}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-[#250d38] font-display mb-1 group-hover:text-[#4c2472] transition-colors line-clamp-1">
                  {locale === "ta" ? other.titleTa : other.titleEn}
                </h4>
                <p className="text-[11px] text-purple-950/70 font-mono mb-2">
                  {other.eventDate} · {other.location.split(",")[0]}
                </p>
                <p className="text-xs text-purple-950/80 font-body line-clamp-2">
                  {locale === "ta" ? other.descriptionTa : other.descriptionEn}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-purple-100 flex items-center justify-between text-xs font-mono font-bold text-[#4c2472]">
                <span>Read Event Story →</span>
                <span className="text-[10px] text-purple-900/60 font-mono">5 Photos</span>
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
                className="absolute top-4 right-4 w-10 h-10 min-w-[40px] min-h-[40px] border-2 border-[#55CCA2] bg-[#250d38] hover:bg-[#34144e] text-white z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] transition-[background-color,transform] duration-150 active:scale-95 flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#55CCA2]"
                aria-label="Close album photo modal"
              >
                <X className="w-5 h-5 text-[#55CCA2]" />
              </button>

              {/* Prev / Next Navigation Buttons */}
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] bg-[#250d38] hover:bg-[#34144e] text-white border-2 border-[#55CCA2] z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] active:scale-95 transition-[background-color,transform,box-shadow] duration-150 flex items-center justify-center shadow-[3px_3px_0px_#55CCA2] cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5 text-[#55CCA2]" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] bg-[#250d38] hover:bg-[#34144e] text-white border-2 border-[#55CCA2] z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] active:scale-95 transition-[background-color,transform,box-shadow] duration-150 flex items-center justify-center shadow-[3px_3px_0px_#55CCA2] cursor-pointer"
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
                  <div className="text-xs font-mono text-[#55CCA2] font-bold uppercase tracking-wider">
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
