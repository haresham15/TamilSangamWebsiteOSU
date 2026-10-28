"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { useTinai } from "@/context/TinaiContext";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle, ExternalLink, Volume2, VolumeX, Globe, Search } from "lucide-react";
import { getNextFlagshipEvent } from "@/data/events";
import { SITE_CONFIG } from "@/data/siteConfig";
import { CURRENT_BOARD, BoardMember } from "@/data/board";
import { DirectorFooterButton, isDirectorEnabled } from "@/director/DirectorHUD";

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

interface FooterProps {
  onOpenSearch?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSearch }) => {
  const pathname = usePathname();
  const { locale, toggleLocale, t } = useLocale();
  const { isSoundEnabled, toggleSound, playClick, playBell } = useAudio();
  const { currentTinai, meta, setTinai } = useTinai();
  const savedEmail = useSyncExternalStore(subscribeStorage, getSavedEmail, () => "");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isBuckeye, setIsBuckeye] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [directorEnabled, setDirectorEnabled] = useState(false);
  const [liveCalendarEvent, setLiveCalendarEvent] = useState<{
    id: string;
    slug: string | null;
    titleEn: string;
    titleTa: string | null;
    dateShort: string;
  } | null>(null);

  React.useEffect(() => {
    setDirectorEnabled(isDirectorEnabled());

    let active = true;
    fetch("/api/events")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data || !Array.isArray(data.events)) return;
        const now = Date.now();
        const upcoming = data.events.find((e: any) => {
          const t = new Date(e.start).getTime();
          return !isNaN(t) && t >= now - 4 * 3600000;
        });
        if (upcoming) {
          const dt = new Date(upcoming.start);
          const dateShort = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            month: "short",
            day: "numeric",
          }).format(dt);
          setLiveCalendarEvent({
            id: upcoming.id,
            slug: upcoming.slug,
            titleEn: upcoming.titleEn,
            titleTa: upcoming.titleTa,
            dateShort,
          });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

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

  // Marquee only renders on the Home page per Content Revamp Plan Section 3.7
  const isHomePage = pathname === "/";

  return (
    <footer className="relative bg-[#1E1B18] border-t border-[#2A2825]/40 overflow-hidden text-[#FAF9F6]">
      {/* ========================================================================= */}
      {/* 1. TOP ROLLING CREDITS MARQUEE (Home Page End-Credits Only)                */}
      {/* ========================================================================= */}
      {isHomePage && (
        <div className="relative w-full bg-[#161412] border-b border-white/10 py-3 overflow-hidden select-none">
          {/* Infinite Running Marquee Film Credits */}
          <div className="relative flex overflow-x-hidden">
            <div className="py-0.5 animate-[marquee-left_36s_linear_infinite] whitespace-nowrap flex items-center font-sans text-xs uppercase tracking-wider text-[#FAF9F6]/80 font-medium">
              <span className="mx-4 text-[#E5A93C] font-semibold">★ EXECUTIVE PRODUCTION: OSU TAMIL SANGAM</span>
              {CURRENT_BOARD.map((officer) => (
                <React.Fragment key={officer.id}>
                  <span className="mx-4 text-white/30">·</span>
                  <span className="mx-4 text-white/90">
                    {officer.roleEn.toUpperCase()}: {officer.nameEn.toUpperCase()} ({officer.nameTa})
                  </span>
                </React.Fragment>
              ))}
              <span className="mx-4 text-white/30">·</span>
              <span className="mx-4 text-white/70">THE OHIO STATE UNIVERSITY · COLUMBUS, OH · EST. 2021 · REGISTERED 2024</span>
            </div>

            <div
              aria-hidden="true"
              className="py-0.5 animate-[marquee-left_36s_linear_infinite] whitespace-nowrap flex items-center font-sans text-xs uppercase tracking-wider text-[#FAF9F6]/80 font-medium"
            >
              <span className="mx-4 text-[#E5A93C] font-semibold">★ EXECUTIVE PRODUCTION: OSU TAMIL SANGAM</span>
              {CURRENT_BOARD.map((officer) => (
                <React.Fragment key={`dup-${officer.id}`}>
                  <span className="mx-4 text-white/30">·</span>
                  <span className="mx-4 text-white/90">
                    {officer.roleEn.toUpperCase()}: {officer.nameEn.toUpperCase()} ({officer.nameTa})
                  </span>
                </React.Fragment>
              ))}
              <span className="mx-4 text-white/30">·</span>
              <span className="mx-4 text-white/70">THE OHIO STATE UNIVERSITY · COLUMBUS, OH · EST. 2021 · REGISTERED 2024</span>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* 2. MAIN CINEMATIC CONTENT & CLAPPERBOARD DISPATCH                         */}
      {/* ========================================================================= */}
      <div className="max-w-[1440px] mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-white/10">
          
          {/* Brand & Editorial Column */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-12 h-12 border border-[#E5A93C]/40 p-2 shrink-0 flex items-center justify-center">
                  <Image
                    src="/emblem.svg"
                    alt="OSU Tamil Sangam Official Logo"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight font-serif">{t("brand.name")}</h3>
                  <p className="text-xs text-[#E5A93C] font-mono uppercase tracking-wider font-semibold">
                    The Ohio State University · Columbus, OH
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/80 max-w-lg leading-relaxed mb-6 font-sans">
                {locale === "ta"
                  ? "ஓஹியோ பல்கலைக்கழகத்தில் தமிழ் மாணவர்கள் மற்றும் அனைத்து நண்பர்களையும் ஒன்றிணைக்கும் மாணவர் அமைப்பு — நல்ல உணவு, இசை, மற்றும் நட்பின் சங்கமம்."
                  : "A student organization connecting Tamil students and friends of all backgrounds at Ohio State through social events, casual hangouts, food, and music."}
              </p>
            </div>

            {(() => {
              if (liveCalendarEvent) {
                const title =
                  locale === "ta" && liveCalendarEvent.titleTa
                    ? liveCalendarEvent.titleTa
                    : liveCalendarEvent.titleEn;
                const linkHref = `/events?view=calendar&event=${encodeURIComponent(
                  liveCalendarEvent.slug || liveCalendarEvent.id
                )}`;
                return (
                  <div className="flex flex-wrap items-center gap-4 text-xs font-sans">
                    <Link
                      href={linkHref}
                      onClick={playClick}
                      className="inline-flex items-center gap-2 pb-1 border-b border-[#E5A93C] text-xs font-sans text-white hover:text-[#E5A93C] transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C] animate-pulse" />
                      <span className="text-[#E5A93C] font-semibold uppercase tracking-wider font-mono">
                        {locale === "ta" ? "அடுத்த நிகழ்வு:" : "Next Event:"}
                      </span>
                      <span className="text-white/90 group-hover:text-white transition-colors">
                        {title} · {liveCalendarEvent.dateShort}
                      </span>
                      <span className="text-[#E5A93C] transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                );
              }
              const nextFlagship = getNextFlagshipEvent();
              if (nextFlagship) {
                return (
                  <div className="flex flex-wrap items-center gap-4 text-xs font-sans">
                    <Link
                      href={`/events/${nextFlagship.slug}`}
                      onClick={playClick}
                      className="inline-flex items-center gap-2 pb-1 border-b border-[#E5A93C] text-xs font-sans text-white hover:text-[#E5A93C] transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C] animate-pulse" />
                      <span className="text-[#E5A93C] font-semibold uppercase tracking-wider font-mono">
                        {locale === "ta" ? "அடுத்த நிகழ்வு:" : "Next Event:"}
                      </span>
                      <span className="text-white/90 group-hover:text-white transition-colors">
                        {locale === "ta" ? nextFlagship.titleTa : nextFlagship.titleEn}
                      </span>
                      <span className="text-[#E5A93C] transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                );
              }
              return (
                <div className="flex flex-wrap items-center gap-4 text-xs font-sans">
                  <a
                    href={SITE_CONFIG.groupMeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 pb-1 border-b border-[#E5A93C] text-xs font-sans text-white hover:text-[#E5A93C] transition-colors group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C] animate-pulse" />
                    <span className="text-[#E5A93C] font-semibold uppercase tracking-wider font-mono">
                      {locale === "ta" ? "அடுத்த நிகழ்வு:" : "Next Event:"}
                    </span>
                    <span className="text-white/90 group-hover:text-white transition-colors">
                      {locale === "ta" ? "அறிவிக்கப்படும் (TBA) · GroupMe-ல் இணைக" : "TBA · Join GroupMe for Date Drops"}
                    </span>
                    <span className="text-[#E5A93C] transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>
              );
            })()}
          </div>

          {/* Stay in Sangam Dispatch: Borderless Column Naked on Footer Background */}
          <div className="lg:col-span-5 text-left relative lg:border-l lg:border-white/10 lg:pl-10 space-y-4">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />
                <span>{locale === "ta" ? "நிகழ்வு தகவல்கள் பெறுக" : "Stay in Sangam"}</span>
              </h4>
            </div>

            <p className="text-xs text-white/70 font-sans leading-relaxed">
              {locale === "ta"
                ? "நிகழ்வுகள், உணவு விருந்துகள், மற்றும் சந்திப்புகள் பற்றிய அறிவிப்புகளைப் பெறுங்கள். (உறுப்பினராக இணைய 'Join' பக்கத்திற்குச் செல்லவும்)."
                : "Get event announcements, food updates, and casual social reminders sent to your inbox. (Note: To become an active voting member, complete the Join form)."}
            </p>

            {isSubscribed ? (
              <div className="py-4 border-t border-b border-white/10 text-white space-y-2.5">
                <div className="flex items-center gap-2 text-[#E5A93C] font-semibold text-xs font-mono uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#E5A93C]" />
                  <span>{activeIsBuckeye ? "Buckeye Verified · Connected" : "Subscribed · Welcome!"}</span>
                </div>
                <p className="text-xs text-white/90 font-sans leading-relaxed">
                  {activeStatusMessage}
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10">
                  <a
                    href={SITE_CONFIG.groupMeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-sans text-[#E5A93C] font-medium hover:underline"
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
                    className="text-[11px] font-sans text-white/60 hover:text-white underline cursor-pointer"
                  >
                    Use another email
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4 pt-2">
                {/* Honeypot field for bot suppression */}
                <input
                  type="text"
                  name="hp_sangam"
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                  <div className="flex-1">
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
                      className="w-full py-2.5 bg-transparent border-b border-white/20 text-white placeholder-white/40 text-xs outline-none focus:border-[#E5A93C] transition-colors font-sans disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="pb-2.5 border-b-2 border-[#E5A93C] text-[#E5A93C] hover:text-white hover:border-white font-semibold text-xs font-sans uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-60 cursor-pointer"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>{locale === "ta" ? "தகவல் பெறுக" : "Get Updates"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {status === "error" && (
                  <div className="p-3 border-l-2 border-rose-500 bg-rose-950/40 text-rose-200 text-xs flex items-start gap-2 font-sans">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-sans text-white/50 pt-1">
                  <span>Open to all Buckeyes & friends · No Tamil required</span>
                  {subscriberCount && (
                    <span className="text-[#E5A93C] font-mono font-semibold">
                      {subscriberCount} in loop
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Relocated Utilities Bar (Purged from Naked Header) */}
        <div className="pt-8 pb-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
          <div className="flex items-center gap-2 text-white/50 font-mono text-[11px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />
            <span>{locale === "ta" ? "தள கருவிகள் & சூழல்" : "Quick Tools & Ambience"}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search ⌘K Trigger */}
            {onOpenSearch && (
              <button
                onClick={() => {
                  playClick();
                  onOpenSearch();
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white/90 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                title="Search (⌘K)"
              >
                <Search className="w-3.5 h-3.5 text-[#E5A93C]" />
                <span>{locale === "ta" ? "தேடல்" : "Search"}</span>
                <kbd className="text-[10px] font-mono px-1 py-0.2 bg-white/10 rounded-xs text-white/60">⌘K</kbd>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => {
                playClick();
                toggleLocale();
              }}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white/90 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
              title="Toggle Language (EN / தமிழ்)"
            >
              <Globe className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span className="font-mono text-[11px] font-bold text-[#E5A93C]">
                {locale === "en" ? "TA" : "EN"}
              </span>
              <span>{locale === "en" ? "தமிழ் பதிப்பு" : "English"}</span>
            </button>

            {/* Interactive Audio Toggle */}
            <button
              onClick={toggleSound}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white/90 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
              title={isSoundEnabled ? "Mute interactive audio" : "Enable interactive audio"}
            >
              {isSoundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#E5A93C]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-white/40" />
              )}
              <span>{isSoundEnabled ? "Audio On" : "Audio Muted"}</span>
            </button>

            {/* Active Tinai Landscape */}
            <div className="px-3 py-1.5 bg-white/5 border border-white/15 text-white/80 flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 shrink-0"
                style={{ backgroundColor: meta.accentColor }}
              />
              <span className="text-[11px]">
                {locale === "ta" ? meta.nameTa : meta.nameEn} ({locale === "ta" ? meta.timeLabelTa : meta.timeLabelEn})
              </span>
            </div>
          </div>
        </div>

        {/* Links & Bottom Navigation Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/70">
          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-6 font-sans font-medium">
            <Link href="/" className="hover:text-[#E5A93C] transition-colors">{t("nav.home")}</Link>
            <Link href="/events" className="hover:text-[#E5A93C] transition-colors">{t("nav.events")}</Link>
            <Link href="/about" className="hover:text-[#E5A93C] transition-colors">{t("nav.about")}</Link>
            <Link href="/board" className="hover:text-[#E5A93C] font-semibold transition-colors">{t("nav.board")}</Link>
            <Link href="/gallery" className="hover:text-[#E5A93C] transition-colors">{t("nav.gallery")}</Link>
            <Link href="/guide" className="hover:text-[#E5A93C] transition-colors">{locale === "ta" ? "வழிகாட்டி & கேள்வி-பதில்" : "Guide & FAQ"}</Link>
            <Link href="/suggestions" className="hover:text-[#E5A93C] transition-colors">{locale === "ta" ? "கருத்துகள்" : "Ideas"}</Link>
            <Link href="/games" className="hover:text-[#E5A93C] transition-colors inline-flex items-center gap-1.5">
              <span>{locale === "ta" ? "விளையாட்டு" : "Games"}</span>
              <span className="font-mono text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-[1px] rounded-full bg-[#E5A93C]/20 text-[#E5A93C] border border-[#E5A93C]/40">
                {locale === "ta" ? "புதிது" : "NEW"}
              </span>
            </Link>
            <Link href="/join" className="hover:text-[#E5A93C] font-semibold text-[#E5A93C] transition-colors">{t("nav.join")}</Link>
            <a 
              href={`mailto:${SITE_CONFIG.contactEmail}`}
              className="text-white/80 hover:text-[#E5A93C] transition-colors"
            >
              Contact
            </a>
            <a 
              href={SITE_CONFIG.instagramUrl}
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white/80 hover:text-[#E5A93C] transition-colors"
            >
              Instagram
            </a>
            <a 
              href={SITE_CONFIG.groupMeUrl}
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white/80 hover:text-[#E5A93C] transition-colors"
            >
              GroupMe
            </a>
            <a 
              href={SITE_CONFIG.constitutionPdfPath} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#E5A93C] font-semibold hover:underline transition-colors flex items-center gap-1.5"
            >
              <span>{locale === "ta" ? "சாசனம் (PDF)" : "Constitution"}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* 1-Hop Crawler Links for Event Dossiers */}
          <div className="w-full pt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-mono text-white/50 border-t border-white/5">
            <span className="text-[#E5A93C]/80 uppercase tracking-wider text-[10px]">Campus Dossiers:</span>
            <Link href="/events/yaar-andha-killer" className="hover:text-[#E5A93C] transition-colors">Yaar Andha Killer?</Link>
            <Link href="/events/berry-cute-picnic" className="hover:text-[#E5A93C] transition-colors">Berry Cute Picnic</Link>
            <Link href="/events/streetside-sapad" className="hover:text-[#E5A93C] transition-colors">Streetside Sapad</Link>
            <Link href="/events/namma-jathara" className="hover:text-[#E5A93C] transition-colors">Namma Jathara Carnival</Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {directorEnabled && (
              <div className="flex items-center gap-2">
                <DirectorFooterButton />
              </div>
            )}
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
