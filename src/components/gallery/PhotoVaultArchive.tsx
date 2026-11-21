"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ChevronDown } from "lucide-react";
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
      className={`w-full border-t border-[#D4A36A]/25 pt-14 sm:pt-20 ${className}`.trim()}
    >
      {/* =========================================================================
          SECTION HEADER
          ========================================================================= */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-widest text-[#D4A36A]">
            <span>GOOGLE PHOTOS VAULTS</span>
            <span className="text-[#D4A36A]/50">❖</span>
            <span lang="ta" className="font-tamil font-normal tracking-normal text-[#D4A36A]">
              புகைப்படப் பெட்டகம்
            </span>
          </div>

          <h3
            id="google-photos-vaults-heading"
            className="flex flex-wrap items-center gap-3 font-serif text-3xl font-normal tracking-tight text-[#FAF5ED] sm:text-4xl lg:text-5xl"
          >
            <span>The Sangam Photo Vaults</span>
            <span className="inline-flex items-center rounded-full border border-[#2BB5A8]/30 bg-[#2BB5A8]/15 px-3 py-1 font-mono text-xs font-semibold tracking-wider text-[#2BB5A8]">
              {allVaults.length} Official Albums
            </span>
          </h3>
        </div>

        <p className="max-w-md font-sans text-sm leading-relaxed text-[#C4B7D7] sm:text-base">
          Full-resolution original albums from our camera rolls. Browse or download every photo from a gathering.
        </p>
      </div>

      {/* =========================================================================
          TIER 1: "LATEST DROPS" — 3 TACTILE PHOTO-STUDIO ENVELOPES
          ========================================================================= */}
      <div className="mt-12">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4A36A]" aria-hidden="true" />
            <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-[#D4A36A]">
              LATEST DROPS · RECENT DEVELOPED PACKETS
            </h4>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#C4B7D7]/70">
            Top 3 Archives
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 pt-8 sm:pt-12 md:grid-cols-3">
          {latestDrops.map((vault, idx) => {
            const hasPhotos = vault.photos.length > 0;
            const peekingPhotos = vault.photos.slice(0, 3);
            const isLatest = idx === 0;

            return (
              <article
                key={vault.slug}
                className="group relative flex flex-col justify-between pt-16 sm:pt-20 overflow-visible"
              >
                {/* -------------------------------------------------------------
                    PEEKING PHOTO STACK (Tucked behind front sleeve, fanning up)
                    ------------------------------------------------------------- */}
                <div
                  className="pointer-events-none absolute left-0 right-0 top-0 flex h-36 items-center justify-center overflow-visible"
                  aria-hidden="true"
                >
                  {hasPhotos ? (
                    <>
                      {/* Photo 1: Left tilted polaroid */}
                      {peekingPhotos[0] && (
                        <div
                          className="absolute h-20 w-28 -translate-x-7 translate-y-3 -rotate-6 rounded-sm border border-[#FAF6F0]/90 bg-[#FAF6F0] p-1 shadow-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-10 group-hover:-translate-y-7 group-hover:-rotate-12 group-hover:shadow-xl motion-reduce:transform-none sm:h-24 sm:w-32 md:h-20 md:w-28 lg:h-22 lg:w-32"
                        >
                          <div className="relative h-full w-full overflow-hidden rounded-[1px] bg-[#140C20]">
                            <Image
                              src={peekingPhotos[0]}
                              alt={`${vault.titleEn} — OSU Tamil Sangam photo archive preview`}
                              fill
                              sizes="(max-width: 768px) 130px, 150px"
                              className="object-cover"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      )}

                      {/* Photo 2: Center polaroid (elevated z-10) */}
                      {peekingPhotos[1] ? (
                        <div
                          className="absolute z-10 h-20 w-28 translate-y-1 rotate-0 rounded-sm border border-[#FAF6F0]/90 bg-[#FAF6F0] p-1 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-9 group-hover:scale-105 group-hover:shadow-2xl motion-reduce:transform-none sm:h-24 sm:w-32 md:h-20 md:w-28 lg:h-22 lg:w-32"
                        >
                          <div className="relative h-full w-full overflow-hidden rounded-[1px] bg-[#140C20]">
                            <Image
                              src={peekingPhotos[1]}
                              alt={`${vault.titleEn} — OSU Tamil Sangam photo archive preview`}
                              fill
                              sizes="(max-width: 768px) 130px, 150px"
                              className="object-cover"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      ) : null}

                      {/* Photo 3: Right tilted polaroid */}
                      {peekingPhotos[2] ? (
                        <div
                          className="absolute h-20 w-28 translate-x-7 translate-y-3 rotate-6 rounded-sm border border-[#FAF6F0]/90 bg-[#FAF6F0] p-1 shadow-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-7 group-hover:translate-x-10 group-hover:rotate-12 group-hover:shadow-xl motion-reduce:transform-none sm:h-24 sm:w-32 md:h-20 md:w-28 lg:h-22 lg:w-32"
                        >
                          <div className="relative h-full w-full overflow-hidden rounded-[1px] bg-[#140C20]">
                            <Image
                              src={peekingPhotos[2]}
                              alt={`${vault.titleEn} — OSU Tamil Sangam photo archive preview`}
                              fill
                              sizes="(max-width: 768px) 130px, 150px"
                              className="object-cover"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    /* Fallback 35mm negative frame if 0 local photos */
                    <div className="absolute h-22 w-32 rounded-sm border border-[#D4A36A]/60 bg-[#1A1028] p-2 text-center shadow-lg">
                      <p lang="ta" className="font-tamil text-xs leading-[1.6] text-[#D4A36A]">
                        {vault.titleTa}
                      </p>
                      <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-[#D4A36A]/60">
                        35mm Vault
                      </span>
                    </div>
                  )}
                </div>

                {/* -------------------------------------------------------------
                    PACKET BODY (Front velvet sleeve with die-cut thumb notch)
                    ------------------------------------------------------------- */}
                <div className="relative z-20 flex flex-1 flex-col justify-between rounded-2xl border border-[#D4A36A]/30 bg-[#271A3C] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.45)] ring-1 ring-inset ring-[#D4A36A]/20 transition-all duration-300 group-hover:border-[#D4A36A]/60 group-hover:shadow-[0_16px_45px_rgba(212,163,106,0.12)] sm:p-7 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] before:from-[#D4A36A]/[0.08] before:via-transparent before:to-transparent">
                  {/* Subtle curved thumb-notch cutout */}
                  <div
                    className="pointer-events-none absolute -top-3.5 left-1/2 -translate-x-1/2 h-4 w-16"
                    aria-hidden="true"
                  >
                    <div className="h-full w-full rounded-b-full border-x border-b border-[#D4A36A]/30 bg-[#140C20] shadow-inner" />
                  </div>

                  {/* Packet Header & Serial Stamp */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-serif text-3xl font-medium leading-none text-[#FAF5ED] transition-colors group-hover:text-[#D4A36A]">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        {isLatest && (
                          <span className="ml-3 inline-flex items-center rounded border border-[#D4A36A]/60 bg-[#D4A36A]/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase text-[#D4A36A] shadow-[0_0_12px_rgba(212,163,106,0.25)]">
                            LATEST
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#D4A36A]/70">
                        STUDIO PACKET
                      </span>
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
                  <div className="mt-6">
                    {/* Thin tapered bronze hairline */}
                    <div
                      className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-[#D4A36A]/30 to-transparent"
                      aria-hidden="true"
                    />

                    <div className="flex items-end justify-between gap-3">
                      <div className="space-y-0.5 font-sans text-xs text-[#C4B7D7]">
                        <p className="font-medium text-[#FAF5ED]/90">
                          {vault.semester} · {vault.eventType}
                        </p>
                        <p className="max-w-[140px] truncate text-[#C4B7D7]/75 sm:max-w-[180px]">
                          {vault.location}
                        </p>
                      </div>

                      <div className="flex flex-col items-end">
                        <a
                          href={vault.googlePhotosUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/btn inline-flex items-center gap-1.5 rounded-lg border border-[#2BB5A8]/40 bg-[#2BB5A8]/15 px-3.5 py-2 font-mono text-xs font-semibold text-[#2BB5A8] shadow-sm transition-all hover:border-[#2BB5A8] hover:bg-[#2BB5A8]/25 hover:text-[#A6F0CF]"
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
                          className="mt-2 text-[11px] font-sans text-[#C4B7D7]/70 transition-colors hover:text-[#FAF5ED]"
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
      <div className="my-14 flex items-center justify-center gap-4 sm:my-16" aria-hidden="true">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4A36A]/20 to-[#D4A36A]/45" />
        <span className="shrink-0 text-[#D4A36A] opacity-80">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2C12 2 14.5 7 17.5 8C20.5 9 22 12 22 12C22 12 17.5 13 16 16.5C14.5 20 12 22 12 22C12 22 9.5 20 8 16.5C6.5 13 2 12 2 12C2 12 3.5 9 6.5 8C9.5 7 12 2 12 2Z" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#D4A36A]/20 to-[#D4A36A]/45" />
      </div>

      {/* =========================================================================
          TIER 2: "THE COMPLETE SANGAM VAULT" — 35MM EDITORIAL YEAR LEDGER
          ========================================================================= */}
      <div className="space-y-6">
        {/* Ledger Header, Search & Filter Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h4 className="font-serif text-2xl font-normal text-[#FAF5ED] sm:text-3xl">
              The Complete Sangam Vault
            </h4>
            <p className="font-sans text-xs text-[#C4B7D7] sm:text-sm">
              Chronological 35mm year ledger. Search or filter through all historical gathering rolls.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D4A36A]/70"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by event, venue, or collab..."
              aria-label="Filter photo vaults"
              className="w-full rounded-xl border border-[#D4A36A]/30 bg-[#1A1028]/90 py-2 pl-10 pr-9 text-xs text-[#FAF5ED] placeholder:text-[#C4B7D7]/50 focus:border-[#2BB5A8] focus:outline-none focus:ring-1 focus:ring-[#2BB5A8] sm:text-sm transition-colors"
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

        {/* Dynamic Academic Year Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedYear("all")}
            className={`min-h-10 shrink-0 rounded-full px-4 font-mono text-xs font-medium transition-all ${
              selectedYear === "all"
                ? "border border-[#2BB5A8] bg-[#2BB5A8] font-bold text-[#0D0814] shadow-[0_2px_12px_rgba(43,181,168,0.3)]"
                : "border border-[#D4A36A]/25 bg-[#271A3C]/70 text-[#C4B7D7] hover:border-[#D4A36A]/60 hover:text-[#FAF5ED]"
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
                className={`min-h-10 shrink-0 rounded-full px-4 font-mono text-xs font-medium transition-all ${
                  isSelected
                    ? "border border-[#2BB5A8] bg-[#2BB5A8] font-bold text-[#0D0814] shadow-[0_2px_12px_rgba(43,181,168,0.3)]"
                    : "border border-[#D4A36A]/25 bg-[#271A3C]/70 text-[#C4B7D7] hover:border-[#D4A36A]/60 hover:text-[#FAF5ED]"
                }`}
              >
                {year} ({countForYear})
              </button>
            );
          })}
        </div>

        {/* -------------------------------------------------------------
            GROUPED ACADEMIC YEAR LEDGER LIST
            ------------------------------------------------------------- */}
        {groupedVaults.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D4A36A]/30 bg-[#271A3C]/30 py-12 px-4 text-center text-[#C4B7D7]">
            <p className="font-sans text-sm">
              No photo vaults match &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedYear("all");
              }}
              className="mt-3 font-mono text-xs text-[#2BB5A8] hover:underline"
            >
              Clear search &amp; view all {allVaults.length} albums
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedVaults.map(([year, yearVaults]) => (
              <div key={year} className="space-y-2">
                {/* Year Header */}
                <div className="flex items-center justify-between border-b border-[#D4A36A]/25 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#D4A36A]" aria-hidden="true" />
                    <h5 className="font-mono text-xs font-semibold uppercase tracking-widest text-[#D4A36A]">
                      {year} ACADEMIC YEAR
                    </h5>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#C4B7D7]/70">
                    {yearVaults.length} {yearVaults.length === 1 ? "Album" : "Albums"}
                  </span>
                </div>

                {/* Ledger Rows */}
                <ul className="divide-y divide-[#D4A36A]/15">
                  {yearVaults.map((vault, rowIdx) => {
                    const isTop3 = top3Slugs.has(vault.slug);
                    const previewPhotos = vault.photos.slice(0, 3);

                    return (
                      <li
                        key={vault.slug}
                        className="group relative flex items-center justify-between rounded-xl px-3 py-3.5 transition-colors duration-200 hover:bg-[#271A3C]/50 sm:px-4 sm:py-4"
                      >
                        {/* Col 1: Index + Polaroid Mini-Thumbnail (Mobile & Desktop) */}
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="w-5 font-mono text-xs text-[#D4A36A]/70">
                            {String(rowIdx + 1).padStart(2, "0")}
                          </span>
                          <div className="relative h-8 w-11 shrink-0 -rotate-3 overflow-hidden rounded-[2px] border border-[#FAF6F0]/80 bg-[#FAF6F0] p-0.5 shadow-sm transition-transform duration-300 group-hover:rotate-0">
                            <div className="relative h-full w-full overflow-hidden rounded-[1px] bg-[#140C20]">
                              <Image
                                src={vault.coverImage}
                                alt=""
                                fill
                                sizes="44px"
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
                              <span className="rounded border border-[#D4A36A]/30 bg-[#D4A36A]/15 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-[#D4A36A]">
                                Featured
                              </span>
                            )}
                          </div>
                          <p
                            lang="ta"
                            className="truncate font-tamil text-xs leading-[1.6] text-[#C4B7D7] sm:text-sm"
                            style={{ letterSpacing: 0 }}
                          >
                            {vault.titleTa}
                          </p>
                        </div>

                        {/* Col 3: Metadata (Semester, Event Type, Venue) */}
                        <div className="hidden shrink-0 flex-col pr-4 text-right font-sans text-xs text-[#9E8EB8] md:flex lg:pr-8">
                          <span className="font-medium text-[#FAF5ED]/80">
                            {vault.semester} · {vault.eventType}
                          </span>
                          <span className="max-w-[200px] truncate text-[#C4B7D7]/70">
                            {vault.location}
                          </span>
                        </div>

                        {/* Col 4: Action Buttons (Dossier + Open Album CTA) */}
                        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                          <Link
                            href={vault.detailHref}
                            className="hidden text-xs font-sans text-[#C4B7D7]/70 transition-colors hover:text-[#FAF5ED] sm:inline-block"
                          >
                            Dossier →
                          </Link>

                          <a
                            href={vault.googlePhotosUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/btn inline-flex items-center gap-1.5 rounded-lg border border-[#2BB5A8]/30 bg-[#2BB5A8]/15 px-3 py-1.5 font-mono text-xs font-semibold text-[#2BB5A8] shadow-sm transition-all hover:border-[#2BB5A8] hover:bg-[#2BB5A8]/25 hover:text-[#A6F0CF]"
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
                          className="pointer-events-none absolute bottom-full right-36 z-40 mb-2 hidden translate-y-2 scale-95 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 motion-reduce:transform-none lg:block"
                          aria-hidden="true"
                        >
                          <div className="rounded-lg border border-[#D4A36A]/50 bg-[#0A0612]/95 p-2.5 shadow-[0_16px_45px_rgba(0,0,0,0.85)] backdrop-blur-md">
                            {/* Top Sprocket Holes */}
                            <div className="mb-1.5 flex items-center justify-between px-1">
                              {Array.from({ length: Math.max(previewPhotos.length * 4, 8) }).map((_, i) => (
                                <span
                                  key={i}
                                  className="h-1.5 w-2 rounded-[1px] border border-[#D4A36A]/20 bg-[#D4A36A]/30 mx-0.5"
                                />
                              ))}
                            </div>

                            {/* 35mm Film Frames */}
                            <div className="flex items-center gap-1.5 rounded bg-[#140C20]/80 p-1 border border-[#D4A36A]/20">
                              {previewPhotos.map((photoUrl, fIdx) => (
                                <div key={fIdx} className="flex flex-col items-center">
                                  <div className="relative h-16 w-24 overflow-hidden rounded-[1px] border border-[#271A3C] bg-[#140C20]">
                                    <Image
                                      src={photoUrl}
                                      alt=""
                                      fill
                                      sizes="96px"
                                      className="object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                  <span className="mt-1 font-mono text-[9px] tracking-widest text-[#D4A36A]/80">
                                    {24 + fIdx}A
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Bottom Sprocket Holes */}
                            <div className="mt-1.5 flex items-center justify-between px-1">
                              {Array.from({ length: Math.max(previewPhotos.length * 4, 8) }).map((_, i) => (
                                <span
                                  key={i}
                                  className="h-1.5 w-2 rounded-[1px] border border-[#D4A36A]/20 bg-[#D4A36A]/30 mx-0.5"
                                />
                              ))}
                            </div>

                            {/* Film Negative Margin Stamps */}
                            <div className="mt-1 flex items-center justify-between px-1 font-mono text-[8px] uppercase tracking-wider text-[#D4A36A]/60">
                              <span>KODAK SANGAM 400</span>
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
