"use client";

import React, { useRef, useState } from "react";
import { LayoutGroup, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { GALLERY_ALBUMS } from "@/data/gallery";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { audioLayer } from "@/utils/audioLayer";
import { Search } from "lucide-react";
import { GalleryHero } from "@/components/gallery-hero/GalleryHero";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import { useLiteMode } from "@/context/LiteModeContext";
import { CinemaLightbox, type LightboxPhoto } from "@/components/ui/CinemaLightbox";

export default function GalleryPage() {
  const { locale } = useLocale();
  const { playClick, playCardSlide } = useAudio();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const printsRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { isLiteMode } = useLiteMode();
  const staticMotion = reducedMotion || isLiteMode;
  const { scrollYProgress } = useScroll({ target: printsRef, offset: ["start end", "end start"] });
  const drift1 = useTransform(scrollYProgress, [0, 1], staticMotion ? [0, 0] : [20, -35]);
  const drift2 = useTransform(scrollYProgress, [0, 1], staticMotion ? [0, 0] : [35, -75]);
  const drift3 = useTransform(scrollYProgress, [0, 1], staticMotion ? [0, 0] : [15, -50]);
  const drifts = [drift1, drift2, drift3];

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

  // Map filtered photos to CinemaLightbox format
  const lightboxPhotos: LightboxPhoto[] = React.useMemo(() => {
    return filteredPhotos.map((photo, idx) => ({
      id: photo.id,
      src: photo.imageUrl,
      titleEn: photo.titleEn,
      titleTa: photo.titleTa,
      captionEn: photo.captionEn,
      captionTa: photo.captionTa,
      date: photo.eventDate,
      plateNumber: String(idx + 1).padStart(2, "0"),
    }));
  }, [filteredPhotos]);

  return (
    <div className="w-full bg-transparent min-h-screen text-left">
      {/* =========================================================================
          Vaaranam Aayiram 6-String Acoustic Guitar Hero
          ========================================================================= */}
      <div data-hero-container="true" className="w-full relative">
        <GalleryHero />
      </div>

      {/* =========================================================================
          THE CANVAS: SUNLIT EXPANSIVE MASONRY ON WARM IVORY
          Transition smoothly from hero into horizontal Archive Control Bar
          ========================================================================= */}
      <EditorialSheetHandoff
        id="gallery-vault-content"
        badge="35MM MEMORIES"
        sublabel="PHYSICAL ARCHIVES"
        className="text-hearth-espresso"
      >
        {/* Sleek Horizontal Archive Control Bar (Search + Filter Pills + Count) */}
        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 pt-8 pb-6 border-b border-[#161210]/10">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            {/* Search Input on Left */}
            <div className="relative flex-1 max-w-md border-b border-hearth-espresso/20 focus-within:border-hearth-terracotta transition-colors pb-1">
              <Search className="w-4 h-4 text-hearth-espresso/50 absolute left-0 top-2.5" />
              <input
                aria-label="Search memories"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === "ta" ? "நினைவுகளைத் தேடுக..." : "Search memories by event, food, or tradition..."}
                className="w-full pl-7 pr-3 py-1.5 bg-transparent text-hearth-espresso placeholder:text-hearth-espresso/40 text-sm font-sans outline-none"
              />
            </div>

            {/* Category Filter Pills in Center/Right */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {tags.map((tag) => {
                const isSelected = activeTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      playClick();
                      playCardSlide();
                      setActiveTag(tag);
                    }}
                    className={`px-3 py-1 text-xs font-mono tracking-wider uppercase rounded-full transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#B85C38] text-white shadow-sm"
                        : "bg-black/[0.04] hover:bg-black/[0.08] text-[#57524C]"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Photo Count Badge on Right */}
            <div className="hidden sm:flex items-center text-xs font-mono text-[#8C827A] tracking-wider shrink-0">
              <span className="font-semibold text-[#B85C38] mr-1.5">{filteredPhotos.length}</span>
              {filteredPhotos.length === 1 ? "EXPOSURE" : "EXPOSURES"}
            </div>
          </div>
        </div>

        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 py-10 sm:py-16">

          {/* Analog Photo Table: Asymmetric Rotations, Physical Overlaps, Sharp Corners */}
          <p role="status" className="sr-only">{filteredPhotos.length} memories found</p>
          <LayoutGroup id="gallery-prints">
          <div ref={printsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-14 items-start">
            {filteredPhotos.map((photo, idx) => {
              // Architectural aspect ratio patterns for dynamic physical photos
              const aspect = idx % 5 === 0 ? "aspect-[4/5]" : idx % 3 === 0 ? "aspect-[16/10]" : "aspect-[4/3]";
              const overlap = idx % 3 === 1 ? "md:-mt-4" : idx % 3 === 2 ? "md:mt-3" : "";

              return (
                <motion.div
                  key={photo.id}
                  layout={staticMotion ? false : "position"}
                  layoutId={`gallery-print-${photo.id}`}
                  transition={staticMotion ? { duration: 0 } : { type: "spring", stiffness: 230, damping: 27 }}
                  className={`relative ${overlap}`}
                >
                <motion.div style={{ y: drifts[idx % 3] }} className="max-md:[transform:none!important]">
                <motion.button
                  type="button"
                  data-gallery-print={photo.id}
                  data-cursor="view"
                  aria-label={`View ${photo.titleEn}`}
                  onClick={() => {
                    audioLayer.playTapeClack();
                    setLightboxIndex(idx);
                  }}
                  animate={{ rotate: 0 }}
                  whileHover={staticMotion ? undefined : { scale: 1.01 }}
                  whileFocus={staticMotion ? undefined : { scale: 1.01 }}
                  transition={staticMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 24 }}
                  className="group relative block w-full text-left cursor-pointer select-none hover:z-30 focus-visible:z-30 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-hearth-terracotta"
                >
                  {/* Sharp Architectural Contact Sheet Print with Plate Badge */}
                  <span className={`block relative w-full ${aspect} overflow-hidden bg-sunbaked-sand border border-hearth-espresso/20 shadow-md`}>
                    <span className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 bg-[#161210]/85 text-[#FAF7F2] font-mono text-[10px] tracking-widest uppercase border border-[#D4AF37]/30 backdrop-blur-sm">
                      PLATE {String(idx + 1).padStart(2, "0")}
                    </span>
                    <Image
                      src={photo.imageUrl}
                      alt={photo.titleEn}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      style={{ objectPosition: photo.crop?.position }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </span>

                  {/* Captions Sitting Naked Directly Beneath Photo on Global Background */}
                  <span className="block pt-4 space-y-1" lang={locale === "ta" ? "ta" : "en"}>
                    <span className="flex items-center gap-2" lang="en">
                      <span className="text-xs font-sans font-semibold text-hearth-terracotta tracking-widest uppercase block">
                        {photo.tags[0] || "Memory"}
                      </span>
                      <span className="text-hearth-espresso/50">·</span>
                      <span className="text-xs font-sans text-hearth-espresso/70 uppercase tracking-wider">
                        {photo.eventDate}
                      </span>
                    </span>

                    <span className="block text-xl sm:text-2xl font-serif font-normal text-hearth-espresso group-hover:text-hearth-terracotta transition-colors leading-relaxed">
                      {locale === "ta" ? photo.titleTa : photo.titleEn}
                    </span>
                    <span className="block font-sans text-sm text-hearth-espresso/75 leading-relaxed line-clamp-2">
                      {locale === "ta" ? photo.captionTa : photo.captionEn}
                    </span>
                    {photo.crop && <span lang="en" className="block text-xs font-mono text-hearth-espresso/70">{photo.crop.label}</span>}
                  </span>
                </motion.button>
                <Link href={`/events/${photo.albumSlug}`} data-cursor="view" className="inline-flex min-h-12 items-center text-xs font-mono text-hearth-terracotta underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">View event dossier</Link>
                </motion.div>
                </motion.div>
              );
            })}
          </div>
          </LayoutGroup>

          {filteredPhotos.length === 0 && (
            <div className="py-24 text-center space-y-3 font-sans text-hearth-espresso/75">
              <p className="text-lg font-serif">No memories matched your search criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveTag("all");
                }}
                className="min-h-12 text-sm font-medium text-hearth-terracotta underline cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Student Photo Consent & Removal Notice (Unboxed, 1px Grounding Line) */}
          <div className="mt-28 sm:mt-40 border-t border-antique-gold/30 pt-16 text-center max-w-2xl mx-auto space-y-3 select-none">
            <span className="font-sans text-xs font-semibold text-hearth-terracotta tracking-widest uppercase block">
              Student Privacy & Consent
            </span>
            <h4 className="text-2xl sm:text-3xl font-serif font-normal text-hearth-espresso">
              Documenting Joy with Community Respect
            </h4>
            <p className="text-sm font-sans text-hearth-espresso/75 leading-relaxed">
              We capture moments of genuine joy on campus. If you appear in any photograph and would prefer it removed, simply email{" "}
              <a href="mailto:osutamilsangam@gmail.com" className="text-hearth-terracotta underline font-medium hover:text-antique-gold">
                osutamilsangam@gmail.com
              </a>{" "}
              and we will take it down immediately with zero questions asked.
            </p>
          </div>

        </div>
      </EditorialSheetHandoff>

      {/* Cinema Lightbox Inspection */}
      <CinemaLightbox
        isOpen={lightboxIndex !== null}
        photos={lightboxPhotos}
        currentIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />
    </div>
  );
}
