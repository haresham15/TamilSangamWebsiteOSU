"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { PronounceableQuote } from "@/components/ui/PronounceableQuote";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { MuttramButton } from "@/components/muttram/MuttramButton";

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

/**
 * ThirukkuralExplorer — unboxed band content (recipe A header + recipe C pull-quote).
 * The parent supplies the surface (a CulturalSection); this renders no card of its own.
 */
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

  const ink = isDark ? "text-ink-alabaster" : "text-ink-earth";
  const muted = isDark ? "text-ink-sand" : "text-ink-umber";
  const numeral = isDark ? "text-brand-lavender" : "text-brand-purple";

  return (
    <section
      aria-labelledby="thirukkural-explorer-heading"
      className={`relative w-full grid grid-cols-1 md:grid-cols-12 gap-10 ${className}`.trim()}
    >
      {/* Header column */}
      <div className="md:col-span-4 md:sticky md:top-28 self-start space-y-4">
        <Eyebrow tone={isDark ? "dark" : "light"}>Thirukkural</Eyebrow>
        <h2
          id="thirukkural-explorer-heading"
          className={`font-serif text-3xl sm:text-5xl font-normal leading-[1.12] tracking-tight ${ink}`}
        >
          Living Wisdom
        </h2>
        <p className={`font-sans text-base leading-relaxed max-w-sm ${muted}`}>
          In the works: collectible Kural meal-ticket cards and bite-sized Tamil moments woven into our biryani nights.
        </p>
      </div>

      {/* Pull-quote column (recipe C) */}
      <div className="md:col-span-8 space-y-8">
        <p className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${muted}`}>
          <span className={`font-serif text-4xl leading-none ${numeral}`}>{current.number}</span>
          <span lang="ta" className="font-tamil text-base leading-[1.6] tracking-normal">
            குறள் {current.number} · {current.chapterTa}
          </span>
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em]">{current.chapterEn}</span>
        </p>

        <figure
          aria-live="polite"
          className={`relative border-l-2 pl-6 sm:pl-10 space-y-6 ${isDark ? "border-accent-zari" : "border-accent-bronze"}`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute -top-10 left-3 sm:left-5 select-none font-serif text-[7rem] leading-none ${
              isDark ? "text-accent-zari/25" : "text-accent-bronze/25"
            }`}
          >
            &ldquo;
          </span>

          {/* Tamil couplet first */}
          <PronounceableQuote
            tamilText={`${current.line1Ta} ${current.line2Ta}`}
            label={`Thirukkural ${current.number}. Click to listen to pronunciation.`}
            tone={isDark ? "gold" : "sandstone"}
            badgePosition="corner"
            className="relative block pr-12 py-2"
          >
            <blockquote>
              <p lang="ta" className={`font-tamil text-2xl sm:text-3xl md:text-4xl font-medium leading-[1.6] tracking-normal ${ink}`}>
                {current.line1Ta}
              </p>
              <p lang="ta" className={`font-tamil text-2xl sm:text-3xl md:text-4xl font-medium leading-[1.6] tracking-normal ${ink}`}>
                {current.line2Ta}
              </p>
            </blockquote>
          </PronounceableQuote>

          <figcaption className="space-y-5">
            <p className={`font-sans text-sm sm:text-base italic leading-relaxed max-w-2xl ${muted}`}>
              &ldquo;{current.transliteration}&rdquo;
            </p>
            <div className={`space-y-2 border-t pt-5 max-w-2xl ${isDark ? "border-border-zari-muted" : "border-border-warm"}`}>
              <Eyebrow tone={isDark ? "dark" : "light"} as="p">
                Campus &amp; life takeaway
              </Eyebrow>
              <p className={`font-serif text-xl sm:text-2xl font-normal leading-relaxed ${ink}`}>
                {current.collegeTakeaway}
              </p>
            </div>
          </figcaption>
        </figure>

        <MuttramButton
          variant="primary"
          onDark={isDark}
          onClick={handleNext}
          icon={<RefreshCw className="w-4 h-4" aria-hidden="true" />}
        >
          Draw another kural
        </MuttramButton>
      </div>
    </section>
  );
}
