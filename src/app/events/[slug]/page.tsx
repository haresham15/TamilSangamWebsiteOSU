"use client";

import React, { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { EVENTS } from "@/data/events";
import { GALLERY_ALBUMS, PhotoItem } from "@/data/gallery";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  Download, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  ExternalLink,
  Shirt, 
  Info,
  CheckCircle2,
  Camera,
  Eye,
  Sparkles
} from "lucide-react";

export default function EventDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { locale } = useLocale();
  const { playClick, playBell } = useAudio();

  // RSVP / Ticket Interest Modal State
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketCount, setTicketCount] = useState("1");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const event = EVENTS.find((e) => e.slug === slug);
  if (!event) {
    return notFound();
  }

  const album = GALLERY_ALBUMS.find(
    (a) => a.slug === event.albumSlug || a.eventSlug === event.slug
  );

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketName || !ticketEmail) return;
    playBell(880);
    setIsConfirmed(true);
  };

  const handleDownloadIcs = () => {
    playClick();
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OSU Tamil Sangam//Events Calendar//EN
BEGIN:VEVENT
UID:${event.slug}@osutamilsangam.org
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
SUMMARY:${event.titleEn} - OSU Tamil Sangam
DESCRIPTION:${event.descriptionEn}
LOCATION:${event.venueAddress}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${event.slug}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      {/* Back Link */}
      <Link
        href="/events"
        onClick={playClick}
        className="box-badge-dark inline-flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-[#55CCA2] hover:border-[#55CCA2] mb-8 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO EVENTS CALENDAR</span>
      </Link>

      {/* Hero Poster Banner */}
      <div className="box-ticket relative h-80 sm:h-96 overflow-hidden border-2 border-white/20 shadow-[6px_6px_0px_#55CCA2] mb-12">
        <Image
          src={event.posterImage}
          alt={event.titleEn}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1024px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b14] via-black/50 to-transparent flex flex-col justify-end p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="box-badge text-xs font-mono font-bold uppercase bg-[#55CCA2] text-[#1b0d28] border-2 border-[#1b0d28] shadow-[2px_2px_0px_#1b0d28]">
              {locale === "ta" ? event.statusBadgeTa : event.statusBadgeEn}
            </span>
            <span className="box-badge-dark text-xs font-mono bg-black/70 backdrop-blur-md text-white border border-white/20">
              {event.tamilDate}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white font-serif tracking-tight mb-2 drop-shadow-md">
            {locale === "ta" ? event.titleTa : event.titleEn}
          </h1>
          <p className="text-sm sm:text-base text-slate-200 drop-shadow-md">
            {locale === "ta" ? event.taglineTa : event.taglineEn}
          </p>
        </div>
      </div>

      {/* Primary Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Left Column: Description, Schedule, Dress Code */}
        <div className="lg:col-span-8 space-y-10">
          <div>
            <h3 className="text-xl font-bold text-white mb-3 font-serif">
              {locale === "ta" ? "நிகழ்ச்சி விவரம்" : "About This Celebration"}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {locale === "ta" ? event.descriptionTa : event.descriptionEn}
            </p>
          </div>

          {/* Schedule Breakdown */}
          <div id="details">
            <h3 className="text-xl font-bold text-white mb-4 font-serif">
              {locale === "ta" ? "நிகழ்ச்சி நிரல்" : "Event Schedule"}
            </h3>
            <div className="space-y-3">
              {event.schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 border-2 border-white/10 bg-[#160d26]/70 shadow-[3px_3px_0px_rgba(76,36,114,0.3)] flex items-center justify-between"
                >
                  <span className="text-xs font-mono font-bold text-[#55CCA2] w-24">
                    {item.time}
                  </span>
                  <span className="text-xs sm:text-sm text-white font-medium flex-1 text-left font-sans">
                    {locale === "ta" ? item.activityTa : item.activityEn}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Attire & Accessibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-white/10">
            <div className="p-5 border-2 border-white/10 bg-[#160d26]/80 shadow-[3px_3px_0px_rgba(76,36,114,0.4)]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#55CCA2] uppercase mb-1">
                <Shirt className="w-4 h-4" />
                <span>Dress Code</span>
              </div>
              <p className="text-xs text-slate-300">
                {locale === "ta" ? event.dressCodeTa : event.dressCodeEn}
              </p>
            </div>

            <div className="p-5 border-2 border-white/10 bg-[#160d26]/80 shadow-[3px_3px_0px_rgba(76,36,114,0.4)]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#55CCA2] uppercase mb-1">
                <Info className="w-4 h-4" />
                <span>Accessibility</span>
              </div>
              <p className="text-xs text-slate-300">
                Wheelchair accessible venue at the Ohio Union with elevator access and accommodations.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Card, Venue, Add to Calendar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="box-ticket p-6 sm:p-7 bg-[#160d26] border-2 border-[#55CCA2] shadow-[6px_6px_0px_#55CCA2] space-y-6">
            <div className="border-b-2 border-white/10 pb-4">
              <span className="text-[10px] font-mono text-[#55CCA2] uppercase tracking-widest block font-bold">
                ADMISSION PASS
              </span>
              <p className="text-3xl font-bold text-white font-mono mt-1">{event.price}</p>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#55CCA2] shrink-0" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#55CCA2] shrink-0" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#55CCA2] shrink-0 mt-0.5" />
                <span>{event.venueAddress}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="https://linktr.ee/osutamilsangam"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClick}
                className="w-full py-3.5 px-4 bg-[#55CCA2] text-[#1b0d28] font-bold text-xs uppercase tracking-wider border-2 border-[#1b0d28] shadow-[3px_3px_0px_#1b0d28] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 text-center"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Official Ticketing Portal</span>
              </a>

              <button
                onClick={() => {
                  playClick();
                  setIsRsvpOpen(true);
                }}
                className="w-full py-3 px-4 bg-white/5 border-2 border-white/20 text-white font-semibold text-xs uppercase tracking-wider hover:bg-white/10 hover:border-[#55CCA2] shadow-[3px_3px_0px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4 text-[#55CCA2]" />
                <span>RSVP for Group Rates</span>
              </button>

              <button
                onClick={handleDownloadIcs}
                className="w-full py-2.5 px-4 bg-transparent border-2 border-white/10 text-slate-300 text-xs font-mono uppercase tracking-wider hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#55CCA2]" />
                <span>Add to Calendar (.ics)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* If Event has an Archive / Album: 5 Curated Photos Showcase */}
      {album && album.photos.length > 0 && (
        <div className="mt-8 mb-16 pt-12 border-t-2 border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b-2 border-white/10">
            <div>
              <span className="text-xs font-mono uppercase font-bold text-[#55CCA2] flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>{album.academicYear} Academic Year · Official Event Archive</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight mt-1">
                {locale === "ta" ? "நிகழ்ச்சி நினைவுகள் (5 புகைப்படக் கதை)" : "Event Memories · 5 Curated Moments"}
              </h2>
            </div>
            <Link
              href={`/gallery/${album.slug}`}
              onClick={playClick}
              className="text-xs font-mono font-bold text-[#55CCA2] hover:underline uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Explore Dedicated Info Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 5-Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
            {album.photos.map((photo, idx) => (
              <Link
                key={photo.id}
                href={`/gallery/${album.slug}`}
                onClick={playClick}
                className="group relative aspect-[4/3] border-2 border-white/20 overflow-hidden bg-black/40 shadow-[3px_3px_0px_rgba(85,204,162,0.3)] hover:border-[#55CCA2] hover:shadow-[4px_4px_0px_#55CCA2] transition-all"
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.titleEn}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, 200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-between p-2 text-white">
                  <div className="flex justify-end">
                    <span className="p-1 bg-black/60 border border-white/30 text-[9px] font-mono text-[#55CCA2]">
                      #{idx + 1}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#55CCA2] block truncate">
                      {photo.titleEn}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Prominent Bottom Card: Google Photos Album Link */}
      {(event.googlePhotosUrl || (album && album.googlePhotosUrl)) && (
        <div className="box-ticket p-6 sm:p-8 bg-[#160d26] border-2 border-[#55CCA2] shadow-[6px_6px_0px_#55CCA2] mb-16 text-left">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="box-badge text-[10px] font-mono font-bold uppercase tracking-widest bg-[#55CCA2] text-[#1b0d28]">
              COMPLETE EVENT ALBUM
            </span>
            <span className="text-xs font-mono text-slate-300">
              {event.academicYear} Academic Year Archive
            </span>
          </div>

          <h3 className="text-xl sm:text-3xl font-bold text-white font-serif mb-2">
            Explore the Complete Photo Album on Google Photos
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-2xl leading-relaxed">
            Looking for all photos from {event.titleEn}? All high-resolution captures, candid student portraits, and complete event memories are published in our official Google Photos album.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={event.googlePhotosUrl || album?.googlePhotosUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClick}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#55CCA2] text-[#1b0d28] font-mono font-bold text-xs uppercase tracking-wider border-2 border-[#1b0d28] shadow-[3px_3px_0px_#ffffff] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <span>Open Google Photos Album</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#1b0d28]" />
            </a>

            {album && (
              <Link
                href={`/gallery/${album.slug}`}
                onClick={playClick}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 border-2 border-white/20 text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all"
              >
                <span>View Dedicated Event Info & Story Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}
      {isRsvpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="box-ticket w-full max-w-md bg-[#160d26] p-6 sm:p-8 border-2 border-[#55CCA2] shadow-[8px_8px_0px_#55CCA2] relative text-left">
            <button
              onClick={() => setIsRsvpOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-mono uppercase tracking-wider"
            >
              [✕ Close]
            </button>

            {!isConfirmed ? (
              <div>
                <h3 className="text-xl font-bold text-white mb-1 font-serif">
                  RSVP & Ticket Updates
                </h3>
                <p className="text-xs text-slate-400 mb-6 font-mono">
                  {event.titleEn} · Ohio Union
                </p>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketName}
                      onChange={(e) => setTicketName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-4 py-2.5 bg-black/50 border-2 border-white/20 text-white text-xs outline-none focus:border-[#55CCA2] font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                      BuckeyeMail or Personal Email
                    </label>
                    <input
                      type="email"
                      required
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      placeholder="name.#@buckeyemail.osu.edu"
                      className="w-full px-4 py-2.5 bg-black/50 border-2 border-white/20 text-white text-xs outline-none focus:border-[#55CCA2] font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                      Number of Attendees
                    </label>
                    <select
                      value={ticketCount}
                      onChange={(e) => setTicketCount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0f0b18] border-2 border-white/20 text-white text-xs outline-none focus:border-[#55CCA2] font-sans"
                    >
                      <option value="1">1 Person (Individual)</option>
                      <option value="2">2 People</option>
                      <option value="3">3-5 People (Group)</option>
                      <option value="6">6+ People (Large Delegation)</option>
                    </select>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Admission is confirmed via our official ticketing link or at the door. We will send you schedule announcements and dinner menu updates.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#55CCA2] text-[#1b0d28] font-bold text-xs uppercase tracking-wider border-2 border-[#1b0d28] shadow-[3px_3px_0px_#1b0d28] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  >
                    Submit RSVP
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 border-2 border-emerald-400 bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[3px_3px_0px_#10b981]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-serif">
                  RSVP Received!
                </h3>
                <p className="text-xs text-slate-300">
                  Vanakkam {ticketName}! We have recorded your interest for {ticketCount} attendee(s). Check your inbox at {ticketEmail} for festival updates.
                </p>

                <div className="p-4 border-2 border-white/15 bg-white/5 text-xs text-slate-300 text-left space-y-1 shadow-[2px_2px_0px_rgba(255,255,255,0.1)]">
                  <p className="font-semibold text-white">Next Steps:</p>
                  <p>• Lock in your admission early via <a href="https://linktr.ee/osutamilsangam" target="_blank" rel="noopener noreferrer" className="text-[#55CCA2] underline font-bold">linktr.ee/osutamilsangam</a>.</p>
                  <p>• Bring your OSU BuckID on event day for student admission.</p>
                </div>

                <button
                  onClick={() => setIsRsvpOpen(false)}
                  className="px-6 py-2 bg-white/10 border-2 border-white/20 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/20 transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
