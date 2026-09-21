"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { GALLERY_ALBUMS, PhotoItem } from "@/data/gallery";
import { GlyphMosaicImage } from "@/components/ui/GlyphMosaicImage";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import {
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  Eye,
  Camera,
  X,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function GalleryPage() {
  const { locale } = useLocale();
  const { playClick, playWoodClick } = useAudio();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeYear, setActiveYear] = useState("all");
  const [activeTag, setActiveTag] = useState("all");
  const [activeAlbum, setActiveAlbum] = useState("all");
  const [visibleCount, setVisibleCount] = useState(24);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [isRemovalModalOpen, setIsRemovalModalOpen] = useState(false);
  const [removalReason, setRemovalReason] = useState("");
  const [removalSent, setRemovalSent] = useState(false);

  // Extract all photos across albums
  const allPhotos = GALLERY_ALBUMS.flatMap((a) => a.photos);

  // Academic Years
  const academicYears = [
    { id: "all", labelEn: "All Archives", labelTa: "அனைத்து தொகுப்புகள்" },
    { id: "2024-2025", labelEn: "2024–2025 (Berry Cute Picnic)", labelTa: "2024–2025 (பிக்னிக்)" },
    { id: "2018-2019", labelEn: "2018–2019 (Sapad & Jathara)", labelTa: "2018–2019 (சாப்பாடு & ஜாதரா)" },
    { id: "2025-2026", labelEn: "2025–2026 (Cultural Showcases)", labelTa: "2025–2026 (விழாக்கள்)" },
  ];

  // Tags
  const tags = ["all", "picnic", "food", "jathara", "carnival", "dance", "games", "tradition", "friends"];

  // Filtered albums
  const filteredAlbums = GALLERY_ALBUMS.filter((album) => {
    if (activeYear === "all") return true;
    return album.academicYear === activeYear;
  });

  // Filtered photos
  const filteredPhotos = allPhotos.filter((photo) => {
    const album = GALLERY_ALBUMS.find((a) => a.slug === photo.albumSlug);
    const matchesYear = activeYear === "all" || album?.academicYear === activeYear;
    const matchesTag = activeTag === "all" || photo.tags.includes(activeTag);
    const matchesAlbum = activeAlbum === "all" || photo.albumSlug === activeAlbum;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesYear && matchesTag && matchesAlbum;

    const matchesQuery =
      photo.titleEn.toLowerCase().includes(q) ||
      photo.captionEn.toLowerCase().includes(q) ||
      photo.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      (album && album.titleEn.toLowerCase().includes(q)) ||
      (album && album.academicYear.toLowerCase().includes(q));

    return matchesYear && matchesTag && matchesAlbum && matchesQuery;
  });

  // Lightbox Navigation
  const currentPhotoIndex = selectedPhoto
    ? filteredPhotos.findIndex((p) => p.id === selectedPhoto.id)
    : -1;

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentPhotoIndex - 1]);
    } else {
      setSelectedPhoto(filteredPhotos[filteredPhotos.length - 1]);
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentPhotoIndex + 1]);
    } else {
      setSelectedPhoto(filteredPhotos[0]);
    }
  };

  const handleRemovalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRemovalSent(true);
    setTimeout(() => {
      setIsRemovalModalOpen(false);
      setRemovalSent(false);
      setSelectedPhoto(null);
    }, 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left font-body">
      {/* Header with High-Contrast Deep Plum Brand Typography */}
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-mono uppercase tracking-widest text-[#4c2472] font-bold block mb-2">
          The Ohio State University · Photo Archives
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#250d38] tracking-tight font-display mb-4">
          {locale === "ta" ? "நினைவுகள் · வரலாற்று புகைப்படத் தொகுப்பு" : "Memories & Photo Archives"}
        </h1>
        <p className="text-base sm:text-lg text-purple-950/85 leading-relaxed font-body">
          {locale === "ta"
            ? "ஓஹியோ ஸ்டேட் தமிழ் சங்கத்தின் வரலாற்றுத் திருவிழாக்கள், பிக்னிக், தெருவோரச் சாப்பாடு மற்றும் கலை நிகழ்ச்சிகளின் அசல் புகைப்படத் தொகுப்பு."
            : "Explore our collegiate archive of past events at Ohio State — from the Fall Berry Cute Picnic and Streetside Sapad to Namma Jathara and flagship cultural festivals."}
        </p>
      </div>

      {/* 1. Academic Year Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 mb-8">
        <span className="text-xs font-mono text-purple-950/80 mr-2 flex items-center gap-1.5 font-bold">
          <Calendar className="w-3.5 h-3.5 text-[#55CCA2]" />
          <span>Timeline Era:</span>
        </span>
        {academicYears.map((year) => (
          <button
            key={year.id}
            onClick={() => {
              playWoodClick();
              setActiveYear(year.id);
              setVisibleCount(24);
            }}
            className={`px-4 py-2 rounded-full text-xs font-mono transition-all duration-200 ${
              activeYear === year.id
                ? "bg-[#4c2472] text-white font-bold shadow-md scale-105 border border-[#4c2472]"
                : "bg-white text-[#250d38] border-2 border-purple-200/90 hover:border-[#55CCA2] hover:bg-purple-50/50 shadow-sm"
            }`}
          >
            {locale === "ta" ? year.labelTa : year.labelEn}
          </button>
        ))}
      </div>

      {/* 2. Photo Archive Search & Filter Panel */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border-2 border-purple-200/90 shadow-xl mb-12">
        <div className="flex items-center justify-between gap-2 text-xs font-mono uppercase tracking-widest text-[#4c2472] font-bold mb-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#55CCA2]" />
            <span>Search Photo Vault</span>
          </div>
          <span className="text-purple-900/70 normal-case text-xs font-medium">
            {filteredPhotos.length} {filteredPhotos.length === 1 ? "photo" : "photos"} matched
          </span>
        </div>

        <div className="relative w-full mb-4">
          <Search className="w-5 h-5 text-purple-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(24);
            }}
            placeholder="Search by title, event, tag (e.g. 'picnic', 'sapad', 'dosa', 'jathara', 'dance', 'lawn')..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-purple-50/50 border-2 border-purple-200 text-[#250d38] placeholder-purple-900/40 text-sm outline-none focus:border-[#4c2472] focus:bg-white font-body transition-all"
          />
        </div>

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-purple-950/70 mr-2 flex items-center gap-1 font-bold">
            <Filter className="w-3.5 h-3.5 text-[#55CCA2]" />
            <span>Tag:</span>
          </span>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                playWoodClick();
                setActiveTag(tag);
                setVisibleCount(24);
              }}
              className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-all ${
                activeTag === tag
                  ? "bg-[#55CCA2] text-[#250d38] font-bold shadow-sm"
                  : "bg-purple-50/70 text-[#4c2472] border border-purple-200/80 hover:bg-purple-100/70 hover:border-purple-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Featured Photo Albums Row */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#250d38] font-display">
            {locale === "ta" ? "சிறப்பு புகைப்படத் தொகுப்புகள்" : "Featured Photo Albums"}
          </h2>
          <span className="text-xs font-mono text-[#4c2472] font-bold">
            {filteredAlbums.length} {filteredAlbums.length === 1 ? "Album" : "Albums"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => (
            <div
              key={album.slug}
              className="rounded-3xl bg-white border-2 border-purple-200/90 p-5 flex flex-col justify-between group hover:border-[#55CCA2] hover:shadow-xl transition-all duration-300 shadow-md"
            >
              <div>
                <Link
                  href={`/gallery/${album.slug}`}
                  onClick={playClick}
                  className="block w-full h-48 relative rounded-2xl overflow-hidden mb-4 border border-purple-100"
                >
                  <Image
                    src={album.coverImage}
                    alt={album.titleEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#250d38]/85 backdrop-blur-md border border-white/20 text-[10px] font-mono text-[#55CCA2] font-bold uppercase tracking-wider">
                    {album.academicYear}
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#250d38]/85 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white font-bold">
                    {album.photoCount} Photos
                  </div>
                </Link>

                <h3 className="text-lg font-bold text-[#250d38] font-display mb-1.5 group-hover:text-[#4c2472] transition-colors">
                  <Link href={`/gallery/${album.slug}`} onClick={playClick}>
                    {locale === "ta" ? album.titleTa : album.titleEn}
                  </Link>
                </h3>
                <p className="text-xs text-purple-950/80 line-clamp-2 leading-relaxed mb-4 font-body">
                  {locale === "ta" ? album.descriptionTa : album.descriptionEn}
                </p>
              </div>

              <div className="pt-3 border-t border-purple-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/gallery/${album.slug}`}
                    onClick={playClick}
                    className="font-bold text-[#4c2472] hover:text-[#250d38] hover:underline"
                  >
                    <span>Open Album</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      playWoodClick();
                      setActiveAlbum(album.slug);
                      const el = document.getElementById("photo-stream");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-[11px] font-mono text-[#55CCA2] hover:underline font-bold"
                  >
                    <span>Browse Stream</span>
                  </button>
                </div>

                {album.googlePhotosUrl && (
                  <a
                    href={album.googlePhotosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-800/80 hover:text-[#4c2472] transition-colors font-medium"
                    title="View on Google Photos"
                  >
                    <span>Google Photos</span>
                    <ExternalLink className="w-3 h-3 text-[#55CCA2]" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Photo Stream with Seamless Album Filter Tabs */}
      <div id="photo-stream" className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#250d38] font-display">
            {locale === "ta" ? "புகைப்பட தொகுப்பு திரை" : "Seamless Photo Stream"}
          </h2>
          <p className="text-xs text-purple-950/70 font-mono mt-0.5">
            Edge-to-edge photo archive · Click any photo for full lightbox view
          </p>
        </div>
        <span className="text-xs font-mono text-purple-950/70 font-bold self-start sm:self-auto">
          Showing {Math.min(visibleCount, filteredPhotos.length)} of {filteredPhotos.length}
        </span>
      </div>

      {/* Seamless Album Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button
          onClick={() => {
            playWoodClick();
            setActiveAlbum("all");
            setVisibleCount(24);
          }}
          className={`px-4 py-2 rounded-full text-xs font-mono transition-all duration-200 ${
            activeAlbum === "all"
              ? "bg-[#4c2472] text-white font-bold shadow-md scale-105"
              : "bg-white text-[#250d38] border-2 border-purple-200 hover:border-[#55CCA2] hover:bg-purple-50 shadow-sm"
          }`}
        >
          All Albums ({allPhotos.length})
        </button>
        {GALLERY_ALBUMS.map((album) => (
          <button
            key={album.slug}
            onClick={() => {
              playWoodClick();
              setActiveAlbum(album.slug);
              setVisibleCount(24);
            }}
            className={`px-4 py-2 rounded-full text-xs font-mono transition-all duration-200 ${
              activeAlbum === album.slug
                ? "bg-[#4c2472] text-white font-bold shadow-md scale-105"
                : "bg-white text-[#250d38] border-2 border-purple-200 hover:border-[#55CCA2] hover:bg-purple-50 shadow-sm"
            }`}
          >
            {locale === "ta" ? album.titleTa : album.titleEn} ({album.photoCount})
          </button>
        ))}
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border-2 border-purple-200/90 shadow-md mb-16">
          <p className="text-purple-900/80 font-mono text-sm">No photos found matching your search filter.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveYear("all");
              setActiveTag("all");
              setActiveAlbum("all");
            }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#4c2472] text-white text-xs font-mono font-bold hover:bg-[#250d38] transition-colors shadow-sm"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-12"
          >
            {filteredPhotos.slice(0, visibleCount).map((photo) => {
              const parentAlbum = GALLERY_ALBUMS.find((a) => a.slug === photo.albumSlug);
              return (
                <motion.div
                  key={photo.id}
                  variants={itemVariants}
                  layoutId={`photo-card-${photo.id}`}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer bg-purple-950/10 border border-purple-200/70 shadow-sm hover:shadow-xl hover:border-[#55CCA2] transition-all duration-300"
                  onClick={() => {
                    playClick();
                    setSelectedPhoto(photo);
                  }}
                >
                  {/* Image Container with Glyph Loader */}
                  <GlyphMosaicImage
                    src={photo.imageUrl}
                    alt={photo.titleEn}
                    aspectRatio="aspect-[4/3]"
                  />

                  {/* Subtle, seamless hover overlay showing album tag and expand icon */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#250d38]/85 via-[#250d38]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 sm:p-3.5 pointer-events-none">
                    <div className="flex justify-end">
                      <span className="p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white/90">
                        <Eye className="w-3.5 h-3.5 text-[#55CCA2]" />
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-mono text-[#55CCA2] font-semibold block truncate">
                        {parentAlbum?.titleEn || photo.eventDate}
                      </span>
                      <span className="text-xs font-bold text-white font-display block truncate">
                        {locale === "ta" ? photo.titleTa : photo.titleEn}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Load More Button */}
          {visibleCount < filteredPhotos.length && (
            <div className="text-center mb-20">
              <button
                onClick={() => {
                  playClick();
                  setVisibleCount((prev) => prev + 24);
                }}
                className="px-8 py-3.5 rounded-full bg-white border-2 border-purple-200 text-[#4c2472] font-mono font-bold text-xs hover:border-[#55CCA2] hover:bg-purple-50 transition-all shadow-md hover:scale-105"
              >
                Load More Photos ({filteredPhotos.length - visibleCount} Remaining)
              </button>
            </div>
          )}
        </>
      )}

      {/* Photo Lightbox Shared Element Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#250d38]/90 backdrop-blur-xl"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              layoutId={`photo-card-${selectedPhoto.id}`}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-full max-w-5xl rounded-3xl bg-[#1c082b] border-2 border-purple-400/30 p-6 shadow-2xl relative text-left"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white z-20 transition-colors"
                aria-label="Close photo lightbox"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Prev / Next Navigation Buttons */}
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 z-20 transition-all hover:scale-110"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5 text-[#55CCA2]" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 z-20 transition-all hover:scale-110"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5 text-[#55CCA2]" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 relative h-80 sm:h-[480px] rounded-2xl overflow-hidden border border-white/10 bg-black/50">
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
                  <div className="text-[11px] font-mono text-[#55CCA2] font-bold uppercase tracking-wider">
                    Photo {currentPhotoIndex + 1} of {filteredPhotos.length}
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
                        className="px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-mono text-purple-200 font-semibold"
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
                      className="text-xs font-mono text-[#55CCA2] hover:underline flex items-center gap-1.5 font-bold"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Full Resolution</span>
                    </a>

                    <button
                      onClick={() => setIsRemovalModalOpen(true)}
                      className="text-[11px] font-mono text-red-300 hover:text-red-200 hover:underline flex items-center gap-1"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Request Removal</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Removal Request Modal */}
      {isRemovalModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#250d38]/90 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 border-2 border-red-400 shadow-2xl relative text-left">
            <button
              onClick={() => setIsRemovalModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
              aria-label="Close removal modal"
            >
              <X className="w-4 h-4" />
            </button>

            {!removalSent ? (
              <form onSubmit={handleRemovalSubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-red-600 text-xs font-mono uppercase font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Student Photo Privacy Request</span>
                </div>
                <h3 className="text-xl font-bold text-[#250d38] font-display">Request Photo Removal</h3>
                <p className="text-xs text-purple-950/80 leading-relaxed font-body">
                  We respect everyone&apos;s privacy. Submit this form to have this image unlisted or your face blurred within 48 hours.
                </p>

                <div>
                  <label className="block text-xs font-mono text-purple-950/80 font-bold mb-1">
                    Reason or Note for Officers
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={removalReason}
                    onChange={(e) => setRemovalReason(e.target.value)}
                    placeholder="I am in this photo and prefer not to have it on the website..."
                    className="w-full p-3 rounded-xl bg-purple-50/50 border-2 border-purple-200 text-[#250d38] text-xs outline-none focus:border-red-500 font-body"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-md"
                >
                  Submit Removal Request
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-2">
                <p className="text-emerald-600 font-bold text-base">Request Received</p>
                <p className="text-xs text-purple-950/80">
                  Our executive board has received your removal request and will action it within 48 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
