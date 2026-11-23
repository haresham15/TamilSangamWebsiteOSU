"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import dynamic from "next/dynamic";
import { HeroKolamLoader } from "@/components/ui/HeroKolamLoader";

const GopuramZScroll = dynamic(
  () => import("@/components/about/GopuramZScroll").then((m) => m.GopuramZScroll),
  {
    ssr: false,
    loading: () => <HeroKolamLoader route="/about" minHeight="100dvh" />,
  }
);
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import { CulturalSection } from "@/components/ui/CulturalSection";
import { CulturalCard } from "@/components/ui/CulturalCard";
import { ThirukkuralExplorer } from "@/components/gateways/ThirukkuralExplorer";
import { SITE_CONFIG } from "@/data/siteConfig";

const CONTAINER = "mx-auto w-full max-w-7xl px-6 sm:px-10";
const BAND = "py-20 sm:py-28";

export function AboutClient() {
  const { locale } = useLocale();

  const timelineMilestones = [
    {
      year: SITE_CONFIG.informalFoundingYear,
      titleEn: "Informal Student Cohort Founded",
      titleTa: "மாணவர் தோழமை தொடக்கம்",
      descriptionEn:
        "Ohio State undergraduate and graduate students organized informal campus meetups to provide a warm community space for Tamil culture, language, and peer support on the banks of the Olentangy.",
      descriptionTa:
        "வளாகத்தில் தமிழ் மாணவர்கள் ஒன்றிணைந்து பழகவும், பண்பாட்டைப் பகிர்ந்து கொள்ளவும் ஆரம்பகால நட்பு வட்டம் தொடங்கப்பட்டது.",
    },
    {
      year: "2023",
      titleEn: "Annual Cultural Celebrations at Ohio Union",
      titleTa: "ஆண்டு கலாச்சார பெருவிழாக்கள்",
      descriptionEn:
        "Expanded into recurring campus celebrations, partnering with local Columbus kitchens to bring authentic South Indian cuisine, live student musical jams, and festive banquets to the Ohio Union.",
      descriptionTa:
        "மாணவர் கலை நிகழ்ச்சிகள் மற்றும் தென் இந்திய உணவுடன் கூடிய பெருவிழாக்கள் ஓஹியோ யூனியனில் முறைப்படுத்தப்பட்டன.",
    },
    {
      year: SITE_CONFIG.officialRegistrationYear,
      titleEn: "Official OSU Student Organization Registration",
      titleTa: "பல்கலைக்கழக உத்தியோகபூர்வ அங்கீகாரம்",
      // RSO status wording comes from the site's single source of truth.
      descriptionEn: `${SITE_CONFIG.chapterStatusEn} Our first democratic constitution was ratified the same year.`,
      descriptionTa:
        "ஓஹியோ மாநில பல்கலைக்கழக மாணவர் அமைப்பாக அதிகாரப்பூர்வமாகப் பதிவு செய்யப்பட்டு, ஜனநாயக விதிகள் உறுதிசெய்யப்பட்டன.",
    },
    {
      year: "2026",
      titleEn: "The Five Pillars & Language Workshops",
      titleTa: "ஐந்து தூண்கள் & மொழிப் பயிற்சி விரிவு",
      descriptionEn:
        "Inaugurating bi-weekly conversational Tamil workshops (Katral), inter-collegiate collaborations (Namma Jathara with Telugu Tamasha), and dedicated Columbus community food drives.",
      descriptionTa:
        "உரையாடல் தமிழ் பயிற்சிப் பட்டறைகள், பிற பண்பாட்டு மாணவர் அமைப்புகளுடன் கூட்டு விழாக்கள் மற்றும் உள்ளூர் சமூகப் பணிகள் விரிவுபடுத்தப்படுகின்றன.",
    },
  ];

  const partners = [
    {
      name: "Telugu Tamasha at OSU",
      type: "Student Org Collaborator",
      collaboration: "Co-hosting major collaborative student celebrations including the annual Namma Jathara spring carnival.",
    },
    {
      name: "The Ohio Union & Student Activities",
      type: "Campus Affiliation",
      collaboration: "Registered Student Organization through the Council on Student Affairs (CSA), hosting all general body gatherings on campus.",
    },
    {
      name: "Central Ohio Tamil Community",
      type: "Community Network",
      collaboration: "Connecting students with local cultural festivals, regional Tamil associations, and professional alumni networks across Columbus.",
    },
    {
      name: "Columbus Local Kitchens",
      type: "Authentic Catering",
      collaboration: "Partnering with trusted South Indian kitchens to bring hot biryani, samosas, traditional snacks, and festive feasts to campus events.",
    },
  ];

  return (
    <div className="w-full text-left bg-transparent">
      {/* =========================================================================
          CRITICAL / IMMUTABLE: Cinematic 3D Gopuram Z-Axis Mission Fly-Through Hero
          HERO ANIMATIONS ARE NEVER TOUCHED OR MODIFIED UNDER ANY CIRCUMSTANCES.
          ========================================================================= */}
      <div className="relative w-full overflow-clip bg-transparent">
        <GopuramZScroll />
      </div>

      {/* Purananuru 192 lives in the hero's first tier, so no repeat quote band here. */}
      <EditorialSheetHandoff
        id="about-epic"
        badge="THE SANGAM EPIC"
        sublabel="MISSION & ROOTS"
        surface="ivory"
        overlapHero={true}
        overflowClass="overflow-x-clip"
      >
        {/* 1 · Ivory · Recipe A: intro split */}
        <section aria-labelledby="about-intro-heading" className={`${CONTAINER} ${BAND}`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-5 md:sticky md:top-28 self-start">
              <CourtyardHeader
                className="!mb-0"
                titleId="about-intro-heading"
                eyebrow="Heritage & Roots"
                title={locale === "ta" ? "எங்கள் வரலாறு & சங்கப் பார்வை" : "The Sangam Epic"}
                tamilTitle={locale !== "ta" ? "வரலாறு · தமிழ் மன்றம்" : undefined}
              />
            </div>

            <div className="md:col-span-7 space-y-12">
              <p className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light leading-snug text-ink-earth">
                Tamil Sangam was born from the deep longing for home-cooked flavors, authentic kinship, and the resonant
                cadence of <span className="text-brand-purple">Sangam verses</span> beneath Midwest skies.
              </p>

              <div className="border-t border-border-warm pt-8 space-y-3">
                <Eyebrow tamil="வழிகாட்டி">Freshmen, Transfers &amp; Columbus Living</Eyebrow>
                <Link
                  href="/guide"
                  className="group inline-flex min-h-12 items-center gap-2 rounded-sm font-serif text-2xl sm:text-3xl font-normal leading-snug text-brand-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-ivory"
                >
                  <span>New to OSU or Tamil Sangam? Read the Student Guide &amp; FAQ</span>
                  <span aria-hidden="true" className="transition-transform duration-200 motion-safe:group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <p className="max-w-xl font-sans text-base leading-relaxed text-ink-umber">
                  Columbus Indian grocers, dosa spots, bus routes, housing, membership questions, and club governance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2 · Sandstone · Heritage timeline on a bronze rail */}
        <CulturalSection variant="sandstone" divider="korvai" aria-labelledby="about-journey-heading">
          <div className={`${CONTAINER} ${BAND}`}>
            <div className="max-w-3xl space-y-3">
              <Eyebrow tamil="வரலாற்றுப் பாதை">Historical Path</Eyebrow>
              <h2
                id="about-journey-heading"
                className="font-serif text-3xl sm:text-5xl font-normal leading-[1.12] tracking-tight text-ink-earth"
              >
                Our Journey on the Olentangy
              </h2>
              <p className="font-sans text-base sm:text-lg leading-relaxed text-ink-umber">
                From informal campus chai circles to a chartered, democratic student organization hosting flagship festivals.
              </p>
            </div>

            <ol className="relative mt-14 sm:mt-20 space-y-10 md:space-y-14">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-3 bottom-3 left-[7px] md:left-[calc(9rem+7px)] w-0.5 bg-accent-bronze/45"
              />
              {timelineMilestones.map((item) => (
                <li key={item.year} className="relative pl-10 md:pl-0 md:grid md:grid-cols-[9rem_1fr]">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 md:left-[9rem] top-3 size-4 rounded-full border-2 border-accent-zari bg-bg-sandstone"
                  />
                  <p className="font-serif text-4xl md:text-5xl font-light leading-none text-brand-purple md:pr-8 md:pt-1 md:text-right">
                    {item.year}
                  </p>
                  <CulturalCard as="article" variant="light" className="mt-4 md:mt-0 md:ml-12 max-w-3xl p-6 sm:p-8 space-y-2">
                    <p lang="ta" className="font-tamil text-base leading-[1.6] tracking-normal text-brand-purple">
                      {item.titleTa}
                    </p>
                    <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-snug text-ink-earth">
                      {item.titleEn}
                    </h3>
                    <p
                      lang={locale === "ta" ? "ta" : undefined}
                      className={`text-base text-ink-umber ${
                        locale === "ta" ? "font-tamil leading-[1.7] tracking-normal" : "font-sans leading-relaxed"
                      }`}
                    >
                      {locale === "ta" ? item.descriptionTa : item.descriptionEn}
                    </p>
                  </CulturalCard>
                </li>
              ))}
            </ol>

            <div className="mt-12 md:pl-[calc(9rem+3rem)]">
              <Link
                href="/events"
                className="inline-flex min-h-12 items-center gap-2 rounded-sm font-sans text-base font-medium text-brand-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sandstone"
              >
                See what&apos;s next on the events calendar <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </CulturalSection>

        {/* 3 · Sangam-deep · Recipe D jewel band: Thirukkural, couplet as recipe C */}
        <CulturalSection variant="sangam-deep">
          <div className={`${CONTAINER} ${BAND}`}>
            <ThirukkuralExplorer variant="dark" />
          </div>
        </CulturalSection>

        {/* 5 · Sandstone · Recipe B ledger: alliances */}
        <CulturalSection variant="sandstone" divider="korvai" aria-labelledby="about-alliances-heading">
          <div className={`${CONTAINER} ${BAND}`}>
            <div className="max-w-3xl space-y-3">
              <Eyebrow tamil="கூட்டணிகள்">Campus &amp; Community Alliances</Eyebrow>
              <h2
                id="about-alliances-heading"
                className="font-serif text-3xl sm:text-5xl font-normal leading-[1.12] tracking-tight text-ink-earth"
              >
                Rooted in Columbus &amp; Buckeye Life
              </h2>
              <p className="font-sans text-base sm:text-lg leading-relaxed text-ink-umber">
                Collaborating with campus cultural organizations, local catering kitchens, and regional families.
              </p>
            </div>

            <ol className="mt-12 sm:mt-16 border-y border-border-warm divide-y divide-border-warm">
              {partners.map((partner, idx) => (
                <li
                  key={partner.name}
                  className="grid grid-cols-[3rem_1fr] md:grid-cols-12 gap-x-4 gap-y-3 md:gap-x-8 py-8 sm:py-10 items-baseline"
                >
                  <span aria-hidden="true" className="font-serif text-3xl leading-none text-brand-purple md:col-span-1">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="md:col-span-5 space-y-2">
                    <span className="inline-flex items-center rounded-full bg-brand-teal-soft px-3 py-1 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">
                      {partner.type}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-snug text-ink-earth">
                      {partner.name}
                    </h3>
                  </div>
                  <p className="col-start-2 md:col-start-auto md:col-span-6 font-sans text-base leading-relaxed text-ink-umber">
                    {partner.collaboration}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </CulturalSection>

        {/* 6 · Peacock closer, always last */}
        <OrganicRouteGateway
          eyebrow="Student Leadership"
          tamilEyebrow="ஆளுமை"
          title="Meet the Executive Board"
          tamilTitle="நிர்வாகக் குழு மற்றும் மாணவப் பொறுப்பாளர்கள்"
          description="Discover the student organizers and committee coordinators guiding our cultural, linguistic, and campus initiatives."
          primaryHref="/board"
          primaryLabel="Meet the Officers"
          secondaryHref="/guide"
          secondaryLabel="Read the Student Guide & FAQ"
        />
      </EditorialSheetHandoff>
    </div>
  );
}
