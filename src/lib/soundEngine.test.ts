import { describe, it, expect } from "vitest";
import {
  soundEngine,
  RAGA_MOHANAM_HZ,
  MOHANAM_ASCENDING_SCALE,
  VAARANAM_6_STRINGS_HZ,
} from "./soundEngine";

describe("Warm Hearth & Carnatic Acoustic Sound Engine", () => {
  it("exposes pure Just Intonation Raga Mohanam frequencies anchored at D3 (146.83 Hz)", () => {
    expect(RAGA_MOHANAM_HZ.Sa_low).toBeCloseTo(146.83, 2);
    expect(RAGA_MOHANAM_HZ.Pa_low).toBeCloseTo(220.25, 2);
    expect(RAGA_MOHANAM_HZ.Sa).toBeCloseTo(293.66, 2);
    expect(RAGA_MOHANAM_HZ.Ri2).toBeCloseTo(330.37, 2);
    expect(RAGA_MOHANAM_HZ.Ga3).toBeCloseTo(367.08, 2);
    expect(RAGA_MOHANAM_HZ.Pa).toBeCloseTo(440.49, 2);
    expect(RAGA_MOHANAM_HZ.Dha2).toBeCloseTo(489.43, 2);
    expect(RAGA_MOHANAM_HZ.Sa_hi).toBeCloseTo(587.33, 2);
  });

  it("scales ascending Arohanam notes strictly across the 5 Pillars", () => {
    expect(MOHANAM_ASCENDING_SCALE).toHaveLength(6);
    expect(MOHANAM_ASCENDING_SCALE[0]).toBe(RAGA_MOHANAM_HZ.Sa);
    expect(MOHANAM_ASCENDING_SCALE[1]).toBe(RAGA_MOHANAM_HZ.Ri2);
    expect(MOHANAM_ASCENDING_SCALE[2]).toBe(RAGA_MOHANAM_HZ.Ga3);
    expect(MOHANAM_ASCENDING_SCALE[3]).toBe(RAGA_MOHANAM_HZ.Pa);
    expect(MOHANAM_ASCENDING_SCALE[4]).toBe(RAGA_MOHANAM_HZ.Dha2);
    expect(MOHANAM_ASCENDING_SCALE[5]).toBe(RAGA_MOHANAM_HZ.Sa_hi);
  });

  it("tunes the 6 Vaaranam Aayiram strings to an open Raga Mohanam voicing", () => {
    expect(VAARANAM_6_STRINGS_HZ).toEqual([
      146.83, 220.25, 293.66, 367.08, 440.49, 659.25,
    ]);
  });

  it("exposes all 7 cultural acoustic voices on the singleton engine", () => {
    expect(typeof soundEngine.startTamburaDrone).toBe("function");
    expect(typeof soundEngine.stopTamburaDrone).toBe("function");
    expect(typeof soundEngine.playPillarHover).toBe("function");
    expect(typeof soundEngine.playAcousticString).toBe("function");
    expect(typeof soundEngine.playVaaranamChord).toBe("function");
    expect(typeof soundEngine.playFlapFlutter).toBe("function");
    expect(typeof soundEngine.playArchiveBrush).toBe("function");
    expect(typeof soundEngine.playTempleChime).toBe("function");
    expect(typeof soundEngine.playMicroTap).toBe("function");
  });

  it("starts muted by default in accordance with the quiet-hearth principle", () => {
    expect(typeof soundEngine.isAudioMuted).toBe("function");
    expect(soundEngine.isAudioMuted()).toBe(true);
  });
});
