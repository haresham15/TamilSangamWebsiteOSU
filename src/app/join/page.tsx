"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "@/context/LocaleContext";
import {
  Check,
  CheckCircle2,
  Loader2,
  AlertCircle,
  GraduationCap,
  User,
  Mail,
  BookOpen,
  Calendar,
  Compass,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";
import { audioLayer } from "@/utils/audioLayer";

// Dynamically load the R3F Nanban Hero Canvas without SSR
const JoinHeroCanvas = dynamic(
  () => import("@/components/join/JoinHeroCanvas").then((m) => m.JoinHeroCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[70dvh] flex flex-col items-center justify-center bg-[#F4EEDD] text-[#6B4E2B] font-cyber-mono text-xs lowercase gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#55CCA2] animate-pulse" />
          <span className="tracking-widest font-normal">
            entering the morning campus... [ webgl r3f core loading ]
          </span>
        </div>
      </div>
    ),
  }
);

export default function JoinPage() {
  const { locale } = useLocale();

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

  const handleSkipToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("membership-form");
    if (target) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      target.focus({ preventScroll: true });
    }
  };

  const toggleCommittee = (comm: string) => {
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
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep(2)) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
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
          source: `join-nanban-${membershipType}`,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
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
    <main className="min-h-screen bg-transparent text-white selection:bg-[#55CCA2] selection:text-[#050201]">
      {/* WCAG AA 2.4.1 Bypass Blocks: Accessible skip link for keyboard & assistive tech */}
      <a
        href="#membership-form"
        onClick={handleSkipToForm}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#55CCA2] focus:text-[#050201] focus:font-semibold focus:rounded-md focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        {locale === "ta" ? "விண்ணப்ப படிவத்திற்கு நேரடியாக தாவவும்" : "Skip directly to membership form"}
      </a>

      {/* ========================================================================= */}
      {/* PHASE 1: 70dvh HYBRID HERO WRAPPER & SEAMLESS GRADIENT HANDOFF            */}
      {/* ========================================================================= */}
      <section
        id="nanban-gates-hero"
        data-hero-container="true"
        aria-label="Nanban Campus Gates 3D Viewport"
        className="relative w-full overflow-hidden bg-transparent"
      >
        <JoinHeroCanvas />
        {/* Bottom overlay gradient blending agent transitioning into the brutalist form */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#050201] via-[#050201]/70 to-transparent pointer-events-none z-10" />
      </section>

      {/* ========================================================================= */}
      {/* PHASE 1: FORM DOM (min-h-screen Brutalist Console Membership Form)        */}
      {/* ========================================================================= */}
      <div id="membership-form" className="min-h-screen relative z-20 -mt-32 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-28 overflow-hidden">
        {/* Structural Blueprint Watermark Glyphs */}
        <WatermarkGlyph text="நண்பன்" position="top-right" theme="dark" opacity={0.035} />

        {/* Section Headline */}
        <header className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight mb-3">
            {locale === "ta" ? "சங்கக் குடும்பத்தில் இணைந்திடுங்கள்" : "Step Through the Gates"}
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            {locale === "ta"
              ? "மாணவர்கள், பட்டதாரிகள், மற்றும் தமிழ் கலாச்சாரத்தை விரும்பும் அனைவரும் சங்கத்தில் இணைய அன்புடன் அழைக்கப்படுகிறார்கள்."
              : "Open year-round to all Buckeyes, graduate students, alumni, and friends celebrating Tamil heritage, music, dance, literature, and fellowship."}
          </p>
        </header>

        {/* Multi-Step Card Container: Sharp Brutalist Architectural Block */}
        <div className="ticket-chamfer-tl-br relative border-2 border-white/20 bg-[#050201] p-6 sm:p-10 shadow-[6px_6px_0px_#250d38] hover:border-[#55CCA2]/40 transition-colors">
          {/* Step Indicator Bar */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
            {[
              { num: 1, label: locale === "ta" ? "தனிப்பட்ட விவரங்கள்" : "Identity" },
              { num: 2, label: locale === "ta" ? "கல்வி & பாதை" : "Academic & Track" },
              { num: 3, label: locale === "ta" ? "ஆர்வங்கள் & உறுதி" : "Interests & Submit" },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2 sm:gap-3">
                <div
                  className={`w-7 h-7 rounded-none flex items-center justify-center font-mono text-xs font-bold transition-colors ${
                    currentStep === s.num
                      ? "bg-[#55CCA2] text-[#050201] border-2 border-[#55CCA2] shadow-[2px_2px_0px_#ffffff]"
                      : currentStep > s.num
                      ? "bg-amber-500/20 text-amber-300 border border-amber-400/50"
                      : "bg-[#141211] text-neutral-500 border border-neutral-700"
                  }`}
                >
                  {currentStep > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span
                  className={`text-xs font-medium font-mono hidden sm:inline ${
                    currentStep === s.num ? "text-white font-bold" : "text-neutral-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Submission Success State */}
          {submitted ? (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-none border-2 border-[#55CCA2] bg-[#55CCA2]/10 flex items-center justify-center text-[#55CCA2] mb-6 shadow-[4px_4px_0px_#55CCA2]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold font-display text-white mb-2">
                {locale === "ta" ? "வரவேற்கிறோம்! உங்கள் விண்ணப்பம் பெறப்பட்டது" : "Welcome to Tamil Sangam!"}
              </h3>
              <p className="text-neutral-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                {locale === "ta"
                  ? "உங்கள் சேர்க்கை பதிவு செய்யப்பட்டுள்ளது. எமது குழு விரைவில் உங்களை GroupMe மற்றும் மின்னஞ்சல் மூலம் தொடர்பு கொள்ளும்."
                  : `Thank you for joining, ${name}! We've registered your interest in the ${membershipType} track. Check your inbox (${email}) for orientation and calendar invites.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setCurrentStep(1);
                  setName("");
                  setEmail("");
                  setMajor("");
                }}
                className="px-6 py-2.5 rounded-none border border-neutral-700 bg-neutral-900 text-neutral-200 text-xs font-mono uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {locale === "ta" ? "மற்றொரு பதிவு சமர்ப்பிக்கவும்" : "Submit Another Application"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} noValidate>
              {stepError && (
                <div className="mb-6 p-4 rounded-none bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{stepError}</span>
                </div>
              )}

              {/* STEP 1: IDENTITY */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="student-name" className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        {locale === "ta" ? "முழு பெயர் *" : "Full Name *"}
                      </span>
                    </label>
                    <input
                      id="student-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Brinda Murugan"
                      className="w-full px-4 py-3 rounded-none bg-[#090b14] border border-white/20 text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-[#55CCA2] transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="student-email" className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        {locale === "ta" ? "BuckeyeMail அல்லது மின்னஞ்சல் *" : "BuckeyeMail or Preferred Email *"}
                      </span>
                    </label>
                    <input
                      id="student-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name.#@osu.edu or user@gmail.com"
                      className="w-full px-4 py-3 rounded-none bg-[#090b14] border border-white/20 text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-[#55CCA2] transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: ACADEMIC & TRACK */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="student-major" className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          {locale === "ta" ? "கல்வித் துறை (Major) *" : "Major / Program *"}
                        </span>
                      </label>
                      <input
                        id="student-major"
                        type="text"
                        required
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="e.g. Computer Science & Engineering"
                        className="w-full px-4 py-3 rounded-none bg-[#090b14] border border-white/20 text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-[#55CCA2] transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="student-year" className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          {locale === "ta" ? "பட்டப்படிப்பு ஆண்டு" : "Graduation Year"}
                        </span>
                      </label>
                      <select
                        id="student-year"
                        value={gradYear}
                        onChange={(e) => setGradYear(e.target.value)}
                        className="w-full px-4 py-3 rounded-none bg-[#090b14] border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-[#55CCA2] transition-colors"
                      >
                        <option value="2025">2025 (Senior)</option>
                        <option value="2026">2026 (Junior)</option>
                        <option value="2027">2027 (Sophomore)</option>
                        <option value="2028">2028 (Freshman)</option>
                        <option value="2029">2029+ (Undergraduate)</option>
                        <option value="Graduate">Graduate / PhD Student</option>
                        <option value="Alumni">Alumni / Supporter</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-3">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                        {locale === "ta" ? "உறுப்பினர் பாதை தேர்வு" : "Membership Track"}
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: "general",
                          title: locale === "ta" ? "பொது உறுப்பினர்" : "General Member",
                          desc: locale === "ta" ? "அனைத்து விழாக்கள் & சமூக நிகழ்வுகள்" : "Social events, festivals & dining",
                        },
                        {
                          id: "performer",
                          title: locale === "ta" ? "கலைஞர் / நடனம்" : "Performer Track",
                          desc: locale === "ta" ? "நடனம், இசை, மேடை நாடகங்கள்" : "Dance teams, vocals & classical arts",
                        },
                        {
                          id: "committee",
                          title: locale === "ta" ? "செயற்குழு / தலைமை" : "Committee Lead",
                          desc: locale === "ta" ? "வடிவமைப்பு, நிகழ்வு மேலாண்மை" : "Logistics, design & leadership",
                        },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setMembershipType(t.id as "general" | "performer" | "committee")}
                          className={`p-4 rounded-none text-left border transition-all cursor-pointer ${
                            membershipType === t.id
                              ? "bg-[#55CCA2]/10 border-[#55CCA2] text-white shadow-[3px_3px_0px_#55CCA2]"
                              : "bg-[#090b14] border-white/15 text-neutral-400 hover:border-white/30"
                          }`}
                        >
                          <p className="font-bold text-sm mb-1 text-white font-display">{t.title}</p>
                          <p className="text-xs text-neutral-400 font-body">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: INTERESTS & CONFIRMATION */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {membershipType === "performer" && (
                    <div>
                      <label htmlFor="performer-discipline" className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                        {locale === "ta" ? "உங்கள் கலை வடிவம் / விருப்பம்" : "Performance Discipline"}
                      </label>
                      <select
                        id="performer-discipline"
                        value={performerDiscipline}
                        onChange={(e) => setPerformerDiscipline(e.target.value)}
                        className="w-full px-4 py-3 rounded-none bg-[#090b14] border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-[#55CCA2] transition-colors"
                      >
                        <option value="Aatam (Dance)">Aatam (Tamil Cinematic / Hip-Hop Dance Team)</option>
                        <option value="Classical Bharatanatyam">Classical Bharatanatyam / Carnatic Vocal</option>
                        <option value="Instrumental Music">Instrumental Music (Miruthangam, Flute, Violin, Keys)</option>
                        <option value="Drama & Emcee">Stage Acting, Emcee & Scriptwriting</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-3">
                      <span className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-amber-400" />
                        {locale === "ta" ? "விருப்பமுள்ள குழுக்கள் (Committees)" : "Committees of Interest"}
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Events & Logistics",
                        "Design & Media",
                        "Sponsorship & Outreach",
                        "Cultural Programming",
                        "Freshman Mentorship",
                      ].map((comm) => {
                        const active = selectedCommittees.includes(comm);
                        return (
                          <button
                            key={comm}
                            type="button"
                            onClick={() => toggleCommittee(comm)}
                            className={`px-3.5 py-2 rounded-none text-xs font-mono transition-all cursor-pointer border ${
                              active
                                ? "bg-[#55CCA2] text-[#050201] font-bold border-[#55CCA2] shadow-[2px_2px_0px_#ffffff]"
                                : "bg-[#090b14] border-white/20 text-neutral-300 hover:border-white/50"
                            }`}
                          >
                            {active ? `✓ ${comm}` : `+ ${comm}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="additional-notes" className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                      {locale === "ta" ? "கூடுதல் தகவல்கள் அல்லது கேள்விகள்" : "Any questions or ideas for the team? (Optional)"}
                    </label>
                    <textarea
                      id="additional-notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tell us what you are most excited about..."
                      className="w-full px-4 py-3 rounded-none bg-[#090b14] border border-white/20 text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-[#55CCA2] transition-colors resize-none"
                    />
                  </div>

                  {submitError && (
                    <div className="p-4 rounded-none bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 font-mono">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{submitError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Form Navigation Controls */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/10">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none border border-white/20 text-neutral-300 text-xs font-mono uppercase tracking-wider hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{locale === "ta" ? "முந்தைய படி" : "Back"}</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    onMouseEnter={() => audioLayer.playTapeClack()}
                    onPointerDown={() => audioLayer.playSubBassThud()}
                    data-cursor="bracket"
                    className="ticket-chamfer-tl-br inline-flex items-center gap-2 px-6 py-2.5 bg-[#55CCA2] text-[#050201] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#6ee7b7] focus:outline-none focus:ring-2 focus:ring-white transition-[background-color,box-shadow,transform] duration-150 cursor-pointer shadow-[3px_3px_0px_#ffffff] hover:shadow-[4px_4px_0px_#ffffff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#ffffff] hover:glow-halogen-mint"
                  >
                    <span>{locale === "ta" ? "அடுத்த படி" : "Next Step"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onMouseEnter={() => audioLayer.playTapeClack()}
                    onPointerDown={() => audioLayer.playSubBassThud()}
                    data-cursor="bracket"
                    className="ticket-chamfer-tl-br inline-flex items-center gap-2 px-8 py-3 bg-[#55CCA2] text-[#050201] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#6ee7b7] focus:outline-none focus:ring-2 focus:ring-white transition-[background-color,box-shadow,transform] duration-150 disabled:opacity-50 cursor-pointer shadow-[4px_4px_0px_#ffffff] hover:shadow-[5px_5px_0px_#ffffff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#ffffff] hover:glow-halogen-mint"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{locale === "ta" ? "சமர்ப்பிக்கிறது..." : "Joining..."}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{locale === "ta" ? "விண்ணப்பத்தை சமர்ப்பிக்கவும்" : "Submit Registration"}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
