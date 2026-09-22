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

  // Academic Years (All photo albums belong to 2025-2026 last academic year)
  const academicYears = [
    { id: "all", labelEn: "All Event Vaults", labelTa: "அனைத்து நிகழ்வுகள்" },
    { id: "2025-2026", labelEn: "2025–2026 (Last Academic Year)", labelTa: "2025–2026 (கடந்த கல்வியாண்டு)" },
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
          The Ohio State University · Event Info & Photo Vaults
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#250d38] tracking-tight font-display mb-4">
          {locale === "ta" ? "நினைவுகள் · வரலாற்று புகைப்படத் தொகுப்பு" : "Memories & Event Info Pages"}
        </h1>
        <p className="text-base sm:text-lg text-purple-950/85 leading-relaxed font-body">
          {locale === "ta"
            ? "ஓஹியோ ஸ்டேட் தமிழ் சங்கத்தின் 2025–2026 கல்வியாண்டின் விழாக்கள், பிக்னிக், தெருவோரச் சாப்பாடு மற்றும் கலை நிகழ்ச்சிகளின் பிரத்யேக தகவல் பக்கங்கள் மற்றும் 5 புகைப்படக் கதைகள்."
            : "Explore our collegiate archive of past events at Ohio State from the 2025–2026 academic year. Each event features a dedicated info page with 5 curated photographs capturing the full narrative, plus direct links to complete Google Photos albums."}
        </p>
      </div>

      {/* 1. Academic Year Filter: Architectural Console Strip */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <div className="box-badge mr-1">
          <Calendar className="w-3.5 h-3.5 text-[#55CCA2]" />
          <span>Timeline Era:</span>
        </div>
        <div className="box-tab-strip">
          {academicYears.map((year) => (
            <button
              key={year.id}
              onClick={() => {
                playWoodClick();
                setActiveYear(year.id);
                setVisibleCount(24);
              }}
              className={`box-tab-item ${activeYear === year.id ? "box-tab-item-active" : ""}`}
            >
              {locale === "ta" ? year.labelTa : year.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Photo Archive Search & Filter Panel: Architectural Console */}
      <div className="border-2 border-[#250d38] bg-white p-6 sm:p-8 shadow-[5px_5px_0px_#4c2472] mb-12">
        <div className="flex items-center justify-between gap-2 text-xs font-mono uppercase tracking-widest text-[#4c2472] font-bold mb-3 border-b-2 border-purple-200 pb-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#55CCA2]" />
            <span>Search Photo Vault</span>
          </div>
          <span className="text-purple-900/80 font-mono text-xs font-bold">
            [{filteredPhotos.length} {filteredPhotos.length === 1 ? "photo" : "photos"} matched]
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
            className="w-full pl-12 pr-4 py-3 bg-purple-50/50 border-2 border-[#250d38] text-[#250d38] placeholder-purple-900/40 text-sm outline-none focus:border-[#4c2472] focus:bg-white font-body transition-all"
          />
        </div>

        {/* Quick Tag Ledger Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono text-purple-950/70 mr-1 flex items-center gap-1 font-bold">
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
              className={`px-2.5 py-1 text-xs font-mono uppercase font-bold border transition-all ${
                activeTag === tag
                  ? "bg-[#250d38] text-[#55CCA2] border-[#250d38] shadow-[1px_1px_0px_#55CCA2]"
                  : "bg-purple-50/80 text-[#4c2472] border-purple-300 hover:bg-purple-100"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Featured Event Info & Photo Pages */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-[#4c2472] block">
              2025–2026 Academic Year Vaults
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#250d38] font-display">
              {locale === "ta" ? "நிகழ்ச்சி தகவல் பக்கங்கள் & புகைப்படக் கதைகள்" : "Event Info Pages & Photo Stories"}
            </h2>
          </div>
          <span className="text-xs font-mono text-[#4c2472] font-bold">
            [{filteredAlbums.length} {filteredAlbums.length === 1 ? "Event" : "Events"}]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAlbums.map((album) => (
            <div
              key={album.slug}
              className="border-2 border-[#250d38] bg-white p-6 flex flex-col justify-between group hover:border-[#55CCA2] hover:shadow-[6px_6px_0px_#55CCA2] transition-all duration-200 shadow-[4px_4px_0px_#4c2472]"
            >
              <div>
                {/* Album Header & Tags */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-[#250d38] text-[10px] font-mono text-[#55CCA2] font-bold uppercase tracking-wider">
                    {album.academicYear} Academic Year
                  </span>
                  <span className="text-[11px] font-mono font-bold text-purple-900/70">
                    {album.eventDate}
                  </span>
                </div>

                <Link
                  href={`/gallery/${album.slug}`}
                  onClick={playClick}
                  className="block w-full h-52 relative border-2 border-[#250d38] overflow-hidden mb-3"
                >
                  <Image
                    src={album.coverImage}
                    alt={album.titleEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#250d38]/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs font-mono text-white font-bold">
                      {album.location.split(",")[0]} · {album.attendance}
                    </span>
                  </div>
                </Link>

                {/* 5-Photo Thumbnail Strip Preview */}
                <div className="grid grid-cols-5 gap-1.5 mb-4">
                  {album.photos.map((p, idx) => (
                    <div
                      key={p.id}
                      className="relative aspect-[4/3] border border-[#250d38] overflow-hidden bg-purple-950/10"
                    >
                      <Image
                        src={p.imageUrl}
                        alt={p.titleEn}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      <div className="absolute top-0.5 left-0.5 px-1 bg-[#250d38]/80 text-[8px] font-mono text-[#55CCA2] font-bold">
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-bold text-[#250d38] font-display mb-1 group-hover:text-[#4c2472] transition-colors">
                  <Link href={`/gallery/${album.slug}`} onClick={playClick}>
                    {locale === "ta" ? album.titleTa : album.titleEn}
                  </Link>
                </h3>
                <p className="text-xs text-[#4c2472] font-tamil font-semibold mb-2">
                  {album.titleTa}
                </p>
                <p className="text-xs text-purple-950/80 line-clamp-2 leading-relaxed mb-4 font-body">
                  {locale === "ta" ? album.descriptionTa : album.descriptionEn}
                </p>
              </div>

              <div className="pt-4 border-t-2 border-purple-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold">
                <Link
                  href={`/gallery/${album.slug}`}
                  onClick={playClick}
                  className="px-4 py-2 bg-[#250d38] text-[#55CCA2] border border-[#250d38] hover:bg-[#3c1959] transition-colors uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#4c2472]"
                >
                  <span>View Event Info & Story →</span>
                </Link>

                {album.googlePhotosUrl && (
                  <a
                    href={album.googlePhotosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-purple-900 hover:text-[#250d38] hover:underline"
                    title="View on Google Photos"
                  >
                    <span>Google Photos</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#55CCA2]" />
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

      {/* Seamless Album Switcher Tabs: Architectural Segmented Console */}
      <div className="flex flex-wrap items-center gap-1.5 mb-8 p-1.5 bg-purple-50 border-2 border-[#250d38] shadow-[3px_3px_0px_#4c2472]">
        <button
          onClick={() => {
            playWoodClick();
            setActiveAlbum("all");
            setVisibleCount(24);
          }}
          className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
            activeAlbum === "all"
              ? "bg-[#250d38] text-[#55CCA2] border-b-2 border-b-[#55CCA2] shadow-sm"
              : "text-[#3c1959] hover:text-[#250d38] hover:bg-purple-100"
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
            className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              activeAlbum === album.slug
                ? "bg-[#250d38] text-[#55CCA2] border-b-2 border-b-[#55CCA2] shadow-sm"
                : "text-[#3c1959] hover:text-[#250d38] hover:bg-purple-100"
            }`}
          >
            {locale === "ta" ? album.titleTa : album.titleEn} ({album.photoCount})
          </button>
        ))}
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="py-20 text-center bg-white border-2 border-[#250d38] shadow-[4px_4px_0px_#4c2472] mb-16">
          <p className="text-purple-900/80 font-mono text-sm">No photos found matching your search filter.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveYear("all");
              setActiveTag("all");
              setActiveAlbum("all");
            }}
            className="mt-4 px-5 py-2.5 btn-sangam text-xs font-mono font-bold uppercase tracking-wider"
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
                  className="relative aspect-[4/3] overflow-hidden group cursor-pointer bg-purple-950/10 border-2 border-[#250d38] shadow-[2px_2px_0px_#4c2472] hover:shadow-[4px_4px_0px_#55CCA2] hover:border-[#55CCA2] transition-all duration-200"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[#250d38]/90 via-[#250d38]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 sm:p-3.5 pointer-events-none">
                    <div className="flex justify-end">
                      <span className="p-1 bg-[#250d38] border border-[#55CCA2] text-white">
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
                className="px-8 py-3.5 btn-sangam-white font-mono font-bold text-xs uppercase tracking-wider"
              >
                Load More Photos ({filteredPhotos.length - visibleCount} Remaining) →
              </button>
            </div>
          )}
        </>
      )}

      {/* Photo Lightbox Shared Element Modal: Architectural Exhibition Box */}
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
              layoutId={`photo-card-${selectedPhoto.id}`}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-full max-w-5xl bg-[#1c082b] border-2 border-[#55CCA2] p-6 shadow-[8px_8px_0px_#55CCA2] relative text-left"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-8 h-8 border border-white/40 bg-white/10 hover:bg-white/25 text-white z-20 transition-colors flex items-center justify-center"
                aria-label="Close photo lightbox"
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

      {/* Privacy Removal Request Modal: Architectural Alert Box */}
      {isRemovalModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#250d38]/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-white p-6 sm:p-8 border-2 border-red-500 shadow-[6px_6px_0px_#dc2626] relative text-left">
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
                    className="w-full p-3 bg-purple-50/50 border-2 border-purple-200 text-[#250d38] text-xs outline-none focus:border-red-500 font-body"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 border-2 border-[#250d38] bg-red-600 text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-colors shadow-[3px_3px_0px_#000]"
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
