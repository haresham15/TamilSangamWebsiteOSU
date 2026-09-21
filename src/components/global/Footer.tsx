"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    { roleEn: "Lead Web Engineering & Architecture", roleTa: "முதன்மை மென்பொருள் வடிவமைப்பு", name: "Haresh Murugesan (OSU CSE)" },
    { roleEn: "Executive Board Leadership", roleTa: "முதன்மை தலைமை", name: "Meenakshi Varadarajan (President) & Shrinidhi Nagappan (VP)" },
    { roleEn: "Visual Identity & Design Direction", roleTa: "காட்சி அடையாளம் & வடிவமைப்பு", name: "Sadhana Sunder (Design Lead)" },
    { roleEn: "Creative Direction & Performing Arts", roleTa: "படைப்பாற்றல் இயக்கம் & கலைகள்", name: "Srinivas Sankaranarayanan & Aatam Troupe" },
    { roleEn: "Festival Operations, Logistics & Finance", roleTa: "விழா ஒருங்கிணைப்பு & நிதி", name: "Anirudh Kamalakannan & Jerachand Senthilkumar" },
    { roleEn: "Digital Media & Community Outreach", roleTa: "சமூக ஊடகம் & தொடர்பு", name: "Raghav Iyer, Ashwinameera Selvakumar & Monaasri Gopinath" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-[#351657] via-[#2a0f47] to-[#1c0830] border-t-2 border-purple-700/40 pt-20 pb-12 px-6 overflow-hidden bg-tamil-pattern-vibrant text-white">
      {/* Decorative Mint Top Accent Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#55CCA2] to-transparent shadow-[0_0_12px_#55CCA2]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Newsletter & Brand CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-16 border-b border-purple-700/40">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-[#55CCA2] to-purple-400 shadow-lg shrink-0">
                <Image
                  src="/emblem.svg"
                  alt="OSU Tamil Sangam Official Logo"
                  width={56}
                  height={56}
                  className="rounded-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight font-display">{t("brand.name")}</h3>
                <p className="text-xs text-[#55CCA2] font-mono uppercase tracking-wider font-semibold">
                  The Ohio State University · Est. Columbus, OH
                </p>
              </div>
            </div>
            <p className="text-sm text-purple-100/90 max-w-md leading-relaxed mb-6 font-body">
              {locale === "ta"
                ? "ஆட்டம், பாட்டம், கொண்டாட்டம் என தமிழ்ப் பண்பாட்டின் உன்னதங்களை ஓஹியோ வளாகத்தில் இணைக்கும் கலாச்சாரப் பாலம்."
                : "Start the Aatam, Paatam, and Kondatam! Bridging classical Tamil heritage with vibrant dance, feasts, and lifelong Buckeye camaraderie."}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-purple-200">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/60 border border-purple-700/50">
                <span className="w-2 h-2 rounded-full bg-[#55CCA2] animate-pulse" />
                <span className="text-[#55CCA2] font-semibold">Next Flagship:</span> Powerhouse Pongal 2027
              </span>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="p-6 rounded-3xl bg-purple-950/60 border border-purple-600/40 max-w-md shadow-xl backdrop-blur-md">
            <h4 className="text-base font-semibold text-white mb-1 font-display">
              {locale === "ta" ? "சங்கச் செய்திகளைப் பெறுங்கள்" : "Stay in the Sangam Loop"}
            </h4>
            <p className="text-xs text-purple-200/80 mb-4 font-body">
              {locale === "ta"
                ? "நிகழ்வுகள், இலவச உணவுப் பதிவுகள் மற்றும் நடனத் தேர்வுகள் பற்றிய மின்னஞ்சல்கள்."
                : "Get festival ticket drops, rehearsal updates, and chai social reminders straight to your inbox."}
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-2 text-[#55CCA2] text-sm font-semibold py-2">
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
                  className="w-full px-4 py-2.5 rounded-xl bg-purple-900/40 border border-purple-600/60 text-white placeholder-purple-300/60 text-xs outline-none focus:border-[#55CCA2] transition-all font-sans"
                />
                <button
                  type="submit"
                  onClick={playClick}
                  className="px-5 py-2.5 rounded-xl btn-sangam-mint text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Rolling Film Credits Presentation */}
        <div className="py-12 border-b border-purple-700/40">
          <div className="text-center mb-8">
            <p className="text-[11px] font-mono uppercase tracking-widest text-[#55CCA2] mb-1 font-semibold">
              {locale === "ta" ? "நன்றியுரை & திரைக் குழு" : "Closing Credits & Acknowledgements"}
            </p>
            <h4 className="text-xl font-display font-bold text-white">
              {locale === "ta" ? "பங்களிப்பாளர்கள் பட்டியல்" : "Project Aintinai Production Roll"}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-center sm:text-left">
            {filmCredits.map((credit, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-purple-900/30 border border-purple-700/30 hover:border-purple-500/50 transition-all">
                <p className="text-[11px] uppercase tracking-wider text-purple-300 font-mono mb-1">
                  {locale === "ta" ? credit.roleTa : credit.roleEn}
                </p>
                <p className="text-sm font-semibold text-white font-body">{credit.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Links & Legal Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-purple-200/80">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/" className="hover:text-[#55CCA2] transition-colors">{t("nav.home")}</Link>
            <Link href="/events" className="hover:text-[#55CCA2] transition-colors">{t("nav.events")}</Link>
            <Link href="/about" className="hover:text-[#55CCA2] transition-colors">{t("nav.about")}</Link>
            <Link href="/board" className="hover:text-[#55CCA2] transition-colors">{t("nav.board")}</Link>
            <Link href="/gallery" className="hover:text-[#55CCA2] transition-colors">{t("nav.gallery")}</Link>
            <Link href="/join" className="hover:text-[#55CCA2] transition-colors">{t("nav.join")}</Link>
            <Link href="/links" className="text-[#55CCA2] font-semibold hover:underline transition-colors">Linktree Bio Hub</Link>
          </div>

          <div className="text-center md:text-right font-mono text-[11px] space-y-1">
            <p className="text-purple-100">© {new Date().getFullYear()} OSU Tamil Sangam. Crafted with pride in Columbus, OH.</p>
            <p className="text-purple-300/60 text-[10px]">
              Registered student organization at Ohio State. Not an official university entity.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
