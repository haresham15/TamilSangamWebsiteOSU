// src/context/AudioContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { soundEngine } from "@/lib/soundEngine";
import { audio } from "@/audio/AudioController";
import { audioLayer } from "@/utils/audioLayer";
import { armAudioUnlock } from "@/audio/armUnlock";

interface AudioContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playBell: (freq?: number) => void;
  playThump: (pitch?: number) => void;
  playClick: () => void;
  playWoodClick: () => void;
  playFlour: () => void;
  playWhoosh: (gain?: number) => void;
  playSilkSwish: (gain?: number) => void;
  playSyllable: (syllable: string) => void;
  playAcousticString: (stringIndex: number, strength?: number) => void;
  playMarimba: (freqOrIndex?: number) => void;
  playCardSlide: (volume?: number) => void;
  playPillarHover: (indexOrKey?: number | string) => void;
  playArchiveBrush: () => void;
  playTempleChime: () => void;
  playMicroTap: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Arm first-gesture passive unlock listener
    armAudioUnlock();

    queueMicrotask(() => {
      const saved =
        localStorage.getItem("sound") ??
        localStorage.getItem("sangam_sound_enabled");
      const enabled = saved === "1" || saved === "true";
      setIsSoundEnabled(enabled);
      audio.setEnabled(enabled);
      soundEngine.setMuted(!enabled);
      audioLayer.setMuted(!enabled);
    });
  }, []);

  const toggleSound = () => {
    const nextState = !isSoundEnabled;
    if (nextState) {
      soundEngine.unlock();
    } else {
      soundEngine.playMicroTap();
    }
    setIsSoundEnabled(nextState);
    audio.setEnabled(nextState);
    soundEngine.setMuted(!nextState);
    audioLayer.setMuted(!nextState);

    try {
      localStorage.setItem("sound", nextState ? "1" : "0");
      localStorage.setItem("sangam_sound_enabled", String(nextState));
    } catch {
      // Ignore private storage restrictions
    }

    if (nextState) {
      // Temple bell harmonic shimmer confirms unmuted state; Tambura drone begins breathing in
      soundEngine.playTempleChime();
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isSoundEnabled,
        toggleSound,
        playBell: () => soundEngine.playTempleChime(),
        playThump: (pitch) => soundEngine.playParaiThump(pitch),
        playClick: () => soundEngine.playMicroTap(),
        playWoodClick: () => soundEngine.playMicroTap(),
        playFlour: () => soundEngine.playFlourChime(),
        playWhoosh: (gain) => soundEngine.playWhoosh(gain),
        playSilkSwish: (gain) => soundEngine.playSilkSwish(gain),
        playSyllable: (s) => soundEngine.playSolkattuSyllable(s),
        playAcousticString: (idx, strength) => soundEngine.playAcousticString(idx, strength),
        playMarimba: (val) => soundEngine.playPillarHover(val ?? 0),
        playCardSlide: () => soundEngine.playArchiveBrush(),
        playPillarHover: (val) => soundEngine.playPillarHover(val ?? 0),
        playArchiveBrush: () => soundEngine.playArchiveBrush(),
        playTempleChime: () => soundEngine.playTempleChime(),
        playMicroTap: () => soundEngine.playMicroTap(),
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
