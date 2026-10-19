"use client";

import React, { useRef, useState } from "react";
import { LayoutGroup, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { GALLERY_ALBUMS, PhotoItem } from "@/data/gallery";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { audioLayer } from "@/utils/audioLayer";
import { X, Search } from "lucide-react";
import { GalleryHero } from "@/components/gallery-hero/GalleryHero";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { useLiteMode } from "@/context/LiteModeContext";

export default function GalleryPage() {
  const { locale } = useLocale();
  const { playClick, playCardSlide } = useAudio();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const printsRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { isLiteMode } = useLiteMode();
  const staticMotion = reducedMotion || isLiteMode;
  const { scrollYProgress } = useScroll({ target: printsRef, offset: ["start end", "end start"] });
  const drift1 = useTransform(scrollYProgress, [0, 1], staticMotion ? [0, 0] : [20, -35]);
  const drift2 = useTransform(scrollYProgress, [0, 1], staticMotion ? [0, 0] : [35, -75]);
  const drift3 = useTransform(scrollYProgress, [0, 1], staticMotion ? [0, 0] : [15, -50]);
  const drifts = [drift1, drift2, drift3];

  // Keyboard Escape listener & scroll-lock for lightbox modal
  React.useEffect(() => {
    if (!selectedPhoto) return;

    const dialog = dialogRef.current;
    dialog?.showModal();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      dialog?.close();
      document.body.style.overflow = originalOverflow;
      openerRef.current?.focus({ preventScroll: true });
    };
  }, [selectedPhoto]);

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
          Vaaranam Aayiram 6-String Acoustic Guitar Hero
          ========================================================================= */}
      <div data-hero-container="true" className="w-full relative">
        <GalleryHero />
      </div>

      {/* Hero to Content Gradient Transition */}

      {/* =========================================================================
          THE CANVAS: SUNLIT EXPANSIVE MASONRY ON WARM IVORY
          Warm Ivory (#FAF9F6), Sunbaked Sand (#F4EFE6), Charcoal Espresso (#2A2825)
          ========================================================================= */}
      <div id="gallery-vault-content" tabIndex={-1} className="relative z-20 w-full bg-paper text-hearth-espresso overflow-hidden">
        
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
            <div className="relative border-b-2 border-hearth-espresso/15 focus-within:border-hearth-terracotta transition-colors pb-1">
              <Search className="w-5 h-5 text-hearth-espresso/75 absolute left-0 top-3" />
              <input
                aria-label="Search memories"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories by event name, food, or tradition..."
                className="w-full min-h-12 pl-8 pr-4 py-2.5 bg-transparent text-hearth-espresso placeholder:text-hearth-espresso/60 text-base sm:text-lg font-sans outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
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
                    className={`min-h-12 min-w-12 font-sans text-xs tracking-widest uppercase font-semibold transition-colors duration-200 cursor-pointer pb-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hearth-terracotta ${
                      isSelected
                        ? "text-hearth-terracotta border-b-2 border-hearth-terracotta"
                        : "text-hearth-espresso/75 hover:text-hearth-espresso border-b-2 border-transparent"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

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
                  onClick={(event) => {
                    openerRef.current = event.currentTarget;
                    audioLayer.playTapeClack();
                    setSelectedPhoto(photo);
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
      </div>

      {/* Lightbox Projection Modal */}
      {selectedPhoto && (
        <dialog
          ref={dialogRef}
          aria-labelledby="gallery-photo-title"
          aria-describedby="gallery-photo-caption"
          onCancel={() => setSelectedPhoto(null)}
          onKeyDown={(event) => {
            if (event.key === "Tab") {
              event.preventDefault();
              dialogRef.current?.querySelector("button")?.focus();
            }
          }}
          className="fixed inset-0 m-0 max-w-none max-h-none w-full h-dvh border-0 flex items-center justify-center p-4 sm:p-8 bg-transparent text-hearth-espresso backdrop:bg-hearth-espresso/85 backdrop:backdrop-blur-md"
          onClick={(event) => { if (event.target === event.currentTarget) setSelectedPhoto(null); }}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90dvh] bg-paper border border-hearth-espresso/20 overflow-y-auto overscroll-contain shadow-2xl flex flex-col md:flex-row"
            data-lenis-prevent
          >
            {/* Top Right Close Button */}
            <button
              type="button"
              autoFocus
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close"
              className="absolute top-4 right-4 z-20 w-12 h-12 bg-paper/90 text-hearth-espresso hover:bg-hearth-terracotta hover:text-paper flex items-center justify-center border border-hearth-espresso/20 shadow-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hearth-terracotta"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo View */}
            <div className="relative md:w-2/3 h-64 shrink-0 md:h-[75dvh] bg-sunbaked-sand">
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
                <span className="text-xs font-sans font-semibold text-hearth-terracotta tracking-widest uppercase block">
                  {selectedPhoto.eventDate}
                </span>
                <h3 id="gallery-photo-title" lang={locale === "ta" ? "ta" : "en"} className="text-2xl sm:text-3xl font-serif text-hearth-espresso leading-relaxed">
                  {locale === "ta" ? selectedPhoto.titleTa : selectedPhoto.titleEn}
                </h3>
                <p id="gallery-photo-caption" lang={locale === "ta" ? "ta" : "en"} className="text-base font-sans text-hearth-espresso/75 leading-relaxed">
                  {locale === "ta" ? selectedPhoto.captionTa : selectedPhoto.captionEn}
                </p>
                {selectedPhoto.crop && <p className="text-xs font-mono text-hearth-espresso/70">{selectedPhoto.crop.label}. Full source shown here.</p>}
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedPhoto.tags.map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full bg-sunbaked-sand text-xs font-sans text-hearth-espresso">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-hearth-espresso/10">
                <p className="text-xs font-sans text-hearth-espresso/75">
                  Columbus, Ohio · The Ohio State University
                </p>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
