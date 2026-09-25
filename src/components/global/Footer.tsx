"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { EVENTS } from "@/data/events";

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
    <footer className="relative bg-gradient-to-b from-[#351657] via-[#2a0f47] to-[#1c0830] border-t-2 border-purple-700/40 pt-16 pb-12 px-6 overflow-hidden text-white">
      {/* Decorative Mint Top Accent Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#55CCA2] to-transparent shadow-[0_0_12px_#55CCA2]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Newsletter & Brand CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-12 border-b border-purple-700/40">
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
                  The Ohio State University · Columbus, OH
                </p>
              </div>
            </div>
            <p className="text-sm text-purple-100/90 max-w-md leading-relaxed mb-6 font-body">
              {locale === "ta"
                ? "ஓஹியோ பல்கலைக்கழகத்தில் தமிழ் மாணவர்கள் மற்றும் அனைத்து நண்பர்களையும் ஒன்றிணைக்கும் மாணவர் அமைப்பு — நல்ல உணவு, இசை, மற்றும் நட்பின் சங்கமம்."
                : "A student organization connecting Tamil students and friends of all backgrounds at Ohio State through social events, casual hangouts, food, and music."}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-purple-200">
              <Link
                href={`/events/${EVENTS[0].slug}`}
                onClick={playClick}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#250d38] border border-purple-700 border-l-4 border-l-[#55CCA2] hover:border-[#55CCA2] hover:bg-purple-900/60 transition-all group shadow-[2px_2px_0px_#55CCA2]"
              >
                <span className="w-2 h-2 bg-[#55CCA2] animate-pulse" />
                <span className="text-[#55CCA2] font-bold uppercase tracking-wider">
                  {locale === "ta" ? "அடுத்த நிகழ்வு:" : "Next Event:"}
                </span>
                <span className="group-hover:text-white transition-colors">
                  {locale === "ta" ? EVENTS[0].titleTa : EVENTS[0].titleEn}
                </span>
              </Link>
            </div>
          </div>

          {/* Stay in Sangam Dispatch Console */}
          <div className="p-6 bg-purple-950/90 border-2 border-purple-600/70 max-w-md shadow-[5px_5px_0px_#55CCA2] text-left">
            <div className="border-b border-purple-700/60 pb-2 mb-3">
              <h4 className="text-base font-bold text-white font-display uppercase tracking-wider">
                {locale === "ta" ? "சங்கச் செய்திகளைப் பெறுங்கள்" : "Stay in the Sangam Loop"}
              </h4>
            </div>

            <p className="text-xs text-purple-200/85 mb-4 font-body leading-relaxed">
              {locale === "ta"
                ? "நிகழ்வுகள், இலவச உணவுப் பதிவுகள், மற்றும் சந்திப்புகள் பற்றிய எளிய மின்னஞ்சல் செய்திகள்."
                : "Get event announcements, food updates, and casual social reminders sent to your email."}
            </p>

            {isSubscribed ? (
              <div className="p-3.5 bg-emerald-950/70 border-2 border-[#55CCA2] text-white space-y-2 shadow-[2px_2px_0px_#55CCA2]">
                <div className="flex items-center gap-2 text-[#55CCA2] font-bold text-xs font-mono uppercase">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{activeIsBuckeye ? "Buckeye Verified · Connected" : "Subscribed · Welcome!"}</span>
                </div>
                <p className="text-xs text-purple-100/90 font-body leading-relaxed">
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
                    className="w-full px-3.5 py-2.5 bg-purple-900/60 border-2 border-purple-500 text-white placeholder-purple-300/60 text-xs outline-none focus:border-[#55CCA2] transition-[border-color,background-color] duration-150 font-mono disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-5 py-2.5 btn-sangam-mint text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 shrink-0 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#250d38] cursor-pointer"
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

        {/* Links & Legal Bottom Bar (Keeping Board in its dedicated tab) */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-purple-200/80">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/" className="hover:text-[#55CCA2] transition-colors">{t("nav.home")}</Link>
            <Link href="/events" className="hover:text-[#55CCA2] transition-colors">{t("nav.events")}</Link>
            <Link href="/about" className="hover:text-[#55CCA2] transition-colors">{t("nav.about")}</Link>
            <Link href="/board" className="hover:text-[#55CCA2] font-semibold transition-colors">{t("nav.board")}</Link>
            <Link href="/gallery" className="hover:text-[#55CCA2] transition-colors">{t("nav.gallery")}</Link>
            <Link href="/guide" className="hover:text-[#55CCA2] transition-colors">{t("nav.guide")}</Link>
            <Link href="/join" className="hover:text-[#55CCA2] transition-colors">{t("nav.join")}</Link>
            <Link href="/suggestions" className="hover:text-[#55CCA2] transition-colors">{t("nav.suggestions")}</Link>
            <Link href="/links" className="text-[#55CCA2] font-semibold hover:underline transition-colors">Quick Links</Link>
          </div>

          <div className="text-center md:text-right font-mono text-[11px] space-y-1">
            <p className="text-purple-100">© {new Date().getFullYear()} OSU Tamil Sangam. The Ohio State University.</p>
            <p className="text-purple-300/60 text-[10px]">
              Registered student organization at Ohio State. Not an official university entity.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
