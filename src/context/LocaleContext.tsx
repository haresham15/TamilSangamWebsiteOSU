"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Locale = "en" | "ta";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, defaultText?: string) => string;
}

export const translations: Record<string, Record<Locale, string>> = {
  // Navigation
  "nav.home": { en: "Home", ta: "முகப்பு" },
  "nav.about": { en: "About", ta: "எங்களைப் பற்றி" },
  "nav.initiatives": { en: "Initiatives", ta: "முன்னெடுப்புகள்" },
  "nav.events": { en: "Events", ta: "நிகழ்வுகள்" },
  "nav.gallery": { en: "Gallery", ta: "நினைவுகள்" },
  "nav.board": { en: "Board", ta: "குழு" },
  "nav.join": { en: "Join", ta: "இணையுங்கள்" },
  "nav.cultureLab": { en: "Culture Lab", ta: "கலாச்சார அரங்கம்" },
  "nav.resources": { en: "Resources", ta: "வளங்கள்" },
  "nav.partners": { en: "Partners", ta: "கூட்டாளர்கள்" },
  "nav.ask": { en: "Ask Sangam", ta: "கேளுங்கள்" },
  "nav.links": { en: "Quick Links", ta: "விரைவு இணைப்புகள்" },
  "nav.underTheHood": { en: "Under the Hood", ta: "தொழில்நுட்பம்" },

  // Brand and Tagline
  "brand.name": { en: "OSU Tamil Sangam", ta: "ஓஹியோ தமிழ் சங்கம்" },
  "brand.tagline": { en: "Start the Aatam, Paatam, and Kondatam!", ta: "ஆட்டம் · பாட்டம் · கொண்டாட்டம்!" },
  "brand.classicalTitle": { en: "The Ohio State University", ta: "ஓஹியோ மாநிலப் பல்கலைக்கழகம்" },

  // Controls
  "control.soundOn": { en: "Sound: On", ta: "ஒலி: இயக்கு" },
  "control.soundOff": { en: "Sound: Off", ta: "ஒலி: நிறுத்து" },
  "control.liteMode": { en: "Lite Mode", ta: "எளிய முறை" },
  "control.fullExperience": { en: "Full 3D", ta: "முழு 3D அனுபவம்" },
  "control.search": { en: "Search (⌘K)", ta: "தேடல் (⌘K)" },
  "control.skipShow": { en: "Skip intro", ta: "நேரடியாக செல்ல" },
  "control.exploreMode": { en: "Explore 3D", ta: "சுழற்றி பார்க்க" },
  "control.scrollMode": { en: "Scroll View", ta: "பக்க பார்வை" },

  // Tinai (Landscapes)
  "tinai.marutham": { en: "Marutham (Farmland)", ta: "மருதம் (வயலும் வயல் சார்ந்த இடமும்)" },
  "tinai.neithal": { en: "Neithal (Seashore)", ta: "நெய்தல் (கடலும் கடல் சார்ந்த இடமும்)" },
  "tinai.mullai": { en: "Mullai (Forest)", ta: "முல்லை (காடும் காடு சார்ந்த இடமும்)" },
  "tinai.paalai": { en: "Paalai (Arid Road)", ta: "பாலை (மணலும் மணல் சார்ந்த இடமும்)" },
  "tinai.kurinji": { en: "Kurinji (Mountains)", ta: "குறிஞ்சி (மலையும் மலை சார்ந்த இடமும்)" },

  // Times of Day (Sirupozhuthu)
  "time.vaigarai": { en: "Vaigarai · Dawn (4 AM - 8 AM)", ta: "வைகறை · விடியற்காலை" },
  "time.nanpagal": { en: "Nanpagal · Midday (8 AM - 2 PM)", ta: "நண்பகல் · உச்சிப்பொழுது" },
  "time.erpaadu": { en: "Erpaadu · Sunset (2 PM - 6 PM)", ta: "எற்பாடு · அந்திப்பொழுது" },
  "time.maalai": { en: "Maalai · Evening (6 PM - 10 PM)", ta: "மாலை · மாலைப்பொழுது" },
  "time.yaamam": { en: "Yaamam · Midnight (10 PM - 4 AM)", ta: "யாமம் · நள்ளிரவு" },

  // General Actions
  "action.rsvp": { en: "Get Tickets / RSVP", ta: "பதிவு செய்ய / நுழைவுச்சீட்டு" },
  "action.joinGroupMe": { en: "Join GroupMe", ta: "குரூப்மீயில் இணையுங்கள்" },
  "action.explore": { en: "Explore", ta: "ஆராயுங்கள்" },
  "action.learnMore": { en: "Learn More", ta: "மேலும் அறிய" },
  "action.downloadIcs": { en: "Add to Calendar", ta: "நாள்காட்டியில் சேர்க்க" },
  "action.share": { en: "Share", ta: "பகிரவும்" },
  "action.viewAll": { en: "View All", ta: "அனைத்தும் பார்க்க" },
  "action.close": { en: "Close", ta: "மூடு" },

  // Intermission
  "interval.title": { en: "இடைவேளை · INTERVAL", ta: "இடைவேளை · INTERVAL" },
  "interval.subtitle": { 
    en: "Grab your warm filter coffee & vadai. Ready to join the celebration?",
    ta: "சூடான ஃபில்டர் காபியுடன் வடையும் அருந்தி, நம்ம சங்கத்தில் இணையத் தயாரா?"
  }
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    queueMicrotask(() => {
      const saved = localStorage.getItem("sangam_locale") as Locale;
      if (saved === "en" || saved === "ta") {
        setLocaleState(saved);
      }
    });
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("sangam_locale", newLocale);
    document.documentElement.lang = newLocale;
  };

  const toggleLocale = () => {
    setLocale(locale === "en" ? "ta" : "en");
  };

  const t = (key: string, defaultText?: string): string => {
    if (translations[key] && translations[key][locale]) {
      return translations[key][locale];
    }
    return defaultText || key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
