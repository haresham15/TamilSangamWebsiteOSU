"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { soundEngine } from "@/lib/soundEngine";
import { audio } from "@/audio/AudioController";
import { armAudioUnlock } from "@/audio/armUnlock";

interface AudioContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playBell: (freq?: number) => void;
  playThump: (pitch?: number) => void;
  playClick: () => void;
  playWoodClick: () => void;
  playFlour: () => void;
  playSyllable: (syllable: string) => void;
  playAcousticString: (stringIndex: number, strength?: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Arm first-gesture passive unlock listener (§4.4)
    armAudioUnlock();

    queueMicrotask(() => {
      const saved =
        localStorage.getItem("sound") ??
        localStorage.getItem("sangam_sound_enabled");
      const enabled = saved === "1" || saved === "true";
      setIsSoundEnabled(enabled);
      audio.setEnabled(enabled);
      soundEngine.setMuted(!enabled);
    });
  }, []);

  const toggleSound = () => {
    const nextState = !isSoundEnabled;
    setIsSoundEnabled(nextState);
    audio.setEnabled(nextState);
    soundEngine.setMuted(!nextState);

    try {
      localStorage.setItem("sound", nextState ? "1" : "0");
      localStorage.setItem("sangam_sound_enabled", String(nextState));
    } catch {
      // Ignore private storage restrictions
    }

    if (nextState) {
      audio.play("toggle");
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
        playAcousticString: (idx, strength) => soundEngine.playAcousticString(idx, strength),
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
