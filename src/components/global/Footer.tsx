"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { getNextFlagshipEvent } from "@/data/events";
import { SITE_CONFIG } from "@/data/siteConfig";
import { CURRENT_BOARD, BoardMember } from "@/data/board";
import { Eyebrow } from "@/components/muttram/Eyebrow";

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

export const Footer: React.FC<FooterProps> = () => {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const { playClick, playBell } = useAudio();
  const savedEmail = useSyncExternalStore(subscribeStorage, getSavedEmail, () => "");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isBuckeye, setIsBuckeye] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [liveCalendarEvent, setLiveCalendarEvent] = useState<{
    id: string;
    slug: string | null;
    titleEn: string;
    titleTa: string | null;
    dateShort: string;
  } | null>(null);

  React.useEffect(() => {
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
    <footer className="relative bg-bg-sangam-deep border-t border-accent-zari/40 overflow-hidden text-ink-alabaster shadow-[0_-8px_36px_rgba(199,147,71,0.06)]">
      {/* Ambient Warm Zari & Peacock Background Blooms */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_900px_450px_at_15%_100%,rgba(199,147,71,0.07),transparent_70%),radial-gradient(ellipse_700px_400px_at_85%_0%,rgba(43,181,168,0.06),transparent_70%)]"
        aria-hidden="true"
      />
      {/* ========================================================================= */}
      {/* 1. TOP ROLLING CREDITS MARQUEE (Home Page End-Credits Only)                */}
      {/* ========================================================================= */}
      {isHomePage && (
        <div className="relative w-full bg-bg-sangam-deep border-b border-accent-zari/20 py-3 overflow-hidden select-none">
          {/* Infinite Running Marquee Film Credits */}
          <div className="relative flex overflow-x-clip">
            <div className="py-0.5 animate-[marquee-left_36s_linear_infinite] whitespace-nowrap flex items-center font-sans text-xs uppercase tracking-wider text-ink-sand font-medium">
              <span className="mx-4 text-accent-zari font-semibold">★ EXECUTIVE PRODUCTION: OSU TAMIL SANGAM</span>
              {CURRENT_BOARD.map((officer) => (
                <React.Fragment key={officer.id}>
                  <span className="mx-4 text-ink-alabaster/30">·</span>
                  <span className="mx-4 text-ink-alabaster/90">
                    {officer.roleEn.toUpperCase()}: {officer.nameEn.toUpperCase()} ({officer.nameTa})
                  </span>
                </React.Fragment>
              ))}
              <span className="mx-4 text-ink-alabaster/30">·</span>
              <span className="mx-4 text-ink-alabaster/70">THE OHIO STATE UNIVERSITY · COLUMBUS, OH · EST. 2021 · REGISTERED 2024</span>
            </div>

            <div
              aria-hidden="true"
              className="py-0.5 animate-[marquee-left_36s_linear_infinite] whitespace-nowrap flex items-center font-sans text-xs uppercase tracking-wider text-ink-sand font-medium"
            >
              <span className="mx-4 text-accent-zari font-semibold">★ EXECUTIVE PRODUCTION: OSU TAMIL SANGAM</span>
              {CURRENT_BOARD.map((officer) => (
                <React.Fragment key={`dup-${officer.id}`}>
                  <span className="mx-4 text-ink-alabaster/30">·</span>
                  <span className="mx-4 text-ink-alabaster/90">
                    {officer.roleEn.toUpperCase()}: {officer.nameEn.toUpperCase()} ({officer.nameTa})
                  </span>
                </React.Fragment>
              ))}
              <span className="mx-4 text-ink-alabaster/30">·</span>
              <span className="mx-4 text-ink-alabaster/70">THE OHIO STATE UNIVERSITY · COLUMBUS, OH · EST. 2021 · REGISTERED 2024</span>
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
                <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                  <Image
                    src="/emblem.svg"
                    alt="OSU Tamil Sangam Official Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-ink-alabaster tracking-tight font-serif">{t("brand.name")}</h3>
                  <Eyebrow tone="dark" as="p">
                    The Ohio State University · Columbus, OH
                  </Eyebrow>
                </div>
              </div>
              <p className="text-sm text-ink-alabaster/80 max-w-lg leading-relaxed mb-6 font-sans">
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
                      className="inline-flex items-center gap-2 pb-1 border-b border-brand-teal-dark text-xs font-sans text-ink-alabaster hover:text-brand-teal-dark transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-teal-dark" />
                      <span className="text-brand-teal-dark font-semibold uppercase tracking-[0.14em] font-sans">
                        {locale === "ta" ? "அடுத்த நிகழ்வு:" : "Next Event:"}
                      </span>
                      <span className="text-ink-alabaster/90 group-hover:text-ink-alabaster transition-colors">
                        {title} · {liveCalendarEvent.dateShort}
                      </span>
                      <span className="text-brand-teal-dark transition-transform group-hover:translate-x-1">→</span>
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
                      className="inline-flex items-center gap-2 pb-1 border-b border-brand-teal-dark text-xs font-sans text-ink-alabaster hover:text-brand-teal-dark transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-teal-dark" />
                      <span className="text-brand-teal-dark font-semibold uppercase tracking-[0.14em] font-sans">
                        {locale === "ta" ? "அடுத்த நிகழ்வு:" : "Next Event:"}
                      </span>
                      <span className="text-ink-alabaster/90 group-hover:text-ink-alabaster transition-colors">
                        {locale === "ta" ? nextFlagship.titleTa : nextFlagship.titleEn}
                      </span>
                      <span className="text-brand-teal-dark transition-transform group-hover:translate-x-1">→</span>
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
                    className="inline-flex items-center gap-2 pb-1 border-b border-brand-teal-dark text-xs font-sans text-ink-alabaster hover:text-brand-teal-dark transition-colors group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-teal-dark" />
                    <span className="text-brand-teal-dark font-semibold uppercase tracking-[0.14em] font-sans">
                      {locale === "ta" ? "அடுத்த நிகழ்வு:" : "Next Event:"}
                    </span>
                    <span className="text-ink-alabaster/90 group-hover:text-ink-alabaster transition-colors">
                      {locale === "ta" ? "அறிவிக்கப்படும் (TBA) · GroupMe-ல் இணைக" : "TBA · Join GroupMe for Date Drops"}
                    </span>
                    <span className="text-brand-teal-dark transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>
              );
            })()}
          </div>

          {/* Stay in Sangam Dispatch: Borderless Column Naked on Footer Background */}
          <div className="lg:col-span-5 text-left relative lg:border-l lg:border-white/10 lg:pl-10 space-y-4">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-ink-alabaster font-sans uppercase tracking-[0.14em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-teal-dark" />
                <span lang={locale === "ta" ? "ta" : undefined} className={locale === "ta" ? "normal-case tracking-normal" : undefined}>
                  {locale === "ta" ? "நிகழ்வு தகவல்கள் பெறுக" : "Stay in Sangam"}
                </span>
              </h4>
            </div>

            <p className="text-xs text-ink-alabaster/70 font-sans leading-relaxed">
              {locale === "ta"
                ? "நிகழ்வுகள், உணவு விருந்துகள், மற்றும் சந்திப்புகள் பற்றிய அறிவிப்புகளைப் பெறுங்கள். (உறுப்பினராக இணைய 'Join' பக்கத்திற்குச் செல்லவும்)."
                : "Get event announcements, food updates, and casual social reminders sent to your inbox. (Note: To become an active voting member, complete the Join form)."}
            </p>

            {isSubscribed ? (
              <div className="py-4 border-t border-b border-white/10 text-ink-alabaster space-y-2.5">
                <div className="flex items-center gap-2 text-brand-teal-dark font-semibold text-xs font-sans uppercase tracking-[0.14em]">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-teal-dark" />
                  <span>{activeIsBuckeye ? "Buckeye Verified · Connected" : "Subscribed · Welcome!"}</span>
                </div>
                <p className="text-xs text-ink-alabaster/90 font-sans leading-relaxed">
                  {activeStatusMessage}
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10">
                  <a
                    href={SITE_CONFIG.groupMeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-sans text-brand-teal-dark font-medium hover:underline"
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
                    className="text-[11px] font-sans text-ink-alabaster/60 hover:text-ink-alabaster underline cursor-pointer"
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
                      className="w-full py-2.5 bg-transparent border-b border-white/20 text-ink-alabaster placeholder:text-ink-alabaster/40 text-xs outline-none focus:border-brand-teal-dark transition-colors font-sans disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="pb-2.5 border-b-2 border-brand-teal-dark text-brand-teal-dark hover:text-ink-alabaster hover:border-ink-alabaster font-semibold text-xs font-sans uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-60 cursor-pointer"
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

                <div className="flex items-center justify-between text-[11px] font-sans text-ink-alabaster/50 pt-1">
                  <span>Open to all Buckeyes & friends · No Tamil required</span>
                  {subscriberCount && (
                    <span className="text-accent-zari font-sans tabular-nums font-semibold">
                      {subscriberCount} in loop
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Links & Bottom Navigation Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-ink-alabaster/70">
          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-x-5 gap-y-0 font-sans font-medium">
            <Link href="/" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">{t("nav.home")}</Link>
            <Link href="/events" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">{t("nav.events")}</Link>
            <Link href="/guide" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">{locale === "ta" ? "வழிகாட்டி" : "Guide"}</Link>
            <Link href="/games" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">{locale === "ta" ? "விளையாட்டு" : "Games"}</Link>
            <Link href="/dance" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">{locale === "ta" ? "நடனம்" : "Dance"}</Link>
            <Link href="/gallery" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">{locale === "ta" ? "புகைப்படங்கள்" : "Gallery"}</Link>
            <Link href="/board" className="hover:text-brand-teal-dark font-semibold transition-colors">{t("nav.board")}</Link>
            <Link href="/about" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">{t("nav.about")}</Link>
            <Link href="/suggestions" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">{locale === "ta" ? "கருத்துகள்" : "Ideas"}</Link>
            <Link href="/join" className="hover:text-brand-teal-hover-dark font-semibold text-brand-teal-dark transition-colors">{t("nav.join")}</Link>
            <Link href="/links" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">{locale === "ta" ? "இணைப்புகள்" : "Links"}</Link>
            <Link href="/faq" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">{locale === "ta" ? "கேள்வி-பதில்" : "FAQ"}</Link>
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">{locale === "ta" ? "தனியுரிமை" : "Privacy"}</Link>
            <a 
              href={`mailto:${SITE_CONFIG.contactEmail}`}
              className="text-ink-alabaster/80 hover:text-brand-teal-dark transition-colors"
            >
              Contact
            </a>
            <a 
              href={SITE_CONFIG.instagramUrl}
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-ink-alabaster/80 hover:text-brand-teal-dark transition-colors"
            >
              Instagram
            </a>
            <a 
              href={SITE_CONFIG.groupMeUrl}
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-ink-alabaster/80 hover:text-brand-teal-dark transition-colors"
            >
              GroupMe
            </a>
            <a 
              href={SITE_CONFIG.constitutionPdfPath} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-accent-zari font-semibold hover:underline transition-colors flex items-center gap-1.5"
            >
              <span>{locale === "ta" ? "சாசனம் (PDF)" : "Constitution"}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* 1-Hop Crawler Links for Event Dossiers */}
          <div className="w-full pt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-sans text-ink-alabaster/50 border-t border-white/5">
            <span className="font-sans font-semibold text-accent-zari/80 uppercase tracking-[0.14em] text-[10px]">Campus Dossiers:</span>
            <Link href="/events/yaar-andha-killer" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">Yaar Andha Killer?</Link>
            <Link href="/events/berry-cute-picnic" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">Berry Cute Picnic</Link>
            <Link href="/events/streetside-sapad" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">Streetside Sapad</Link>
            <Link href="/events/namma-jathara" className="inline-flex min-h-11 items-center hover:text-brand-teal-dark transition-colors">Namma Jathara Carnival</Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-center md:text-right font-sans text-[11px] space-y-1">
              <p className="text-ink-alabaster/90">© {new Date().getFullYear()} OSU Tamil Sangam. The Ohio State University.</p>
              <p className="text-ink-alabaster/40 text-[10px]">
                Registered student organization at Ohio State. Not an official university entity.
              </p>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};
