import React from "react";
import Link from "next/link";
import { HeartHandshake, Sparkles, Sprout, ArrowRight, ShieldCheck } from "lucide-react";

interface AramPhilanthropyGatewayProps {
  className?: string;
  variant?: "dark" | "light";
}

export function AramPhilanthropyGateway({
  className = "",
  variant = "light",
}: AramPhilanthropyGatewayProps) {
  const isDark = variant === "dark";

  const PILLARS = [
    {
      titleEn: "Columbus Food Pantry Drives",
      titleTa: "உணவுப் பகிர்வு & அறப்பணி",
      desc: "Channeling student community drives into Columbus food banks and campus pantry pantries to support food security.",
    },
    {
      titleEn: "Cross-Cultural Student Coalitions",
      titleTa: "பல்கலாச்சார மாணவர் கூட்டணி",
      desc: "Co-hosting joint mixers, game exchanges, and shared advocacy alongside non-Indian student organizations across OSU.",
    },
    {
      titleEn: "Sustainable Gathering Ethics",
      titleTa: "சுற்றுச்சூழல் பாதுகாப்பு",
      desc: "Phasing out disposable single-use plastic decor to invest in wholesome food and compostable campus gatherings.",
    },
  ];

  return (
    <section
      aria-labelledby="aram-gateway-heading"
      className={`relative w-full overflow-hidden rounded-2xl p-6 sm:p-8 md:p-10 border transition-all ${
        isDark
          ? "bg-[#171514] border-white/10 text-white"
          : "bg-[#F9F5EE] border-[#E8DFC8] text-[#2A2825]"
      } ${className}`}
    >
      <div className="relative max-w-5xl mx-auto space-y-8">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5 border-current/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-[#B85C38]/10 text-[#B85C38] dark:bg-[#B85C38]/20 dark:text-[#E07A5F]">
            <HeartHandshake className="w-3.5 h-3.5" aria-hidden="true" />
            <span>OPEN GATEWAY · CAMPUS IMPACT BLUEPRINT</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-stone-500 uppercase">
            <Sprout className="w-4 h-4 text-[#55CCA2]" aria-hidden="true" />
            <span>அறம் · விருந்தோம்பல்</span>
          </div>
        </div>

        {/* Content Header & Lead */}
        <div className="space-y-4 max-w-3xl">
          <h2
            id="aram-gateway-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight leading-tight"
          >
            Tamil Hospitality in Action: Philanthropy &amp; Cross-Campus Service
          </h2>

          <p lang="ta" className="text-base sm:text-lg font-tamil text-[#B85C38] tracking-normal">
            அறமும் விருந்தோம்பலும்: கல்லூரி சமூக நலப் பங்களிப்பு
          </p>

          <p className={`text-sm sm:text-base leading-relaxed font-sans ${isDark ? "text-stone-300" : "text-[#57524C]"}`}>
            In Tamil culture, <em>Virunthombal</em> (hospitality) and <em>Aram</em> (ethical giving) mean using what we have to uplift the wider community. Instead of spending budget on heavy plastic decorations, we prioritize better food and are opening gateways to partner with Columbus charities, campus food drives, and non-Indian student organizations across Ohio State.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.titleEn}
              className={`p-5 rounded-xl border space-y-2 ${
                isDark ? "bg-[#211E1C] border-white/10" : "bg-white border-[#E6DDCE]"
              }`}
            >
              <h3 className="font-serif text-lg font-medium leading-snug">
                {pillar.titleEn}
              </h3>
              <p lang="ta" className="text-xs font-tamil text-[#B85C38] tracking-normal">
                {pillar.titleTa}
              </p>
              <p className={`text-xs leading-relaxed font-sans ${isDark ? "text-stone-400" : "text-[#706B64]"}`}>
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Action CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-current/10">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
            <ShieldCheck className="w-4 h-4 text-[#55CCA2]" aria-hidden="true" />
            <span>Open Call for Co-Founding Leads &amp; Student Partners</span>
          </div>

          <Link
            href="/ideas?category=PARTNERSHIP&prompt=Philanthropy+or+Cross-Org+Collab"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all bg-[#B85C38] text-white hover:bg-[#A04E2F] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#B85C38]"
          >
            <span>Partner With Us / Pitch a Collab</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
