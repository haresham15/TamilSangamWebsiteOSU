"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Tinai = "marutham" | "neithal" | "mullai" | "paalai" | "kurinji";
export type Sirupozhuthu = "vaigarai" | "nanpagal" | "erpaadu" | "maalai" | "yaamam";

export interface TinaiMeta {
  id: Tinai;
  timeId: Sirupozhuthu;
  nameEn: string;
  nameTa: string;
  landscapeEn: string;
  landscapeTa: string;
  timeLabelEn: string;
  timeLabelTa: string;
  sectionEn: string;
  sectionTa: string;
  accentColor: string;
}

export const TINAIS: Record<Tinai, TinaiMeta> = {
  marutham: {
    id: "marutham",
    timeId: "vaigarai",
    nameEn: "Marutham",
    nameTa: "மருதம்",
    landscapeEn: "Farmland & River Plains",
    landscapeTa: "வயலும் வயல் சார்ந்த இடமும்",
    timeLabelEn: "Vaigarai · Dawn (4 AM - 8 AM)",
    timeLabelTa: "வைகறை · விடியற்காலை",
    sectionEn: "Events & Celebrations",
    sectionTa: "நிகழ்வுகள் & கொண்டாட்டங்கள்",
    accentColor: "#f2b705",
  },
  paalai: {
    id: "paalai",
    timeId: "nanpagal",
    nameEn: "Paalai",
    nameTa: "பாலை",
    landscapeEn: "Arid Sand & Desert Highway",
    landscapeTa: "மணலும் மணல் சார்ந்த இடமும்",
    timeLabelEn: "Nanpagal · Midday (8 AM - 2 PM)",
    timeLabelTa: "நண்பகல் · உச்சிப்பொழுது",
    sectionEn: "Initiatives & Outreaches",
    sectionTa: "முன்னெடுப்புகள் & சமூகப் பணிகள்",
    accentColor: "#b5573a",
  },
  neithal: {
    id: "neithal",
    timeId: "erpaadu",
    nameEn: "Neithal",
    nameTa: "நெய்தல்",
    landscapeEn: "Seashore & Ocean Tides",
    landscapeTa: "கடலும் கடல் சார்ந்த இடமும்",
    timeLabelEn: "Erpaadu · Sunset (2 PM - 6 PM)",
    timeLabelTa: "எற்பாடு · அந்திப்பொழுது",
    sectionEn: "Memories & Photo Gallery",
    sectionTa: "நினைவுகள் & புகைப்படத் தொகுப்பு",
    accentColor: "#0b7a75",
  },
  mullai: {
    id: "mullai",
    timeId: "maalai",
    nameEn: "Mullai",
    nameTa: "முல்லை",
    landscapeEn: "Forest & Pasture",
    landscapeTa: "காடும் காடு சார்ந்த இடமும்",
    timeLabelEn: "Maalai · Evening (6 PM - 10 PM)",
    timeLabelTa: "மாலை · மாலைப்பொழுது",
    sectionEn: "Board & Alumni",
    sectionTa: "குழு & முன்னாள் மாணவர்கள்",
    accentColor: "#6b8e4e",
  },
  kurinji: {
    id: "kurinji",
    timeId: "yaamam",
    nameEn: "Kurinji",
    nameTa: "குறிஞ்சி",
    landscapeEn: "Mountains & Highlands",
    landscapeTa: "மலையும் மலை சார்ந்த இடமும்",
    timeLabelEn: "Yaamam · Midnight (10 PM - 4 AM)",
    timeLabelTa: "யாமம் · நள்ளிரவு",
    sectionEn: "Join & Community",
    sectionTa: "இணையுங்கள் & சமுதாயம்",
    accentColor: "#8b5cf6",
  },
};

interface TinaiContextType {
  currentTinai: Tinai;
  isManualPin: boolean;
  setTinai: (tinai: Tinai, manual?: boolean) => void;
  resetToLiveTime: () => void;
  meta: TinaiMeta;
}

const TinaiContext = createContext<TinaiContextType | undefined>(undefined);

function getTinaiFromHour(hour: number): Tinai {
  if (hour >= 4 && hour < 8) return "marutham";
  if (hour >= 8 && hour < 14) return "paalai";
  if (hour >= 14 && hour < 18) return "neithal";
  if (hour >= 18 && hour < 22) return "mullai";
  return "kurinji";
}

export function TinaiProvider({ children }: { children: React.ReactNode }) {
  const [currentTinai, setCurrentTinai] = useState<Tinai>("marutham");
  const [isManualPin, setIsManualPin] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    queueMicrotask(() => {
      const savedPin = localStorage.getItem("sangam_tinai_pin");
      if (savedPin && Object.keys(TINAIS).includes(savedPin)) {
        setCurrentTinai(savedPin as Tinai);
        setIsManualPin(true);
        document.documentElement.setAttribute("data-tinai", savedPin);
        return;
      }

      const updateFromClock = () => {
        const hour = new Date().getHours();
        const detected = getTinaiFromHour(hour);
        setCurrentTinai(detected);
        document.documentElement.setAttribute("data-tinai", detected);
      };

      updateFromClock();
      interval = setInterval(updateFromClock, 60000);
    });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const setTinai = (tinai: Tinai, manual: boolean = true) => {
    setCurrentTinai(tinai);
    setIsManualPin(manual);
    document.documentElement.setAttribute("data-tinai", tinai);
    if (manual) {
      localStorage.setItem("sangam_tinai_pin", tinai);
    }
  };

  const resetToLiveTime = () => {
    localStorage.removeItem("sangam_tinai_pin");
    setIsManualPin(false);
    const hour = new Date().getHours();
    const detected = getTinaiFromHour(hour);
    setCurrentTinai(detected);
    document.documentElement.setAttribute("data-tinai", detected);
  };

  return (
    <TinaiContext.Provider
      value={{
        currentTinai,
        isManualPin,
        setTinai,
        resetToLiveTime,
        meta: TINAIS[currentTinai],
      }}
    >
      {children}
    </TinaiContext.Provider>
  );
}

export function useTinai() {
  const context = useContext(TinaiContext);
  if (!context) {
    throw new Error("useTinai must be used within a TinaiProvider");
  }
  return context;
}
