"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { soundEngine } from "@/lib/soundEngine";

interface AudioContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playBell: (freq?: number) => void;
  playThump: (pitch?: number) => void;
  playClick: () => void;
  playWoodClick: () => void;
  playFlour: () => void;
  playSyllable: (syllable: string) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(false);

  useEffect(() => {
    queueMicrotask(() => {
      const saved = localStorage.getItem("sangam_sound_enabled");
      if (saved === "true") {
        setIsSoundEnabled(true);
        soundEngine.setMuted(false);
      } else {
        soundEngine.setMuted(true);
      }
    });
  }, []);

  const toggleSound = () => {
    const nextState = !isSoundEnabled;
    setIsSoundEnabled(nextState);
    soundEngine.setMuted(!nextState);
    localStorage.setItem("sangam_sound_enabled", String(nextState));
    if (nextState) {
      soundEngine.playTempleBell(880);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isSoundEnabled,
        toggleSound,
        playBell: (freq) => soundEngine.playTempleBell(freq),
        playThump: (pitch) => soundEngine.playParaiThump(pitch),
        playClick: () => soundEngine.playWoodClick(),
        playWoodClick: () => soundEngine.playWoodClick(),
        playFlour: () => soundEngine.playFlourChime(),
        playSyllable: (s) => soundEngine.playSolkattuSyllable(s),
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
