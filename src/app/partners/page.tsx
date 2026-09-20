"use client";

import React, { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { Handshake, Download, CheckCircle2 } from "lucide-react";

export default function PartnersPage() {
  const { locale } = useLocale();
  const { playClick, playBell } = useAudio();

  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("Corporate / Local Business Sponsorship");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const partners = [
    {
      name: "Tamil Thalaivas (TT)",
      type: "Student Org Collaborator",
      collaboration: "Co-host of Pattas Tappas Diwali 2025/2026 showcase and cultural dance medleys.",
      logoText: "TT",
    },
    {
      name: "Central Ohio Tamil Sangam (COTS)",
      type: "Community Partner",
      collaboration: "Youth mentorship, festival patron sponsorships, and community service food drives.",
      logoText: "COTS",
    },
    {
      name: "Saraga International Market",
      type: "Local Business Sponsor",
      collaboration: "Annual fresh sugarcane and banana leaf sponsor for Powerhouse Pongal.",
      logoText: "SIM",
    },
    {
      name: "Ohio Union Activities Board (OUAB)",
      type: "University Grant Partner",
      collaboration: "Co-sponsorship of campus diversity cultural performances in the Archie Griffin Ballroom.",
      logoText: "OUAB",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !contactEmail) return;
    playBell(880);
    setSubmitted(true);
  };

  const handleDownloadMediaKit = () => {
    playClick();
    const mediaKitText = `OSU TAMIL SANGAM - MEDIA KIT & SPONSORSHIP PROSPECTUS (2026-2027)
========================================================================
Mission: Celebrating Tamil heritage, performing arts, and student community at The Ohio State University.
Demographics: 500+ active event attendees, 1,200+ Instagram followers, 450+ member GroupMe.
Flagship Festivals:
  - Powerhouse Pongal (January) - 450 attendees in Ohio Union Performance Hall.
  - Pattas Tappas Diwali (November) - 500 attendees in Archie Griffin Ballroom.
  - Chithirai Thiruvizha (April) - Outdoor spring celebration on the South Oval.

Contact: president.osutamilsangam@gmail.com
Website: https://osutamilsangam.org
`;

    const blob = new Blob([mediaKitText], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "OSU_Tamil_Sangam_Media_Kit_2026.txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      {/* Header */}
      <div className="max-w-3xl mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
          Collaboration & Community Alliances
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight font-serif mb-4">
          {locale === "ta" ? "கூட்டாளர்கள் & புரவலர்கள்" : "Partners & Sponsors"}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {locale === "ta"
            ? "பல்கலைக்கழக மாணவர் அமைப்புகள், உள்ளூர் வணிக நிறுவனங்கள் மற்றும் மத்திய ஓஹியோ அமைப்புகளுடன் இணைந்து செயல்படுகிறோம்."
            : "We collaborate with student organizations, university bodies, local businesses, and community groups to bring the highest-caliber festivals and performing arts to Columbus."}
        </p>
      </div>

      {/* 1. Partners & Sponsors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-20">
        {partners.map((partner, idx) => (
          <div key={idx} className="glass-glow-card p-6 rounded-3xl border border-white/10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center font-serif font-bold text-base text-[var(--accent-tint)] shrink-0 shadow-md">
              {partner.logoText}
            </div>
            <div>
              <span className="text-[10px] font-mono text-[var(--accent-tint)] uppercase tracking-wider block mb-0.5">
                {partner.type}
              </span>
              <h3 className="text-lg font-bold text-white mb-1">{partner.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{partner.collaboration}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Media Kit & Partner With Us Form */}
      <div className="rounded-3xl glass-panel-elevated p-8 sm:p-12 border border-[var(--border-strong)] shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-tint)] uppercase mb-2">
              <Handshake className="w-4 h-4" />
              <span>Sponsorship & Co-Hosting</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              Partner With Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Reach hundreds of energetic undergraduate, graduate, and alumni Buckeyes across the Midwest. We offer branded festival banners, digital promotions, and catering partnerships.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="text-xs font-bold text-white">Media Kit & Sponsorship Deck</h4>
            <p className="text-xs text-slate-400">
              Download our audience numbers, festival sponsorship tiers, and demographic reach.
            </p>
            <button
              onClick={handleDownloadMediaKit}
              className="mt-2 px-4 py-2 rounded-xl bg-[var(--accent-tint)] text-black font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Media Kit (.txt)</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Organization or Business Name
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Columbus Indian Bistro"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="sponsor@business.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Partnership Category
                </label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#131728] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)]"
                >
                  <option value="Corporate / Local Business Sponsorship">Festival Title / Corporate Sponsorship</option>
                  <option value="Food & Catering Collaboration">Food Catering & Refreshment Vendor</option>
                  <option value="Student Org Co-Hosting">Student Organization Collaboration</option>
                  <option value="Community Mentorship">Community Mentorship & Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Message or Proposal
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How would you like to collaborate with OSU Tamil Sangam?"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[var(--accent-tint)] text-black font-bold text-xs hover:opacity-95 transition-all shadow-md"
              >
                Submit Partnership Inquiry →
              </button>
            </form>
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-serif">
                Inquiry Sent Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                Thank you, {orgName}! Our Treasurer and Executive Board will review your partnership inquiry and reach out to {contactEmail} within 48 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2 rounded-xl glass-panel text-xs text-white hover:bg-white/10 font-mono"
              >
                Send Another Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
