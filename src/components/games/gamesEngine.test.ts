import { describe, it, expect } from "vitest";
import {
  splitTamilAksharas,
  SOLLU_MONTHLY_EDITIONS,
  THODARPU_MONTHLY_EDITIONS,
  SOLLU_BIWEEKLY_EDITIONS,
  THODARPU_BIWEEKLY_EDITIONS,
  BIWEEKLY_EDITION_IDS,
} from "@/data/gamesData";
import {
  getCurrentBiweeklyEditionId,
  isEditionUnlocked,
  getUnlockCountdown,
  normalizeEditionId,
} from "@/lib/gamesStorage";
import { DESIGN_ASPECT, evaluateCameraRail, evaluateForegroundRig, evaluateFireball } from "@/components/games-hero/gamesRail";

describe("Tamil Akshara Grapheme Tokenizer & Games Engine (D-11)", () => {
  it("correctly tokenizes compound Tamil grapheme clusters into single tiles", () => {
    const word1 = "வணக்கம்";
    const tokens1 = splitTamilAksharas(word1);
    expect(tokens1).toEqual(["வ", "ண", "க்", "க", "ம்"]);
    expect(tokens1.length).toBe(5);

    const word2 = "குத்து";
    const tokens2 = splitTamilAksharas(word2);
    expect(tokens2).toEqual(["கு", "த்", "து"]);
    expect(tokens2.length).toBe(3);

    const word3 = "திருக்குறள்";
    const tokens3 = splitTamilAksharas(word3);
    expect(tokens3).toEqual(["தி", "ரு", "க்", "கு", "ற", "ள்"]);
    expect(tokens3.length).toBe(6);

    const word4 = "விருந்தோம்பல்";
    const tokens4 = splitTamilAksharas(word4);
    expect(tokens4).toEqual(["வி", "ரு", "ந்", "தோ", "ம்", "ப", "ல்"]);
    expect(tokens4.length).toBe(7);
  });

  it("contains all 3 valid legacy monthly editions for Sollu and Thodarpu", () => {
    expect(SOLLU_MONTHLY_EDITIONS["2026-10"]).toBeDefined();
    expect(SOLLU_MONTHLY_EDITIONS["2026-11"]).toBeDefined();
    expect(SOLLU_MONTHLY_EDITIONS["2026-12"]).toBeDefined();

    expect(THODARPU_MONTHLY_EDITIONS["2026-10"].categories.length).toBe(4);
    expect(THODARPU_MONTHLY_EDITIONS["2026-11"].categories.length).toBe(4);
    expect(THODARPU_MONTHLY_EDITIONS["2026-12"].categories.length).toBe(4);
  });

  it("contains 8 complete biweekly editions spanning Oct 2026 to Jan 2027 with Tanglish words spanning 3-6 letters", () => {
    expect(BIWEEKLY_EDITION_IDS.length).toBe(8);
    const lengths = new Set<number>();
    for (const id of BIWEEKLY_EDITION_IDS) {
      expect(SOLLU_BIWEEKLY_EDITIONS[id]).toBeDefined();
      const len = SOLLU_BIWEEKLY_EDITIONS[id].tanglishWord.length;
      expect(len).toBeGreaterThanOrEqual(3);
      expect(len).toBeLessThanOrEqual(6);
      lengths.add(len);
      expect(THODARPU_BIWEEKLY_EDITIONS[id]).toBeDefined();
      expect(THODARPU_BIWEEKLY_EDITIONS[id].categories.length).toBe(4);
    }
    expect(Array.from(lengths).sort()).toEqual([3, 4, 5, 6]);
  });

  it("correctly determines biweekly edition from calendar date", () => {
    expect(getCurrentBiweeklyEditionId(new Date("2026-10-05T12:00:00Z"))).toBe("2026-10-A");
    expect(getCurrentBiweeklyEditionId(new Date("2026-10-20T12:00:00Z"))).toBe("2026-10-B");
    expect(getCurrentBiweeklyEditionId(new Date("2026-11-05T12:00:00Z"))).toBe("2026-11-A");
    expect(getCurrentBiweeklyEditionId(new Date("2026-11-20T12:00:00Z"))).toBe("2026-11-B");
    expect(getCurrentBiweeklyEditionId(new Date("2026-12-05T12:00:00Z"))).toBe("2026-12-A");
    expect(getCurrentBiweeklyEditionId(new Date("2026-12-20T12:00:00Z"))).toBe("2026-12-B");
    expect(getCurrentBiweeklyEditionId(new Date("2027-01-05T12:00:00Z"))).toBe("2027-01-A");
    expect(getCurrentBiweeklyEditionId(new Date("2027-01-20T12:00:00Z"))).toBe("2027-01-B");
  });

  it("normalizes legacy edition IDs to biweekly canonical IDs", () => {
    expect(normalizeEditionId("2026-10")).toBe("2026-10-A");
    expect(normalizeEditionId("2026-11")).toBe("2026-11-A");
    expect(normalizeEditionId("2026-12")).toBe("2026-12-A");
    expect(normalizeEditionId("2026-10-B")).toBe("2026-10-B");
  });
});

describe("Beach Blast Hero Camera Rail & Kinematics (D-01 to D-10)", () => {
  it("evaluates Beat 1 (p = 0.10) with sharp distant background and an unfocused foreground plane", () => {
    const cam = evaluateCameraRail(0.10);
    expect(cam.dofFocusDistance).toBeCloseTo(37.0);
    expect(cam.backgroundBokeh).toBe(0.0);
    expect(cam.foregroundBlur).toBe(18.0);
  });

  it("brings the soft entering hand into focus before shifting focus back to the beach", () => {
    expect(evaluateCameraRail(0.30).foregroundBlur).toBeGreaterThan(10);
    expect(evaluateCameraRail(0.42).foregroundBlur).toBe(0);
    expect(evaluateCameraRail(0.56).foregroundBlur).toBeCloseTo(9);
    expect(evaluateCameraRail(0.72).foregroundBlur).toBe(18);
    for (const p of [0.10, 0.30, 0.42, 0.56, 0.72]) {
      const rail = evaluateCameraRail(p);
      expect(rail.foregroundBlur / 18 + rail.backgroundBokeh / 24).toBeCloseTo(1);
    }
  });

  it("evaluates Beat 2 (p = 0.42) with macro foreground sharpness at 0.36m and creamy background bokeh", () => {
    const cam = evaluateCameraRail(0.42);
    expect(cam.dofFocusDistance).toBeCloseTo(0.36, 1);
    expect(cam.backgroundBokeh).toBe(24.0);
    expect(cam.foregroundBlur).toBe(0.0);

    const rig = evaluateForegroundRig(0.42);
    expect(rig.opacity).toBeCloseTo(1.0);
    // Eyeglasses sit at d = 0.36m in front of camera at z=6.0 -> z = 5.64m
    expect(rig.position.z).toBeCloseTo(5.64, 2);
    expect(rig.rotation.z).toBeCloseTo(0.323, 2); // Three.js +18.5 degrees
  });

  it("evaluates Beat 3 (p = 0.72) with reverse rack focus, active detonations and lens contrast pop", () => {
    const cam = evaluateCameraRail(0.72);
    expect(cam.dofFocusDistance).toBeCloseTo(37.0);
    expect(cam.foregroundBlur).toBe(18.0);
    expect(cam.lensContrastBoost).toBeCloseTo(0.12, 2);

    const blastCentre = evaluateFireball(0.72, 1);
    expect(blastCentre.radius).toBeGreaterThan(1.5);
    expect(blastCentre.brightness).toBeGreaterThan(0.2);
  });
});

describe("fixed cinematic framing", () => {
  it("keeps the camera completely fixed through impacts and the content handoff", () => {
    for (const aspect of [DESIGN_ASPECT, 390 / 844]) {
      const start = evaluateCameraRail(0, 0, aspect);
      for (const p of [0.1, 0.42, 0.64, 0.65, 0.72, 0.85, 0.93, 1]) {
        const state = evaluateCameraRail(p, 30, aspect);
        expect(state.position.toArray()).toEqual(start.position.toArray());
        expect(state.lookAt.toArray()).toEqual(start.lookAt.toArray());
        expect(state.fov).toBe(start.fov);
        expect(state.cameraShake).toBe(0);
      }
    }
  });

  it("settles the hand without a tremor or a final lens zoom", () => {
    let previousRoll = Infinity;
    for (let i = 0; i <= 100; i++) {
      const roll = evaluateForegroundRig(0.5 + i / 1000).rotation.z;
      expect(roll).toBeLessThanOrEqual(previousRoll + 1e-10);
      previousRoll = roll;
    }
    const settled = evaluateForegroundRig(0.72);
    for (const p of [0.85, 0.88, 0.9, 0.93, 1]) {
      const hand = evaluateForegroundRig(p);
      expect(hand.position.toArray()).toEqual(settled.position.toArray());
      expect(hand.rotation.toArray()).toEqual(settled.rotation.toArray());
    }
    expect(evaluateForegroundRig(0.9).opacity).toBeLessThan(evaluateForegroundRig(0.85).opacity);
    expect(evaluateForegroundRig(0.94).opacity).toBe(0);
  });

  it("starts and finishes the entrance with zero velocity", () => {
    for (const [p, direction] of [[0.22, 1], [0.4, -1]]) {
      const endpoint = evaluateForegroundRig(p).position;
      const adjacent = evaluateForegroundRig(p + direction * 0.00001).position;
      expect(endpoint.distanceTo(adjacent)).toBeLessThan(1e-8);
    }
  });
});
