"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { EVENTS } from "@/data/events";
import { DirectorFooterButton } from "@/director/DirectorHUD";

const getSavedEmail = () => {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem("sangam_stay_subscribed") || "";
  } catch {
    return "";
  }
};

const subscribeStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

export const Footer: React.FC = () => {
  const { locale, t } = useLocale();
  const { playClick, playBell } = useAudio();
  const savedEmail = useSyncExternalStore(subscribeStorage, getSavedEmail, () => "");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isBuckeye, setIsBuckeye] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const isSubscribed = status === "success" || (status === "idle" && Boolean(savedEmail) && !isDismissed);
  const activeStatusMessage =
    statusMessage || (savedEmail ? "You're plugged into the Stay in Sangam loop!" : "");
  const activeIsBuckeye =
    status === "success" ? isBuckeye : (savedEmail.endsWith("@osu.edu") || savedEmail.endsWith(".osu.edu"));

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

  return (
    <footer className="relative bg-[#07030d] border-t border-white/15 overflow-hidden text-white">
      {/* ========================================================================= */}
      {/* 1. TOP ROLLING CREDITS MARQUEE                                            */}
      {/* ========================================================================= */}
      <div className="relative w-full bg-black/60 border-b border-white/15 py-2.5 overflow-hidden select-none">

        {/* Infinite Running Marquee Film Credits */}
        <div className="relative flex overflow-x-hidden">
          <div className="py-1 animate-[marquee-left_36s_linear_infinite] whitespace-nowrap flex items-center font-mono text-xs uppercase tracking-wider text-amber-200/90 font-bold">
            <span className="mx-4 text-[#55CCA2]">★ EXECUTIVE PRODUCTION: OSU TAMIL SANGAM</span>
            <span className="mx-4 text-white/40">·</span>
            <span className="mx-4 text-white">PRESIDENT: MEENAKSHI VARADARAJAN (மீனாட்சி வரதராஜன்)</span>
            <span className="mx-4 text-white/40">·</span>
            <span className="mx-4 text-white">VICE PRESIDENT: SHRINIDHI NAGAPPAN (ஸ்ரீநிதி நாகப்பன்)</span>
            <span className="mx-4 text-white/40">·</span>
            <span className="mx-4 text-white">DESIGN LEAD: SADHANA SUNDER (சாதனா சுந்தர்)</span>
            <span className="mx-4 text-white/40">·</span>
            <span className="mx-4 text-white">CREATIVE DIRECTOR: SRINIVAS SANKARANARAYANAN (ஸ்ரீனிவாஸ்)</span>
            <span className="mx-4 text-white/40">·</span>
            <span className="mx-4 text-white">TREASURER: ANIRUDH KAMALAKANNAN (அனிருத்)</span>
            <span className="mx-4 text-white/40">·</span>
            <span className="mx-4 text-white">SOCIAL MEDIA: RAGHAV IYER (ராகவ்)</span>
            <span className="mx-4 text-white/40">·</span>
            <span className="mx-4 text-white/80">THE OHIO STATE UNIVERSITY · COLUMBUS, OH · EST. 1972</span>
          </div>

          <div
            aria-hidden="true"
            className="py-1 animate-[marquee-left_36s_linear_infinite] whitespace-nowrap flex items-center font-mono text-xs uppercase tracking-wider text-amber-200/90 font-bold"
          >
            <span className="mx-4 text-[#55CCA2]">★ EXECUTIVE PRODUCTION: OSU TAMIL SANGAM</span>
            <span className="mx-4 text-white/40">·</span>
            <span className="mx-4 text-white">PRESIDENT: MEENAKSHI VARADARAJAN (மீனாட்சி வரதராஜன்)</span>
            <span className="mx-4 text-white/40">·</span>
            <span className="mx-4 text-white">VICE PRESIDENT: SHRINIDHI NAGAPPAN (ஸ்ரீநிதி நாகப்பன்)</span>
            <span className="mx-4 text-white/40">·</span>
            <span className="mx-4 text-white">DESIGN LEAD: SADHANA SUNDER (சாதனா சுந்தர்)</span>
            <span className="mx-4 text-white/40">·</span>
            <span className="mx-4 text-white">CREATIVE DIRECTOR: SRINIVAS SANKARANARAYANAN (ஸ்ரீனிவாஸ்)</span>
            <span className="mx-4 text-white/40">·</span>
            <span className="mx-4 text-white">TREASURER: ANIRUDH KAMALAKANNAN (அனிருத்)</span>
            <span className="mx-4 text-white/40">·</span>
            <span className="mx-4 text-white">SOCIAL MEDIA: RAGHAV IYER (ராகவ்)</span>
            <span className="mx-4 text-white/40">·</span>
            <span className="mx-4 text-white/80">THE OHIO STATE UNIVERSITY · COLUMBUS, OH · EST. 1972</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN CINEMATIC CONTENT & CLAPPERBOARD DISPATCH                         */}
      {/* ========================================================================= */}
      <div className="max-w-[1440px] mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-white/10">
          
          {/* Brand & Editorial Column */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-12 h-12 border border-[#55CCA2] bg-[#160b24] p-1 shrink-0 ticket-chamfer-tl-br shadow-[2px_2px_0px_#55CCA2]">
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
                    The Ohio State University · Columbus, OH
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/80 max-w-lg leading-relaxed mb-6 font-body">
                {locale === "ta"
                  ? "ஓஹியோ பல்கலைக்கழகத்தில் தமிழ் மாணவர்கள் மற்றும் அனைத்து நண்பர்களையும் ஒன்றிணைக்கும் மாணவர் அமைப்பு — நல்ல உணவு, இசை, மற்றும் நட்பின் சங்கமம்."
                  : "A student organization connecting Tamil students and friends of all backgrounds at Ohio State through social events, casual hangouts, food, and music."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <Link
                href={`/events/${EVENTS[0].slug}`}
                onClick={playClick}
                className="flex items-center gap-2 px-4 py-2 bg-[#120820] border border-white/15 border-l-4 border-l-[#55CCA2] hover:border-[#55CCA2] hover:glow-halogen-mint transition-all group ticket-chamfer-tl-br"
              >
                <span className="w-2 h-2 rounded-none bg-[#55CCA2] animate-pulse" />
                <span className="text-[#55CCA2] font-bold uppercase tracking-wider">
                  {locale === "ta" ? "அடுத்த நிகழ்வு:" : "Next Event:"}
                </span>
                <span className="text-white/90 group-hover:text-white transition-colors">
                  {locale === "ta" ? EVENTS[0].titleTa : EVENTS[0].titleEn}
                </span>
              </Link>
            </div>
          </div>

          {/* Stay in Sangam Clapperboard Dispatch Box */}
          <div className="lg:col-span-5 p-6 bg-[#10071c] border border-white/15 ticket-chamfer-tr-bl shadow-[4px_4px_0px_#55CCA2] text-left relative blueprint-node">
            <div className="border-b border-white/10 pb-2 mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-none bg-[#55CCA2]" />
                <span>{locale === "ta" ? "சங்கச் செய்திகளைப் பெறுங்கள்" : "Stay in the Sangam Loop"}</span>
              </h4>
            </div>

            <p className="text-xs text-white/70 mb-4 font-body leading-relaxed">
              {locale === "ta"
                ? "நிகழ்வுகள், இலவச உணவுப் பதிவுகள், மற்றும் சந்திப்புகள் பற்றிய எளிய மின்னஞ்சல் செய்திகள்."
                : "Get event announcements, food updates, and casual social reminders sent to your email."}
            </p>

            {isSubscribed ? (
              <div className="p-3.5 bg-emerald-950/70 border border-[#55CCA2] text-white space-y-2 ticket-chamfer-tl-br shadow-[2px_2px_0px_#55CCA2]">
                <div className="flex items-center gap-2 text-[#55CCA2] font-bold text-xs font-mono uppercase">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{activeIsBuckeye ? "Buckeye Verified · Connected" : "Subscribed · Welcome!"}</span>
                </div>
                <p className="text-xs text-white/90 font-body leading-relaxed">
                  {activeStatusMessage}
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
                      setIsDismissed(true);
                      setStatus("idle");
                      setEmail("");
                    }}
                    className="text-[10px] font-mono text-white/60 hover:text-white underline"
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
                    id="footer-newsletter-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name.#@buckeyemail.osu.edu"
                    aria-label="OSU Buckeye Email Address"
                    autoComplete="email"
                    required
                    disabled={status === "loading"}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/20 text-white placeholder-white/40 text-xs outline-none focus:border-[#55CCA2] transition-colors font-mono disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-5 py-2.5 btn-sangam-mint text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 shrink-0 disabled:opacity-60 cursor-pointer ticket-chamfer-tl-br"
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

                <div className="flex items-center justify-between text-[10px] font-mono text-white/50 pt-0.5">
                  <span>Open to all students</span>
                  {subscriberCount && (
                    <span className="text-[#55CCA2] font-bold">
                      {subscriberCount} in loop
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Links & Blueprint Bottom Navigation Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/70">
          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-6 font-display font-medium">
            <Link href="/" className="hover:text-[#55CCA2] transition-colors">{t("nav.home")}</Link>
            <Link href="/events" className="hover:text-[#55CCA2] transition-colors">{t("nav.events")}</Link>
            <Link href="/join" className="hover:text-[#55CCA2] font-semibold text-[#55CCA2] transition-colors">{t("nav.join")}</Link>
            <Link href="/about" className="hover:text-[#55CCA2] transition-colors">{t("nav.about")}</Link>
            <Link href="/board" className="hover:text-[#55CCA2] font-semibold transition-colors">{t("nav.board")}</Link>
            <Link href="/guide" className="hover:text-[#55CCA2] transition-colors">{t("nav.guide")}</Link>
            <Link href="/gallery" className="hover:text-[#55CCA2] transition-colors">{t("nav.gallery")}</Link>
            <Link href="/suggestions" className="hover:text-[#55CCA2] transition-colors">{t("nav.suggestions")}</Link>
            <Link href="/links" className="text-[#55CCA2] font-semibold hover:underline transition-colors">Quick Links</Link>
          </nav>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <DirectorFooterButton />
              <span className="hidden lg:inline text-[10px] font-mono text-white/40 border-l border-white/10 pl-2">
                Keys: <kbd className="text-[#55CCA2]">Shift+D</kbd> Viewport · <kbd className="text-[#55CCA2]">W</kbd> Wire · <kbd className="text-[#55CCA2]">C</kbd> Grade · <kbd className="text-[#55CCA2]">Esc</kbd> Exit
              </span>
            </div>
            <div className="text-center md:text-right font-mono text-[11px] space-y-1">
              <p className="text-white/90">© {new Date().getFullYear()} OSU Tamil Sangam. The Ohio State University.</p>
              <p className="text-white/40 text-[10px]">
                Registered student organization at Ohio State. Not an official university entity.
              </p>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};
