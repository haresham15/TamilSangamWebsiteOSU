"use client";

import React, { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { EVENTS } from "@/data/events";
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
  ExternalLink,
  Shirt, 
  Info,
  CheckCircle2
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
PRODID:-//OSU Tamil Sangam//Project Aintinai//EN
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
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white mb-8 glass-panel px-3.5 py-1.5 rounded-full border border-white/10"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Events Calendar</span>
      </Link>

      {/* Hero Poster Banner */}
      <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-white/15 shadow-2xl mb-12">
        <Image
          src={event.posterImage}
          alt={event.titleEn}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1024px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b14] via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[var(--accent-tint)] text-black">
              {locale === "ta" ? event.statusBadgeTa : event.statusBadgeEn}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-black/60 backdrop-blur-md text-white border border-white/20">
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
                  className="p-4 rounded-2xl glass-panel border border-white/10 flex items-center justify-between"
                >
                  <span className="text-xs font-mono font-bold text-[var(--accent-tint)] w-24">
                    {item.time}
                  </span>
                  <span className="text-xs sm:text-sm text-white font-medium flex-1 text-left">
                    {locale === "ta" ? item.activityTa : item.activityEn}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Attire & Accessibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-tint)] uppercase mb-1">
                <Shirt className="w-4 h-4" />
                <span>Dress Code</span>
              </div>
              <p className="text-xs text-slate-300">
                {locale === "ta" ? event.dressCodeTa : event.dressCodeEn}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-tint)] uppercase mb-1">
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
          <div className="rounded-3xl glass-panel-elevated p-6 border border-[var(--border-strong)] shadow-2xl space-y-6">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                Admission
              </span>
              <p className="text-2xl font-bold text-white font-mono mt-0.5">{event.price}</p>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--accent-tint)] shrink-0" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--accent-tint)] shrink-0" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[var(--accent-tint)] shrink-0 mt-0.5" />
                <span>{event.venueAddress}</span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href="https://linktr.ee/osutamilsangam"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClick}
                className="w-full py-3.5 rounded-2xl bg-[var(--accent-tint)] text-black font-bold text-xs hover:opacity-95 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Official Ticketing Portal (Linktree / Square)</span>
              </a>

              <button
                onClick={() => {
                  playClick();
                  setIsRsvpOpen(true);
                }}
                className="w-full py-3 rounded-2xl glass-panel border border-white/20 text-white font-semibold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4 text-[var(--accent-tint)]" />
                <span>RSVP for Event Updates & Group Rates</span>
              </button>

              <button
                onClick={handleDownloadIcs}
                className="w-full py-2.5 rounded-xl glass-panel border border-white/10 text-slate-300 text-xs font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[var(--accent-tint)]" />
                <span>Add to Calendar (.ics)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Notification & Group Rate Modal */}
      {isRsvpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-[var(--border-strong)] shadow-2xl relative text-left">
            <button
              onClick={() => setIsRsvpOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-mono"
            >
              ✕ Close
            </button>

            {!isConfirmed ? (
              <div>
                <h3 className="text-xl font-bold text-white mb-1 font-serif">
                  RSVP & Ticket Updates
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  {event.titleEn} · Ohio Union
                </p>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketName}
                      onChange={(e) => setTicketName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      BuckeyeMail or Personal Email
                    </label>
                    <input
                      type="email"
                      required
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      placeholder="name.#@buckeyemail.osu.edu"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Number of Attendees
                    </label>
                    <select
                      value={ticketCount}
                      onChange={(e) => setTicketCount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#111424] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-sans"
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
                    className="w-full py-3 rounded-xl bg-[var(--accent-tint)] text-black font-bold text-xs hover:opacity-95 transition-all shadow-md"
                  >
                    Submit RSVP
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-serif">
                  RSVP Received!
                </h3>
                <p className="text-xs text-slate-300">
                  Vanakkam {ticketName}! We have recorded your interest for {ticketCount} attendee(s). Check your inbox at {ticketEmail} for festival updates.
                </p>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 text-left space-y-1">
                  <p className="font-semibold text-white">Next Steps:</p>
                  <p>• Lock in your admission early via <a href="https://linktr.ee/osutamilsangam" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-tint)] underline">linktr.ee/osutamilsangam</a>.</p>
                  <p>• Bring your OSU BuckID on event day for student admission.</p>
                </div>

                <button
                  onClick={() => setIsRsvpOpen(false)}
                  className="px-6 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all"
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
