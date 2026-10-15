"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { soundEngine } from "@/lib/soundEngine";
import { audio } from "@/audio/AudioController";
import { audioLayer } from "@/utils/audioLayer";
import { armAudioUnlock } from "@/audio/armUnlock";
import { playHearthAmbience, stopHearthAmbience, playKuralChime } from "@/audio/sounds";

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
      // Kural chime confirms audio-on; hearth ambience begins fading in
      playKuralChime();
      playHearthAmbience();
    } else {
      stopHearthAmbience();
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isSoundEnabled,
        toggleSound,
        playBell: (freq) => soundEngine.playTempleBell(freq),
        playThump: (pitch) => soundEngine.playParaiThump(pitch),
        playClick: () => {
          soundEngine.playWoodClick();
          audioLayer.playWarmWoodClick();
        },
        playWoodClick: () => {
          soundEngine.playWoodClick();
          audioLayer.playWarmWoodClick();
        },
        playFlour: () => soundEngine.playFlourChime(),
        playWhoosh: (gain) => {
          soundEngine.playWhoosh(gain);
          audioLayer.playCinematicWhoosh(gain);
        },
        playSilkSwish: (gain) => {
          soundEngine.playSilkSwish(gain);
          audioLayer.playSilkSwish(gain);
        },
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
