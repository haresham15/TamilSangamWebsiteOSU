"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { EVENTS } from "@/data/events";

export const Footer: React.FC = () => {
  const { locale, t } = useLocale();
  const { playClick, playBell } = useAudio();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isBuckeye, setIsBuckeye] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sangam_stay_subscribed");
      if (saved) {
        setEmail(saved);
        setStatus("success");
        setStatusMessage("You're plugged into the Stay in Sangam loop!");
        setIsBuckeye(saved.endsWith("@osu.edu") || saved.endsWith(".osu.edu"));
      }
    } catch {
      // localStorage not accessible
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    setStatus("loading");
    playClick();

    try {
      const res = await fetch("/api/stay-in-sangam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: "footer",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        playBell(880);
        setStatus("success");
        setStatusMessage(data.message || "Vanakkam! You are now subscribed to Stay in Sangam.");
        setIsBuckeye(!!data.isBuckeye);
        if (data.totalSubscribers) {
          setSubscriberCount(data.totalSubscribers);
        }
        try {
          localStorage.setItem("sangam_stay_subscribed", email.trim());
        } catch {
          // ignore
        }
      } else {
        setStatus("error");
        setStatusMessage(data.error || "Failed to process subscription. Please check your email and try again.");
      }
    } catch {
      setStatus("error");
      setStatusMessage("Network error reaching Sangam Dispatch. Please check your connection and try again.");
    }
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
    <footer className="relative bg-gradient-to-b from-[#351657] via-[#2a0f47] to-[#1c0830] border-t-2 border-purple-700/40 pt-20 pb-12 px-6 overflow-hidden text-white">
      {/* Decorative Mint Top Accent Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#55CCA2] to-transparent shadow-[0_0_12px_#55CCA2]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Newsletter & Brand CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-16 border-b border-purple-700/40">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-12 h-12 border-2 border-[#55CCA2] bg-[#250d38] p-1 shrink-0 shadow-[2px_2px_0px_#55CCA2]">
                <Image
                  src="/emblem.svg"
                  alt="OSU Tamil Sangam Official Logo"
                  fill
                  className="object-contain p-0.5"
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
                ? "ஆட்டம், பாட்டம், கொண்டாட்டம்! ஓஹியோ வளாகத்தில் தமிழ் மாணவர்கள் மற்றும் அனைத்து நண்பர்களையும் ஒன்றிணைக்கும் கலாச்சார மையம் — நல்ல உணவு, இசை மற்றும் தோழமையின் சங்கமம்."
                : "Start the Aatam, Paatam, and Kondatam! A welcoming campus hub for Tamil students and friends of all backgrounds — connecting through good food, music, casual hangouts, and campus celebrations at Ohio State."}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-purple-200">
              <Link
                href={`/events/${EVENTS[0].slug}`}
                onClick={playClick}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#250d38] border border-purple-700 border-l-4 border-l-[#55CCA2] hover:border-[#55CCA2] hover:bg-purple-900/60 transition-all group shadow-[2px_2px_0px_#55CCA2]"
              >
                <span className="w-2 h-2 bg-[#55CCA2] animate-pulse" />
                <span className="text-[#55CCA2] font-bold uppercase tracking-wider">
                  {locale === "ta" ? "அடுத்த பெருவிழா:" : "Next Flagship:"}
                </span>
                <span className="group-hover:text-white transition-colors">
                  {locale === "ta" ? EVENTS[0].titleTa : EVENTS[0].titleEn}
                </span>
              </Link>
            </div>
          </div>

          {/* Stay in Sangam Dispatch Console */}
          <div className="p-6 bg-purple-950/90 border-2 border-purple-600/70 max-w-md shadow-[5px_5px_0px_#55CCA2] text-left">
            <div className="border-b border-purple-700/60 pb-2 mb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#55CCA2] font-bold uppercase tracking-widest block">
                  [STAY IN SANGAM]
                </span>
                <h4 className="text-base font-bold text-white font-display uppercase tracking-wider">
                  {locale === "ta" ? "சங்கச் செய்திகளைப் பெறுங்கள்" : "Stay in the Sangam Loop"}
                </h4>
              </div>
              <span className="box-badge-dark text-[9px] font-mono text-[#55CCA2] font-bold uppercase border border-[#55CCA2]/40">
                ACTIVE DISPATCH
              </span>
            </div>

            <p className="text-xs text-purple-200/85 mb-4 font-body leading-relaxed">
              {locale === "ta"
                ? "நிகழ்வுகள், இலவச உணவுப் பதிவுகள், மற்றும் சங்கம சந்திப்புகள் பற்றிய நேரடி மின்னஞ்சல் செய்திகள்."
                : "Get ticket drops, free food alerts (Streetside Sapad, Oval picnics), and chai social updates straight to your inbox."}
            </p>

            {status === "success" ? (
              <div className="p-3.5 bg-emerald-950/70 border-2 border-[#55CCA2] text-white space-y-2 shadow-[2px_2px_0px_#55CCA2]">
                <div className="flex items-center gap-2 text-[#55CCA2] font-bold text-xs font-mono uppercase">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{isBuckeye ? "Buckeye Verified · Connected" : "Subscribed · Welcome!"}</span>
                </div>
                <p className="text-xs text-purple-100/90 font-body leading-relaxed">
                  {statusMessage}
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-800/60">
                  <a
                    href="https://groupme.com/join_group/osutamilsangam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#55CCA2] font-bold hover:underline"
                  >
                    <span>Join Student GroupMe</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setEmail("");
                    }}
                    className="text-[10px] font-mono text-purple-300 hover:text-white underline"
                  >
                    Use another email
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                {/* Honeypot field for bot suppression */}
                <input
                  type="text"
                  name="hp_sangam"
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name.#@buckeyemail.osu.edu"
                    required
                    disabled={status === "loading"}
                    className="w-full px-3.5 py-2.5 bg-purple-900/60 border-2 border-purple-500 text-white placeholder-purple-300/60 text-xs outline-none focus:border-[#55CCA2] transition-all font-mono disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-5 py-2.5 btn-sangam-mint text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-60"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>{locale === "ta" ? "இணைக" : "Join"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {status === "error" && (
                  <div className="p-2.5 bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-mono text-purple-300/60 pt-0.5">
                  <span>Open to all majors & backgrounds</span>
                  {subscriberCount && (
                    <span className="text-[#55CCA2] font-bold">
                      {subscriberCount} Buckeyes in loop
                    </span>
                  )}
                </div>
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
              {locale === "ta" ? "நிர்வாகக் குழு மற்றும் பங்களிப்பாளர்கள் பட்டியல்" : "Student Leadership & Contributor Roll"}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center sm:text-left">
            {filmCredits.map((credit, idx) => (
              <div key={idx} className="p-3.5 bg-purple-900/40 border border-purple-700/40 border-l-4 border-l-purple-500 hover:border-l-[#55CCA2] hover:border-purple-400 transition-all shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-[#55CCA2] font-mono mb-0.5 font-bold">
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
            <Link href="/links" className="text-[#55CCA2] font-semibold hover:underline transition-colors">Quick Links</Link>
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
