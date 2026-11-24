"use client";

import React, { useState, useEffect, useCallback, useId, useMemo } from "react";
import dynamic from "next/dynamic";
import { FadeImage } from "@/components/ui/FadeImage";
import { GALLERY_ALBUMS, PhotoItem } from "@/data/gallery";
import { GlyphMosaicImage } from "@/components/ui/GlyphMosaicImage";
import { CulturalSection } from "@/components/ui/CulturalSection";
import { DialogShell } from "@/components/ui/DialogShell";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { ChevronLeft, ChevronRight, Maximize2, Shuffle, Grid3X3 } from "lucide-react";

const ParallaxScatter = dynamic(
  () => import("./ParallaxScatter").then((m) => m.ParallaxScatter),
  {
    ssr: false,
    loading: () => <div className="min-h-[480px] rounded-2xl bg-[#140C20]/20" aria-hidden="true" />,
  }
);

interface EventPhotoVaultProps {
  eventSlug: string;
  eventTitle: string;
  scatterPhotos?: string[];
  /** Light band the archive sits on; alternate with the band above it. */
  surface?: "ivory" | "sandstone";
}

// White print matte for photographs on light bands (purple-tinted shadow, rule C4).
const PRINT_MATTE =
  "rounded-[1.25rem] border border-border-warm bg-surface-card-light p-2 sm:p-2.5 shadow-[0_10px_30px_rgba(91,44,134,0.09)]";

// ParallaxScatter is a shared events file this route does not own; these descendant
// overrides give its naked prints a white matte and a readable caption on light bands.
const SCATTER_PRINT_OVERRIDES =
  "[&_figure>div]:border-[6px] sm:[&_figure>div]:border-[10px] [&_figure>div]:border-surface-card-light [&_figure>div]:shadow-[0_10px_30px_rgba(91,44,134,0.12)] [&_figcaption]:text-ink-umber [&_figcaption_span]:text-brand-teal";

/**
 * The event dossier photo archive: a curated print story (or a shuffled scatter) on a
 * light band, with a DialogShell media lightbox. The Google Photos link lives in VaultCta.
 */
export function EventPhotoVault({
  eventSlug,
  eventTitle,
  scatterPhotos = [],
  surface = "sandstone",
}: EventPhotoVaultProps) {
  const { locale } = useLocale();
  const { playClick, playCardSlide } = useAudio();
  const headingId = useId();
  const isTa = locale === "ta";
  const taText = isTa ? "font-tamil leading-[1.6]" : "";

  const album = useMemo(
    () => GALLERY_ALBUMS.find((a) => a.eventSlug === eventSlug || a.slug === eventSlug),
    [eventSlug]
  );

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [viewMode, setViewMode] = useState<"curated" | "scatter">("curated");
  const [randomizedScatter, setRandomizedScatter] = useState<string[]>(scatterPhotos);
  const [shuffleCount, setShuffleCount] = useState(0);

  const photos = useMemo(() => album?.photos ?? [], [album]);
  const heroPhoto = photos[0];
  const supportingPhotos = photos.slice(1);

  const currentPhotoIndex = selectedPhoto ? photos.findIndex((p) => p.id === selectedPhoto.id) : -1;

  const safeClick = useCallback(() => {
    try {
      playClick();
    } catch {
      // Audio optional
    }
  }, [playClick]);

  const handlePrevPhoto = useCallback(() => {
    if (photos.length === 0) return;
    safeClick();
    setSelectedPhoto(currentPhotoIndex > 0 ? photos[currentPhotoIndex - 1] : photos[photos.length - 1]);
  }, [photos, currentPhotoIndex, safeClick]);

  const handleNextPhoto = useCallback(() => {
    if (photos.length === 0) return;
    safeClick();
    setSelectedPhoto(currentPhotoIndex < photos.length - 1 ? photos[currentPhotoIndex + 1] : photos[0]);
  }, [photos, currentPhotoIndex, safeClick]);

  const handleCloseLightbox = useCallback(() => {
    safeClick();
    setSelectedPhoto(null);
  }, [safeClick]);

  const openPhoto = (photo: PhotoItem) => {
    safeClick();
    setSelectedPhoto(photo);
  };

  // Arrow keys step through the lightbox (DialogShell owns Escape, focus trap and scroll lock).
  useEffect(() => {
    if (!selectedPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevPhoto();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextPhoto();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, handlePrevPhoto, handleNextPhoto]);

  const shuffleScatter = () => {
    try {
      playClick();
      playCardSlide();
    } catch {
      // Audio optional
    }
    setViewMode("scatter");
    setRandomizedScatter((current) => {
      const next = [...current];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
    setShuffleCount((count) => count + 1);
  };

  const tabClass = (active: boolean) =>
    `inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full px-4 font-sans text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal ${
      active ? "bg-brand-purple text-ink-alabaster" : "text-ink-umber hover:bg-brand-purple-soft hover:text-brand-purple"
    }`;

  const navButton =
    "absolute top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border-zari-muted bg-bg-sangam-deep/85 text-ink-alabaster transition-colors hover:bg-brand-teal-dark hover:text-ink-on-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark";

  return (
    <CulturalSection id="photo-vault" variant={surface} aria-labelledby={headingId} className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
        {/* Header with bilingual title and view switchers */}
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-border-warm pb-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <Eyebrow tamil="ஆவணக் காப்பகம்">Campus photo vault</Eyebrow>
            <h2 id={headingId} className="flex flex-wrap items-baseline gap-x-3 font-serif text-3xl font-normal text-ink-earth sm:text-5xl">
              <span lang={isTa && album ? "ta" : undefined} className={isTa && album ? "font-tamil leading-[1.6]" : ""}>
                {album ? (isTa ? album.titleTa : album.titleEn) : "Photographic Archive"}
              </span>
              <span lang="ta" className="font-tamil text-xl font-normal leading-[1.6] text-brand-purple sm:text-2xl">
                தொகுப்பு
              </span>
              <span className="font-sans text-sm font-semibold text-brand-purple">
                ({album ? photos.length : randomizedScatter.length})
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {album && scatterPhotos.length > 0 && (
              <div
                role="group"
                aria-label="Archive view"
                className="inline-flex rounded-full border border-border-warm bg-surface-card-light p-1"
              >
                <button
                  type="button"
                  aria-pressed={viewMode === "curated"}
                  onClick={() => {
                    safeClick();
                    setViewMode("curated");
                  }}
                  className={tabClass(viewMode === "curated")}
                >
                  <Grid3X3 className="h-4 w-4" aria-hidden="true" />
                  Curated story
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === "scatter"}
                  onClick={() => {
                    safeClick();
                    setViewMode("scatter");
                  }}
                  className={tabClass(viewMode === "scatter")}
                >
                  <Shuffle className="h-4 w-4" aria-hidden="true" />
                  Scatter view
                </button>
              </div>
            )}

            {randomizedScatter.length > 1 && (
              <MuttramButton onClick={shuffleScatter} icon={<Shuffle className="h-4 w-4" aria-hidden="true" />}>
                Shuffle archive
              </MuttramButton>
            )}
          </div>
        </div>

        <p role="status" className="sr-only">
          {shuffleCount > 0 ? `Archive reshuffled. ${randomizedScatter.length} selected samples.` : ""}
        </p>

        {/* View 1: curated print story */}
        {viewMode === "curated" && album && photos.length > 0 && (
          <div className="space-y-8">
            {heroPhoto && (
              <figure data-dossier-photo={heroPhoto.imageUrl} className={`group relative ${PRINT_MATTE}`}>
                <GlyphMosaicImage src={heroPhoto.imageUrl} alt={heroPhoto.titleEn} aspectRatio="aspect-[16/9] sm:aspect-[21/9]" />
                <figcaption className="flex flex-col gap-1 px-2 pb-2 pt-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:px-3">
                  <div className="min-w-0">
                    <Eyebrow as="p">Featured archive</Eyebrow>
                    <p lang={isTa ? "ta" : undefined} className={`mt-1 font-serif text-xl text-ink-earth sm:text-2xl ${taText}`}>
                      {isTa ? heroPhoto.titleTa : heroPhoto.titleEn}
                    </p>
                  </div>
                  <p lang={isTa ? "ta" : undefined} className={`max-w-xl font-sans text-sm text-ink-umber ${isTa ? taText : "leading-relaxed"}`}>
                    {isTa ? heroPhoto.captionTa : heroPhoto.captionEn}
                  </p>
                </figcaption>
                <button
                  type="button"
                  onClick={() => openPhoto(heroPhoto)}
                  aria-label={`View enlarged photo: ${heroPhoto.titleEn}`}
                  className="absolute inset-0 cursor-pointer rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2"
                />
              </figure>
            )}

            {supportingPhotos.length > 0 && (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {supportingPhotos.map((photo, i) => (
                  <li key={photo.id}>
                    <figure
                      data-dossier-photo={photo.imageUrl}
                      className={`group relative h-full transition-transform duration-200 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${PRINT_MATTE} ${
                        i % 2 ? "lg:rotate-[0.6deg]" : "lg:-rotate-[0.6deg]"
                      }`}
                    >
                      <GlyphMosaicImage src={photo.imageUrl} alt={photo.titleEn} aspectRatio="aspect-[4/3]" />
                      <figcaption className="px-1.5 pb-1.5 pt-3">
                        <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-purple">
                          {photo.eventDate}
                        </p>
                        <p lang={isTa ? "ta" : undefined} className={`mt-1 truncate font-serif text-base text-ink-earth ${taText}`}>
                          {isTa ? photo.titleTa : photo.titleEn}
                        </p>
                        <p lang={isTa ? "ta" : undefined} className={`mt-0.5 line-clamp-1 font-sans text-xs text-ink-umber ${taText}`}>
                          {isTa ? photo.captionTa : photo.captionEn}
                        </p>
                      </figcaption>
                      <button
                        type="button"
                        onClick={() => openPhoto(photo)}
                        aria-label={`View enlarged photo: ${photo.titleEn}`}
                        className="absolute inset-0 cursor-pointer rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2"
                      />
                    </figure>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* View 2: scatter, or fallback when no curated album exists */}
        {(viewMode === "scatter" || !album || photos.length === 0) && (
          <div className={SCATTER_PRINT_OVERRIDES}>
            {randomizedScatter.length > 0 ? (
              <ParallaxScatter photos={randomizedScatter} eventTitle={eventTitle} googlePhotosUrl={album?.googlePhotosUrl} />
            ) : (
              <p className="py-24 font-serif text-xl italic text-ink-umber">
                Photographic prints being cataloged in the local vault.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Media lightbox */}
      <DialogShell
        open={Boolean(selectedPhoto)}
        onClose={handleCloseLightbox}
        tone="media"
        size="full"
        eyebrow={selectedPhoto ? `Photo ${currentPhotoIndex + 1} of ${photos.length}` : undefined}
        title={
          selectedPhoto ? (
            <span lang={isTa ? "ta" : undefined} className={taText}>
              {isTa ? selectedPhoto.titleTa : selectedPhoto.titleEn}
            </span>
          ) : undefined
        }
        closeLabel="Close photo preview"
        bodyClassName="p-4 sm:p-6"
      >
        {selectedPhoto && (
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="relative h-[52dvh] overflow-hidden rounded-2xl border border-border-zari-muted bg-bg-sangam-deep sm:h-[64dvh] lg:col-span-8">
              <FadeImage
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.titleEn}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1000px"
                priority
                decoding="async"
              />
              {photos.length > 1 && (
                <>
                  <button type="button" onClick={handlePrevPhoto} aria-label="Previous photo" className={`left-3 ${navButton}`}>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={handleNextPhoto} aria-label="Next photo" className={`right-3 ${navButton}`}>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            <div className="space-y-4 lg:col-span-4">
              <p lang={isTa ? "ta" : undefined} className={`font-sans text-sm text-ink-sand ${isTa ? taText : "leading-relaxed"}`}>
                {isTa ? selectedPhoto.captionTa : selectedPhoto.captionEn}
              </p>

              <dl className="space-y-1 border-t border-border-zari-muted pt-3 font-sans text-xs text-ink-sand">
                <div className="flex gap-1.5">
                  <dt>Photographer:</dt>
                  <dd>{selectedPhoto.photographer}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt>Event date:</dt>
                  <dd>{selectedPhoto.eventDate}</dd>
                </div>
              </dl>

              {selectedPhoto.tags.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label="Photo tags">
                  {selectedPhoto.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-border-zari-muted px-2.5 py-1 font-sans text-xs text-brand-lavender"
                    >
                      #{tag}
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-t border-border-zari-muted pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={selectedPhoto.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-1.5 font-sans text-sm font-semibold text-brand-teal-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
                >
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                  Full resolution ↗
                </a>
                {album?.googlePhotosUrl && (
                  <a
                    href={album.googlePhotosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center gap-1.5 font-sans text-sm font-semibold text-accent-zari hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-zari"
                  >
                    Google Photos Vault ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogShell>
    </CulturalSection>
  );
}
