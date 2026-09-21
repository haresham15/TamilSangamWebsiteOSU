"use client";

import React, { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { MEMBERSHIP_GOVERNANCE } from "@/data/constitution";
import { 
  MessageCircle, 
  Check, 
  Copy, 
  QrCode, 
  ArrowRight, 
  CheckCircle2,
  Users,
  Award,
  Scale
} from "lucide-react";

export default function JoinPage() {
  const { locale } = useLocale();
  const { playClick, playBell } = useAudio();

  const [copiedGroupMe, setCopiedGroupMe] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<"member" | "performer">("member");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [major, setMajor] = useState("");
  const [interestRole, setInterestRole] = useState("Aatam (Dance)");
  const [submitted, setSubmitted] = useState(false);

  const groupMeUrl = "https://groupme.com/join_group/osutamilsangam";

  const handleCopyGroupMe = () => {
    playClick();
    navigator.clipboard.writeText(groupMeUrl);
    setCopiedGroupMe(true);
    setTimeout(() => setCopiedGroupMe(false), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    playBell(880);
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left font-body">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
          Kurinji (குறிஞ்சி) · Mountain Highs, Stars & Belonging
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight font-display mb-4">
          {locale === "ta" ? "சங்கத்தில் இணையுங்கள்" : "Join the Sangam Family"}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body">
          {locale === "ta"
            ? "நீங்கள் புதிய மாணவராக இருந்தாலும், பழைய மாணவராக இருந்தாலும் சரி — எங்களோடு இணைந்திருங்கள்; நட்பையும் கலைகளையும் கொண்டாடுங்கள்."
            : "Whether you are an incoming freshman, graduate student, or community member, find your people. Open year-round, 100% free general membership, and everyone is welcome."}
        </p>
      </div>

      {/* 1. Official Membership & Governance Rules Card */}
      <div className="rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-white/10 shadow-2xl mb-12">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] mb-3">
          <Scale className="w-4 h-4" />
          <span>Constitutional Membership Requirements</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white font-display mb-4">
          {locale === "ta" ? "உறுப்பினர் விதிகள் & தகுதிகள்" : "Membership Guidelines & Voting Rights"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <span className="font-mono text-[var(--accent-tint)] font-semibold block uppercase">
              01 · Student Composition
            </span>
            <p className="leading-relaxed">
              {locale === "ta" ? MEMBERSHIP_GOVERNANCE.studentQuotaTa : MEMBERSHIP_GOVERNANCE.studentQuotaEn}
            </p>
            <p className="text-[11px] text-slate-400">
              Open year-round to all undergraduate and graduate students across all disciplines.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <span className="font-mono text-emerald-400 font-semibold block uppercase">
              02 · Voting & Shadowing
            </span>
            <p className="leading-relaxed font-medium text-slate-200">
              {locale === "ta" ? MEMBERSHIP_GOVERNANCE.votingRequirementTa : MEMBERSHIP_GOVERNANCE.votingRequirementEn}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <span className="font-mono text-sky-400 font-semibold block uppercase">
              03 · Community Members
            </span>
            <p className="leading-relaxed">
              {locale === "ta" ? MEMBERSHIP_GOVERNANCE.communityPolicyTa : MEMBERSHIP_GOVERNANCE.communityPolicyEn}
            </p>
          </div>
        </div>
      </div>

      {/* 2. GroupMe Interstitial & Gateway Panel */}
      <div className="rounded-3xl glass-panel-elevated p-8 sm:p-12 border border-[var(--border-strong)] shadow-2xl mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <MessageCircle className="w-4 h-4" />
            <span>Official Chat Hub</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            {locale === "ta" ? "குரூப்மீயில் இணைந்திருங்கள்" : "Connect on our Official GroupMe"}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
            {locale === "ta"
              ? "நிகழ்வுகள், இலவச உணவு அறிவிப்புகள், மற்றும் சக மாணவர்களுடன் கலந்துரையாட எங்கள் பிரதான குரூப்மீ குழுவில் இணையுங்கள்."
              : "Our GroupMe is the heartbeat of day-to-day announcements, dinner gatherings, rideshares, ticket early-bird access, and study groups across campus."}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={groupMeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClick}
              className="px-6 py-3 rounded-2xl bg-[var(--accent-tint)] text-black font-bold text-xs hover:opacity-95 transition-all shadow-md flex items-center gap-2"
            >
              <span>Open GroupMe in App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleCopyGroupMe}
              className="px-4 py-3 rounded-2xl glass-panel border border-white/15 text-white text-xs font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              {copiedGroupMe ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedGroupMe ? "Copied Link!" : "Copy Invite Link"}</span>
            </button>
          </div>
        </div>

        {/* QR Code Card for Flyer Scanning */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="p-6 rounded-3xl bg-[var(--surface-sunken)] border border-white/10 text-center shadow-inner">
            <QrCode className="w-32 h-32 mx-auto text-[var(--accent-tint)] mb-3" />
            <p className="text-xs font-mono text-slate-300">Scan to Join GroupMe</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">groupme.com/join_group</p>
          </div>
        </div>
      </div>

      {/* 3. Interactive Interest Forms (Membership vs Performer) */}
      <div id="performer" className="rounded-3xl glass-panel-elevated p-8 sm:p-12 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
          <button
            onClick={() => {
              playClick();
              setActiveFormTab("member");
              setSubmitted(false);
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              activeFormTab === "member"
                ? "bg-[var(--accent-tint)] text-black border-transparent shadow-md"
                : "glass-panel text-slate-300 border-white/10 hover:border-white/20"
            }`}
          >
            General Membership Form
          </button>
          <button
            onClick={() => {
              playClick();
              setActiveFormTab("performer");
              setSubmitted(false);
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              activeFormTab === "performer"
                ? "bg-[var(--accent-tint)] text-black border-transparent shadow-md"
                : "glass-panel text-slate-300 border-white/10 hover:border-white/20"
            }`}
          >
            Performer Interest (Aatam & Paatam)
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleFormSubmit} className="space-y-6 max-w-xl">
            <div>
              <h3 className="text-xl font-bold text-white font-display mb-1">
                {activeFormTab === "member" ? "Join General Membership" : "Performer Audition & Interest Form"}
              </h3>
              <p className="text-xs text-slate-400 font-body">
                {activeFormTab === "member"
                  ? "Receive our bi-weekly updates and event invitations."
                  : "Audition for dance troupes, fusion band, emceeing, or backstage production."}
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Sundaram"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-body"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                BuckeyeMail or Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sundaram.123@osu.edu"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-body"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Academic Major & Standing
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Data Analytics, Sophomore"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-body"
              />
            </div>

            {activeFormTab === "performer" && (
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Primary Artistic Discipline
                </label>
                <select
                  value={interestRole}
                  onChange={(e) => setInterestRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-sunken)] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-body"
                >
                  <option value="Aatam (Dance)">Aatam · Classical / Fusion / Kuthu Dance</option>
                  <option value="Paatam (Vocal)">Paatam · Classical / Cinematic Vocals</option>
                  <option value="Paatam (Instruments)">Paatam · Instrumental (Veena, Flute, Mridangam, Guitar)</option>
                  <option value="Parai Attam">Parai Attam · Campus Folk Percussion Ensemble</option>
                  <option value="Emcee & Stage">Emcee, Backstage Coordination & Visuals</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-[var(--accent-tint)] text-black font-bold text-xs hover:opacity-95 transition-all shadow-md"
            >
              Submit Application →
            </button>
          </form>
        ) : (
          <div className="py-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-display">
              Vanakkam, {name}! Application Received!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
              We have recorded your details for the {activeFormTab === "member" ? "general membership" : "performer troupe"}. Keep an eye on your email for the next rehearsal and mixer dates!
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-5 py-2 rounded-xl glass-panel text-xs text-white font-semibold hover:bg-white/10 font-body"
            >
              Submit Another Response
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
