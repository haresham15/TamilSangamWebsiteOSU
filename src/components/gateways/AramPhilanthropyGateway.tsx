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
          : "bg-[#25173B] border-[rgba(125,96,166,0.25)] text-[#F4F0FA]"
      } ${className}`}
    >
      <div className="relative max-w-5xl mx-auto space-y-8">
        {/* Editorial Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-current/10 text-xs font-mono tracking-wider uppercase">
          <div className="flex items-center gap-2 text-[#A6F0CF]">
            <HeartHandshake className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Campus Impact Blueprint</span>
          </div>

          <div className="flex items-center gap-2 text-[#C4B7D7]">
            <Sprout className="w-3.5 h-3.5 text-[#55CCA2]" aria-hidden="true" />
            <span lang="ta">அறம் · விருந்தோம்பல்</span>
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

          <p lang="ta" className="text-base sm:text-lg font-tamil text-[#A6F0CF] tracking-normal">
            அறமும் விருந்தோம்பலும்: கல்லூரி சமூக நலப் பங்களிப்பு
          </p>

          <p className={`text-sm sm:text-base leading-relaxed font-sans ${isDark ? "text-stone-300" : "text-[#C4B7D7]"}`}>
            In Tamil culture, <em>Virunthombal</em> (hospitality) and <em>Aram</em> (ethical giving) mean using what we have to uplift the wider community. Instead of spending budget on heavy plastic decorations, we prioritize better food and are opening gateways to partner with Columbus charities, campus food drives, and non-Indian student organizations across Ohio State.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.titleEn}
              className={`p-5 rounded-xl border space-y-2 ${
                isDark ? "bg-[#1A1028] border-white/10" : "bg-[#1A1028] border-[rgba(125,96,166,0.25)]"
              }`}
            >
              <h3 className="font-serif text-lg font-medium leading-snug">
                {pillar.titleEn}
              </h3>
              <p lang="ta" className="text-xs font-tamil text-[#A6F0CF] tracking-normal">
                {pillar.titleTa}
              </p>
              <p className={`text-xs leading-relaxed font-sans ${isDark ? "text-[#C4B7D7]" : "text-[#C4B7D7]"}`}>
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Action CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-current/10">
          <div className="flex items-center gap-2 text-xs font-mono text-[#C4B7D7]">
            <ShieldCheck className="w-4 h-4 text-[#55CCA2]" aria-hidden="true" />
            <span>Open Call for Co-Founding Leads &amp; Student Partners</span>
          </div>

          <Link
            href="/ideas?category=PARTNERSHIP&prompt=Philanthropy+or+Cross-Org+Collab"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all bg-[#A6F0CF] text-[#140C20] hover:bg-[#A04E2F] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#4FD6E0]"
          >
            <span>Partner With Us / Pitch a Collab</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
