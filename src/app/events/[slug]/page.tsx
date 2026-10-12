"use client";

import React, { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { EVENTS } from "@/data/events";
import { GALLERY_ALBUMS } from "@/data/gallery";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  Download, 
  ArrowLeft, 
  ArrowRight,
  ExternalLink,
  Shirt, 
  Info, 
  CheckCircle2, 
  Camera, 
  X 
} from "lucide-react";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";

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
    <div className="w-full min-h-screen bg-[#FAF9F6] text-[#2A2825] font-sans selection:bg-[#E5A93C]/30">
      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left overflow-hidden">
        {/* Structural Watermark */}
        <WatermarkGlyph text="விழா" position="top-right" theme="light" opacity={0.03} />

        {/* Back Link */}
        <Link
          href="/events"
          onClick={playClick}
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-[#B85C38] hover:text-[#2A2825] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#B85C38]" />
          <span>Back to The Gatherings River</span>
        </Link>

        {/* Hero Poster Banner */}
        <div className="relative h-80 sm:h-[420px] overflow-hidden rounded-3xl shadow-lg shadow-stone-900/10 mb-12 bg-[#F4EFE6]">
          <Image
            src={event.posterImage}
            alt={event.titleEn}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent flex flex-col justify-end p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="px-3.5 py-1 text-xs font-sans font-semibold uppercase tracking-wider rounded-full bg-[#E5A93C] text-[#1E1B18] shadow-sm">
                {locale === "ta" ? event.statusBadgeTa : event.statusBadgeEn}
              </span>
              <span className="px-3.5 py-1 text-xs font-sans font-medium rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                {event.tamilDate}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif text-white tracking-tight mb-2">
              {locale === "ta" ? event.titleTa : event.titleEn}
            </h1>
            <p className="text-sm sm:text-base text-stone-200 font-sans">
              {locale === "ta" ? event.taglineTa : event.taglineEn}
            </p>
          </div>
        </div>

        {/* Primary Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
          {/* Left Column: Description, Schedule, Attire */}
          <div className="lg:col-span-8 space-y-10">
            <div>
              <h3 className="text-2xl font-normal text-[#2A2825] mb-3 font-serif">
                {locale === "ta" ? "நிகழ்ச்சி விவரம்" : "About This Celebration"}
              </h3>
              <p className="text-base text-[#57524C] leading-relaxed font-sans">
                {locale === "ta" ? event.descriptionTa : event.descriptionEn}
              </p>
            </div>

            {/* Schedule Breakdown */}
            <div id="details">
              <h3 className="text-2xl font-normal text-[#2A2825] mb-4 font-serif">
                {locale === "ta" ? "நிகழ்ச்சி நிரல்" : "Event Schedule"}
              </h3>
              <div className="space-y-3">
                {event.schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-[#F4EFE6] border border-[#2A2825]/5 shadow-sm flex items-center justify-between"
                  >
                    <span className="text-xs font-sans font-semibold text-[#B85C38] w-28 uppercase tracking-wider">
                      {item.time}
                    </span>
                    <span className="text-sm text-[#2A2825] font-medium flex-1 text-left font-sans">
                      {locale === "ta" ? item.activityTa : item.activityEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attire & Accessibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#2A2825]/10">
              <div className="p-6 rounded-2xl bg-[#F4EFE6] border border-[#2A2825]/5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-sans font-semibold text-[#B85C38] uppercase tracking-wider mb-2">
                  <Shirt className="w-4 h-4 text-[#B85C38]" />
                  <span>Dress Code</span>
                </div>
                <p className="text-xs sm:text-sm text-[#57524C] leading-relaxed">
                  {locale === "ta" ? event.dressCodeTa : event.dressCodeEn}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F4EFE6] border border-[#2A2825]/5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-sans font-semibold text-[#B85C38] uppercase tracking-wider mb-2">
                  <Info className="w-4 h-4 text-[#B85C38]" />
                  <span>Accessibility</span>
                </div>
                <p className="text-xs sm:text-sm text-[#57524C] leading-relaxed">
                  Wheelchair accessible venue at the Ohio Union with elevator access and physical accommodations.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Ticket Card, Venue, Add to Calendar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="relative p-7 rounded-3xl bg-[#F4EFE6] border border-[#2A2825]/5 shadow-sm space-y-6">
              <div className="border-b border-[#2A2825]/10 pb-4">
                <span className="text-xs font-sans text-[#B85C38] font-semibold uppercase tracking-wider block">
                  Admission
                </span>
                <p className="text-3xl font-normal text-[#2A2825] font-serif mt-1">{event.price}</p>
              </div>

              <div className="space-y-3.5 text-xs font-sans text-[#57524C]">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#B85C38] shrink-0" />
                  <span className="font-medium text-[#2A2825]">{event.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#B85C38] shrink-0" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#B85C38] shrink-0 mt-0.5" />
                  <span>{event.venueAddress}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href="https://linktr.ee/osutamilsangam"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClick}
                  className="w-full py-3.5 px-4 bg-[#E5A93C] hover:bg-[#B85C38] text-[#1E1B18] hover:text-[#FAF9F6] font-sans font-semibold text-xs uppercase tracking-wider rounded-full shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Official Ticketing Portal</span>
                </a>

                <button
                  onClick={() => {
                    playClick();
                    setIsRsvpOpen(true);
                  }}
                  className="w-full py-3 px-4 bg-white border border-[#2A2825]/15 text-[#2A2825] hover:bg-[#FAF9F6] font-sans font-medium text-xs uppercase tracking-wider rounded-full shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4 text-[#B85C38]" />
                  <span>RSVP for Group Rates</span>
                </button>

                <button
                  onClick={handleDownloadIcs}
                  className="w-full py-3 px-4 bg-transparent border border-[#2A2825]/15 text-[#57524C] hover:text-[#2A2825] hover:bg-white text-xs font-sans uppercase tracking-wider rounded-full transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#B85C38]" />
                  <span>Add to Calendar (.ics)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* If Event has an Archive / Album: 5 Curated Photos Showcase */}
        {album && album.photos.length > 0 && (
          <div className="mt-8 mb-16 pt-12 border-t border-[#2A2825]/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-[#2A2825]/10">
              <div>
                <span className="text-xs font-sans uppercase font-semibold text-[#B85C38] flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#B85C38]" />
                  <span>{album.academicYear} Academic Year · Official Event Archive</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-normal text-[#2A2825] font-serif tracking-tight mt-1">
                  {locale === "ta" ? "நிகழ்ச்சி நினைவுகள் (5 புகைப்படக் கதை)" : "Event Memories · 5 Curated Moments"}
                </h2>
              </div>
              <Link
                href={`/gallery/${album.slug}`}
                onClick={playClick}
                className="text-xs font-sans font-semibold text-[#B85C38] hover:underline uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Explore Dedicated Info Page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 5-Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {album.photos.map((photo, idx) => (
                <Link
                  key={photo.id}
                  href={`/gallery/${album.slug}`}
                  onClick={playClick}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F4EFE6] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  <Image
                    src={photo.imageUrl}
                    alt={photo.titleEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 200px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-between p-3 text-white">
                    <div className="flex justify-end">
                      <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-sans font-medium text-white">
                        #{idx + 1}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-serif text-white block truncate">
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
          <div className="p-8 sm:p-12 rounded-3xl bg-[#F4EFE6] border border-[#2A2825]/5 shadow-sm mb-16 text-left">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#B85C38]">
                Complete Event Album
              </span>
              <span className="text-xs font-sans text-[#57524C]">
                {event.academicYear} Academic Year Archive
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-normal text-[#2A2825] font-serif mb-2">
              Explore the Complete Photo Album on Google Photos
            </h3>

            <p className="text-sm text-[#57524C] mb-6 max-w-2xl leading-relaxed font-sans">
              Looking for all photos from {event.titleEn}? All high-resolution captures, candid student portraits, and complete event memories are published in our official Google Photos album.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href={event.googlePhotosUrl || album?.googlePhotosUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClick}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#E5A93C] hover:bg-[#B85C38] text-[#1E1B18] hover:text-[#FAF9F6] font-sans font-semibold text-xs uppercase tracking-wider rounded-full shadow-md transition-all duration-200"
              >
                <span>Open Google Photos Album</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {album && (
                <Link
                  href={`/gallery/${album.slug}`}
                  onClick={playClick}
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-white border border-[#2A2825]/15 text-[#2A2825] hover:bg-[#FAF9F6] font-sans font-medium text-xs uppercase tracking-wider rounded-full shadow-sm transition-all"
                >
                  <span>View Dedicated Event Info & Story Page</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* RSVP Modal */}
        {isRsvpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left">
              <button
                onClick={() => setIsRsvpOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center bg-[#FAF9F6] text-[#2A2825] hover:bg-[#E5A93C] transition-colors cursor-pointer"
                aria-label="Close RSVP modal"
              >
                <X className="w-5 h-5" />
              </button>

              {!isConfirmed ? (
                <div>
                  <h3 className="text-2xl font-normal text-[#2A2825] mb-1 font-serif">
                    RSVP & Ticket Updates
                  </h3>
                  <p className="text-xs text-[#57524C] mb-6 font-sans">
                    {event.titleEn} · Ohio Union
                  </p>

                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="ticket-full-name" className="block text-xs font-sans font-semibold uppercase text-[#2A2825] mb-1">
                        Full Name
                      </label>
                      <input
                        id="ticket-full-name"
                        name="ticket_name"
                        type="text"
                        required
                        value={ticketName}
                        onChange={(e) => setTicketName(e.target.value)}
                        placeholder="Your Full Name"
                        className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#2A2825]/15 rounded-xl text-[#2A2825] text-sm outline-none focus:border-[#B85C38] font-sans"
                      />
                    </div>

                    <div>
                      <label htmlFor="ticket-email" className="block text-xs font-sans font-semibold uppercase text-[#2A2825] mb-1">
                        BuckeyeMail or Personal Email
                      </label>
                      <input
                        id="ticket-email"
                        name="ticket_email"
                        type="email"
                        required
                        value={ticketEmail}
                        onChange={(e) => setTicketEmail(e.target.value)}
                        placeholder="name.#@buckeyemail.osu.edu"
                        className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#2A2825]/15 rounded-xl text-[#2A2825] text-sm outline-none focus:border-[#B85C38] font-sans"
                      />
                    </div>

                    <div>
                      <label htmlFor="ticket-count-select" className="block text-xs font-sans font-semibold uppercase text-[#2A2825] mb-1">
                        Number of Attendees
                      </label>
                      <select
                        id="ticket-count-select"
                        name="ticket_count"
                        value={ticketCount}
                        onChange={(e) => setTicketCount(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#2A2825]/15 rounded-xl text-[#2A2825] text-sm outline-none focus:border-[#B85C38] font-sans"
                      >
                        <option value="1">1 Person (Individual)</option>
                        <option value="2">2 People</option>
                        <option value="3">3-5 People (Group)</option>
                        <option value="6">6+ People (Large Delegation)</option>
                      </select>
                    </div>

                    <p className="text-xs text-[#57524C] leading-relaxed">
                      Admission is confirmed via our official ticketing link or at the door. We will send you schedule announcements and dinner menu updates.
                    </p>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#E5A93C] hover:bg-[#B85C38] text-[#1E1B18] hover:text-[#FAF9F6] font-semibold text-xs font-sans uppercase tracking-wider rounded-full shadow-md transition-all duration-200 cursor-pointer"
                    >
                      Submit RSVP
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#B85C38]/10 text-[#B85C38] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-normal text-[#2A2825] font-serif">
                    RSVP Received!
                  </h3>
                  <p className="text-sm text-[#57524C] font-sans">
                    Vanakkam {ticketName}! We have recorded your interest for {ticketCount} attendee(s). Check your inbox at {ticketEmail} for festival updates.
                  </p>

                  <div className="p-4 rounded-2xl bg-[#F4EFE6] text-xs text-[#57524C] text-left space-y-1.5 font-sans">
                    <p className="font-semibold text-[#2A2825]">Next Steps:</p>
                    <p>• Lock in your admission early via <a href="https://linktr.ee/osutamilsangam" target="_blank" rel="noopener noreferrer" className="text-[#B85C38] underline font-semibold">linktr.ee/osutamilsangam</a>.</p>
                    <p>• Bring your OSU BuckID on event day for student admission.</p>
                  </div>

                  <button
                    onClick={() => setIsRsvpOpen(false)}
                    className="px-6 py-2.5 bg-[#F4EFE6] text-[#2A2825] hover:bg-[#E5A93C] rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
