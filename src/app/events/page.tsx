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

import dynamic from "next/dynamic";

const EventsArenaCanvas = dynamic(
  () =>
    import("@/components/events/EventsArenaCanvas").then(
      (m) => m.EventsArenaCanvas
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

  const years = ["all", "2026-2027", "2025-2026"];

  return (
    <div className="w-full text-left">
      {/* 1. Procedural "Naa Ready" WebGL Arena (Events Section Hero) */}
      <EventsArenaCanvas />

      {/* 2. Events Catalogue Container */}
      <div id="events-catalogue" className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-left">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#4c2472] block mb-2 font-bold">
            The Ohio State University · Campus Community & Social Events
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#250d38] tracking-tight font-display mb-4">
            {locale === "ta" ? "நிகழ்வுகள் & சந்திப்புகள்" : "Events & Campus Gatherings"}
          </h1>
          <p className="text-sm sm:text-base text-purple-950/80 leading-relaxed font-body font-medium">
            {locale === "ta"
              ? "ஆட்டம், பாட்டம், கொண்டாட்டம்! ஓவல் புல்வெளி பிக்னிக், தெருவோர உணவு திருவிழாக்கள் முதல் தீபாவளிக் கொண்டாட்டம் வரை — மொழி பேதமின்றி அனைவரும் ஒன்றிணையும் களம்."
              : "Start the Aatam, Paatam, and Kondatam! From casual lawn picnics on the Oval and street food nights to our annual Diwali party — our events are relaxed, social, and open to all students regardless of language or background."}
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
      <div className="p-6 bg-[#250d38] border-2 border-[#55CCA2] shadow-[6px_6px_0px_#55CCA2] mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#55CCA2] font-bold">
            [CAMPUS COMMUNITY · OPEN TO ALL LANGUAGES & MAJORS]
          </span>
          <h3 className="text-lg font-bold text-white font-display mt-0.5">
            {locale === "ta" ? "அனைவரையும் அன்போடு வரவேற்கிறோம்!" : "A Casual Cultural Hub for Everyone"}
          </h3>
          <p className="text-xs text-purple-200/90 mt-1 font-body max-w-2xl">
            {locale === "ta"
              ? "எங்கள் நிகழ்வுகள் எப்போதும் எளிமையானவை மற்றும் உற்சாகமானவை. தமிழ் பேசுபவர்கள் மட்டுமின்றி, நல்ல உணவு, இசை மற்றும் நட்பை விரும்பும் அனைத்து மாணவர்களையும் மனதார வரவேற்கிறோம்!"
              : "Our club is a welcoming social hub for Tamil students and friends from every walk of campus life. Whether you speak the language, want to learn, or just want to eat good food and hang out — you belong here!"}
          </p>
        </div>
        <Link
          href="/join"
          onClick={playClick}
          className="px-5 py-2.5 btn-sangam-mint text-xs font-mono font-bold uppercase tracking-wider shrink-0"
        >
          Join The Family →
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
            className="border-2 border-[#250d38] bg-white p-6 sm:p-8 shadow-[5px_5px_0px_#4c2472] hover:shadow-[7px_7px_0px_#55CCA2] hover:border-[#55CCA2] transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left"
          >
            {/* Event Poster / Visual: Architectural Frame */}
            <div className="lg:col-span-5 relative h-64 sm:h-72 border-2 border-[#250d38] overflow-hidden shadow-[3px_3px_0px_#4c2472] group">
              <Image
                src={evt.posterImage}
                alt={evt.titleEn}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
              <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                  evt.status === "upcoming"
                    ? "bg-[#250d38] text-[#55CCA2] border-[#55CCA2] shadow-[2px_2px_0px_#55CCA2]"
                    : "bg-black/80 text-white border-white/40"
                }`}>
                  {evt.status === "upcoming" ? "Upcoming" : "Past Celebration"}
                </span>
              </div>
            </div>

            {/* Event Details */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-purple-900/80 font-bold">
                <span className="box-badge text-[#11694c] border-l-[#55CCA2]" lang="ta" style={{ letterSpacing: 0 }}>
                  {evt.tamilDate}
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 border border-purple-300 bg-purple-50 text-[#4c2472]">
                  {evt.academicYear}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#250d38] font-display tracking-tight">
                {locale === "ta" ? evt.titleTa : evt.titleEn}
              </h2>

              <p className="text-xs sm:text-sm text-purple-950/80 leading-relaxed font-body line-clamp-3">
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
                <Link
                  href={`/events/${evt.slug}`}
                  onClick={playClick}
                  className="px-5 py-2.5 btn-sangam text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <Ticket className="w-3.5 h-3.5 text-[#55CCA2]" />
                  <span>{evt.status === "upcoming" ? `Get Tickets (${evt.price})` : "Event Overview"}</span>
                </Link>

                {evt.albumSlug ? (
                  <Link
                    href={`/gallery/${evt.albumSlug}`}
                    onClick={playClick}
                    className="px-5 py-2.5 btn-sangam-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span>Event Info & 5-Photo Story →</span>
                  </Link>
                ) : (
                  <Link
                    href={`/events/${evt.slug}`}
                    onClick={playClick}
                    className="px-5 py-2.5 btn-sangam-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span>Full Schedule →</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Signature Feature: Events Hall of Fame (Hover Swap Poster-to-Photo Grid) */}
      <div id="hall-of-fame" className="pt-12 border-t-2 border-purple-200">
        <div className="max-w-2xl mb-10">
          <div className="box-badge shadow-[2px_2px_0px_#4c2472] mb-2">
            <Star className="w-3.5 h-3.5 text-[#55CCA2]" />
            <span>Interactive Gallery</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#250d38] font-display tracking-tight">
            {locale === "ta" ? "புகழ் அரங்கம் · Events Hall of Fame" : "Events Hall of Fame"}
          </h2>
          <p className="text-xs sm:text-sm text-purple-950/75 mt-1 font-body">
            Rest shows official festival artwork, hover seamlessly swaps to crowd photography.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EVENTS.map((evt) => (
            <Link
              key={evt.slug}
              href={`/events/${evt.slug}`}
              onClick={playClick}
              className="group relative h-80 overflow-hidden border-2 border-[#250d38] shadow-[4px_4px_0px_#4c2472] hover:shadow-[6px_6px_0px_#55CCA2] hover:border-[#55CCA2] transition-all block"
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#250d38]/95 via-[#250d38]/40 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] font-mono text-[#55CCA2] uppercase font-bold">
                  {evt.date}
                </span>
                <h4 className="text-base font-bold text-white tracking-tight font-display">
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
  );
}
