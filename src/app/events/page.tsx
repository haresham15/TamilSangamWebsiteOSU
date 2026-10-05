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
  Clock 
} from "lucide-react";
import { PalagaiButton } from "@/components/ui/PalagaiButton";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";
import { CulturalGlossaryTerm } from "@/components/ui/CulturalGlossaryTerm";
import { HeritageTextureOverlay } from "@/components/ui/HeritageTextureOverlay";
import { HeroGradientTransition } from "@/components/ui/HeroGradientTransition";

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

import dynamic from "next/dynamic";

const EventsGen3Canvas = dynamic(
  () =>
    import("@/components/gen3/EventsGen3Canvas").then(
      (m) => m.EventsGen3Canvas
    ),
  { ssr: false }
);

export default function EventsPage() {
  const { locale } = useLocale();
  const { playClick } = useAudio();

  const [filterYear, setFilterYear] = useState<string>("all");

  const filteredEvents = EVENTS.filter((evt) => {
    if (filterYear === "all") return true;
    return evt.academicYear.includes(filterYear);
  });

  const years = ["all", "2025-2026"];

  return (
    <div className="w-full text-left bg-transparent">
      {/* 1. Cinematic Sodium-Vapor Amber Events Hero Scene (Festival Arena) */}
      <div
        id="events-hero-trigger"
        className="w-full h-[100dvh] relative z-10 overflow-hidden bg-transparent"
      >
        <EventsGen3Canvas />
      </div>

      {/* Color Gradient Transition from 3D Festival Arena (#0c0a08) to Warm Cream (#FAF6EE) */}
      <HeroGradientTransition variant="events" className="-mt-32 relative z-20" />

      {/* 2. Events Catalogue Container with Warm Cream Background (#FAF6EE) & Tactile Sandstone Texture */}
      <div className="relative z-20 w-full bg-[#FAF6EE] overflow-hidden vignette-ambient-warm">
        {/* Tactile Sandstone Texture Overlay */}
        <HeritageTextureOverlay variant="sandstone" opacity={0.02} />

        {/* Structural Tamil Background Watermarks */}
        <WatermarkGlyph text="திருவிழா" opacity={0.04} align="right" theme="light" />
        <WatermarkGlyph text="கொண்டாட்டம்" opacity={0.032} align="left" theme="light" className="top-[70%]" />

        <div id="events-catalogue" className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-left relative z-10">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-6xl font-extrabold text-[#250d38] tracking-tight font-display mb-4" {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}>
                {locale === "ta" ? "நிகழ்வுகள் & சந்திப்புகள்" : "Events & Campus Gatherings"}
              </h1>
              <p className="text-sm sm:text-base text-[#250d38] font-medium leading-relaxed font-body" {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}>
                {locale === "ta" ? (
                  <span>
                    <CulturalGlossaryTerm termKey="aatam" className="text-[#87500e]">ஆட்டம்</CulturalGlossaryTerm>,{" "}
                    <CulturalGlossaryTerm termKey="paatam" className="text-[#87500e]">பாட்டம்</CulturalGlossaryTerm>,{" "}
                    <CulturalGlossaryTerm termKey="kondatam" className="text-[#87500e]">கொண்டாட்டம்</CulturalGlossaryTerm>! ஓவல் புல்வெளி பிக்னிக், தெருவோர உணவு திருவிழாக்கள் முதல் நம்ம ஜாதரா வசந்தகால விழா வரை — மொழி பேதமின்றி அனைவரும் ஒன்றிணையும் களம்.
                  </span>
                ) : (
                  <span>
                    Start the <CulturalGlossaryTerm termKey="aatam" className="text-[#87500e]">Aatam</CulturalGlossaryTerm>,{" "}
                    <CulturalGlossaryTerm termKey="paatam" className="text-[#87500e]">Paatam</CulturalGlossaryTerm>, and{" "}
                    <CulturalGlossaryTerm termKey="kondatam" className="text-[#87500e]">Kondatam</CulturalGlossaryTerm>! From casual lawn picnics on the Oval and street food nights to spring cultural carnivals — our events are relaxed, social, and open to all students regardless of language or background.
                  </span>
                )}
              </p>
            </div>

            {/* Academic Year Filter: Architectural Console Strip */}
            <div className="box-tab-strip">
              {years.map((yr) => (
                <button
                  key={yr}
                  onClick={() => {
                    playClick();
                    setFilterYear(yr);
                  }}
                  className={`box-tab-item ${filterYear === yr ? "box-tab-item-active" : ""}`}
                >
                  {yr === "all" ? "All Years" : yr}
                </button>
              ))}
            </div>
          </div>

          {/* 1. Welcoming Community Hub Banner: Open to All Languages */}
          <div className="p-6 bg-[#250d38] border border-[#B5A642]/50 rounded-t-[32px] rounded-b-md shadow-[0_0_30px_rgba(255,184,77,0.18)] hover-glow-kuthuvilakku transition-all duration-300 mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white relative overflow-hidden">
            {/* Tactile Kanjeevaram Texture Overlay */}
            <HeritageTextureOverlay variant="kanjeevaram" opacity={0.035} />

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white font-display mt-0.5" {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}>
                {locale === "ta" ? "அனைவரையும் அன்போடு வரவேற்கிறோம்!" : "A Casual Cultural Hub for Everyone"}
              </h3>
              <p className="text-xs text-purple-200/90 mt-1 font-body max-w-2xl" {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}>
                {locale === "ta"
                  ? "எங்கள் நிகழ்வுகள் எப்போதும் எளிமையானவை மற்றும் உற்சாகமானவை. தமிழ் பேசுபவர்கள் மட்டுமின்றி, நல்ல உணவு, இசை மற்றும் நட்பை விரும்பும் அனைத்து மாணவர்களையும் மனதார வரவேற்கிறோம்!"
                  : "Our club is a welcoming social hub for Tamil students and friends from every walk of campus life. Whether you speak the language, want to learn, or just want to eat good food and hang out — you belong here!"}
              </p>
            </div>
            <div className="relative z-10 shrink-0">
              <PalagaiButton
                href="/join"
                primaryText={locale === "ta" ? "குடும்பத்தில் இணைக →" : "Join The Family →"}
                secondaryText={locale === "ta" ? "Join The Family →" : "குடும்பத்தில் இணைக →"}
                variant="gold-foil"
                size="sm"
              />
            </div>
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
                className="rounded-t-[36px] rounded-b-md border border-[#B5A642]/35 bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#4c2472] hover:shadow-[0_0_35px_rgba(255,184,77,0.22)] hover:border-[#FFB84D] transition-all duration-300 ease-out grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left relative overflow-hidden"
              >
                {/* Perforated vertical railway ticket divider for desktop */}
                <div className="hidden lg:block absolute left-[41.66%] top-0 bottom-0 w-0 border-r-2 border-dashed border-[#B5A642]/35 pointer-events-none" />
                <div className="hidden lg:block absolute left-[41.66%] -top-3 -translate-x-1/2 w-6 h-6 bg-[#FAF6EE] border border-[#B5A642]/40 rotate-45 z-20 pointer-events-none" />
                <div className="hidden lg:block absolute left-[41.66%] -bottom-3 -translate-x-1/2 w-6 h-6 bg-[#FAF6EE] border border-[#B5A642]/40 rotate-45 z-20 pointer-events-none" />

                {/* Event Poster / Visual: Temple Arch Framing */}
                <div className="lg:col-span-5 relative h-64 sm:h-72 temple-arch border border-[#B5A642]/40 overflow-hidden shadow-[3px_3px_0px_#4c2472] group">
                  <Image
                    src={evt.posterImage}
                    alt={evt.titleEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-[40px] rounded-b-md"
                    sizes="(max-width: 1024px) 100vw, 500px"
                  />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 z-10">
                    <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#250d38]/90 text-[#FFB84D] border border-[#B5A642]/60 rounded-sm">
                      {evt.status === "upcoming" ? "Upcoming" : "Past Celebration"}
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                    <span className="text-[#11694c]" lang="ta" style={{ letterSpacing: 0 }}>
                      {evt.tamilDate}
                    </span>
                    <span className="text-[#B5A642]/60">·</span>
                    <span className="text-[#4c2472]">
                      {evt.academicYear}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#250d38] font-display tracking-tight" {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}>
                    {locale === "ta" ? evt.titleTa : evt.titleEn}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#250d38] leading-relaxed font-body line-clamp-3" {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}>
                    {locale === "ta" ? evt.descriptionTa : evt.descriptionEn}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-purple-900 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#4c2472] shrink-0" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#4c2472] shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-[#4c2472] shrink-0" />
                      <span>{evt.location}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <PalagaiButton
                      href={`/events/${evt.slug}`}
                      primaryText={evt.status === "upcoming" ? "Event Details & Schedule" : "Event Overview"}
                      secondaryText={evt.status === "upcoming" ? "நிகழ்வு விவரங்கள் & அட்டவணை" : "நிகழ்வு விவரம்"}
                      variant={evt.status === "upcoming" ? "gold-foil" : "primary"}
                      size="sm"
                    />

                    <PalagaiButton
                      href={evt.albumSlug ? `/gallery/${evt.albumSlug}` : `/events/${evt.slug}`}
                      primaryText={evt.albumSlug ? "5-Photo Story →" : "Full Schedule →"}
                      secondaryText={evt.albumSlug ? "புகைப்படத் தொகுப்பு →" : "முழு அட்டவணை →"}
                      variant="white"
                      size="sm"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* 3. Signature Feature: Events Hall of Fame (Hover Swap Poster-to-Photo Grid) */}
          <div id="hall-of-fame" className="pt-12 border-t-2 border-purple-200 relative z-10">
            <div className="max-w-2xl mb-10">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#250d38] font-display tracking-tight">
                {locale === "ta" ? "புகழ் அரங்கம் · Events Hall of Fame" : "Events Hall of Fame"}
              </h2>
              <p className="text-xs sm:text-sm text-[#250d38] font-medium mt-1 font-body">
                Rest shows official festival artwork, hover seamlessly swaps to crowd photography.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {EVENTS.map((evt) => (
                <Link
                  key={evt.slug}
                  href={`/events/${evt.slug}`}
                  onClick={playClick}
                  className="temple-arch group relative h-80 overflow-hidden border border-[#B5A642]/40 shadow-[4px_4px_0px_#4c2472] hover:shadow-[0_0_35px_rgba(255,184,77,0.25)] hover:border-[#FFB84D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB84D] focus-visible:ring-offset-2 transition-all duration-300 ease-out block rounded-t-[40px] rounded-b-md"
                >
                  {/* Base Poster at rest */}
                  <Image
                    src={evt.posterImage}
                    alt={evt.titleEn}
                    fill
                    className="object-cover transition-opacity duration-500 group-hover:opacity-0 rounded-t-[40px] rounded-b-md"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />

                  {/* Action Photo on hover */}
                  <Image
                    src={evt.hoverImage}
                    alt={evt.titleEn}
                    fill
                    className="object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105 rounded-t-[40px] rounded-b-md"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />

                  {/* Scrim and metadata */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#250d38]/95 via-[#250d38]/40 to-transparent flex flex-col justify-end p-5 text-white">
                    <span className="text-[10px] font-mono text-[#FFB84D] uppercase font-bold tracking-wider">
                      {evt.date}
                    </span>
                    <h4 className="text-base font-bold text-white tracking-tight font-display" {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}>
                      {locale === "ta" ? evt.titleTa : evt.titleEn}
                    </h4>
                    <p className="text-[11px] text-purple-200/90 line-clamp-1 mt-0.5 font-body">
                      {evt.location}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

