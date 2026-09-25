"use client";

import React, { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { MEMBERSHIP_GOVERNANCE } from "@/data/constitution";
import { 
  Check, 
  Copy, 
  QrCode, 
  ArrowRight, 
  CheckCircle2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { PalagaiButton } from "@/components/ui/PalagaiButton";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const groupMeUrl = "https://groupme.com/join_group/osutamilsangam";

  const handleCopyGroupMe = () => {
    playClick();
    navigator.clipboard.writeText(groupMeUrl);
    setCopiedGroupMe(true);
    setTimeout(() => setCopiedGroupMe(false), 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setSubmitError("");
    playClick();

    try {
      const res = await fetch("/api/stay-in-sangam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          interests: [
            activeFormTab === "member" ? "general-membership" : `performer-${interestRole.toLowerCase()}`,
            major.trim() || "general-student",
          ],
          source: `join-${activeFormTab}`,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        playBell(880);
        setSubmitted(true);
      } else {
        setSubmitError(data.error || "Unable to process application. Please check your email and try again.");
      }
    } catch {
      setSubmitError("Network connection error. Please try again shortly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left font-body">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#250d38] tracking-tight font-display mb-4">
          {locale === "ta" ? "சங்கத்தில் இணையுங்கள்" : "Join the Sangam Family"}
        </h1>
        <p className="text-sm sm:text-base text-[#250d38] font-medium leading-relaxed font-body">
          {locale === "ta"
            ? "நீங்கள் எந்த மொழி பேசினாலும் சரி — எங்களோடு இணைந்திருங்கள்; நல்ல உணவு, இசை, மற்றும் நட்பைக் கொண்டாடுங்கள். அனைவரும் வரவேற்கப்படுகிறார்கள்!"
            : "Whether you are an incoming freshman, transfer, graduate student, or friend who loves the culture — find your people. Open year-round, 100% free membership, and welcoming to students of all languages and backgrounds!"}
        </p>
      </div>

      {/* 1. Official Membership & Governance Rules Card */}
      <div className="box-architectural-dark p-6 sm:p-8 border-2 border-white/20 shadow-[5px_5px_0px_#4c2472] mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-white font-display mb-4">
          {locale === "ta" ? "உறுப்பினர் விதிகள் & தகுதிகள்" : "Membership Guidelines & Voting Rights"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 border-2 border-white/10 bg-black/40 space-y-2 shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
            <span className="font-mono text-[#55CCA2] font-semibold block uppercase">
              01 · Student Composition
            </span>
            <p className="leading-relaxed font-body">
              {locale === "ta" ? MEMBERSHIP_GOVERNANCE.studentQuotaTa : MEMBERSHIP_GOVERNANCE.studentQuotaEn}
            </p>
            <p className="text-[11px] text-slate-400 font-body">
              Open year-round to all undergraduate and graduate students across all disciplines.
            </p>
          </div>

          <div className="p-4 border-2 border-white/10 bg-black/40 space-y-2 shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
            <span className="font-mono text-emerald-400 font-semibold block uppercase">
              02 · Voting & Shadowing
            </span>
            <p className="leading-relaxed font-medium text-slate-200 font-body">
              {locale === "ta" ? MEMBERSHIP_GOVERNANCE.votingRequirementTa : MEMBERSHIP_GOVERNANCE.votingRequirementEn}
            </p>
          </div>

          <div className="p-4 border-2 border-white/10 bg-black/40 space-y-2 shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
            <span className="font-mono text-sky-400 font-semibold block uppercase">
              03 · Community Members
            </span>
            <p className="leading-relaxed font-body">
              {locale === "ta" ? MEMBERSHIP_GOVERNANCE.communityPolicyTa : MEMBERSHIP_GOVERNANCE.communityPolicyEn}
            </p>
          </div>
        </div>
      </div>

      {/* 2. GroupMe Interstitial & Gateway Panel */}
      <div className="box-ticket p-8 sm:p-12 bg-[#160d26] border-2 border-[#55CCA2] shadow-[6px_6px_0px_#55CCA2] mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            {locale === "ta" ? "குரூப்மீயில் இணைந்திருங்கள்" : "Connect on our Official GroupMe"}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
            {locale === "ta"
              ? "நிகழ்வுகள், இலவச உணவு அறிவிப்புகள், மற்றும் சக மாணவர்களுடன் கலந்துரையாட எங்கள் பிரதான குரூப்மீ குழுவில் இணையுங்கள்."
              : "Our GroupMe is the heartbeat of day-to-day announcements, dinner gatherings, rideshares, ticket early-bird access, and study groups across campus."}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <PalagaiButton
              href={groupMeUrl}
              target="_blank"
              rel="noopener noreferrer"
              primaryText={locale === "ta" ? "குரூப்மீயில் இணைக" : "Open GroupMe in App"}
              secondaryText={locale === "ta" ? "Open GroupMe in App" : "குரூப்மீயில் இணைக"}
              variant="mint"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            />

            <button
              onClick={handleCopyGroupMe}
              className="px-4 py-3 border-2 border-white/20 bg-white/5 text-white text-xs font-mono uppercase tracking-wider hover:bg-white/10 hover:border-[#55CCA2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 active:translate-x-0.5 active:translate-y-0.5 transition-[border-color,background-color,transform] duration-150 flex items-center gap-2 cursor-pointer"
            >
              {copiedGroupMe ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedGroupMe ? "Copied Link!" : "Copy Invite Link"}</span>
            </button>
          </div>
        </div>

        {/* QR Code Card for Flyer Scanning */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="p-6 border-2 border-white/20 bg-black/50 text-center shadow-[3px_3px_0px_rgba(0,0,0,0.5)]">
            <QrCode className="w-32 h-32 mx-auto text-[#55CCA2] mb-3" />
            <p className="text-xs font-mono text-slate-300 font-bold uppercase">Scan to Join GroupMe</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">groupme.com/join_group</p>
          </div>
        </div>
      </div>

      {/* 3. Interactive Interest Forms (Membership vs Performer) */}
      <div id="performer" className="box-ticket p-8 sm:p-12 bg-[#160d26] border-2 border-white/20 shadow-[6px_6px_0px_#4c2472]">
        <div className="box-tab-strip inline-flex items-center gap-2 mb-8 p-1.5 border-2 border-white/10">
          <button
            onClick={() => {
              playClick();
              setActiveFormTab("member");
              setSubmitted(false);
            }}
            className={`box-tab-item px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold transition-all ${
              activeFormTab === "member"
                ? "box-tab-item-active"
                : "text-slate-400 hover:text-white"
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
            className={`box-tab-item px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold transition-all ${
              activeFormTab === "performer"
                ? "box-tab-item-active"
                : "text-slate-400 hover:text-white"
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
              <label htmlFor="join-full-name" className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Full Name
              </label>
              <input
                id="join-full-name"
                name="full_name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Sundaram"
                className="w-full px-4 py-3 bg-black/50 border-2 border-white/20 text-white text-xs outline-none focus:border-[#55CCA2] font-body"
              />
            </div>

            <div>
              <label htmlFor="join-email" className="block text-xs font-mono uppercase text-slate-300 mb-1">
                BuckeyeMail or Email
              </label>
              <input
                id="join-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sundaram.123@osu.edu"
                className="w-full px-4 py-3 bg-black/50 border-2 border-white/20 text-white text-xs outline-none focus:border-[#55CCA2] font-body"
              />
            </div>

            <div>
              <label htmlFor="join-major" className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Academic Major & Standing
              </label>
              <input
                id="join-major"
                name="major"
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Data Analytics, Sophomore"
                className="w-full px-4 py-3 bg-black/50 border-2 border-white/20 text-white text-xs outline-none focus:border-[#55CCA2] font-body"
              />
            </div>

            {activeFormTab === "performer" && (
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Primary Artistic Discipline
                </label>
                <select
                  value={interestRole}
                  onChange={(e) => setInterestRole(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f0b18] border-2 border-white/20 text-white text-xs outline-none focus:border-[#55CCA2] font-body"
                >
                  <option value="Aatam (Dance)">Aatam · Classical / Fusion / Kuthu Dance</option>
                  <option value="Paatam (Vocal)">Paatam · Classical / Cinematic Vocals</option>
                  <option value="Paatam (Instruments)">Paatam · Instrumental (Veena, Flute, Mridangam, Guitar)</option>
                  <option value="Parai Attam">Parai Attam · Campus Folk Percussion Ensemble</option>
                  <option value="Emcee & Stage">Emcee, Backstage Coordination & Visuals</option>
                </select>
              </div>
            )}

            {submitError && (
              <div className="p-3 bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <PalagaiButton
              type="submit"
              disabled={isSubmitting}
              primaryText={isSubmitting ? "Submitting Application..." : (locale === "ta" ? "விண்ணப்பத்தை அனுப்புக →" : "Submit Application →")}
              secondaryText={isSubmitting ? "அனுப்பப்படுகிறது..." : (locale === "ta" ? "Submit Application →" : "விண்ணப்பத்தை அனுப்புக →")}
              variant="mint"
              size="md"
              icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
            />
          </form>
        ) : (
          <div className="py-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 border-2 border-emerald-400 bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[3px_3px_0px_#10b981]">
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
              className="px-5 py-2.5 bg-white/10 border-2 border-white/20 text-xs text-white font-mono uppercase tracking-wider hover:bg-white/20 font-body"
            >
              Submit Another Response
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
