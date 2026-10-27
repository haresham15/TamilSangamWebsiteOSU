import { describe, it, expect } from "vitest";
import { splitTamilAksharas, SOLLU_MONTHLY_EDITIONS, THODARPU_MONTHLY_EDITIONS } from "@/data/gamesData";
import { evaluateCameraRail, evaluateForegroundRig, evaluateFireball } from "@/components/games-hero/gamesRail";

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

  it("contains all 3 valid monthly editions for Sollu and Thodarpu", () => {
    expect(SOLLU_MONTHLY_EDITIONS["2026-10"]).toBeDefined();
    expect(SOLLU_MONTHLY_EDITIONS["2026-11"]).toBeDefined();
    expect(SOLLU_MONTHLY_EDITIONS["2026-12"]).toBeDefined();

    expect(THODARPU_MONTHLY_EDITIONS["2026-10"].categories.length).toBe(4);
    expect(THODARPU_MONTHLY_EDITIONS["2026-11"].categories.length).toBe(4);
    expect(THODARPU_MONTHLY_EDITIONS["2026-12"].categories.length).toBe(4);
  });
});

describe("Beach Blast Hero Camera Rail & Kinematics (D-01 to D-10)", () => {
  it("evaluates Beat 1 (p = 0.10) with sharp distant background and no foreground blur", () => {
    const cam = evaluateCameraRail(0.10);
    expect(cam.dofFocusDistance).toBeCloseTo(37.0);
    expect(cam.backgroundBokeh).toBe(0.0);
    expect(cam.foregroundBlur).toBe(0.0);
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
