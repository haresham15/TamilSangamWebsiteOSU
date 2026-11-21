"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ChevronDown, Calendar, MapPin, Sparkles, Camera } from "lucide-react";
import { EVENTS, type SangamEvent } from "@/data/events";
import { GALLERY_ALBUMS } from "@/data/gallery";

export interface PhotoVaultItem {
  slug: string;
  titleEn: string;
  titleTa: string;
  date: string;
  timestamp: number;
  academicYear: string;
  semester: string;
  eventType: string;
  location: string;
  googlePhotosUrl: string;
  detailHref: string;
  photos: string[];
  coverImage: string;
  tags: string[];
}

/**
 * Derives academic year from event date or explicit field (e.g. "2026–2027").
 */
function deriveAcademicYear(dateStr: string, explicitYear?: string): string {
  if (explicitYear) {
    return explicitYear.replace("-", "–");
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Archive";
  const year = d.getFullYear();
  const month = d.getMonth();
  // Aug (7) - Dec (11) = YYYY–(YYYY+1); Jan (0) - Jul (6) = (YYYY-1)–YYYY
  return month >= 7 ? `${year}–${year + 1}` : `${year - 1}–${year}`;
}

/**
 * Derives semester string (e.g. "Fall 2026", "Spring 2026").
 */
function deriveSemester(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Campus Gathering";
  const month = d.getMonth();
  const year = d.getFullYear();
  if (month >= 7) return `Fall ${year}`;
  if (month <= 4) return `Spring ${year}`;
  return `Summer ${year}`;
}

/**
 * Derives a short vintage stamp date (e.g. "OCT '26").
 */
function deriveShortStampDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "ARCHIVE";
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const m = monthNames[d.getMonth()] || "ROLL";
  const y = String(d.getFullYear()).slice(-2);
  return `${m} '${y}`;
}

/**
 * Finds up to 6 photo thumbnail paths for an event from GALLERY_ALBUMS and event fields.
 */
function getEventThumbnails(event: SangamEvent): string[] {
  const matchingAlbum = GALLERY_ALBUMS.find(
    (a) => a.eventSlug === event.slug || a.slug === event.slug || (event.albumSlug && a.slug === event.albumSlug)
  );

  const albumPhotos = matchingAlbum?.photos?.map((p) => p.imageUrl) || [];
  const uniquePool = Array.from(
    new Set([
      ...albumPhotos,
      event.posterImage,
      event.hoverImage,
    ].filter(Boolean))
  );

  return uniquePool;
}

/**
 * Extracts and sorts all official vaults from EVENTS (newest-first).
 */
export function getAllPhotoVaults(): PhotoVaultItem[] {
  const vaultsWithUrl = EVENTS.filter((e) => Boolean(e.googlePhotosUrl));

  const items: PhotoVaultItem[] = vaultsWithUrl.map((event) => {
    const photos = getEventThumbnails(event);
    const coverImage = photos[0] || event.posterImage || "/emblem.svg";
    const timestamp = new Date(event.date).getTime() || 0;
    const academicYear = deriveAcademicYear(event.date, event.academicYear);
    const semester = deriveSemester(event.date);

    return {
      slug: event.slug,
      titleEn: event.titleEn,
      titleTa: event.titleTa,
      date: event.date,
      timestamp,
      academicYear,
      semester,
      eventType: event.statusBadgeEn || "Official Gathering",
      location: event.location,
      googlePhotosUrl: event.googlePhotosUrl!,
      detailHref: `/events/${event.slug}`,
      photos,
      coverImage,
      tags: event.tags || [],
    };
  });

  return items.sort((a, b) => b.timestamp - a.timestamp);
}

export interface PhotoVaultArchiveProps {
  className?: string;
  id?: string;
}

export function PhotoVaultArchive({ className = "", id = "google-photos-vaults" }: PhotoVaultArchiveProps) {
  // 100% Data-Driven & Zero Hardcoded Counts
  const allVaults = useMemo(() => getAllPhotoVaults(), []);

  // Top 3 for Tier 1 "Latest Drops"
  const latestDrops = useMemo(() => allVaults.slice(0, 3), [allVaults]);

  // Unique Academic Years for filtering pills
  const academicYears = useMemo(() => {
    const years = Array.from(new Set(allVaults.map((v) => v.academicYear)));
    return years.sort().reverse();
  }, [allVaults]);

  // State for Ledger Filtering & Search
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAllVaults, setShowAllVaults] = useState<boolean>(false);

  // Filtered Vaults for Tier 2 Ledger
  const filteredVaults = useMemo(() => {
    let result = allVaults;

    if (selectedYear !== "all") {
      result = result.filter((v) => v.academicYear === selectedYear);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.titleEn.toLowerCase().includes(q) ||
          v.titleTa.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q) ||
          v.eventType.toLowerCase().includes(q) ||
          v.semester.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allVaults, selectedYear, searchQuery]);

  // Grouped by Academic Year for Ledger display
  const groupedVaults = useMemo(() => {
    const groups: Record<string, PhotoVaultItem[]> = {};
    for (const v of filteredVaults) {
      if (!groups[v.academicYear]) {
        groups[v.academicYear] = [];
      }
      groups[v.academicYear].push(v);
    }
    return Object.entries(groups).sort(([yearA], [yearB]) => yearB.localeCompare(yearA));
  }, [filteredVaults]);

  // Top 3 slug lookup for "Featured" badging in Tier 2
  const top3Slugs = useMemo(() => new Set(latestDrops.map((d) => d.slug)), [latestDrops]);

  const MAX_INITIAL_ROWS = 12;
  const isCapped = !searchQuery && selectedYear === "all" && !showAllVaults && filteredVaults.length > MAX_INITIAL_ROWS;

  return (
    <section
      id={id}
      aria-labelledby="google-photos-vaults-heading"
      className={`relative w-full border-t border-[#D4A36A]/25 pt-16 sm:pt-24 ${className}`.trim()}
    >
      {/* Ambient background glow to ground the archive section */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(212,163,106,0.12),transparent_75%)] opacity-80"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-10 top-36 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(43,181,168,0.06),transparent_70%)] blur-2xl"
        aria-hidden="true"
      />

      {/* =========================================================================
          SECTION HEADER
          ========================================================================= */}
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3.5">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#D4A36A]/35 bg-[#25173B]/90 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-[#D4A36A] shadow-sm backdrop-blur-md">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#D4A36A] animate-pulse" aria-hidden="true" />
            <span>GOOGLE PHOTOS VAULTS</span>
            <span className="text-[#D4A36A]/40">❖</span>
            <span lang="ta" className="font-tamil font-normal tracking-normal text-[#D4A36A]">
              புகைப்படப் பெட்டகம்
            </span>
          </div>

          <h3
            id="google-photos-vaults-heading"
            className="flex flex-wrap items-center gap-3.5 font-serif text-3xl font-normal tracking-tight text-[#FAF5ED] sm:text-4xl lg:text-5xl"
          >
            <span>The Sangam Photo Vaults</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2BB5A8]/50 bg-[#2BB5A8]/15 px-3 py-1 font-mono text-xs font-semibold tracking-wider text-[#2BB5A8] shadow-[0_0_20px_rgba(43,181,168,0.2)]">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              <span>{allVaults.length} Official Albums</span>
            </span>
          </h3>
        </div>

        <p className="max-w-md font-sans text-sm leading-relaxed text-[#C4B7D7] sm:text-base">
          Full-resolution original albums from our camera rolls. Browse, share, or download every photo from our campus
          gatherings and cultural showcases.
        </p>
      </div>

      {/* =========================================================================
          TIER 1: "LATEST DROPS" — 3 TACTILE PHOTO-STUDIO ENVELOPES
          ========================================================================= */}
      <div className="relative z-10 mt-14">
        {/* Tier 1 Header */}
        <div className="flex items-center justify-between border-b border-[#D4A36A]/20 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#D4A36A]" aria-hidden="true" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-[#D4A36A]">
              TIER 1 · LATEST STUDIO DROPS
            </h4>
            <span className="hidden rounded bg-[#D4A36A]/10 px-2 py-0.5 font-mono text-[10px] text-[#D4A36A]/85 sm:inline-block">
              RECENT PRINTS
            </span>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#C4B7D7]/75">
            Top 3 Camera Rolls
          </span>
        </div>

        {/* 3-Column Responsive Envelope Grid with Generous Overhead Clearance */}
        <div className="grid grid-cols-1 gap-12 pt-12 sm:pt-16 md:grid-cols-3 md:gap-6 lg:gap-8">
          {latestDrops.map((vault, idx) => {
            const hasPhotos = vault.photos.length > 0;
            const peekingPhotos = hasPhotos ? vault.photos.slice(0, 3) : [vault.coverImage];
            const isLatest = idx === 0;
            const stampDate = deriveShortStampDate(vault.date);

            return (
              <article
                key={vault.slug}
                className="group relative flex flex-col justify-between pt-20 sm:pt-24 overflow-visible"
              >
                {/* -------------------------------------------------------------
                    PEEKING POLAROID PHOTO STACK (Tucked behind front sleeve)
                    ------------------------------------------------------------- */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 flex h-40 items-center justify-center overflow-visible"
                  aria-hidden="true"
                >
                  {/* Photo 1: Left tilted print with classic bottom chin */}
                  {peekingPhotos[0] && (
                    <div
                      className="absolute h-24 w-32 -translate-x-8 translate-y-3 -rotate-6 rounded-sm border border-[#FAF6F0] bg-[#FAF6F0] p-1.5 pb-4 shadow-[0_10px_24px_rgba(0,0,0,0.6)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-12 group-hover:-translate-y-9 group-hover:-rotate-12 group-hover:shadow-[0_20px_36px_rgba(0,0,0,0.75)] motion-reduce:transform-none sm:h-26 sm:w-34 md:h-22 md:w-28 lg:h-24 lg:w-32"
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-[1px] bg-[#140C20]">
                        <Image
                          src={peekingPhotos[0]}
                          alt={`${vault.titleEn} — OSU Tamil Sangam photo archive preview`}
                          fill
                          sizes="(max-width: 768px) 140px, 160px"
                          className="object-cover"
                          loading="lazy"
                        />
                        {/* Subtle glossy photo glare overlay */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.09] to-transparent" />
                      </div>
                      {/* Vintage pencil stamp on the polaroid chin */}
                      <div className="mt-1 flex items-center justify-between font-mono text-[7px] text-[#6B5A4B]/90 tracking-widest px-0.5">
                        <span>01/03</span>
                        <span>{stampDate}</span>
                      </div>
                    </div>
                  )}

                  {/* Photo 2: Center elevated print */}
                  {peekingPhotos[1] && (
                    <div
                      className="absolute z-10 h-24 w-32 translate-y-1 rotate-0 rounded-sm border border-[#FAF6F0] bg-[#FAF6F0] p-1.5 pb-4 shadow-[0_12px_28px_rgba(0,0,0,0.7)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-12 group-hover:scale-105 group-hover:shadow-[0_24px_44px_rgba(0,0,0,0.85)] motion-reduce:transform-none sm:h-26 sm:w-34 md:h-22 md:w-28 lg:h-24 lg:w-32"
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-[1px] bg-[#140C20]">
                        <Image
                          src={peekingPhotos[1]}
                          alt={`${vault.titleEn} — OSU Tamil Sangam photo archive preview`}
                          fill
                          sizes="(max-width: 768px) 140px, 160px"
                          className="object-cover"
                          loading="lazy"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.09] to-transparent" />
                      </div>
                      <div className="mt-1 flex items-center justify-between font-mono text-[7px] text-[#6B5A4B]/90 tracking-widest px-0.5">
                        <span>02/03</span>
                        <span>TS·PROOF</span>
                      </div>
                    </div>
                  )}

                  {/* Photo 3: Right tilted print */}
                  {peekingPhotos[2] && (
                    <div
                      className="absolute h-24 w-32 translate-x-8 translate-y-3 rotate-6 rounded-sm border border-[#FAF6F0] bg-[#FAF6F0] p-1.5 pb-4 shadow-[0_10px_24px_rgba(0,0,0,0.6)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-12 group-hover:-translate-y-9 group-hover:rotate-12 group-hover:shadow-[0_20px_36px_rgba(0,0,0,0.75)] motion-reduce:transform-none sm:h-26 sm:w-34 md:h-22 md:w-28 lg:h-24 lg:w-32"
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-[1px] bg-[#140C20]">
                        <Image
                          src={peekingPhotos[2]}
                          alt={`${vault.titleEn} — OSU Tamil Sangam photo archive preview`}
                          fill
                          sizes="(max-width: 768px) 140px, 160px"
                          className="object-cover"
                          loading="lazy"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.09] to-transparent" />
                      </div>
                      <div className="mt-1 flex items-center justify-between font-mono text-[7px] text-[#6B5A4B]/90 tracking-widest px-0.5">
                        <span>03/03</span>
                        <span>{vault.academicYear.slice(-4)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* -------------------------------------------------------------
                    PACKET BODY (Front velvet sleeve with die-cut thumb notch)
                    ------------------------------------------------------------- */}
                <div className="relative z-20 flex flex-1 flex-col justify-between rounded-2xl border border-[#D4A36A]/35 bg-[#25173B] p-6 shadow-[0_14px_45px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-[#D4A36A]/20 transition-all duration-300 group-hover:border-[#D4A36A]/75 group-hover:shadow-[0_20px_55px_rgba(212,163,106,0.18)] sm:p-7 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] before:from-[#D4A36A]/[0.12] before:via-transparent before:to-transparent">
                  {/* Subtle curved thumb-notch cutout on top border revealing inner pocket darkness */}
                  <div
                    className="pointer-events-none absolute -top-3.5 left-1/2 -translate-x-1/2 h-4 w-20"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 80 16" className="h-full w-full fill-[#160D26] text-[#D4A36A]/45" preserveAspectRatio="none">
                      <path d="M0,0 Q40,16 80,0" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>

                  {/* Corner Brass Accent Flourishes (Studio Packet Aesthetics) */}
                  <div className="pointer-events-none absolute left-3 top-3 h-2.5 w-2.5 border-l border-t border-[#D4A36A]/45" aria-hidden="true" />
                  <div className="pointer-events-none absolute right-3 top-3 h-2.5 w-2.5 border-r border-t border-[#D4A36A]/45" aria-hidden="true" />
                  <div className="pointer-events-none absolute bottom-3 left-3 h-2.5 w-2.5 border-b border-l border-[#D4A36A]/45" aria-hidden="true" />
                  <div className="pointer-events-none absolute bottom-3 right-3 h-2.5 w-2.5 border-b border-r border-[#D4A36A]/45" aria-hidden="true" />

                  {/* Packet Header & Serial Stamp */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-serif text-3xl font-medium leading-none text-[#FAF5ED] transition-colors group-hover:text-[#D4A36A]">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        {isLatest && (
                          <span className="ml-3 inline-flex items-center gap-1 rounded-sm border border-[#D4A36A] bg-[#D4A36A]/20 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase text-[#D4A36A] shadow-[0_0_12px_rgba(212,163,106,0.3)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#D4A36A] animate-pulse" />
                            <span>LATEST</span>
                          </span>
                        )}
                      </div>

                      {/* Studio Stamp Seal */}
                      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[#D4A36A]/80">
                        <Camera className="h-3 w-3 text-[#D4A36A]/70" aria-hidden="true" />
                        <span>TS-0{idx + 1}</span>
                      </div>
                    </div>

                    {/* Event Titles */}
                    <h4 className="mt-4 font-serif text-xl font-medium leading-tight text-[#FAF5ED] transition-colors group-hover:text-[#D4A36A] sm:text-2xl">
                      {vault.titleEn}
                    </h4>
                    <p
                      lang="ta"
                      className="mt-1.5 font-tamil text-sm leading-[1.6] text-[#D4A36A]"
                      style={{ letterSpacing: 0 }}
                    >
                      {vault.titleTa}
                    </p>
                  </div>

                  {/* Packet Bottom Details */}
                  <div className="mt-7">
                    {/* Thin tapered bronze hairline */}
                    <div
                      className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-[#D4A36A]/35 to-transparent"
                      aria-hidden="true"
                    />

                    <div className="flex items-end justify-between gap-3">
                      <div className="space-y-1 font-sans text-xs text-[#C4B7D7]">
                        <p className="flex items-center gap-1.5 font-medium text-[#FAF5ED]/95">
                          <Calendar className="h-3.5 w-3.5 text-[#D4A36A]" aria-hidden="true" />
                          <span>{vault.semester} · {vault.eventType}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-[#C4B7D7]/85">
                          <MapPin className="h-3.5 w-3.5 text-[#D4A36A]/70 shrink-0" aria-hidden="true" />
                          <span className="max-w-[140px] truncate sm:max-w-[180px]">{vault.location}</span>
                        </p>
                      </div>

                      <div className="flex flex-col items-end">
                        <a
                          href={vault.googlePhotosUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/btn inline-flex items-center gap-1.5 rounded-lg border border-[#2BB5A8]/50 bg-[#2BB5A8]/15 px-3.5 py-2 font-mono text-xs font-semibold text-[#2BB5A8] shadow-sm transition-all hover:border-[#2BB5A8] hover:bg-[#2BB5A8]/25 hover:text-[#A6F0CF]"
                        >
                          <span>Open Vault</span>
                          <span
                            aria-hidden="true"
                            className="transition-transform duration-200 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
                          >
                            ↗
                          </span>
                          <span className="sr-only"> (opens Google Photos album in new tab)</span>
                        </a>

                        <Link
                          href={vault.detailHref}
                          className="mt-2 text-[11px] font-sans text-[#C4B7D7]/80 transition-colors hover:text-[#FAF5ED]"
                        >
                          Dossier →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          LOTUS / KOLAM BRONZE DIVIDER (Separating Tier 1 and Tier 2)
          ========================================================================= */}
      <div className="my-16 flex items-center justify-center gap-4 sm:my-20" aria-hidden="true">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4A36A]/25 to-[#D4A36A]/50" />
        <div className="flex items-center gap-2.5 rounded-full border border-[#D4A36A]/35 bg-[#25173B]/95 px-4 py-1.5 font-mono text-[11px] tracking-widest text-[#D4A36A] uppercase shadow-sm">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2C12 2 14.5 7 17.5 8C20.5 9 22 12 22 12C22 12 17.5 13 16 16.5C14.5 20 12 22 12 22C12 22 9.5 20 8 16.5C6.5 13 2 12 2 12C2 12 3.5 9 6.5 8C9.5 7 12 2 12 2Z" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
          <span>CHRONOLOGICAL YEAR LEDGER ❖ ஆண்டுக் குறிப்பேடு</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#D4A36A]/25 to-[#D4A36A]/50" />
      </div>

      {/* =========================================================================
          TIER 2: "THE COMPLETE SANGAM VAULT" — 35MM EDITORIAL YEAR LEDGER
          ========================================================================= */}
      <div className="relative z-10 space-y-7">
        {/* Ledger Header & Interactive Search Deck */}
        <div className="rounded-2xl border border-[#D4A36A]/25 bg-[#25173B]/70 p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h4 className="font-serif text-2xl font-normal text-[#FAF5ED] sm:text-3xl">
                The Complete Sangam Vault
              </h4>
              <p className="font-sans text-xs text-[#C4B7D7] sm:text-sm">
                Chronological 35mm year ledger. Search or filter through all historical gathering rolls.
              </p>
            </div>

            {/* Quick Search Input */}
            <div className="relative min-w-[260px] sm:min-w-[340px]">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D4A36A]/75"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by event, venue, or collab..."
                aria-label="Filter photo vaults"
                className="w-full rounded-xl border border-[#D4A36A]/30 bg-[#140C20]/90 py-2.5 pl-10 pr-9 text-xs text-[#FAF5ED] placeholder:text-[#C4B7D7]/55 focus:border-[#2BB5A8] focus:outline-none focus:ring-1 focus:ring-[#2BB5A8] sm:text-sm transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search input"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#C4B7D7]/70 hover:text-[#FAF5ED]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Academic Year Filter Pills & Ledger Counter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#D4A36A]/15 pt-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedYear("all")}
                className={`min-h-9 shrink-0 rounded-full px-4 font-mono text-xs transition-all ${
                  selectedYear === "all"
                    ? "border border-[#2BB5A8] bg-[#2BB5A8] font-bold text-[#0D0814] shadow-[0_2px_12px_rgba(43,181,168,0.3)]"
                    : "border border-[#D4A36A]/25 bg-[#140C20]/80 text-[#C4B7D7] hover:border-[#D4A36A]/60 hover:text-[#FAF5ED]"
                }`}
              >
                All Vaults ({allVaults.length})
              </button>

              {academicYears.map((year) => {
                const countForYear = allVaults.filter((v) => v.academicYear === year).length;
                const isSelected = selectedYear === year;

                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectedYear(year)}
                    className={`min-h-9 shrink-0 rounded-full px-4 font-mono text-xs transition-all ${
                      isSelected
                        ? "border border-[#2BB5A8] bg-[#2BB5A8] font-bold text-[#0D0814] shadow-[0_2px_12px_rgba(43,181,168,0.3)]"
                        : "border border-[#D4A36A]/25 bg-[#140C20]/80 text-[#C4B7D7] hover:border-[#D4A36A]/60 hover:text-[#FAF5ED]"
                    }`}
                  >
                    {year} ({countForYear})
                  </button>
                );
              })}
            </div>

            <span className="font-mono text-[11px] uppercase tracking-wider text-[#D4A36A]/85 shrink-0">
              Showing {filteredVaults.length} of {allVaults.length} Rolls
            </span>
          </div>
        </div>

        {/* -------------------------------------------------------------
            GROUPED ACADEMIC YEAR LEDGER LIST
            ------------------------------------------------------------- */}
        {groupedVaults.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D4A36A]/30 bg-[#25173B]/30 py-14 px-4 text-center text-[#C4B7D7]">
            <p className="font-sans text-sm sm:text-base">
              No photo vaults match &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedYear("all");
              }}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg border border-[#2BB5A8]/40 bg-[#2BB5A8]/10 px-4 py-1.5 font-mono text-xs font-semibold text-[#2BB5A8] hover:bg-[#2BB5A8]/20 transition-all"
            >
              Clear search &amp; view all {allVaults.length} albums
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {groupedVaults.map(([year, yearVaults]) => (
              <div key={year} className="space-y-3">
                {/* Year Ledger Header Bar */}
                <div className="flex items-center justify-between border-b border-[#D4A36A]/25 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#D4A36A]" aria-hidden="true" />
                    <h5 className="font-mono text-xs font-bold uppercase tracking-widest text-[#D4A36A]">
                      {year} ACADEMIC YEAR
                    </h5>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#C4B7D7]/75">
                    {yearVaults.length} {yearVaults.length === 1 ? "Album" : "Albums"}
                  </span>
                </div>

                {/* Ledger Rows */}
                <ul className="divide-y divide-[#D4A36A]/15 rounded-2xl border border-[#D4A36A]/20 bg-[#25173B]/50 overflow-visible backdrop-blur-sm">
                  {yearVaults.map((vault, rowIdx) => {
                    const isTop3 = top3Slugs.has(vault.slug);
                    const previewPhotos = vault.photos.length > 0 ? vault.photos.slice(0, 3) : [vault.coverImage];

                    return (
                      <li
                        key={vault.slug}
                        className="group relative flex items-center justify-between px-3.5 py-4 transition-colors duration-200 hover:bg-[#2e1d48]/70 sm:px-5 sm:py-4.5 before:pointer-events-none before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r before:bg-[#2BB5A8] before:opacity-0 group-hover:before:opacity-100 before:transition-opacity"
                      >
                        {/* Col 1: Index + Polaroid Mini-Thumbnail (Mobile & Desktop) */}
                        <div className="flex shrink-0 items-center gap-3 sm:gap-3.5">
                          <span className="w-5 font-mono text-xs text-[#D4A36A]/75 font-semibold">
                            {String(rowIdx + 1).padStart(2, "0")}
                          </span>
                          <div className="relative h-9 w-12 shrink-0 -rotate-2 overflow-hidden rounded-[2px] border border-[#FAF6F0] bg-[#FAF6F0] p-0.5 pb-1.5 shadow-sm transition-transform duration-300 group-hover:rotate-0">
                            <div className="relative h-full w-full overflow-hidden rounded-[1px] bg-[#140C20]">
                              <Image
                                src={vault.coverImage}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Col 2: Title, Tamil Subtitle, and Optional Featured Badge */}
                        <div className="min-w-0 flex-1 pl-3 sm:pl-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <h6 className="font-serif text-base font-medium leading-snug text-[#FAF5ED] transition-colors group-hover:text-[#D4A36A] sm:text-lg">
                              {vault.titleEn}
                            </h6>
                            {isTop3 && (
                              <span className="rounded-sm border border-[#D4A36A]/40 bg-[#D4A36A]/15 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-[#D4A36A]">
                                Featured
                              </span>
                            )}
                          </div>
                          <p
                            lang="ta"
                            className="truncate font-tamil text-xs leading-[1.6] text-[#C4B7D7] sm:text-sm mt-0.5"
                            style={{ letterSpacing: 0 }}
                          >
                            {vault.titleTa}
                          </p>
                        </div>

                        {/* Col 3: Metadata (Semester, Event Type, Venue) */}
                        <div className="hidden shrink-0 flex-col pr-4 text-right font-sans text-xs text-[#9E8EB8] md:flex lg:pr-8 space-y-0.5">
                          <span className="font-medium text-[#FAF5ED]/85">
                            {vault.semester} · {vault.eventType}
                          </span>
                          <span className="max-w-[210px] truncate text-[#C4B7D7]/75">
                            {vault.location}
                          </span>
                        </div>

                        {/* Col 4: Action Buttons (Dossier + Open Album CTA) */}
                        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                          <Link
                            href={vault.detailHref}
                            className="hidden text-xs font-sans text-[#C4B7D7]/75 transition-colors hover:text-[#FAF5ED] sm:inline-block"
                          >
                            Dossier →
                          </Link>

                          <a
                            href={vault.googlePhotosUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/btn inline-flex items-center gap-1.5 rounded-lg border border-[#2BB5A8]/35 bg-[#2BB5A8]/15 px-3 py-1.5 font-mono text-xs font-semibold text-[#2BB5A8] shadow-sm transition-all hover:border-[#2BB5A8] hover:bg-[#2BB5A8]/25 hover:text-[#A6F0CF]"
                          >
                            <span>Open Album</span>
                            <span
                              aria-hidden="true"
                              className="transition-transform duration-200 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
                            >
                              ↗
                            </span>
                            <span className="sr-only"> (opens Google Photos in new tab)</span>
                          </a>
                        </div>

                        {/* -------------------------------------------------------------
                            DESKTOP 35MM FLOATING FILMSTRIP HOVER PREVIEW
                            ------------------------------------------------------------- */}
                        <div
                          className="pointer-events-none absolute bottom-full right-36 z-50 mb-3 hidden translate-y-2 scale-95 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 motion-reduce:transform-none lg:block"
                          aria-hidden="true"
                        >
                          <div className="rounded-lg border border-[#D4A36A]/60 bg-[#090510]/98 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-md">
                            {/* Top Sprocket Holes */}
                            <div className="mb-2 flex items-center justify-between px-1">
                              {Array.from({ length: Math.max(previewPhotos.length * 4, 8) }).map((_, i) => (
                                <span
                                  key={i}
                                  className="h-1.5 w-2 rounded-[1px] border border-[#D4A36A]/25 bg-[#D4A36A]/35 mx-0.5"
                                />
                              ))}
                            </div>

                            {/* 35mm Film Frames */}
                            <div className="flex items-center gap-2 rounded bg-[#140C20] p-1.5 border border-[#D4A36A]/30">
                              {previewPhotos.map((photoUrl, fIdx) => (
                                <div key={fIdx} className="flex flex-col items-center">
                                  <div className="relative h-18 w-26 overflow-hidden rounded-[1px] border border-[#271A3C] bg-[#140C20]">
                                    <Image
                                      src={photoUrl}
                                      alt=""
                                      fill
                                      sizes="104px"
                                      className="object-cover"
                                      loading="lazy"
                                    />
                                    {/* Film negative sheen */}
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent" />
                                  </div>
                                  <span className="mt-1 font-mono text-[9px] tracking-widest text-[#D4A36A]/90 font-bold">
                                    ▶ {24 + fIdx}A
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Bottom Sprocket Holes */}
                            <div className="mt-2 flex items-center justify-between px-1">
                              {Array.from({ length: Math.max(previewPhotos.length * 4, 8) }).map((_, i) => (
                                <span
                                  key={i}
                                  className="h-1.5 w-2 rounded-[1px] border border-[#D4A36A]/25 bg-[#D4A36A]/35 mx-0.5"
                                />
                              ))}
                            </div>

                            {/* Film Negative Margin Stamps */}
                            <div className="mt-1.5 flex items-center justify-between px-1 font-mono text-[8px] uppercase tracking-wider text-[#D4A36A]/70">
                              <span>EASTMAN 5207 · KODAK SANGAM 400</span>
                              <span>SAFETY FILM</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Future-Proof Show All Button if records exceed initial cap */}
        {isCapped && (
          <div className="pt-6 text-center">
            <button
              type="button"
              onClick={() => setShowAllVaults(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#D4A36A]/40 bg-[#271A3C] px-5 py-2.5 font-mono text-xs font-semibold text-[#FAF5ED] transition-all hover:border-[#D4A36A]"
            >
              <span>Show All {filteredVaults.length} Vaults</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#D4A36A]" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
