"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const Footer: React.FC = () => {
  const { locale, t } = useLocale();
  const { playClick, playBell } = useAudio();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    playBell(700);
    setIsSubscribed(true);
    setEmail("");
  };

  const filmCredits = [
    { roleEn: "Lead Engineering & Architecture", roleTa: "முதன்மை மென்பொருள் வடிவமைப்பு", name: "Haresh N. (OSU CSE)" },
    { roleEn: "Choreography & Cultural Direction", roleTa: "நடன இயக்கம் & கலை வடிவமைப்பு", name: "Kavya Ramanathan & Ananya Krishnan" },
    { roleEn: "Cinematic Visuals & Posters", roleTa: "காட்சி விளம்பரம் & போஸ்டர் கலை", name: "Dinesh Sundaram" },
    { roleEn: "Festival Operations & Finance", roleTa: "விழா ஒருங்கிணைப்பு & நிதி", name: "Siddharth Venkat" },
    { roleEn: "Tamil Classical Translation Review", roleTa: "தமிழ்க் கூர்ந்தாய்வு & மொழியாக்கம்", name: "OSU Sangam Senior Council" },
    { roleEn: "Event Photography & Archives", roleTa: "புகைப்படக் கலை & ஆவணக்காப்பகம்", name: "Sangam Media Crew & Campus Photographers" },
  ];

  return (
    <footer className="relative bg-[#060810] border-t border-white/10 pt-20 pb-12 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Newsletter & Brand CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-16 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f2b705] via-[#d6452f] to-[#1e2a78] flex items-center justify-center text-white font-bold text-lg shadow-md">
                ஐ
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">{t("brand.name")}</h3>
                <p className="text-xs text-[var(--accent-tint)] font-mono uppercase tracking-wider">
                  The Ohio State University · Est. Columbus, OH
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-md leading-relaxed mb-6">
              {locale === "ta"
                ? "ஆட்டம், பாட்டம், கொண்டாட்டம் என தமிழ்ப் பண்பாட்டின் உன்னதங்களை ஓஹியோ வளாகத்தில் இணைக்கும் கலாச்சாரப் பாலம்."
                : "Bridging classical Tamil poetry, electrifying performing arts, and warm community across the Buckeye nation."}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Next Event: Powerhouse Pongal 2027
              </span>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="glass-panel-elevated p-6 rounded-3xl border border-white/10 max-w-md">
            <h4 className="text-base font-semibold text-white mb-1">
              {locale === "ta" ? "சங்கச் செய்திகளைப் பெறுங்கள்" : "Stay in the Sangam Loop"}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              {locale === "ta"
                ? "நிகழ்வுகள், இலவச உணவுப் பதிவுகள் மற்றும் நடனத் தேர்வுகள் பற்றிய மின்னஞ்சல்கள்."
                : "Get festival ticket drops, rehearsal updates, and chai social reminders straight to your inbox."}
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium py-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{locale === "ta" ? "நன்றி! நீங்கள் இணைக்கப்பட்டுவிட்டீர்கள்." : "Vanakkam! You're subscribed."}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.buckeyemail@osu.edu"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] transition-all font-sans"
                />
                <button
                  type="submit"
                  onClick={playClick}
                  className="px-4 py-2.5 rounded-xl bg-[var(--accent-tint)] text-black font-semibold text-xs hover:opacity-90 transition-all flex items-center gap-1 shrink-0"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Rolling Film Credits Presentation */}
        <div className="py-12 border-b border-white/10">
          <div className="text-center mb-8">
            <p className="text-[11px] font-mono uppercase tracking-widest text-[var(--accent-tint)] mb-1">
              {locale === "ta" ? "நன்றியுரை & திரைக் குழு" : "Closing Credits & Acknowledgements"}
            </p>
            <h4 className="text-lg font-serif font-bold text-white">
              {locale === "ta" ? "பங்களிப்பாளர்கள் பட்டியல்" : "Project Aintinai Production Roll"}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-center sm:text-left">
            {filmCredits.map((credit, idx) => (
              <div key={idx} className="p-4 rounded-2xl glass-panel border border-white/5 hover:border-white/15 transition-all">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-mono mb-1">
                  {locale === "ta" ? credit.roleTa : credit.roleEn}
                </p>
                <p className="text-sm font-semibold text-white">{credit.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Links & Legal Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/about" className="hover:text-white transition-colors">{t("nav.about")}</Link>
            <Link href="/events" className="hover:text-white transition-colors">{t("nav.events")}</Link>
            <Link href="/gallery" className="hover:text-white transition-colors">{t("nav.gallery")}</Link>
            <Link href="/board" className="hover:text-white transition-colors">{t("nav.board")}</Link>
            <Link href="/culture-lab" className="hover:text-white transition-colors">{t("nav.cultureLab")}</Link>
            <Link href="/resources" className="hover:text-white transition-colors">{t("nav.resources")}</Link>
            <Link href="/under-the-hood" className="hover:text-[var(--accent-tint)] transition-colors">{t("nav.underTheHood")}</Link>
            <Link href="/links" className="text-[var(--accent-tint)] hover:underline transition-colors">Linktree Bio Hub</Link>
          </div>

          <div className="text-center md:text-right font-mono text-[11px] space-y-1">
            <p>© {new Date().getFullYear()} OSU Tamil Sangam. Crafted with pride in Columbus, OH.</p>
            <p className="text-slate-500 text-[10px]">
              Registered student organization at Ohio State. Not an official university entity.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
