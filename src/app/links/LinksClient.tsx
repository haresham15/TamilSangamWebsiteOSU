"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Calendar,
  Users,
  Compass,
  MessageSquare,
  Mail,
  Check,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Camera,
  ExternalLink,
  Images,
  Lightbulb,
  Award,
  FileText,
  Music2,
} from "lucide-react";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";
import { CulturalCard } from "@/components/ui/CulturalCard";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { SITE_CONFIG } from "@/data/siteConfig";
import { EVENTS } from "@/data/events";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.32a6.34 6.34 0 0 0-.85-.06A6.33 6.33 0 0 0 3 15.6a6.34 6.34 0 0 0 10.82 4.48 6.27 6.27 0 0 0 1.86-4.47V8.71a8.18 8.18 0 0 0 4.91 1.63v-3.45a4.85 4.85 0 0 1-1-.2z" />
  </svg>
);

interface PreviousEventAlbum {
  id: string;
  num: string;
  title: string;
  season: string;
  location: string;
  url: string;
}

const PREVIOUS_EVENT_ALBUMS: PreviousEventAlbum[] = [
  {
    id: "yaar-andha-killer",
    num: "01",
    title: 'TS "Yaar Andha Killer?" Mystery',
    season: "Fall 2026 · Murder Mystery Night",
    location: "Houston Grove Room, Ohio Union",
    url: SITE_CONFIG.googlePhotosAlbums.album1,
  },
  {
    id: "berry-cute-picnic",
    num: "02",
    title: 'TS "A Berry Cute Picnic"',
    season: "Fall 2025 · Welcome Kickback",
    location: "South Oval Lawn",
    url: SITE_CONFIG.googlePhotosAlbums.album2,
  },
  {
    id: "streetside-sapad",
    num: "03",
    title: "TS Streetside Sapad & Game Night",
    season: "Spring 2026 · General Body Gathering",
    location: "Campus Hall / Ohio Union",
    url: SITE_CONFIG.googlePhotosAlbums.album3,
  },
  {
    id: "namma-jathara",
    num: "04",
    title: "TS x TT: Namma Jathara Carnival",
    season: "Spring 2026 · Joint Spring Carnival",
    location: "RPAC Plaza / South Oval",
    url: SITE_CONFIG.googlePhotosAlbums.album4,
  },
  {
    id: "autumn-gathering",
    num: "05",
    title: "TS x TT Autumn Gathering",
    season: "Fall 2025 · Inter-Club Fellowship",
    location: "Ohio State Campus Spaces",
    url: SITE_CONFIG.googlePhotosAlbums.album5,
  },
];

const DIWALI_SLUG = "namma-deepavali-2026";
const DIWALI_FORM_URL =
  EVENTS.find((e) => e.slug === DIWALI_SLUG)?.interestFormUrl ?? `/events/${DIWALI_SLUG}`;

/** Category-coded icon badges: purple = events/board, teal = chats & social, bronze = vaults/constitution. */
type LinkCategory = "purple" | "teal" | "bronze";

const CATEGORY = {
  purple: {
    badge: "bg-brand-purple-soft text-brand-purple border-brand-purple/25",
    label: "text-brand-purple",
    chip: "bg-brand-purple-soft text-brand-purple",
  },
  teal: {
    badge: "bg-brand-teal-soft text-brand-teal border-brand-teal/25",
    label: "text-brand-teal",
    chip: "bg-brand-teal-soft text-brand-teal",
  },
  bronze: {
    badge: "bg-surface-card-parchment text-ink-umber border-accent-bronze/50",
    label: "text-ink-umber",
    chip: "bg-surface-card-parchment text-ink-umber border border-accent-bronze/40",
  },
} as const;

const SMALL_CAPS = "font-sans font-semibold uppercase tracking-[0.14em]";
const META = `${SMALL_CAPS} text-[11px]`;
const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal";

interface LinkCardProps {
  href: string;
  external?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  category: LinkCategory;
  label: string;
  labelTa?: string;
  chip?: string;
  title: string;
  description: string;
}

/** One link in the bio stack: a CulturalCard light whose whole surface is the native link. */
function LinkCard({ href, external = false, icon: Icon, category, label, labelTa, chip, title, description }: LinkCardProps) {
  const tone = CATEGORY[category];
  const TrailIcon = external ? ExternalLink : ChevronRight;
  const inner = (
    <>
      <span className="flex min-w-0 items-start gap-3">
        <span className={`mt-0.5 shrink-0 rounded-lg border p-2.5 ${tone.badge}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="block min-w-0">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className={`${META} ${tone.label}`}>{label}</span>
            {labelTa && (
              <span lang="ta" className={`font-tamil text-xs leading-[1.6] tracking-normal ${tone.label}`}>
                {labelTa}
              </span>
            )}
            {chip && <span className={`rounded-full px-2 py-0.5 ${SMALL_CAPS} text-[10px] ${tone.chip}`}>{chip}</span>}
          </span>
          <span className="mt-0.5 block truncate font-serif text-base font-medium text-ink-earth transition-colors group-hover:text-brand-purple">
            {title}
          </span>
          <span className="mt-0.5 block truncate font-sans text-xs text-ink-umber">{description}</span>
        </span>
      </span>
      <TrailIcon
        aria-hidden="true"
        className="mt-2 h-4 w-4 shrink-0 text-ink-umber transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-brand-teal motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
      />
    </>
  );
  const linkClass = `group flex min-h-12 items-start justify-between gap-3 rounded-2xl p-4 text-left ${FOCUS_RING} focus-visible:ring-inset`;

  return (
    <CulturalCard as="li" variant="light">
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {inner}
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ) : (
        <Link href={href} className={linkClass}>
          {inner}
        </Link>
      )}
    </CulturalCard>
  );
}

export function LinksClient() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isPhotosMenuOpen, setIsPhotosMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleCopy = (key: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedItem(key);
      setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  const socialLink = `inline-flex min-h-12 items-center gap-1.5 px-1 font-sans text-xs font-medium text-ink-umber transition-colors rounded ${FOCUS_RING}`;

  return (
    <div className="relative flex min-h-dvh flex-col justify-between overflow-x-clip bg-bg-sandstone px-4 pb-28 pt-10 font-sans text-ink-earth texture-khadi">
      {/* Soft bronze இணை watermark (WatermarkGlyph is aria-hidden and lang="ta") */}
      <WatermarkGlyph text="இணை" position="center" theme="bronze" opacity={0.06} />

      {/* Top Persistent Return Bar */}
      <header className="relative z-10 mx-auto mb-6 flex w-full max-w-md items-center justify-between">
        <Link
          href="/"
          className={`inline-flex min-h-12 items-center gap-1.5 rounded text-sm text-ink-umber transition-colors hover:text-brand-purple ${FOCUS_RING}`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Main Website</span>
        </Link>
        <span className={`${META} text-ink-umber`}>Bio Hub</span>
      </header>

      {/* Centered bio-link column (the /links R1 exception) */}
      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center text-center">
        {/* Prominent 'Explore Full Website' Top Banner */}
        <CulturalCard variant="light" className="mb-8 w-full">
          <Link
            href="/"
            className={`group flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl p-4 ${FOCUS_RING} focus-visible:ring-inset`}
          >
            <span className="flex items-center gap-2.5 pl-1">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-purple" aria-hidden="true" />
              <span className={`${SMALL_CAPS} text-xs text-ink-earth transition-colors group-hover:text-brand-purple`}>
                Explore Full Website
              </span>
            </span>
            <span className="flex items-center gap-1.5 font-sans text-sm font-semibold text-brand-teal">
              <span>Enter Site</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
            </span>
          </Link>
        </CulturalCard>

        {/* Official Collegiate Crest & Verified Organization Badge */}
        <div className="relative mb-4 h-24 w-24 rounded-full border-2 border-accent-zari bg-bg-ivory p-1 shadow-[0_8px_24px_rgba(91,44,134,0.12)]">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-bg-ivory">
            <Image
              src="/emblem.svg"
              alt="The Ohio State University Tamil Sangam Official Seal"
              width={96}
              height={96}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg-ivory bg-brand-purple shadow-[0_4px_12px_rgba(91,44,134,0.25)]"
            title="Recognized Student Organization · The Ohio State University"
          >
            <Check className="h-3.5 w-3.5 stroke-[3] text-ink-alabaster" />
          </div>
        </div>

        {/* Club Handle & Institutional Badge */}
        <div className="mb-1 flex flex-wrap items-center justify-center gap-2">
          <h1 className="font-serif text-2xl font-bold text-ink-earth sm:text-3xl">{SITE_CONFIG.brandNameEn}</h1>
          <span className={`inline-flex items-center rounded-full border border-brand-purple/30 bg-brand-purple-soft px-2.5 py-0.5 ${SMALL_CAPS} text-[10px] text-brand-purple`}>
            Official RSO
          </span>
        </div>
        <p className={`${META} mb-1.5 text-ink-umber`}>@tamilsangam.osu · The Ohio State University</p>
        <p className="mb-6 max-w-sm font-sans text-xs leading-relaxed text-ink-umber">
          Office of Student Life · Recognized Student Organization · Columbus, OH
        </p>

        {/* Quick Social Actions Row */}
        <div className="mb-8 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-1 border-b border-border-warm pb-6">
          <a
            href={SITE_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${socialLink} hover:text-brand-purple`}
            aria-label="Instagram profile (opens in a new tab)"
          >
            <InstagramIcon className="h-4 w-4 text-brand-purple" />
            <span>Instagram</span>
          </a>
          <a
            href={SITE_CONFIG.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${socialLink} hover:text-brand-teal`}
            aria-label="TikTok profile (opens in a new tab)"
          >
            <TikTokIcon className="h-3.5 w-3.5 text-brand-teal" />
            <span>TikTok</span>
          </a>
          <a
            href={SITE_CONFIG.groupMeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${socialLink} hover:text-brand-teal`}
            aria-label="GroupMe chat (opens in a new tab)"
          >
            <MessageSquare className="h-4 w-4 text-brand-teal" aria-hidden="true" />
            <span>GroupMe</span>
          </a>
          <button
            type="button"
            onClick={() => handleCopy("email", SITE_CONFIG.contactEmail)}
            className={`${socialLink} cursor-pointer hover:text-brand-purple`}
            aria-label="Copy Contact Email"
          >
            {copiedItem === "email" ? (
              <>
                <Check className="h-4 w-4 text-brand-teal" aria-hidden="true" />
                <span className="font-bold text-brand-teal" role="status">Copied</span>
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 text-ink-umber" aria-hidden="true" />
                <span>Email</span>
              </>
            )}
          </button>
        </div>

        {/* Interactive Link Stack */}
        <div className="w-full space-y-6 text-left">
          {/* FEATURED: Diwali 2026 Sign-Up Form (TS × MS × KS) — the page's only deep element */}
          <CulturalCard variant="pathirikai" as="article" className="p-5 sm:p-6" aria-labelledby="links-diwali-heading">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent-zari" aria-hidden="true" />
                <Eyebrow tone="dark">Upcoming Event · Diwali 2026</Eyebrow>
              </span>
              <span className={`rounded-full border border-accent-zari/60 px-2 py-0.5 ${SMALL_CAPS} text-[10px] text-accent-zari`}>
                Sign-ups open
              </span>
            </div>

            <h2 id="links-diwali-heading" className="font-serif text-xl font-bold leading-tight text-ink-alabaster">
              Diwali 2026: TS × MS × KS
            </h2>
            <p className="mt-1 font-tamil text-sm leading-[1.6] text-brand-lavender" lang="ta">
              நம்ம தீபாவளி · நிகழ்ச்சி &amp; நடனப் பதிவு
            </p>
            <p className="mt-2 font-sans text-sm leading-relaxed text-ink-sand">
              Tamil Sangam, Kannada Sangam, and Mallu Society are hosting Diwali on Nov 15th! Sign up for dance performances, cultural acts, or attend.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border-zari-muted pt-4">
              <MuttramButton
                href={DIWALI_FORM_URL}
                external={DIWALI_FORM_URL.startsWith("http")}
                onDark
                icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
              >
                Open sign-up form
              </MuttramButton>
              <MuttramButton
                href="/dance"
                variant="secondary"
                onDark
                icon={<Music2 className="h-4 w-4" aria-hidden="true" />}
              >
                Dance Hub
              </MuttramButton>
              <MuttramButton href={`/events/${DIWALI_SLUG}`} variant="ghost" onDark>
                Dossier →
              </MuttramButton>
            </div>
          </CulturalCard>

          {/* Section: Core Gatherings & Community */}
          <ul className="space-y-3">
            <LinkCard
              href="/dance"
              icon={Music2}
              category="purple"
              label="Stage Sign-Ups"
              labelTa="ஆடல் அரங்கம்"
              chip="Form Live Now"
              title="Dance Performance Registration"
              description="Diwali 2026 dance troupes · Kuthu, Gaana, and cinematic fusion"
            />
            <LinkCard
              href="/events"
              icon={Calendar}
              category="purple"
              label="Events & Calendar · All Welcome"
              title="Event Schedule & Gatherings"
              description="Celebrations, festivals, dates, and campus event dossiers"
            />
            <LinkCard
              href="/join"
              icon={Users}
              category="purple"
              label="Join the Family"
              chip="100% Free · $0 Dues"
              title="Membership & Community Guestbook"
              description="Sign the guestbook, performer signups & freshman mentorship"
            />

            {/* Photos Archive with Expandable Previous Events Menu */}
            <CulturalCard as="li" variant="light">
              <button
                type="button"
                onClick={() => setIsPhotosMenuOpen((prev) => !prev)}
                aria-expanded={isPhotosMenuOpen}
                aria-controls="photos-menu-content"
                className={`flex min-h-12 w-full cursor-pointer items-start justify-between gap-3 rounded-2xl p-4 text-left ${FOCUS_RING} focus-visible:ring-inset`}
              >
                <span className="flex min-w-0 items-start gap-3">
                  <span className={`mt-0.5 shrink-0 rounded-lg border p-2.5 ${CATEGORY.bronze.badge}`}>
                    <Camera className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="block min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={`${META} ${CATEGORY.bronze.label}`}>Photo Archive</span>
                      <span className={`rounded-full px-2 py-0.5 ${SMALL_CAPS} text-[10px] ${CATEGORY.bronze.chip}`}>
                        {PREVIOUS_EVENT_ALBUMS.length} Albums
                      </span>
                    </span>
                    <span className="mt-0.5 block font-serif text-base font-medium text-ink-earth">
                      Previous Event Photo Vaults
                    </span>
                    <span className="mt-0.5 block font-sans text-xs text-ink-umber">
                      {isPhotosMenuOpen ? "Tap to close album list" : "Tap to open all high-resolution Google Photos links"}
                    </span>
                  </span>
                </span>
                <motion.span
                  aria-hidden="true"
                  className="mt-2 shrink-0 text-ink-umber"
                  animate={{ rotate: isPhotosMenuOpen ? 180 : 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isPhotosMenuOpen && (
                  <motion.div
                    id="photos-menu-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden border-t border-border-warm"
                  >
                    <div className="px-4 pb-3 pt-3">
                      <p className={`${META} px-1 text-ink-umber`}>Official Google Photos Albums</p>
                      <ul className="mt-1 divide-y divide-border-warm">
                        {PREVIOUS_EVENT_ALBUMS.map((album) => (
                          <li key={album.id}>
                            <a
                              href={album.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`group/album flex min-h-12 items-center justify-between gap-3 rounded px-1 py-3 ${FOCUS_RING}`}
                            >
                              <span className="block min-w-0">
                                <span className="flex items-baseline gap-2">
                                  <span className="font-serif text-sm font-semibold text-brand-purple">{album.num}</span>
                                  <span className="truncate font-serif text-sm font-medium text-ink-earth transition-colors group-hover/album:text-brand-purple">
                                    {album.title}
                                  </span>
                                </span>
                                <span className="mt-0.5 block truncate font-sans text-xs text-ink-umber">
                                  {album.season} · {album.location}
                                </span>
                              </span>
                              <span className="flex shrink-0 items-center gap-1 font-sans text-xs font-medium text-brand-teal">
                                <span className="hidden sm:inline">Open</span>
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                <span className="sr-only">(opens in a new tab)</span>
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>

                      {/* Link to Website Living Photo Gallery */}
                      <Link
                        href="/gallery"
                        className={`mt-1 flex min-h-12 w-full items-center justify-between gap-2 border-t border-border-warm px-1 pt-3 font-sans text-sm font-medium text-brand-teal underline-offset-4 hover:underline ${FOCUS_RING}`}
                      >
                        <span className="flex items-center gap-2">
                          <Images className="h-4 w-4 text-brand-purple" aria-hidden="true" />
                          <span>View 35mm Campus Gallery on Website</span>
                        </span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CulturalCard>
          </ul>

          {/* Section: Community Channels */}
          <div className="space-y-3">
            <Eyebrow as="p" className="px-1">Official Community &amp; Chats</Eyebrow>
            <ul className="space-y-3">
              <LinkCard
                href={SITE_CONFIG.groupMeUrl}
                external
                icon={MessageSquare}
                category="teal"
                label="Student Chat · GroupMe"
                title="Official Student GroupMe"
                description="120+ Buckeyes · rideshares, meetups, food spots & active chat"
              />
              <LinkCard
                href={SITE_CONFIG.instagramUrl}
                external
                icon={InstagramIcon}
                category="teal"
                label="Instagram · @tamilsangam.osu"
                title="Official Instagram Page"
                description="Stories, live event announcements & photo reels"
              />
              <LinkCard
                href={SITE_CONFIG.tiktokUrl}
                external
                icon={TikTokIcon}
                category="teal"
                label="TikTok · @osutamilsangam"
                title="Official TikTok Channel"
                description="Campus POV clips, dance routines & event highlights"
              />
            </ul>
          </div>

          {/* Section: Campus Exploration & Student Resources */}
          <div className="space-y-3">
            <Eyebrow as="p" className="px-1">Student Resources &amp; Discovery</Eyebrow>
            <ul className="space-y-3">
              <LinkCard
                href="/guide"
                icon={Compass}
                category="teal"
                label="Freshmen & Transfer Handbook"
                title="Student Survival Guide & FAQ"
                description="Columbus South Asian dining, grocery markets, transit & housing"
              />
              <LinkCard
                href="/board"
                icon={Award}
                category="purple"
                label="2026–2027 Leadership"
                title="Executive Board Officers"
                description="Meet the team leading Tamil Sangam at Ohio State"
              />
              <LinkCard
                href="/ideas"
                icon={Lightbulb}
                category="purple"
                label="Propose Events & Feedback"
                title="The Ideas Hearth"
                description="Submit anonymous suggestions, workshop ideas & event requests"
              />
              <LinkCard
                href="/games"
                icon={Sparkles}
                category="teal"
                label="Interactive Cultural Lab"
                title="Wordle, Connections & Kolam"
                description="Play biweekly Tamil-English word puzzles (Sollu) and pattern games"
              />
              <LinkCard
                href={SITE_CONFIG.constitutionPdfPath}
                external
                icon={FileText}
                category="bronze"
                label="Official Governance"
                title="Constitution (2026–2027)"
                description="Official student organization bylaws registered at Ohio State"
              />
            </ul>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 mt-12 space-y-1 text-center font-sans text-xs text-ink-umber">
        <p className="font-medium text-ink-earth">{SITE_CONFIG.universityAffiliationEn}</p>
        <p className="leading-[1.6]">
          <span lang="ta" className="font-tamil">{SITE_CONFIG.officialNameTa}</span> · Project Aintinai (
          <span lang="ta" className="font-tamil">ஐந்திணை</span>)
        </p>
      </footer>
    </div>
  );
}
