"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { EVENTS } from "@/data/events";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Ticket, 
  ArrowRight, 
  Star 
} from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function EventsPage() {
  const { locale } = useLocale();
  const { playClick } = useAudio();

  const [filterYear, setFilterYear] = useState<string>("all");

  const filteredEvents = EVENTS.filter((evt) => {
    if (filterYear === "all") return true;
    return evt.academicYear.includes(filterYear);
  });

  const years = ["all", "2026-2027", "2025-2026", "2024-2025"];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
            Marutham (மருதம்) · Assembly, Harvest & Flagship Feasts
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight font-display mb-4">
            {locale === "ta" ? "விழாக்கள் & சங்க நிகழ்வுகள்" : "Events & Cultural Showcases"}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {locale === "ta"
              ? "ஆட்டம், பாட்டம், மற்றும் கொண்டாட்டம்! ஓஹியோ யூனியனில் நடக்கும் பிரம்மாண்ட பொங்கல் பெருவிழா முதல் வளாக சந்திப்புகள் வரை."
              : "Start the Aatam, Paatam, and Kondatam! From our 400+ student Powerhouse Pongal celebration to semester chai socials and dance auditions."}
          </p>
        </div>

        {/* Academic Year Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {years.map((yr) => (
            <button
              key={yr}
              onClick={() => {
                playClick();
                setFilterYear(yr);
              }}
              className={`px-4 py-2 rounded-full text-xs font-mono transition-colors ${
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
          <h3 className="text-lg font-bold text-white font-display mt-0.5">
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

      {/* 2. Events Main Feed with Parent Variant Sequencing */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 mb-24"
      >
        {filteredEvents.map((evt) => (
          <motion.div
            key={evt.slug}
            variants={itemVariants}
            layout
            className="rounded-3xl glass-panel-elevated border border-white/10 hover:border-[var(--accent-tint)] transition-colors p-6 sm:p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left"
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

              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
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
                  className="px-6 py-2.5 rounded-2xl bg-[var(--accent-tint)] text-black font-bold text-xs hover:opacity-95 transition-opacity shadow-md flex items-center gap-2"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{evt.status === "upcoming" ? `Get Tickets (${evt.price})` : "View Event Recap"}</span>
                </Link>

                <Link
                  href={`/events/${evt.slug}`}
                  onClick={playClick}
                  className="px-5 py-2.5 rounded-2xl glass-panel text-white text-xs font-semibold hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                  <span>Full Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Signature Feature: Events Hall of Fame (Hover Swap Poster-to-Photo Grid) */}
      <div id="hall-of-fame" className="pt-12 border-t border-white/10">
        <div className="max-w-2xl mb-10">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] mb-2">
            <Star className="w-3.5 h-3.5" />
            <span>Interactive Gallery</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-display tracking-tight">
            {locale === "ta" ? "புகழ் அரங்கம் · Events Hall of Fame" : "Events Hall of Fame"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Rest shows official festival artwork, hover seamlessly swaps to crowd photography.
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
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-sunken)]/90 via-[var(--surface-sunken)]/30 to-transparent flex flex-col justify-end p-5">
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
