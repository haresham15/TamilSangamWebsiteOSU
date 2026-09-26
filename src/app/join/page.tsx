"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { MEMBERSHIP_GOVERNANCE } from "@/data/constitution";
import {
  Check,
  Copy,
  QrCode,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  User,
  Mail,
  BookOpen,
  Calendar,
  Compass,
} from "lucide-react";
import { PalagaiButton } from "@/components/ui/PalagaiButton";
import { HeroToContentBridge } from "@/components/shared/HeroToContentBridge";

// Dynamically load 3D Nanban Campus Arch hero without SSR
const JoinHeroCanvas = dynamic(
  () => import("@/components/join/JoinHeroCanvas").then((m) => m.JoinHeroCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[60dvh] bg-[#FFF3DC] flex flex-col items-center justify-center text-[#250d38] font-mono text-xs gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#55CCA2] animate-pulse" />
          <span className="tracking-widest uppercase font-bold">
            OPENING THE NANBAN GATES OF BELONGING...
          </span>
        </div>
      </div>
    ),
  }
);

export default function JoinPage() {
  const { locale } = useLocale();
  const { playClick, playBell } = useAudio();

  const [copiedGroupMe, setCopiedGroupMe] = useState(false);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [major, setMajor] = useState("");
  const [gradYear, setGradYear] = useState("2028");
  const [membershipType, setMembershipType] = useState<"general" | "performer" | "committee">("general");
  const [selectedCommittees, setSelectedCommittees] = useState<string[]>([]);
  const [performerDiscipline, setPerformerDiscipline] = useState("Aatam (Dance)");
  const [notes, setNotes] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const groupMeUrl = "https://groupme.com/join_group/osutamilsangam";

  const handleCopyGroupMe = () => {
    playClick();
    navigator.clipboard.writeText(groupMeUrl);
    setCopiedGroupMe(true);
    setTimeout(() => setCopiedGroupMe(false), 2000);
  };

  const handleSkipToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    playClick();
    const target = document.getElementById("membership-form");
    if (target) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      target.focus({ preventScroll: true });
    }
  };

  const toggleCommittee = (comm: string) => {
    playClick();
    setSelectedCommittees((prev) =>
      prev.includes(comm) ? prev.filter((c) => c !== comm) : [...prev, comm]
    );
  };

  const validateStep = (step: 1 | 2): boolean => {
    setStepError("");
    if (step === 1) {
      if (!name.trim()) {
        setStepError(locale === "ta" ? "உங்கள் முழு பெயரை உள்ளிடவும்." : "Please enter your full name.");
        return false;
      }
      if (!email.trim() || !email.includes("@")) {
        setStepError(
          locale === "ta"
            ? "செல்லுபடியாகும் மின்னஞ்சல் அல்லது BuckeyeMail முகவரியை உள்ளிடவும்."
            : "Please enter a valid BuckeyeMail or email address."
        );
        return false;
      }
    }
    if (step === 2) {
      if (!major.trim()) {
        setStepError(
          locale === "ta"
            ? "உங்கள் கல்வித் துறை அல்லது பாடத்திட்டத்தை உள்ளிடவும்."
            : "Please enter your major or degree program."
        );
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep(1)) {
      playClick();
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep(2)) {
      playClick();
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    playClick();
    setStepError("");
    if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setCurrentStep(1);
      validateStep(1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    playClick();

    const interestsList = [
      `membership-${membershipType}`,
      `grad-${gradYear}`,
      major.trim(),
      ...selectedCommittees.map((c) => `committee-${c.toLowerCase()}`),
    ];
    if (membershipType === "performer") {
      interestsList.push(`performer-${performerDiscipline.toLowerCase()}`);
    }
    if (notes.trim()) {
      interestsList.push(`note-${notes.slice(0, 80).trim()}`);
    }

    try {
      const res = await fetch("/api/stay-in-sangam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          interests: interestsList,
          source: `join-multistep-${membershipType}`,
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
    <div className="w-full min-h-screen bg-[#FFFBF3] text-left font-body relative">
      {/* ========================================================================= */}
      {/* 1. 3D NANBAN CAMPUS ARCH HERO (§0–§14: 120vh Pin with Morning Volumetrics)*/}
      {/* ========================================================================= */}
      <section aria-label="Nanban Campus Arch" className="relative w-full overflow-hidden bg-[#0c0806]">
        <JoinHeroCanvas />
        {/* Token-driven Oklab DOM bridge to contentBg */}
        <HeroToContentBridge fadeColor="#FFF3DC" contentBg="#FFFBF3" heightPct={16} />
      </section>

      {/* ========================================================================= */}
      {/* 2. EDITORIAL MEMBERSHIP SECTION & ACCESSIBLE APPLICATION FORM             */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-24">
      {/* 0. Persistent Accessible Skip Link (Present from p=0 for high-conversion flow) */}
      <aside aria-label="Quick Actions" className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 bg-[#160d26]/90 border-2 border-[#55CCA2] shadow-[4px_4px_0px_#55CCA2] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#55CCA2] animate-pulse" />
            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              <strong className="text-white font-mono uppercase tracking-wider">
                {locale === "ta" ? "2026–2027 உறுப்பினர் சேர்க்கை திறக்கப்பட்டுள்ளது" : "2026–2027 Membership Open"}
              </strong>{" "}
              · {locale === "ta" ? "100% இலவசம்" : "100% Free · No Dues"}
            </p>
          </div>

          <a
            id="join-now-skip-link"
            href="#membership-form"
            onClick={handleSkipToForm}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#55CCA2] text-[#160d26] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#6ee7b7] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#160d26] active:translate-x-0.5 active:translate-y-0.5 transition-transform"
          >
            <span>{locale === "ta" ? "இப்போதே இணையுங்கள் ↓" : "Join Now ↓"}</span>
            <span className="text-[10px] opacity-75 font-body hidden md:inline">
              {locale === "ta" ? "(படிவத்திற்குச் செல்க)" : "(Skip intro)"}
            </span>
          </a>
        </div>
      </aside>

      {/* Header */}
      <header className="max-w-3xl mb-12">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#250d38] tracking-tight font-display mb-4">
          {locale === "ta" ? "சங்கத்தில் இணையுங்கள்" : "Join the Sangam Family"}
        </h1>
        <p className="text-sm sm:text-base text-[#250d38] font-medium leading-relaxed font-body">
          {locale === "ta"
            ? "நீங்கள் எந்த மொழி பேசினாலும் சரி — எங்களோடு இணைந்திருங்கள்; நல்ல உணவு, இசை, மற்றும் நட்பைக் கொண்டாடுங்கள். அனைவரும் வரவேற்கப்படுகிறார்கள்!"
            : "Whether you are an incoming freshman, transfer, graduate student, or friend who loves the culture — find your people. Open year-round, 100% free membership, and welcoming to students of all languages and backgrounds!"}
        </p>
      </header>

      {/* 1. Official Membership & Governance Rules Card */}
      <section aria-labelledby="membership-rules-heading" className="box-architectural-dark p-6 sm:p-8 border-2 border-white/20 shadow-[5px_5px_0px_#4c2472] mb-12">
        <h2 id="membership-rules-heading" className="text-xl sm:text-2xl font-bold text-white font-display mb-4">
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
      </section>

      {/* 2. GroupMe Interstitial & Gateway Panel */}
      <section aria-labelledby="groupme-heading" className="box-ticket p-8 sm:p-12 bg-[#160d26] border-2 border-[#55CCA2] shadow-[6px_6px_0px_#55CCA2] mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <h2 id="groupme-heading" className="text-2xl sm:text-3xl font-bold text-white font-display">
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
              type="button"
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
      </section>

      {/* 3. Editorial Multi-Step Membership Form (The Target Destination) */}
      <section
        id="membership-form"
        tabIndex={-1}
        aria-labelledby="form-heading"
        className="box-ticket p-6 sm:p-10 lg:p-12 bg-[#160d26] border-2 border-white/20 shadow-[6px_6px_0px_#4c2472] outline-none focus:ring-2 focus:ring-[#55CCA2]"
      >
        <div className="border-b border-white/10 pb-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#55CCA2] block mb-1">
                {locale === "ta" ? "படிவம் · சேர்க்கை" : "Official Enrollment"}
              </span>
              <h2 id="form-heading" className="text-2xl sm:text-3xl font-bold text-white font-display">
                {locale === "ta" ? "மாணவர் உறுப்பினர் விண்ணப்பம்" : "Collegiate Membership Application"}
              </h2>
            </div>

            {/* Step Indicator Badges */}
            <nav aria-label="Application Progress" className="flex items-center gap-2">
              {[
                { num: 1, label: "Identity" },
                { num: 2, label: "Academics" },
                { num: 3, label: "Interests" },
              ].map((s) => (
                <div
                  key={s.num}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono uppercase tracking-wider transition-colors ${
                    currentStep === s.num
                      ? "border-[#55CCA2] bg-[#55CCA2]/10 text-[#55CCA2] font-bold"
                      : currentStep > s.num
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : "border-white/10 bg-black/30 text-slate-400"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-white/10">
                    {currentStep > s.num ? "✓" : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {!submitted ? (
          <form onSubmit={handleFormSubmit} className="space-y-8 max-w-2xl">
            {/* STEP 1: Buckeye Identification */}
            {currentStep === 1 && (
              <fieldset className="space-y-6">
                <legend className="text-lg font-bold text-white font-display mb-1 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#55CCA2]" />
                  <span>Step 1 of 3: Buckeye Identification & Contact</span>
                </legend>
                <p className="text-xs text-slate-400 font-body">
                  We use your Ohio State credentials to send invites to general body meetings, workshops, and exclusive member announcements.
                </p>

                <div>
                  <label htmlFor="join-full-name" className="block text-xs font-mono uppercase text-slate-300 mb-2">
                    Full Legal / Preferred Name <span className="text-[#55CCA2]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="join-full-name"
                      name="full_name"
                      type="text"
                      required
                      aria-required="true"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya Sundaram"
                      className="w-full pl-10 pr-4 py-3 bg-black/50 border-2 border-white/20 text-white text-xs outline-none focus:border-[#55CCA2] font-body transition-colors"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label htmlFor="join-email" className="block text-xs font-mono uppercase text-slate-300 mb-2">
                    BuckeyeMail (@osu.edu) or Personal Email <span className="text-[#55CCA2]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="join-email"
                      name="email"
                      type="email"
                      required
                      aria-required="true"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sundaram.123@osu.edu"
                      className="w-full pl-10 pr-4 py-3 bg-black/50 border-2 border-white/20 text-white text-xs outline-none focus:border-[#55CCA2] font-body transition-colors"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </fieldset>
            )}

            {/* STEP 2: Academic Standing */}
            {currentStep === 2 && (
              <fieldset className="space-y-6">
                <legend className="text-lg font-bold text-white font-display mb-1 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#55CCA2]" />
                  <span>Step 2 of 3: Academic Standing & Graduation Cohort</span>
                </legend>
                <p className="text-xs text-slate-400 font-body">
                  Connecting members across majors enables mentorship, study cohorts, and career shadow programs.
                </p>

                <div>
                  <label htmlFor="join-major" className="block text-xs font-mono uppercase text-slate-300 mb-2">
                    Academic Major & Specialization <span className="text-[#55CCA2]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="join-major"
                      name="major"
                      type="text"
                      required
                      aria-required="true"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="e.g. Computer Science & Engineering, Pre-Med, Business"
                      className="w-full pl-10 pr-4 py-3 bg-black/50 border-2 border-white/20 text-white text-xs outline-none focus:border-[#55CCA2] font-body transition-colors"
                    />
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label htmlFor="join-grad-year" className="block text-xs font-mono uppercase text-slate-300 mb-2">
                    Expected Graduation Year
                  </label>
                  <div className="relative">
                    <select
                      id="join-grad-year"
                      name="grad_year"
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#0f0b18] border-2 border-white/20 text-white text-xs outline-none focus:border-[#55CCA2] font-body transition-colors cursor-pointer"
                    >
                      <option value="2025">Class of 2025 (Senior)</option>
                      <option value="2026">Class of 2026 (Junior)</option>
                      <option value="2027">Class of 2027 (Sophomore)</option>
                      <option value="2028">Class of 2028 (Freshman)</option>
                      <option value="2029+">Class of 2029+ / Direct Admit</option>
                      <option value="Graduate">Graduate / PhD Student</option>
                      <option value="Alumni">OSU Alumni / Community Supporter</option>
                    </select>
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </fieldset>
            )}

            {/* STEP 3: Committee & Artistic Interests */}
            {currentStep === 3 && (
              <fieldset className="space-y-6">
                <legend className="text-lg font-bold text-white font-display mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#55CCA2]" />
                  <span>Step 3 of 3: Sangam Involvement & Special Tracks</span>
                </legend>
                <p className="text-xs text-slate-400 font-body">
                  Choose how you would like to participate in Ohio State Tamil Sangam activities this year.
                </p>

                {/* Membership Category Selection */}
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
                    Primary Participation Track
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "general", label: "General Member", desc: "Events, dinners, community" },
                      { id: "committee", label: "Executive Track", desc: "Committees & shadowing" },
                      { id: "performer", label: "Performer Troupe", desc: "Dance, vocals, instruments" },
                    ].map((track) => (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => {
                          playClick();
                          setMembershipType(track.id as "general" | "performer" | "committee");
                        }}
                        className={`p-3 text-left border-2 transition-all cursor-pointer ${
                          membershipType === track.id
                            ? "border-[#55CCA2] bg-[#55CCA2]/15 text-white shadow-[3px_3px_0px_#55CCA2]"
                            : "border-white/10 bg-black/40 text-slate-300 hover:border-white/30"
                        }`}
                      >
                        <span className="font-mono text-xs uppercase font-bold block mb-0.5">
                          {track.label}
                        </span>
                        <span className="text-[11px] text-slate-400 leading-tight block">
                          {track.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Committees Checkbox Group */}
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
                    Committee Shadowing & Interest (Optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { id: "cultural", name: "Cultural & Festivities", desc: "Pongal, Deepavali, Tamil New Year" },
                      { id: "logistics", name: "Events & Logistics", desc: "Venues, catering, ticket checks" },
                      { id: "marketing", name: "Media & Design", desc: "Flyers, photography, social reels" },
                      { id: "tech", name: "Tech & Web Platform", desc: "Site architecture & tools" },
                      { id: "outreach", name: "Community & Alumni", desc: "Columbus diaspora & charities" },
                    ].map((c) => {
                      const active = selectedCommittees.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleCommittee(c.id)}
                          className={`p-2.5 text-left border transition-all flex items-start gap-2.5 cursor-pointer ${
                            active
                              ? "border-[#55CCA2] bg-[#55CCA2]/10 text-white"
                              : "border-white/10 bg-black/30 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 shrink-0 border mt-0.5 flex items-center justify-center text-[10px] ${
                              active ? "border-[#55CCA2] bg-[#55CCA2] text-[#160d26]" : "border-white/30"
                            }`}
                          >
                            {active && "✓"}
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold block text-white">{c.name}</span>
                            <span className="text-[10px] text-slate-400">{c.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Performer Audition Selection */}
                {membershipType === "performer" && (
                  <div>
                    <label htmlFor="join-discipline" className="block text-xs font-mono uppercase text-slate-300 mb-2">
                      Primary Artistic Discipline
                    </label>
                    <select
                      id="join-discipline"
                      name="discipline"
                      value={performerDiscipline}
                      onChange={(e) => setPerformerDiscipline(e.target.value)}
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

                {/* Additional Notes */}
                <div>
                  <label htmlFor="join-notes" className="block text-xs font-mono uppercase text-slate-300 mb-2">
                    Anything you would like the team to know? (Optional)
                  </label>
                  <textarea
                    id="join-notes"
                    name="notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Dietary preferences, prior dance troupe experience, or ideas for campus events..."
                    className="w-full px-4 py-2.5 bg-black/50 border-2 border-white/20 text-white text-xs outline-none focus:border-[#55CCA2] font-body"
                  />
                </div>
              </fieldset>
            )}

            {/* Error notifications */}
            {stepError && (
              <div role="alert" className="p-3 bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{stepError}</span>
              </div>
            )}

            {submitError && (
              <div role="alert" className="p-3 bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 border-2 border-white/20 text-white text-xs font-mono uppercase tracking-wider hover:bg-white/10 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-[#55CCA2] text-[#160d26] text-xs font-mono uppercase font-bold tracking-wider hover:bg-[#6ee7b7] flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_#10b981] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  <span>Next: {currentStep === 1 ? "Academics" : "Interests"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <PalagaiButton
                  type="submit"
                  disabled={isSubmitting}
                  primaryText={isSubmitting ? "Submitting Application..." : (locale === "ta" ? "விண்ணப்பத்தை அனுப்புக →" : "Complete Registration →")}
                  secondaryText={isSubmitting ? "அனுப்பப்படுகிறது..." : (locale === "ta" ? "Submit Application →" : "விண்ணப்பத்தை அனுப்புக →")}
                  variant="mint"
                  size="md"
                  icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                />
              )}
            </div>
          </form>
        ) : (
          /* Confirmation State */
          <div className="py-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 border-2 border-emerald-400 bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[4px_4px_0px_#10b981]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white font-display">
              Vanakkam, {name}! Registration Confirmed!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
              Your details have been saved for the {membershipType === "performer" ? "performer troupe" : membershipType === "committee" ? "executive committee cohort" : "general membership"}. We have sent confirmation to <strong className="text-white font-mono">{email}</strong>.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <PalagaiButton
                href={groupMeUrl}
                target="_blank"
                rel="noopener noreferrer"
                primaryText="Join the GroupMe Now"
                secondaryText="குரூப்மீயில் இணைக"
                variant="mint"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              />
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setCurrentStep(1);
                  setName("");
                  setEmail("");
                  setMajor("");
                }}
                className="px-5 py-2.5 bg-white/10 border-2 border-white/20 text-xs text-white font-mono uppercase tracking-wider hover:bg-white/20 font-body transition-colors"
              >
                Submit Another Response
              </button>
            </div>
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
