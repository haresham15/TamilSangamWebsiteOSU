import { describe, it, expect } from "vitest";
import { KOLAM_PATHS, PULLI_DOTS } from "./SikkuKolamToggle";
import { NAV_ROUTES, PRIMARY_NAV_ROUTES, SECONDARY_NAV_ROUTES } from "./navRoutes";

describe("SikkuKolamToggle specifications", () => {
  it("defines 4-segment cubic Bezier paths for seamless morphing", () => {
    // Both woven and unraveled paths must begin with M and have 4 C segments ending in Z
    const countC = (d: string) => (d.match(/ C /g) || []).length;

    expect(KOLAM_PATHS.loopA_woven.startsWith("M 16 16")).toBe(true);
    expect(KOLAM_PATHS.loopA_unraveled.startsWith("M 16 16")).toBe(true);
    expect(countC(KOLAM_PATHS.loopA_woven)).toBe(4);
    expect(countC(KOLAM_PATHS.loopA_unraveled)).toBe(4);

    expect(KOLAM_PATHS.loopB_woven.startsWith("M 16 16")).toBe(true);
    expect(KOLAM_PATHS.loopB_unraveled.startsWith("M 16 16")).toBe(true);
    expect(countC(KOLAM_PATHS.loopB_woven)).toBe(4);
    expect(countC(KOLAM_PATHS.loopB_unraveled)).toBe(4);
  });

  it("defines 4 outer Pulli dots around central coordinate 16,16", () => {
    expect(PULLI_DOTS.length).toBe(4);
    const ids = PULLI_DOTS.map((d) => d.id);
    expect(ids).toEqual(["top", "bottom", "left", "right"]);
  });

  it("curates 8 primary routes sorted by necessity with games badge and clear names", () => {
    const gamesRoute = PRIMARY_NAV_ROUTES.find((r) => r.href === "/games");
    expect(gamesRoute).toBeDefined();
    expect(gamesRoute?.badge).toBe(true);

    // Gallery and Next Event removed from primary navbar per user steering
    expect(PRIMARY_NAV_ROUTES.find((r) => r.href === "/gallery")).toBeUndefined();
    expect(PRIMARY_NAV_ROUTES.find((r) => r.isNextEvent)).toBeUndefined();

    // Renamed ideas to Suggestions
    const suggestionsRoute = PRIMARY_NAV_ROUTES.find((r) => r.href === "/suggestions");
    expect(suggestionsRoute).toBeDefined();
    expect(suggestionsRoute?.en).toBe("Suggestions");
    expect(suggestionsRoute?.ta).toBe("பரிந்துரைகள்");

    // Full route counts
    expect(PRIMARY_NAV_ROUTES.length).toBe(8);
    expect(SECONDARY_NAV_ROUTES.length).toBe(3);
    expect(NAV_ROUTES.length).toBe(11);

    // Secondary routes contain gallery and next event for deep matching
    expect(NAV_ROUTES.find((r) => r.href === "/gallery")).toBeDefined();
    expect(NAV_ROUTES.find((r) => r.isNextEvent)).toBeDefined();
  });
});
