"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Search,
  Sparkles,
  ExternalLink
} from "lucide-react";

export default function HelpDeskPage() {
  const { locale } = useLocale();
  const { playClick, playBell } = useAudio();

  const [searchQuery, setSearchQuery] = useState("");
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const topics = [
    {
      id: "tickets",
      titleEn: "Tickets & Admission",
      titleTa: "நுழைவுச்சீட்டு விவரங்கள்",
      contentEn: "Tickets for Powerhouse Pongal and Pattas Tappas are sold via our Linktree / Square portal. Subsidized student rates are available with valid OSU BuckID.",
      contentTa: "பொங்கல் மற்றும் தீபாவளி நுழைவுச்சீட்டுகள் எங்கள் அதிகாரப்பூர்வ லிங்க்ட்ரீ தளம் வழியாக விற்கப்படுகின்றன. மாணவர்களுக்கு சலுகைக் கட்டணம் உண்டு.",
      actionLabel: "View Events & Tickets",
      actionHref: "/events",
    },
    {
      id: "join",
      titleEn: "Joining the Sangam",
      titleTa: "சங்கத்தில் இணைதல்",
      contentEn: "OSU Tamil Sangam has no membership dues or prerequisites. All undergraduate, graduate, and professional students of all cultural backgrounds are warmly welcomed.",
      contentTa: "சங்கத்தில் இணைய கட்டணம் எதுவும் இல்லை. அனைத்து மாணவர்களுக்கும் கதவுகள் திறந்திருக்கின்றன.",
      actionLabel: "Join Official GroupMe",
      actionHref: "/join",
    },
    {
      id: "auditions",
      titleEn: "Dance & Music Auditions",
      titleTa: "நடனம் & இசைப் பயிற்சிகள்",
      contentEn: "Open auditions for Aatam (Dance) and Paatam (Music) take place at the start of each semester. We field classical Bharatanatyam, Kuthu, live bands, and folk percussion.",
      contentTa: "ஒவ்வொரு பருவத்தின் தொடக்கத்திலும் நடன மற்றும் இசைத் தேர்வுகள் நடைபெறும். பரதநாட்டியம், குத்து மற்றும் நேரடி இசைக் குழுக்கள் செயல்படுகின்றன.",
      actionLabel: "Submit Performer Interest",
      actionHref: "/join#performer",
    },
    {
      id: "columbus",
      titleEn: "Columbus South Asian Guide",
      titleTa: "கொலம்பஸ் வழிகாட்டி",
      contentEn: "Need recommendations for fresh curry leaves, idli rice, or crispy ghee roast dosas? Check out Dosa Corner on Henderson Rd, Saraga on Morse Rd, and Patel Brothers on Sawmill.",
      contentTa: "கொலம்பஸில் தோசை கார்னர், சரகா, மற்றும் பட்டேல் பிரதர்ஸ் சிறந்த மளிகை மற்றும் உணவகங்களாகும்.",
      actionLabel: "Explore Columbus Guide",
      actionHref: "/resources",
    },
    {
      id: "leadership",
      titleEn: "Leadership & Volunteer Roles",
      titleTa: "தலைமை & தன்னார்வலர் பொறுப்புகள்",
      contentEn: "Want to get involved behind the scenes? We recruit student leads for choreography, graphic design, photography, event logistics, and freshman welcoming.",
      contentTa: "விழா ஒருங்கிணைப்பு, வடிவமைப்பு மற்றும் வரவேற்புக் குழுக்களில் இணைந்து செயலாற்றலாம்.",
      actionLabel: "Meet the Board & Committees",
      actionHref: "/board",
    },
  ];

  const filteredTopics = topics.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.titleEn.toLowerCase().includes(q) ||
      t.contentEn.toLowerCase().includes(q) ||
      t.titleTa.includes(q) ||
      t.contentTa.includes(q)
    );
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail || !inquiryMessage) return;
    playBell(880);
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
          Help Desk & Student Inquiries
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight font-serif mb-4">
          {locale === "ta" ? "கேளுங்கள் · சங்க உதவி அரங்கம்" : "Ask Sangam: Help Desk & FAQ"}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {locale === "ta"
            ? "நிகழ்வுகள், நுழைவுச்சீட்டுகள், நடனத் தேர்வுகள், அல்லது கொலம்பஸில் மாணவர் வாழ்க்கை குறித்து அடிக்கடி கேட்கப்படும் கேள்விகள் மற்றும் நேரடித் தொடர்பு."
            : "Direct answers to questions about festivals, tickets, auditions, and living in Columbus as a Tamil student at Ohio State."}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative w-full mb-12">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search topics (e.g., 'tickets', 'auditions', 'dues', 'dosa', 'groupme')..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-white text-sm outline-none focus:border-[var(--accent-tint)] font-sans"
        />
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="p-6 rounded-3xl glass-panel-elevated border border-white/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-tint)] uppercase mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{locale === "ta" ? topic.titleTa : topic.titleEn}</span>
              </div>
              <h3 className="text-lg font-bold font-serif text-white mb-2">
                {locale === "ta" ? topic.titleTa : topic.titleEn}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                {locale === "ta" ? topic.contentTa : topic.contentEn}
              </p>
            </div>

            <div>
              <Link
                href={topic.actionHref}
                onClick={playClick}
                className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[var(--accent-tint)] hover:underline"
              >
                <span>{topic.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Direct Inquiry Contact Box */}
      <div className="p-8 sm:p-10 rounded-3xl glass-panel-elevated border border-[var(--border-strong)] shadow-2xl">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] mb-2">
            <Mail className="w-4 h-4" />
            <span>Direct Officer Contact</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white mb-2">
            {locale === "ta" ? "நேரடியாகத் தொடர்பு கொள்க" : "Have a Specific Question?"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
            Reach out directly to the executive board. You can also message our official email at <span className="text-white font-mono">osutamilsangam@gmail.com</span> or DM on Instagram <span className="text-[var(--accent-tint)] font-mono">@osutamilsangam</span>.
          </p>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold">Vanakkam {inquiryName}, your inquiry has been sent!</p>
                <p className="text-xs text-emerald-400/80">An executive board member will reply to {inquiryEmail} shortly.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="First & Last Name"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="name.#@osu.edu"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Message or Question</label>
                <textarea
                  rows={3}
                  required
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Ask about rideshares, rehearsals, ticket transfers, or club initiatives..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-sans resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-[var(--accent-tint)] text-black font-bold text-xs hover:opacity-95 transition-all shadow-md flex items-center gap-2"
              >
                <span>Send Message to Executive Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
