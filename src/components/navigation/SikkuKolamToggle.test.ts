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

  it("positions Games as the final primary route with isNew and badge active", () => {
    const lastPrimaryRoute = PRIMARY_NAV_ROUTES[PRIMARY_NAV_ROUTES.length - 1];
    expect(lastPrimaryRoute.href).toBe("/games");
    expect(lastPrimaryRoute.isNew).toBe(true);
    expect(lastPrimaryRoute.badge).toBe(true);
    expect(PRIMARY_NAV_ROUTES.length).toBe(6);
    expect(SECONDARY_NAV_ROUTES.length).toBe(3);
    expect(NAV_ROUTES.length).toBe(9);
  });
});
