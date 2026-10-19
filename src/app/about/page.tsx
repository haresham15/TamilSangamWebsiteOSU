"use client";

import React, { useEffect, useRef } from "react";
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

export default function AboutPage() {
  const { locale } = useLocale();
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const watermarkRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !quoteRef.current) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const split = new SplitText(quoteRef.current, { type: "words" });
    const ctx = gsap.context(() => {
      gsap.fromTo(split.words, { opacity: 0.18, filter: "blur(4px)" }, {
        opacity: 1, filter: "blur(0px)", stagger: 0.08,
        scrollTrigger: { trigger: quoteRef.current, start: "top 85%", end: "center center", scrub: true, invalidateOnRefresh: true },
      });
      gsap.fromTo(watermarkRef.current, { xPercent: -8 }, { xPercent: 8,
        scrollTrigger: { trigger: quoteRef.current, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      });
    });
    return () => { ctx.revert(); split.revert(); };
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
      collaboration: "Partnering with trusted South Indian kitchens to bring piping-hot dosas, filter coffee, and festive feasts to campus events.",
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

      {/* Hero to Content Gradient Transition */}

      {/* =========================================================================
          THE ORGANIC JOURNEY: CENTRAL RIVER TIMELINE ON WARM IVORY
          Warm Ivory (#FAF9F6), Sunbaked Sand (#F4EFE6), Charcoal Espresso (#2A2825)
          Glides up over the bronze rings stage (p = 0.84 -> 1.00)
          ========================================================================= */}
      <EditorialSheetHandoff
        badge="THE SANGAM EPIC"
        sublabel="MISSION & ROOTS"
        className="text-hearth-espresso"
      >
        
        <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
          
          {/* Centered Airy Section Header */}
          <CourtyardHeader
            align="center"
            eyebrow="Heritage & Roots"
            title={locale === "ta" ? "எங்கள் வரலாறு & சங்கப் பார்வை" : "The Sangam Epic"}
            tamilTitle={locale !== "ta" ? "வரலாறு · தமிழ் மன்றம்" : undefined}
          />

          {/* The Hero Quote: Naked Architectural Monument Against Global Background */}
          <div className="relative my-24 sm:my-36 text-center space-y-8 max-w-4xl mx-auto">
            <span className="font-sans text-xs uppercase tracking-widest text-[#B85C38] font-semibold block">
              Core Motto // புறநானூறு 192
            </span>
            <span ref={watermarkRef} aria-hidden="true" lang="ta" className="pointer-events-none absolute inset-x-0 top-1/3 font-tamil text-8xl text-[#B85C38]/[0.035] whitespace-nowrap tracking-normal">யாதும் ஊரே யாவரும் கேளிர்</span>
            <blockquote ref={quoteRef} className="text-3xl sm:text-5xl lg:text-6xl font-serif font-light text-[#2A2825] leading-snug tracking-tight">
              &ldquo;<strong className="font-medium text-[#B85C38]">To Us All Towns Are Home, Everyone Our Kin.</strong> Born from the deep longing for home-cooked meals, steaming cups of filter coffee, and the resonant cadence of <strong className="font-medium text-[#E5A93C]">Sangam verses</strong> beneath Midwest skies.&rdquo;
            </blockquote>
            <p className="font-tamil text-xl sm:text-2xl text-[#B85C38]" lang="ta">
              யாதும் ஊரே யாவரும் கேளிர் — கணியன் பூங்குன்றனார்
            </p>
          </div>

          {/* Centered Snaking Timeline: The Flowing River */}
          <div className="my-24 sm:my-36 space-y-8">
            <div className="text-center space-y-2">
              <span className="font-sans text-xs font-semibold text-[#B85C38] tracking-widest uppercase block">
                The Historical Path // வரலாற்றுப் பாதை
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-normal text-[#2A2825]">
                Our Journey on the Olentangy
              </h2>
              <p className="text-base text-[#57524C] font-sans max-w-xl mx-auto">
                Snaking from informal campus chai circles to a chartered, democratic student organization hosting flagship festivals.
              </p>
            </div>

            <FlowingRiverTimeline milestones={timelineMilestones} locale={locale} />
          </div>

          {/* Campus & Regional Alliances: Staggered Text-Only Typographic List (No Beige Cards) */}
          <div className="mt-28 sm:mt-40 space-y-12">
            <div className="text-center space-y-2">
              <span className="font-sans text-xs font-semibold text-[#B85C38] tracking-widest uppercase block">
                Campus & Community Alliances // கூட்டணிகள்
              </span>
              <h3 className="text-3xl sm:text-4xl font-serif font-normal text-[#2A2825]">
                Rooted in Columbus & Buckeye Life
              </h3>
              <p className="text-base text-[#57524C] font-sans max-w-xl mx-auto">
                Collaborating with campus cultural organizations, local catering kitchens, and regional families.
              </p>
            </div>

            {/* Staggered Text-Only Typographic List (Zero Beige Boxes, 1px Grounding Lines) */}
            <div className="border-t border-[#E5DDD0] divide-y divide-[#E5DDD0] text-left">
              {partners.map((partner, idx) => (
                <div
                  key={partner.name}
                  className={`py-10 sm:py-14 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline ${
                    idx % 2 === 1 ? "md:pl-8" : ""
                  }`}
                >
                  <div className="md:col-span-4 space-y-1">
                    <span className="font-sans text-xs text-[#B85C38] uppercase tracking-widest font-semibold block">
                      {partner.type}
                    </span>
                    <h4 className="text-2xl sm:text-3xl font-serif text-[#2A2825]">
                      {partner.name}
                    </h4>
                  </div>
                  <div className="md:col-span-8">
                    <p className="text-base font-sans text-[#57524C] leading-relaxed">
                      {partner.collaboration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

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

        </div>
      </EditorialSheetHandoff>
    </div>
  );
}
