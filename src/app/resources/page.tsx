"use client";

import React, { useState } from "react";
import { COLUMBUS_GUIDE } from "@/data/columbus-guide";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { Volume2, ExternalLink } from "lucide-react";

export default function ResourcesPage() {
  const { locale } = useLocale();
  const { playBell, playWoodClick } = useAudio();

  const [activeTab, setActiveTab] = useState<"columbus" | "tamil101" | "recipes" | "festivals">("columbus");

  const phrases = [
    { tamil: "வணக்கம்", english: "Vanakkam", meaning: "Hello / Greetings / Reverence", audioPitch: 700 },
    { tamil: "நன்றி", english: "Nandri", meaning: "Thank you", audioPitch: 650 },
    { tamil: "வாங்க", english: "Vaanga", meaning: "Welcome / Come in (respectful)", audioPitch: 600 },
    { tamil: "சாப்பிட்டீங்களா?", english: "Saapiteengala?", meaning: "Did you eat? (Classic Tamil greeting of care)", audioPitch: 550 },
    { tamil: "போயிட்டு வரேன்", english: "Poittu Varen", meaning: "I will go and return (Never say final goodbye)", audioPitch: 500 },
    { tamil: "மகிழ்ச்சி", english: "Magizhchi", meaning: "Joy / Pleasure / Happiness", audioPitch: 750 },
  ];

  const recipes = [
    {
      title: "Authentic Ven Pongal (வெண் பொங்கல்)",
      region: "Tamil Nadu Harvest Classic",
      cookingTime: "30 mins",
      ingredients: ["1 cup Raw Ponni Rice", "1/2 cup Split Yellow Moong Dal", "4 cups Water", "3 tbsp Pure Ghee", "1 tsp Black Peppercorns", "1 tsp Cumin Seeds", "1 inch Fresh Ginger (grated)", "Curry Leaves & Cashews"],
      steps: [
        "Dry roast the moong dal until lightly fragrant, then rinse with raw ponni rice.",
        "Pressure cook with 4 cups of water and salt for 4-5 whistles until soft and mushy.",
        "In a tempering pan, heat ghee. Fry whole black pepper, cumin seeds, ginger, curry leaves, and golden cashews until aromatic.",
        "Pour the sizzling tempered ghee over the hot mashed pongal and mix well. Serve piping hot with coconut chutney and sambar.",
      ],
    },
    {
      title: "Madras Degree Filter Coffee (மட்ராஸ் ஃபில்டர் காபி)",
      region: "South Indian Breakfast Tradition",
      cookingTime: "10 mins",
      ingredients: ["3 tbsp Freshly Ground Coffee Powder (80% coffee, 20% chicory)", "1 cup Boiling Water", "1 cup Whole Milk (thick)", "2 tsp Sugar (or Jaggery)"],
      steps: [
        "Place the coffee powder in the top compartment of the traditional brass filter, pressing gently with the plunger.",
        "Pour boiling water over the powder and close the lid to extract the thick aromatic decoction (10 mins).",
        "Heat fresh whole milk until frothy.",
        "In a traditional stainless steel dabarah and tumbler, mix 2-3 tbsp of decoction, sugar, and hot milk.",
        "Aerate by pouring back and forth from height into the dabarah to create thick creamy foam. Enjoy hot!",
      ],
    },
  ];

  const festivals = [
    {
      name: "Thai Pongal (பொங்கல் திருநாள்)",
      month: "Mid-January (தை 1)",
      description: "A four-day harvest thanksgiving festival: Bhogi (clearing old belongings), Thai Pongal (cooking harvest milk and rice in earthen pots to overflowing), Mattu Pongal (honoring cattle and agriculture), and Kaanum Pongal (family outings and reunions).",
      attire: "Traditional pattu veshti, pattu saree, and traditional gold jewelry.",
      greeting: "பொங்கலோ பொங்கல்! (Pongalo Pongal!)",
    },
    {
      name: "Chithirai Thiruvizha (தமிழ்ப் புத்தாண்டு)",
      month: "Mid-April (சித்திரை 1)",
      description: "The dawn of the Tamil New Year. Families view 'Kani' (auspicious tray of fruits, betel leaves, mirrors, and gold) and prepare 'Mango Pachadi' blending six tastes (sweet, sour, bitter, spicy, salty, astringent) symbolizing the diverse flavors of life.",
      attire: "Bright silk garments and floral garlands.",
      greeting: "இனிய தமிழ்ப் புத்தாண்டு நல்வாழ்த்துகள்!",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
          Knowledge & Community Directory
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight font-serif mb-4">
          {locale === "ta" ? "வளங்கள் & கொலம்பஸ் வழிகாட்டி" : "Resources & Columbus Guide"}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {locale === "ta"
            ? "உள்ளூர் தென் இந்திய அங்காடிகள், தமிழ் 101 சொற்கள், பாரம்பரிய சமையல் குறிப்புகள் மற்றும் திருவிழா விளக்கங்கள்."
            : "Curated by Sangam members: local South Indian groceries, student-friendly diners, Tamil 101 phonetic phrases, authentic recipes, and festival deep dives."}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-12 border-b border-white/10 pb-4">
        {[
          { id: "columbus" as const, label: "Columbus Tamil Spots (கொலம்பஸ்)" },
          { id: "tamil101" as const, label: "Tamil 101 Audio Phrases (தமிழ் 101)" },
          { id: "recipes" as const, label: "Amma's Kitchen Recipes (சமையல்)" },
          { id: "festivals" as const, label: "Festival Deep Dives (திருவிழாக்கள்)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playWoodClick();
              setActiveTab(tab.id);
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              activeTab === tab.id
                ? "bg-[var(--accent-tint)] text-black border-transparent shadow-md"
                : "glass-panel text-slate-300 border-white/10 hover:border-white/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Columbus Local Guide */}
      {activeTab === "columbus" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COLUMBUS_GUIDE.map((spot) => (
            <div key={spot.id} className="glass-glow-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-[var(--accent-tint)]">
                    {spot.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{spot.distanceFromCampus}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-0.5">{spot.name}</h3>
                <p className="text-xs text-[var(--accent-tint)] font-mono mb-3">{spot.tamilName}</p>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{spot.descriptionEn}</p>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-200">
                  <span className="text-[var(--accent-tint)] font-semibold block mb-0.5">Sangam Tip:</span>
                  <span>{spot.recommendationEn}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate pr-2">{spot.address}</span>
                <a
                  href={spot.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-tint)] hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Map</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Tamil 101 Audio Phrases */}
      {activeTab === "tamil101" && (
        <div className="space-y-4">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white font-serif">Everyday Tamil Greetings & Expressions</h3>
            <p className="text-xs text-slate-400 mt-1">Tap the speaker icon to play the phonetic pitch.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {phrases.map((phrase, idx) => (
              <div key={idx} className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-white font-serif mb-1">{phrase.tamil}</h4>
                  <p className="text-xs font-mono text-[var(--accent-tint)]">{phrase.english}</p>
                  <p className="text-xs text-slate-300 mt-1">{phrase.meaning}</p>
                </div>
                <button
                  onClick={() => playBell(phrase.audioPitch)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-[var(--accent-tint)] border border-white/10 transition-all"
                  title="Hear Audio Tone"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Amma's Kitchen Traditional Recipes */}
      {activeTab === "recipes" && (
        <div className="space-y-8">
          {recipes.map((rec, i) => (
            <div key={i} className="rounded-3xl glass-panel-elevated p-8 border border-white/10 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white font-serif">{rec.title}</h3>
                  <p className="text-xs text-[var(--accent-tint)] font-mono">{rec.region}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 text-slate-300">
                  ⏱️ {rec.cookingTime}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-white/10">
                <div className="lg:col-span-5 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">Ingredients</h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {rec.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-tint)]" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-7 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">Preparation Steps</h4>
                  <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                    {rec.steps.map((st, sIdx) => (
                      <li key={sIdx}>{st}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Festival Deep Dives */}
      {activeTab === "festivals" && (
        <div className="space-y-8">
          {festivals.map((fest, fIdx) => (
            <div key={fIdx} className="rounded-3xl glass-panel-elevated p-8 border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white font-serif">{fest.name}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-[var(--accent-tint)] text-black font-semibold">
                  {fest.month}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{fest.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-slate-400 block mb-1">Traditional Attire:</span>
                  <span className="text-white">{fest.attire}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-slate-400 block mb-1">Festive Greeting:</span>
                  <span className="text-[var(--accent-tint)] font-serif text-sm">{fest.greeting}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
