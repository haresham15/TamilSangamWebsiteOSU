"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useReducedMotion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { GopuramZScroll } from "@/components/about/GopuramZScroll";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { FlowingRiverTimeline } from "@/components/muttram/FlowingRiverTimeline";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import { KolamSectionRule } from "@/components/ui/KolamSectionRule";
import { ThirukkuralExplorer } from "@/components/gateways/ThirukkuralExplorer";
import { AramPhilanthropyGateway } from "@/components/gateways/AramPhilanthropyGateway";
import { PronounceableQuote } from "@/components/ui/PronounceableQuote";

export default function AboutPage() {
  const { locale } = useLocale();
  const quoteContainerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const tamilRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !quoteRef.current || !quoteContainerRef.current) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const split = new SplitText(quoteRef.current, { type: "words" });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: quoteContainerRef.current,
          start: "top 82%",
          end: "center 48%",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1. Tagline badge reveal
      if (tagRef.current) {
        tl.fromTo(
          tagRef.current,
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
          0
        );
      }

      // 2. Tamil script slide-up + unblur (The Thirukkural/Purananuru classical verse)
      if (tamilRef.current) {
        tl.fromTo(
          tamilRef.current,
          { opacity: 0, y: 28, filter: "blur(8px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power2.out" },
          0.05
        );
      }

      // 3. English translation words cascade with subtle blur & lift
      if (split.words && split.words.length > 0) {
        tl.fromTo(
          split.words,
          { opacity: 0.12, filter: "blur(4px)", y: 12 },
          { opacity: 1, filter: "blur(0px)", y: 0, stagger: 0.02, duration: 0.6, ease: "power1.out" },
          0.15
        );
      }

      // 4. Subtle watermark horizontal parallax
      if (watermarkRef.current) {
        gsap.fromTo(
          watermarkRef.current,
          { xPercent: -12 },
          {
            xPercent: 12,
            ease: "none",
            scrollTrigger: {
              trigger: quoteContainerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }
    }, quoteContainerRef);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    return () => {
      clearTimeout(timer);
      ctx.revert();
      split.revert();
    };
  }, [reduced, locale]);

  const timelineMilestones = [
    {
      year: "2021",
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
      year: "2024",
      titleEn: "Official OSU Student Organization Registration",
      titleTa: "பல்கலைக்கழக உத்தியோகபூர்வ அங்கீகாரம்",
      descriptionEn:
        "Formally chartered as a Recognized Student Organization (RSO) under Ohio State University Student Activities and the Council on Student Affairs (CSA), ratifying our first democratic constitution.",
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
      {/* Semantic SSR H1 for Search Engine Crawlers & Screen Readers */}
      <h1 className="sr-only">
        About Us &amp; Heritage (யாதும் ஊரே யாவரும் கேளிர்) — OSU Tamil Sangam at The Ohio State University
      </h1>

      {/* =========================================================================
          CRITICAL / IMMUTABLE: Cinematic 3D Gopuram Z-Axis Mission Fly-Through Hero
          HERO ANIMATIONS ARE NEVER TOUCHED OR MODIFIED UNDER ANY CIRCUMSTANCES.
          ========================================================================= */}
      <div className="relative w-full overflow-clip bg-transparent">
        <GopuramZScroll />
      </div>

      {/* Hero to Content Gradient Transition */}

      {/* =========================================================================
          THE ORGANIC JOURNEY: CENTRAL RIVER TIMELINE ON WARM IVORY
          Royal Violet (#140C20), Raised Surface (#25173B), Off-White (#F4F0FA)
          Glides up over the bronze rings stage (p = 0.84 -> 1.00)
          ========================================================================= */}
      <EditorialSheetHandoff
        badge="THE SANGAM EPIC"
        sublabel="MISSION & ROOTS"
        className="text-[#F4F0FA]"
      >
        
        <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
          
          {/* Centered Airy Section Header */}
          <CourtyardHeader
            align="center"
            eyebrow="Heritage & Roots"
            title={locale === "ta" ? "எங்கள் வரலாறு & சங்கப் பார்வை" : "The Sangam Epic"}
            tamilTitle={locale !== "ta" ? "வரலாறு · தமிழ் மன்றம்" : undefined}
          />


          {/* The Hero Quote: Naked Architectural Monument with Warm Amber Halo */}
          <div
            ref={quoteContainerRef}
            className="relative my-24 sm:my-36 text-center space-y-8 max-w-4xl mx-auto py-12 px-6 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(166,240,207,0.08),rgba(242,107,181,0.04)_50%,transparent_75%)]"
          >
            <span
              ref={tagRef}
              className="font-sans text-xs uppercase tracking-widest text-[#A6F0CF] font-semibold block will-change-[transform,opacity]"
            >
              புறநானூறு 192 · கணியன் பூங்குன்றனார்
            </span>
            <span
              ref={watermarkRef}
              aria-hidden="true"
              lang="ta"
              className="pointer-events-none absolute inset-x-0 top-1/3 font-tamil text-8xl text-[#A6F0CF]/[0.035] whitespace-nowrap tracking-normal will-change-transform"
            >
              யாதும் ஊரே யாவரும் கேளிர்
            </span>
            <blockquote
              ref={quoteRef}
              className="text-3xl sm:text-5xl lg:text-6xl font-serif font-light text-[#F4F0FA] leading-snug tracking-tight will-change-[transform,opacity]"
            >
              &ldquo;<strong className="font-medium text-[#A6F0CF]">To Us All Towns Are Home, Everyone Our Kin.</strong> Born from the deep longing for home-cooked flavors, authentic kinship, and the resonant cadence of <strong className="font-medium text-[#A6F0CF]">Sangam verses</strong> beneath Midwest skies.&rdquo;
            </blockquote>
            <div ref={tamilRef} className="will-change-[transform,opacity]">
              <PronounceableQuote
                tamilText="யாதும் ஊரே யாவரும் கேளிர்"
                label="Purananuru 192: Yadhum Oore Yaavarum Kaelir. Click to hear pronunciation."
                tone="light"
                badgePosition="beside"
                className="inline-block mx-auto px-4 py-2"
              >
                <p className="font-tamil text-xl sm:text-2xl text-[#A6F0CF]" lang="ta">
                  யாதும் ஊரே யாவரும் கேளிர் — கணியன் பூங்குன்றனார்
                </p>
              </PronounceableQuote>
            </div>
          </div>

          <KolamSectionRule tone="sandstone" />

          {/* Centered Snaking Timeline: The Flowing River (Stepped Warm Sandstone Chapter) */}
          <div className="my-24 sm:my-36 -mx-6 sm:-mx-10 px-6 sm:px-10 py-24 bg-[#25173B] border-y border-[rgba(125,96,166,0.25)] shadow-[inset_0_2px_12px_rgba(0,0,0,0.2)] space-y-8">
            <div className="text-center space-y-2">
              <span className="font-sans text-xs font-semibold text-[#A6F0CF] tracking-widest uppercase block">
                வரலாற்றுப் பாதை · Historical Path
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-normal text-[#F4F0FA]">
                Our Journey on the Olentangy
              </h2>
              <p className="text-base text-[#C4B7D7] font-sans max-w-xl mx-auto">
                Snaking from informal campus chai circles to a chartered, democratic student organization hosting flagship festivals.
              </p>
            </div>

            <FlowingRiverTimeline milestones={timelineMilestones} locale={locale} />
          </div>

          {/* Open Community Gateway: Living Thirukkural Card */}
          <div className="my-16 sm:my-24">
            <ThirukkuralExplorer variant="light" />
          </div>

          <KolamSectionRule tone="sandstone" />

          {/* Open Community Gateway: Aram Philanthropy & Cross-Cultural Service */}
          <div className="my-16 sm:my-24">
            <AramPhilanthropyGateway variant="light" />
          </div>

          <KolamSectionRule tone="sandstone" />

          {/* Campus & Regional Alliances: Staggered Text-Only Typographic List (No Beige Cards) */}
          <div className="mt-28 sm:mt-40 space-y-12">
            <div className="text-center space-y-2">
              <span className="font-sans text-xs font-semibold text-[#A6F0CF] tracking-widest uppercase block">
                Campus & Community Alliances · கூட்டணிகள்
              </span>
              <h3 className="text-3xl sm:text-4xl font-serif font-normal text-[#F4F0FA]">
                Rooted in Columbus & Buckeye Life
              </h3>
              <p className="text-base text-[#C4B7D7] font-sans max-w-xl mx-auto">
                Collaborating with campus cultural organizations, local catering kitchens, and regional families.
              </p>
            </div>

            {/* Staggered Text-Only Typographic List (Zero Beige Boxes, 1px Grounding Lines) */}
            <div className="border-t border-[rgba(125,96,166,0.25)] divide-y divide-[rgba(125,96,166,0.25)] text-left">
              {partners.map((partner, idx) => (
                <div
                  key={partner.name}
                  className={`py-10 sm:py-14 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline ${
                    idx % 2 === 1 ? "md:pl-8" : ""
                  }`}
                >
                  <div className="md:col-span-4 space-y-1">
                    <span className="font-sans text-xs text-[#A6F0CF] uppercase tracking-widest font-semibold block">
                      {partner.type}
                    </span>
                    <h4 className="text-2xl sm:text-3xl font-serif text-[#F4F0FA]">
                      {partner.name}
                    </h4>
                  </div>
                  <div className="md:col-span-8">
                    <p className="text-base font-sans text-[#C4B7D7] leading-relaxed">
                      {partner.collaboration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <KolamSectionRule tone="light" />

          {/* Gateway Section to The Board (Organic Route Gateway) */}
          <OrganicRouteGateway
            eyebrow="Student Leadership"
            tamilEyebrow="ஆளுமை"
            title="Meet the Executive Board"
            tamilTitle="நிர்வாகக் குழு மற்றும் மாணவப் பொறுப்பாளர்கள்"
            description="Discover the student organizers and committee coordinators guiding our cultural, linguistic, and campus initiatives."
            primaryHref="/board"
            primaryLabel="Meet the Officers"
            secondaryHref="/join"
            secondaryLabel="Sign the Guestbook"
          />


          <KolamSectionRule tone="sandstone" />

          {/* Student Guide & FAQ Editorial Callout Section */}
          <section className="my-16 sm:my-24 text-left">
            <Link
              href="/guide"
              className="group block p-8 sm:p-12 rounded-2xl bg-[#140C20] text-[#F4F0FA] border border-[#A6F0CF]/35 hover:border-[#A6F0CF] transition-all duration-300 shadow-xl focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#A6F0CF] font-semibold block">
                    Freshmen, Transfers &amp; Columbus Living · வழிகாட்டி
                  </span>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-[#F4F0FA] group-hover:text-[#A6F0CF] transition-colors">
                    New to OSU or Tamil Sangam? Read the Student Guide &amp; FAQ →
                  </h3>
                  <p className="text-sm sm:text-base font-sans text-[#C4B7D7] leading-relaxed">
                    Essential campus resources: Columbus Indian grocers, authentic dosa spots, bus routes, housing recommendations, membership questions, and club governance.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#A6F0CF] group-hover:text-white transition-colors">
                  <span className="hidden sm:inline">Open Student Guide</span>
                  <span className="text-xl group-hover:translate-x-1.5 transition-transform">→</span>
                </div>
              </div>
            </Link>
          </section>


        </div>
      </EditorialSheetHandoff>
    </div>
  );
}
