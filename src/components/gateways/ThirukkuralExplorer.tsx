"use client";

import React, { useState } from "react";
import { BookOpen, RefreshCw, Quote } from "lucide-react";
import { PronounceableQuote } from "@/components/ui/PronounceableQuote";

interface KuralItem {
  number: number;
  chapterEn: string;
  chapterTa: string;
  line1Ta: string;
  line2Ta: string;
  transliteration: string;
  collegeTakeaway: string;
}

const KURAL_COLLECTION: KuralItem[] = [
  {
    number: 81,
    chapterEn: "Hospitality · Virunthombal",
    chapterTa: "விருந்தோம்பல்",
    line1Ta: "இருந்தோம்பி இல்வாழ்வ தெல்லாம் விருந்தோம்பி",
    line2Ta: "வேளாண்மை செய்தற் பொருட்டு.",
    transliteration: "Irundhompi ilvaazhva thellaam virundhompi velaanmai seydhar poruttu.",
    collegeTakeaway:
      "The whole point of having a space is opening the door, sharing good food, and making people feel welcome.",
  },
  {
    number: 784,
    chapterEn: "Friendship · Natpu",
    chapterTa: "நட்பு",
    line1Ta: "நவில்தொறும் நூல்நயம் போலும் பயில்தொறும்",
    line2Ta: "பண்புடை யாளர் தொடர்பு.",
    transliteration: "Navildhorum noolnayam poolum payildhorum panpudai yaalar thodarpu.",
    collegeTakeaway:
      "Real friends are like your favorite book or comfort album—they get better every single time you return to them.",
  },
  {
    number: 391,
    chapterEn: "Learning · Kalvi",
    chapterTa: "கல்வி",
    line1Ta: "கற்க கசடறக் கற்பவை கற்றபின்",
    line2Ta: "நிற்க அதற்குத் தக.",
    transliteration: "Karka kasadarak karpavai katrapin nirka adharkuth thaga.",
    collegeTakeaway:
      "Learn whatever you study deeply without shortcuts, and let what you learn actually shape how you live.",
  },
  {
    number: 33,
    chapterEn: "Doing Good · Aram",
    chapterTa: "அறன் வலியுறுத்தல்",
    line1Ta: "ஒல்லும் வகையான் அறவினை ஓவாதே",
    line2Ta: "செல்லும்வாய் எல்லாஞ் செயல்.",
    transliteration: "Ollum vagaiyaan aravinai oovaadhe sellumvaay ellaanj seyal.",
    collegeTakeaway:
      "Do good whenever you can, wherever you are, in any small way that is within your power.",
  },
  {
    number: 788,
    chapterEn: "Unconditional Support · Natpu",
    chapterTa: "நட்பு",
    line1Ta: "உடுக்கை இழந்தவன் கைபோல ஆங்கே",
    line2Ta: "இடுக்கண் களைவதாம் நட்பு.",
    transliteration: "Udukkai izhandhavan kaipoola aangae idukkan kalaivadhaam natpu.",
    collegeTakeaway:
      "A true friend shows up instantly when you stumble—like your hand catching slipping clothes before you even think.",
  },
  {
    number: 99,
    chapterEn: "Kind Speech · Iniyavai Kooraldal",
    chapterTa: "இனியவை கூறல்",
    line1Ta: "இனிய உளவாக இன்னாத கூறல்",
    line2Ta: "கனிஇருப்பக் காய்கவர்ந் தற்று.",
    transliteration: "Iniya ulavaaga innaadha kooral kani-iruppak kaai-kavarndh atru.",
    collegeTakeaway:
      "Choosing harsh words when kind ones work is like picking bitter raw fruit when sweet fruit is sitting right in front of you.",
  },
  {
    number: 527,
    chapterEn: "Sharing With Kin · Sutrathazhuthal",
    chapterTa: "சுற்றந்தழால்",
    line1Ta: "காக்கை கரவா கரைந்துண்ணும் ஆக்கமும்",
    line2Ta: "அன்னநீ ரார்க்கே உள.",
    transliteration: "Kaakkai karavaa karaindhunnum aakkamum anna-nee raarkkae ula.",
    collegeTakeaway:
      "Crows call their whole flock before taking a single bite; prosperity naturally flows to those who share everything they have.",
  },
  {
    number: 619,
    chapterEn: "Grit & Persistence · Aazhvinaiyudaimai",
    chapterTa: "ஆள்வினையுடைமை",
    line1Ta: "தெய்வத்தான் ஆகா தெனினும் முயற்சிதன்",
    line2Ta: "மெய்வருத்தக் கூலி தரும்.",
    transliteration: "Dheivathaan aagaa dheninum muyarsithan mei-varuthak kooli tharum.",
    collegeTakeaway:
      "Even when luck seems completely against you, honest grind and sweat never leave you empty-handed.",
  },
];

interface ThirukkuralExplorerProps {
  className?: string;
  variant?: "dark" | "light";
}

export function ThirukkuralExplorer({
  className = "",
  variant = "light",
}: ThirukkuralExplorerProps) {
  const isDark = variant === "dark";
  const [index, setIndex] = useState(0);

  const current = KURAL_COLLECTION[index];

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % KURAL_COLLECTION.length);
  };

  return (
    <section
      aria-labelledby="thirukkural-explorer-heading"
      className={`relative w-full overflow-hidden rounded-2xl p-6 sm:p-8 md:p-10 border transition-all ${
        isDark
          ? "bg-[#181615] border-white/10 text-white"
          : "bg-[#FFFDF9] border-[#E8DFC8] text-[#2A2825] shadow-sm"
      } ${className}`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Editorial Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-current/10 text-xs font-mono tracking-wider uppercase">
          <div className={`flex items-center gap-2 ${isDark ? "text-[#E5A93C]" : "text-[#B85C38]"}`}>
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Living Wisdom</span>
          </div>

          <div className={isDark ? "text-stone-400" : "text-[#706B64]"}>
            <span lang="ta">குறள் {current.number} · {current.chapterTa}</span>
          </div>
        </div>

        {/* Couplet Monument Box */}
        <div className="relative py-6 px-4 sm:px-8 rounded-xl bg-[radial-gradient(ellipse_at_center,rgba(229,169,60,0.08),transparent_70%)] space-y-6 text-center">
          <Quote
            className={`w-8 h-8 mx-auto ${isDark ? "text-[#E5A93C]/40" : "text-[#B85C38]/30"}`}
            aria-hidden="true"
          />

          {/* 2-line Tamil Couplet (Click to Pronounce with cute button next to it) */}
          <PronounceableQuote
            tamilText={`${current.line1Ta} ${current.line2Ta}`}
            label={`Thirukkural ${current.number}. Click to listen to pronunciation.`}
            tone={isDark ? "gold" : "light"}
            badgePosition="corner"
            className={`p-3 sm:p-4 rounded-xl transition-colors ${
              isDark ? "hover:bg-white/5" : "hover:bg-black/5"
            }`}
          >
            <div className="space-y-1">
              <p
                lang="ta"
                className={`text-xl sm:text-2xl md:text-3xl font-tamil font-medium tracking-normal leading-relaxed ${
                  isDark ? "text-stone-100" : "text-[#161210]"
                }`}
              >
                {current.line1Ta}
              </p>
              <p
                lang="ta"
                className={`text-xl sm:text-2xl md:text-3xl font-tamil font-medium tracking-normal leading-relaxed ${
                  isDark ? "text-stone-100" : "text-[#161210]"
                }`}
              >
                {current.line2Ta}
              </p>
            </div>
          </PronounceableQuote>

          {/* Transliteration */}
          <p
            className={`text-xs sm:text-sm font-mono italic max-w-xl mx-auto ${
              isDark ? "text-stone-400" : "text-[#57524C]"
            }`}
          >
            &ldquo;{current.transliteration}&rdquo;
          </p>

          {/* Modern Takeaway */}
          <div
            className={`p-4 rounded-xl border max-w-2xl mx-auto ${
              isDark ? "bg-[#211E1C] border-white/10" : "bg-[#F4EFE6] border-[#E0D5C3]"
            }`}
          >
            <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#B85C38] mb-1">
              Campus &amp; Life Takeaway (Zero Preachiness):
            </span>
            <p
              className={`text-sm sm:text-base font-serif font-normal leading-relaxed ${
                isDark ? "text-stone-200" : "text-[#2A2825]"
              }`}
            >
              {current.collegeTakeaway}
            </p>
          </div>
        </div>

        {/* Control Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-current/10">
          <p
            className={`text-xs font-sans italic text-center sm:text-left ${
              isDark ? "text-stone-400" : "text-[#706B64]"
            }`}
          >
            Incubating Idea: Collectible Kural meal-ticket cards &amp; bite-sized Tamil cultural moments woven naturally into our biryani nights.
          </p>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all bg-[#B85C38] text-white hover:bg-[#A04E2F] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#B85C38]"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Draw Another Kural ↻</span>
          </button>
        </div>
      </div>
    </section>
  );
}
