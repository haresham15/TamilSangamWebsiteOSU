"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { GALLERY_ALBUMS } from "@/data/gallery";
import { CinemaLightbox, type LightboxPhoto } from "@/components/ui/CinemaLightbox";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { CulturalCard } from "@/components/ui/CulturalCard";
import { Eyebrow } from "@/components/muttram/Eyebrow";

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

  const activeAlbum = useMemo(() => {
    if (activeAlbumSlug === "all") return null;
    return GALLERY_ALBUMS.find((a) => a.slug === activeAlbumSlug) || null;
  }, [activeAlbumSlug]);

  // Formatted photos for CinemaLightbox
  const lightboxPhotos: LightboxPhoto[] = useMemo(() => {
    return photos.map((p, idx) => {
      const parentAlbum = GALLERY_ALBUMS.find((a) => a.photos.some((ph) => ph.id === p.id));
      return {
        id: p.id,
        src: p.imageUrl,
        titleEn: p.titleEn,
        titleTa: p.titleTa,
        captionEn: p.captionEn,
        captionTa: p.captionTa,
        date: p.eventDate,
        plateNumber: String(idx + 1).padStart(2, "0"),
        googlePhotosUrl: parentAlbum?.googlePhotosUrl || (activeAlbumSlug !== "all" ? activeAlbum?.googlePhotosUrl : undefined),
      };
    });
  }, [photos, activeAlbum, activeAlbumSlug]);

  const handleScroll = (direction: "left" | "right") => {
    playClick();
    if (!scrollTrackRef.current) return;
    const offset = direction === "left" ? -380 : 380;
    scrollTrackRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const pillBase =
    "inline-flex min-h-12 shrink-0 cursor-pointer items-center rounded-full px-4 font-sans text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark";
  const pillActive = "bg-brand-teal-dark font-semibold text-ink-on-teal";
  const pillIdle = "border border-border-zari-muted text-ink-sand hover:border-accent-zari hover:text-ink-alabaster";
  const navButton =
    "inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-border-zari-muted text-ink-alabaster transition-colors hover:border-brand-teal-dark hover:text-brand-teal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark";

  return (
    <div className="w-full text-left">
      {/* Header & carousel controls */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-3">
          <Eyebrow tone="dark" tamil="நிழற்படத் தொகுப்பு">
            Living photo chronicle
          </Eyebrow>
          <h2
            id="editorial-photo-carousel-heading"
            className="font-serif text-3xl font-normal leading-[1.12] tracking-tight text-ink-alabaster sm:text-5xl"
          >
            Memories on the Banks of the Olentangy
          </h2>
          <p className="max-w-xl font-sans text-base leading-relaxed text-ink-sand">
            Candid captures from our welcome picnics, murder mystery game nights, student jam circles, and joint spring carnivals.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start md:self-end">
          <button type="button" onClick={() => handleScroll("left")} aria-label="Scroll photos left" className={navButton}>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => handleScroll("right")} aria-label="Scroll photos right" className={navButton}>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Album filter */}
      <div role="group" aria-label="Filter photos by album" className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
        <button
          type="button"
          aria-pressed={activeAlbumSlug === "all"}
          onClick={() => {
            playClick();
            setActiveAlbumSlug("all");
          }}
          className={`${pillBase} ${activeAlbumSlug === "all" ? pillActive : pillIdle}`}
        >
          All memories ({GALLERY_ALBUMS.reduce((acc, a) => acc + a.photos.length, 0)})
        </button>
        {GALLERY_ALBUMS.map((album) => {
          const isSelected = activeAlbumSlug === album.slug;
          return (
            <button
              key={album.slug}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                playClick();
                setActiveAlbumSlug(album.slug);
              }}
              className={`${pillBase} ${isSelected ? pillActive : pillIdle}`}
            >
              {album.titleEn.replace(/^TS\s*/, "")}
            </button>
          );
        })}
      </div>

      {/* Album context (single album filtered): unboxed, zari rule */}
      {activeAlbum && (
        <div className="mt-6 flex flex-col justify-between gap-3 border-l-2 border-accent-zari pl-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-accent-zari">
              {activeAlbum.eventDate} · {activeAlbum.location}
            </p>
            <p
              lang={locale === "ta" ? "ta" : "en"}
              className={`mt-1 max-w-2xl text-sm text-ink-sand ${locale === "ta" ? "font-tamil leading-[1.6]" : "font-sans leading-relaxed"}`}
            >
              {locale === "ta" ? activeAlbum.descriptionTa : activeAlbum.descriptionEn}
            </p>
          </div>
          <Link
            href={`/events/${activeAlbum.eventSlug || activeAlbum.slug}#photo-vault`}
            onClick={playClick}
            className="inline-flex min-h-12 shrink-0 items-center gap-1.5 font-sans text-sm font-semibold text-brand-teal-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
          >
            View event dossier
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Horizontal photo track */}
      <div
        ref={scrollTrackRef}
        role="region"
        tabIndex={0}
        aria-label="Scrollable photo collection. Use left and right arrow keys to explore."
        className="mt-8 overflow-x-auto scroll-smooth rounded-2xl pb-4 pt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
        style={{ scrollbarWidth: "none" }}
      >
        <ul className="flex snap-x snap-mandatory gap-5">
          {photos.map((photo, index) => (
            <CulturalCard
              key={photo.id || index}
              as="li"
              variant="dark"
              className="group w-[280px] flex-none snap-start focus-within:border-brand-teal-dark sm:w-[340px] md:w-[380px]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-card-dark">
                <Image
                  src={photo.imageUrl}
                  alt={photo.titleEn}
                  fill
                  sizes="(max-width: 640px) 280px, (max-width: 768px) 340px, 380px"
                  loading="lazy"
                  decoding="async"
                  className="object-cover transition-all duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <div className="space-y-1 p-4">
                <div className="flex items-center justify-between font-sans text-xs text-ink-sand">
                  <span>{photo.eventDate}</span>
                  <span className="font-semibold uppercase tracking-[0.14em] text-brand-lavender">
                    Plate {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3
                  lang={locale === "ta" ? "ta" : "en"}
                  className={`truncate text-base font-normal text-ink-alabaster transition-colors group-hover:text-accent-zari ${locale === "ta" ? "font-tamil leading-[1.6]" : "font-serif"}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setLightboxIndex(index);
                    }}
                    className="cursor-pointer text-left after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-teal-dark"
                  >
                    <span className="sr-only">View enlarged photo: </span>
                    {locale === "ta" ? photo.titleTa : photo.titleEn}
                  </button>
                </h3>
                <p
                  lang={locale === "ta" ? "ta" : "en"}
                  className={`line-clamp-2 text-xs text-ink-sand ${locale === "ta" ? "font-tamil leading-[1.6]" : "font-sans leading-relaxed"}`}
                >
                  {locale === "ta" ? photo.captionTa : photo.captionEn}
                </p>
              </div>
            </CulturalCard>
          ))}
        </ul>
      </div>

      {/* Accessible cinema lightbox */}
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
