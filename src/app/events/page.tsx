"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { EVENTS } from "@/data/events";
import { Calendar, MapPin, Ticket, Clock, ArrowRight, Star } from "lucide-react";

export default function EventsPage() {
  const { locale } = useLocale();
  const { playClick, playWoodClick } = useAudio();
  const [filterYear, setFilterYear] = useState<string>("all");

  const filteredEvents = EVENTS.filter((e) => {
    if (filterYear === "all") return true;
    return e.academicYear === filterYear;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-16">
        <div className="max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
            Marutham (மருதம்) · Harvest, Gathering & Festivals
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight font-serif mb-4">
            {locale === "ta" ? "நிகழ்வுகள் & நாள்காட்டி" : "Events & Festivals"}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {locale === "ta"
              ? "கிரிகோரியன் நாள்காட்டியுடன் தமிழ் மாதப் பிரிவுகளையும் (தை, சித்திரை, ஐப்பசி) இணைத்த கலாச்சார விழாக்கள்."
              : "Discover upcoming flagship festivals, chai socials, dance workshops, and traditional feasts overlaid with the classical Tamil calendar."}
          </p>
        </div>

        {/* Academic Year Filter */}
        <div className="flex items-center gap-2">
          {["all", "2026-2027", "2025-2026"].map((yr) => (
            <button
              key={yr}
              onClick={() => {
                playWoodClick();
                setFilterYear(yr);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                filterYear === yr
                  ? "bg-[var(--accent-tint)] text-black font-semibold border-transparent"
                  : "glass-panel text-slate-300 border-white/10 hover:border-white/20"
              }`}
            >
              {yr === "all" ? "All Years" : yr}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Tamil Calendar Overlay Highlight Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-red-500/10 to-transparent border border-[var(--border-strong)] mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--accent-tint)]">
            Tamil Calendar Overlay (தமிழ் பஞ்சாங்கம்)
          </span>
          <h3 className="text-lg font-bold text-white font-serif mt-0.5">
            Current Season: தை மாதம் (Thai Month) · சுபகிருது ஆண்டு
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Thai 1 marks Pongal harvest, renewed beginnings, and gratitude to nature.
          </p>
        </div>
        <Link
          href="#hall-of-fame"
          onClick={playClick}
          className="px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-white hover:bg-white/10 shrink-0"
        >
          View Hall of Fame ↓
        </Link>
      </div>

      {/* 2. Events Main Feed */}
      <div className="space-y-8 mb-24">
        {filteredEvents.map((evt) => (
          <div
            key={evt.slug}
            className="rounded-3xl glass-panel-elevated border border-white/10 hover:border-[var(--accent-tint)] transition-all duration-300 p-6 sm:p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left"
          >
            {/* Event Poster / Visual */}
            <div className="lg:col-span-5 relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-white/10 shadow-inner group">
              <Image
                src={evt.posterImage}
                alt={evt.titleEn}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  evt.status === "upcoming" ? "bg-emerald-500 text-black shadow-md" : "bg-white/20 text-white backdrop-blur-md"
                }`}>
                  {evt.status === "upcoming" ? "Upcoming" : "Past Celebration"}
                </span>
              </div>
            </div>

            {/* Event Details */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-[var(--accent-tint)] font-bold">{evt.tamilDate}</span>
                <span>•</span>
                <span>{evt.academicYear}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
                {locale === "ta" ? evt.titleTa : evt.titleEn}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                {locale === "ta" ? evt.descriptionTa : evt.descriptionEn}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--accent-tint)] shrink-0" />
                  <span>{evt.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--accent-tint)] shrink-0" />
                  <span>{evt.time}</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-[var(--accent-tint)] shrink-0" />
                  <span>{evt.location}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href={`/events/${evt.slug}`}
                  onClick={playClick}
                  className="px-6 py-2.5 rounded-2xl bg-[var(--accent-tint)] text-black font-bold text-xs hover:opacity-95 transition-all shadow-md flex items-center gap-2"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{evt.status === "upcoming" ? `Get Tickets (${evt.price})` : "View Event Recap"}</span>
                </Link>

                <Link
                  href={`/events/${evt.slug}`}
                  onClick={playClick}
                  className="px-5 py-2.5 rounded-2xl glass-panel text-white text-xs font-semibold hover:bg-white/10 transition-all flex items-center gap-1.5"
                >
                  <span>Full Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Signature Feature: Events Hall of Fame (Hover Swap Poster-to-Photo Grid) */}
      <div id="hall-of-fame" className="pt-12 border-t border-white/10">
        <div className="max-w-2xl mb-10">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] mb-2">
            <Star className="w-3.5 h-3.5" />
            <span>Interactive Gallery</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-serif tracking-tight">
            {locale === "ta" ? "புகழ் அரங்கம் · Events Hall of Fame" : "Events Hall of Fame"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Inspired by landonorris.com: Rest shows official festival artwork, hover seamlessly swaps to crowd photography.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EVENTS.map((evt) => (
            <Link
              key={evt.slug}
              href={`/events/${evt.slug}`}
              onClick={playClick}
              className="group relative h-80 rounded-3xl overflow-hidden border border-white/10 glass-panel shadow-xl block"
            >
              {/* Base Poster at rest */}
              <Image
                src={evt.posterImage}
                alt={evt.titleEn}
                fill
                className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                sizes="(max-width: 768px) 100vw, 400px"
              />

              {/* Action Photo on hover */}
              <Image
                src={evt.hoverImage}
                alt={evt.titleEn}
                fill
                className="object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 400px"
              />

              {/* Scrim and metadata */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                <span className="text-[10px] font-mono text-[var(--accent-tint)] uppercase">
                  {evt.date}
                </span>
                <h4 className="text-base font-bold text-white tracking-tight">
                  {locale === "ta" ? evt.titleTa : evt.titleEn}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                  {evt.location}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
