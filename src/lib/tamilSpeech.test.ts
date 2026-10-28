// src/lib/tamilSpeech.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  extractTamilText,
  speakTamil,
  stopTamilSpeech,
  isSpeechSupported,
} from "./tamilSpeech";

describe("tamilSpeech utility", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("extractTamilText", () => {
    it("extracts clean Tamil text from parenthesized English translation", () => {
      const raw =
        "யாதும் ஊரே யாவரும் கேளீர் (To us all towns are home, everyone our kin).";
      expect(extractTamilText(raw)).toBe("யாதும் ஊரே யாவரும் கேளீர்");
    });

    it("extracts two-line Thirukkural couplets accurately", () => {
      const line1 = "கற்க கசடறக் கற்பவை கற்றபின்";
      const line2 = "நிற்க அதற்குத் தக.";
      const raw = `${line1}\n${line2}`;
      expect(extractTamilText(raw)).toBe("கற்க கசடறக் கற்பவை கற்றபின் நிற்க அதற்குத் தக.");
    });

    it("cleans quotation marks and whitespace", () => {
      const raw = '“அன்பே சிவம்” (Love is the highest divinity)';
      expect(extractTamilText(raw)).toBe("அன்பே சிவம்");
    });

    it("returns empty string for empty input", () => {
      expect(extractTamilText("")).toBe("");
    });
  });

  describe("speech synthesis runtime", () => {
    it("detects SpeechSynthesis support or lack thereof in test env", () => {
      expect(typeof isSpeechSupported()).toBe("boolean");
    });

    it("safely handles stopTamilSpeech without throwing", () => {
      expect(() => stopTamilSpeech()).not.toThrow();
    });

    it("returns false and invokes error callback when synthesis is unavailable", () => {
      // In node/vitest environment window.speechSynthesis is undefined by default
      const onError = vi.fn();
      const res = speakTamil("வணக்கம்", { onError, playChime: false });
      expect(res).toBe(false);
      expect(onError).toHaveBeenCalled();
    });
  });
});
