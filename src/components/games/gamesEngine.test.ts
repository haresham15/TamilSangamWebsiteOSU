import { describe, it, expect } from "vitest";
import { splitTamilAksharas, SOLLU_MONTHLY_EDITIONS, THODARPU_MONTHLY_EDITIONS } from "@/data/gamesData";
import { evaluateCameraRail, evaluateForegroundRig, evaluateMissilesAndPyro } from "@/components/games-hero/gamesRail";

describe("Tamil Akshara Grapheme Tokenizer & Games Engine", () => {
  it("correctly tokenizes compound Tamil grapheme clusters into single tiles", () => {
    const word1 = "வணக்கம்";
    const tokens1 = splitTamilAksharas(word1);
    expect(tokens1).toEqual(["வ", "ண", "க்", "க", "ம்"]);
    expect(tokens1.length).toBe(5);

    const word2 = "குத்து";
    const tokens2 = splitTamilAksharas(word2);
    expect(tokens2).toEqual(["கு", "த்", "து"]);
    expect(tokens2.length).toBe(3);

    const word3 = "செந்தமிழ்";
    const tokens3 = splitTamilAksharas(word3);
    expect(tokens3).toEqual(["செ", "ந்", "த", "மி", "ழ்"]);
    expect(tokens3.length).toBe(5);
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

describe("Jailer 2 Hero Camera Rail & Kinematics", () => {
  it("evaluates Beat 1 (p = 0.10) with sharp distant background and no foreground blur", () => {
    const cam = evaluateCameraRail(0.10);
    expect(cam.dofFocusDistance).toBeCloseTo(37.0);
    expect(cam.backgroundBokeh).toBe(0.0);
    expect(cam.foregroundBlur).toBe(0.0);
  });

  it("evaluates Beat 2 (p = 0.42) with macro foreground sharpness and creamy background bokeh", () => {
    const cam = evaluateCameraRail(0.42);
    expect(cam.dofFocusDistance).toBeLessThan(3.0);
    expect(cam.backgroundBokeh).toBeGreaterThan(5.0);
    expect(cam.foregroundBlur).toBe(0.0);

    const rig = evaluateForegroundRig(0.42);
    expect(rig.opacity).toBeCloseTo(1.0);
    expect(rig.position.z).toBeCloseTo(4.65);
    expect(rig.rotation.z).toBeCloseTo(-0.323, 2); // -18.5 degrees
  });

  it("evaluates Beat 3 (p = 0.72) with reverse rack focus, active detonations and lens refraction", () => {
    const cam = evaluateCameraRail(0.72);
    expect(cam.dofFocusDistance).toBeCloseTo(37.0);
    expect(cam.foregroundBlur).toBeGreaterThan(4.0);
    expect(cam.lensRefractionZoom).toBeGreaterThan(1.05);

    const pyro = evaluateMissilesAndPyro(0.72);
    expect(pyro.detonated).toBe(true);
    expect(pyro.fireballScale).toBeGreaterThan(0.5);
  });
});
