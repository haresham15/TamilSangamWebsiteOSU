"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { GALLERY_ALBUMS, PhotoItem } from "@/data/gallery";
import { CinemaLightbox, type LightboxPhoto } from "@/components/ui/CinemaLightbox";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { ChevronLeft, ChevronRight, ExternalLink, Camera, Sparkles, ArrowRight } from "lucide-react";

export function EditorialPhotoCarousel() {
  const { locale } = useLocale();
  const { playClick } = useAudio();
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  const [activeAlbumSlug, setActiveAlbumSlug] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filtered photos based on album selection
  const photos = useMemo(() => {
    if (activeAlbumSlug === "all") {
      return GALLERY_ALBUMS.flatMap((album) => album.photos);
    }
    const targetAlbum = GALLERY_ALBUMS.find((a) => a.slug === activeAlbumSlug);
    return targetAlbum ? targetAlbum.photos : [];
  }, [activeAlbumSlug]);

  // Formatted photos for CinemaLightbox
  const lightboxPhotos: LightboxPhoto[] = useMemo(() => {
    return photos.map((p, idx) => ({
      id: p.id,
      src: p.imageUrl,
      titleEn: p.titleEn,
      titleTa: p.titleTa,
      captionEn: p.captionEn,
      captionTa: p.captionTa,
      date: p.eventDate,
      plateNumber: String(idx + 1).padStart(2, "0"),
    }));
  }, [photos]);

  const activeAlbum = useMemo(() => {
    if (activeAlbumSlug === "all") return null;
    return GALLERY_ALBUMS.find((a) => a.slug === activeAlbumSlug) || null;
  }, [activeAlbumSlug]);

  const handleScroll = (direction: "left" | "right") => {
    playClick();
    if (!scrollTrackRef.current) return;
    const offset = direction === "left" ? -380 : 380;
    scrollTrackRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section id="photo-archives" aria-labelledby="editorial-photo-carousel-heading" className="w-full my-20 sm:my-28 text-left scroll-mt-24">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[rgba(125,96,166,0.25)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#271A3C] text-[#C79347]">
              <Camera className="w-4 h-4" />
            </span>
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-[#C79347]">
              Living Photo Chronicle · நிழற்படத் தொகுப்பு
            </span>
          </div>
          <h2
            id="editorial-photo-carousel-heading"
            className="text-3xl sm:text-4xl font-serif font-normal text-[#FAF5ED]"
          >
            Memories on the Banks of the Olentangy
          </h2>
          <p className="text-sm font-sans text-[#CBBBA8] max-w-xl">
            Candid captures from our welcome picnics, murder mystery game nights, student jam circles, and joint spring carnivals.
          </p>
        </div>

        {/* Carousel Prev/Next Navigation Controls */}
        <div className="flex items-center gap-2 self-start md:self-end shrink-0">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Scroll photo gallery left"
            className="p-2.5 rounded-full border border-[#C79347]/30 hover:border-[#2BB5A8] text-[#FAF5ED] hover:text-[#2BB5A8] bg-[#1C122B] hover:bg-[#271A3C] transition-colors focus-visible:outline-2 focus-visible:outline-[#2BB5A8] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Scroll photo gallery right"
            className="p-2.5 rounded-full border border-[#C79347]/30 hover:border-[#2BB5A8] text-[#FAF5ED] hover:text-[#2BB5A8] bg-[#1C122B] hover:bg-[#271A3C] transition-colors focus-visible:outline-2 focus-visible:outline-[#2BB5A8] cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Album Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none text-xs font-mono">
        <button
          type="button"
          onClick={() => {
            playClick();
            setActiveAlbumSlug("all");
          }}
          className={`px-3.5 py-1.5 rounded-full transition-colors shrink-0 cursor-pointer ${
            activeAlbumSlug === "all"
              ? "bg-[#5B2C86] text-[#FAF5ED] font-semibold shadow-xs"
              : "bg-[#271A3C] text-[#CBBBA8] border border-[rgba(212,163,106,0.24)] hover:text-[#FAF5ED]"
          }`}
        >
          All Memories ({GALLERY_ALBUMS.reduce((acc, a) => acc + a.photos.length, 0)})
        </button>
        {GALLERY_ALBUMS.map((album) => {
          const isSelected = activeAlbumSlug === album.slug;
          return (
            <button
              key={album.slug}
              type="button"
              onClick={() => {
                playClick();
                setActiveAlbumSlug(album.slug);
              }}
              className={`px-3.5 py-1.5 rounded-full transition-colors shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-[#5B2C86] text-[#FAF5ED] font-semibold shadow-xs"
                  : "bg-[#271A3C] text-[#CBBBA8] border border-[rgba(212,163,106,0.24)] hover:text-[#FAF5ED]"
              }`}
            >
              {album.titleEn.replace(/^TS\s*/, "")}
            </button>
          );
        })}
      </div>

      {/* Album Context Banner (If single album filtered) */}
      {activeAlbum && (
        <div className="mt-2 mb-6 p-4 rounded-xl bg-[#271A3C] border border-[rgba(212,163,106,0.24)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans text-[#FAF5ED]">
          <div>
            <span className="font-mono text-[#C79347] uppercase tracking-wider block font-semibold text-[10px]">
              {activeAlbum.eventDate} · {activeAlbum.location}
            </span>
            <p className="text-[#CBBBA8] mt-0.5 max-w-2xl">
              {locale === "ta" ? activeAlbum.descriptionTa : activeAlbum.descriptionEn}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 flex-wrap">
            <Link
              href={`/events/${activeAlbum.eventSlug || activeAlbum.slug}#photo-vault`}
              onClick={playClick}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#C79347] hover:text-[#FAF5ED] border-b border-[#C79347] pb-0.5 transition-colors"
            >
              <span>View Event Dossier &amp; Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {activeAlbum.googlePhotosUrl && (
              <a
                href={activeAlbum.googlePhotosUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#CBBBA8] hover:text-[#C79347] transition-colors"
              >
                <span>Google Vault</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Horizontal Smooth Drag/Scroll Photo Track */}
      <div
        ref={scrollTrackRef}
        tabIndex={0}
        aria-label="Scrollable photo collection. Use left and right arrow keys to explore."
        className="mt-6 flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C79347] rounded-xl"
        style={{ scrollbarWidth: "none" }}
      >
        {photos.map((photo, index) => {
          return (
            <div
              key={photo.id || index}
              onClick={() => {
                playClick();
                setLightboxIndex(index);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  playClick();
                  setLightboxIndex(index);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`View enlarged photo: ${photo.titleEn}`}
              className="group relative flex-none w-[280px] sm:w-[340px] md:w-[380px] snap-start rounded-xl overflow-hidden bg-[#271A3C] border border-[rgba(212,163,106,0.24)] hover:border-[#C79347]/50 hover:shadow-lg transition-[border-color,box-shadow] duration-200 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-[#C79347]"
            >
              {/* Aspect Ratio Locked Frame */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200">
                <Image
                  src={photo.imageUrl}
                  alt={photo.titleEn}
                  fill
                  sizes="(max-width: 640px) 280px, (max-width: 768px) 340px, 380px"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white bg-black/50 backdrop-blur-xs p-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-[#C79347]" />
                </div>
              </div>

              {/* Photo Caption / Meta */}
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#CBBBA8]">
                  <span>{photo.eventDate}</span>
                  <span className="text-[#C79347] uppercase tracking-wider font-semibold">
                    Plate {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-base font-serif font-normal text-[#FAF5ED] group-hover:text-[#C79347] transition-colors truncate">
                  {locale === "ta" ? photo.titleTa : photo.titleEn}
                </h3>
                <p className="text-xs font-sans text-[#CBBBA8] line-clamp-2 leading-relaxed">
                  {locale === "ta" ? photo.captionTa : photo.captionEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accessible Cinema Lightbox Modal */}
      <CinemaLightbox
        isOpen={lightboxIndex !== null}
        photos={lightboxPhotos}
        currentIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />
    </section>
  );
}

