"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GALLERY_ALBUMS, PhotoItem } from "@/data/gallery";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { audioLayer } from "@/utils/audioLayer";
import { X, Search } from "lucide-react";
import { GalleryHero } from "@/components/gallery-hero/GalleryHero";
import { HeroGradientTransition } from "@/components/ui/HeroGradientTransition";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { MuttramButton } from "@/components/muttram/MuttramButton";

export default function GalleryPage() {
  const { locale } = useLocale();
  const { playClick } = useAudio();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  // Extract all photos across albums
  const allPhotos = GALLERY_ALBUMS.flatMap((a) => a.photos);

  const tags = ["all", "picnic", "food", "jathara", "carnival", "dance", "games", "tradition", "friends"];

  // Filtered photos
  const filteredPhotos = allPhotos.filter((photo) => {
    const album = GALLERY_ALBUMS.find((a) => a.slug === photo.albumSlug);
    const matchesTag = activeTag === "all" || photo.tags.includes(activeTag);
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesTag;

    return (
      matchesTag &&
      (photo.titleEn.toLowerCase().includes(q) ||
        photo.captionEn.toLowerCase().includes(q) ||
        photo.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        (album && album.titleEn.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="w-full bg-transparent min-h-screen text-left">
      {/* =========================================================================
          CRITICAL / IMMUTABLE: 3D Fretboard Highway Hero
          HERO ANIMATIONS ARE NEVER TOUCHED OR MODIFIED UNDER ANY CIRCUMSTANCES.
          ========================================================================= */}
      <div data-hero-container="true" id="gallery-hero" className="w-full relative">
        <GalleryHero />
      </div>

      {/* Hero to Content Gradient Transition */}
      <HeroGradientTransition variant="gallery" className="-mt-32 relative z-20" />

      {/* =========================================================================
          THE CANVAS: SUNLIT EXPANSIVE MASONRY ON WARM IVORY
          Warm Ivory (#FAF9F6), Sunbaked Sand (#F4EFE6), Charcoal Espresso (#2A2825)
          ========================================================================= */}
      <div className="relative z-20 w-full bg-[#FAF9F6] text-[#2A2825] overflow-hidden">
        
        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
          
          {/* Centered Airy Header */}
          <CourtyardHeader
            align="center"
            eyebrow="Physical Archives · 35mm Memories"
            title={locale === "ta" ? "நினைவுகள் & வரலாற்று புகைப்படத் தொகுப்பு" : "The Canvas"}
            tamilTitle={locale !== "ta" ? "நிழற்படம் · நினைவுகள்" : undefined}
            description="Messy, candid, and full of life. Photographs expand widely across the bright courtyard canvas, capturing student laughter, lawn blankets, and festive stages."
          />

          {/* Search Bar & Tag Links (Zero Pill Buttons) */}
          <div className="max-w-2xl mx-auto space-y-8 mb-20 sm:mb-28">
            <div className="relative border-b-2 border-[#2A2825]/15 focus-within:border-[#B85C38] transition-colors pb-1">
              <Search className="w-5 h-5 text-[#57524C] absolute left-0 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories by event name, food, or tradition..."
                className="w-full pl-8 pr-4 py-2.5 bg-transparent text-[#2A2825] placeholder:text-[#2A2825]/35 text-base sm:text-lg font-sans outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              {tags.map((tag) => {
                const isSelected = activeTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      playClick();
                      setActiveTag(tag);
                    }}
                    className={`font-sans text-xs tracking-widest uppercase font-semibold transition-colors duration-200 cursor-pointer pb-1 ${
                      isSelected
                        ? "text-[#B85C38] border-b-2 border-[#B85C38]"
                        : "text-[#57524C] hover:text-[#2A2825] border-b-2 border-transparent"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Analog Photo Table: Asymmetric Rotations, Physical Overlaps, Sharp Corners */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-14 items-start">
            {filteredPhotos.map((photo, idx) => {
              // Asymmetric aspect ratio patterns for dynamic physical photos
              const aspect = idx % 5 === 0 ? "aspect-[4/5]" : idx % 3 === 0 ? "aspect-[16/10]" : "aspect-[4/3]";
              const rotations = ["-rotate-1 md:-rotate-2", "rotate-1 md:rotate-2", "rotate-0", "-rotate-2 md:-rotate-1", "rotate-2 md:rotate-1", "-rotate-1"];
              const rot = rotations[idx % rotations.length];
              const overlap = idx % 3 === 1 ? "md:-mt-6" : idx % 3 === 2 ? "md:mt-4" : "";

              return (
                <div
                  key={photo.id}
                  onClick={() => {
                    audioLayer.playTapeClack();
                    setSelectedPhoto(photo);
                  }}
                  className={`group relative transition-all duration-500 cursor-pointer select-none ${rot} ${overlap} hover:rotate-0 hover:scale-[1.02] hover:z-30`}
                >
                  {/* Sharp Physical Photo Print (No rounded corners, no white card wrapper) */}
                  <div className={`relative w-full ${aspect} overflow-hidden bg-[#F4EFE6] border border-stone-300/50 shadow-xl shadow-stone-900/10`}>
                    <Image
                      src={photo.imageUrl}
                      alt={photo.titleEn}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Captions Sitting Naked Directly Beneath Photo on Global Background */}
                  <div className="pt-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-sans font-semibold text-[#B85C38] tracking-widest uppercase block">
                        {photo.tags[0] || "Memory"}
                      </span>
                      <span className="text-stone-400">·</span>
                      <span className="text-xs font-sans text-stone-500 uppercase tracking-wider">
                        {photo.eventDate}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-serif font-normal text-[#2A2825] group-hover:text-[#B85C38] transition-colors leading-snug">
                      {locale === "ta" ? photo.titleTa : photo.titleEn}
                    </h3>
                    <p className="font-sans text-sm text-[#57524C] leading-relaxed line-clamp-2">
                      {locale === "ta" ? photo.captionTa : photo.captionEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPhotos.length === 0 && (
            <div className="py-24 text-center space-y-3 font-sans text-[#57524C]">
              <p className="text-lg font-serif">No memories matched your search criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveTag("all");
                }}
                className="text-sm font-medium text-[#B85C38] underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Student Photo Consent & Removal Notice (Unboxed, 1px Grounding Line) */}
          <div className="mt-28 sm:mt-40 border-t border-[#E5DDD0] pt-16 text-center max-w-2xl mx-auto space-y-3 select-none">
            <span className="font-sans text-xs font-semibold text-[#B85C38] tracking-widest uppercase block">
              Student Privacy & Consent
            </span>
            <h4 className="text-2xl sm:text-3xl font-serif font-normal text-[#2A2825]">
              Documenting Joy with Community Respect
            </h4>
            <p className="text-sm font-sans text-[#57524C] leading-relaxed">
              We capture moments of genuine joy on campus. If you appear in any photograph and would prefer it removed, simply email{" "}
              <a href="mailto:osutamilsangam@gmail.com" className="text-[#B85C38] underline font-medium hover:text-[#E5A93C]">
                osutamilsangam@gmail.com
              </a>{" "}
              and we will take it down immediately with zero questions asked.
            </p>
          </div>

        </div>
      </div>

      {/* Lightbox Projection Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-[#FAF9F6] border border-stone-400/40 overflow-hidden shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Right Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close"
              className="absolute top-4 right-4 z-20 w-11 h-11 bg-[#FAF9F6]/90 text-[#2A2825] hover:bg-[#B85C38] hover:text-[#FAF9F6] flex items-center justify-center border border-stone-300 shadow-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo View */}
            <div className="relative md:w-2/3 h-80 md:h-[75vh] bg-[#F4EFE6]">
              <Image
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.titleEn}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 800px"
              />
            </div>

            {/* Info View */}
            <div className="p-8 md:w-1/3 flex flex-col justify-between space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <span className="text-xs font-sans font-semibold text-[#B85C38] tracking-widest uppercase block">
                  {selectedPhoto.eventDate}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif text-[#2A2825]">
                  {locale === "ta" ? selectedPhoto.titleTa : selectedPhoto.titleEn}
                </h3>
                <p className="text-base font-sans text-[#57524C] leading-relaxed">
                  {locale === "ta" ? selectedPhoto.captionTa : selectedPhoto.captionEn}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedPhoto.tags.map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full bg-[#F4EFE6] text-xs font-sans text-[#2A2825]">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#2A2825]/10">
                <p className="text-xs font-sans text-[#57524C]">
                  Columbus, Ohio · The Ohio State University
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
