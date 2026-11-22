// src/components/ui/KolamLoader.test.ts
import { describe, it, expect } from "vitest";
import { ROUTE_INFO_MAP } from "./KolamLoader";

describe("KolamLoader ROUTE_INFO_MAP and route parsing", () => {
  it("provides valid editorial bilingual titles for all core routes", () => {
    const requiredRoutes = [
      "/",
      "/events",
      "/about",
      "/board",
      "/gallery",
      "/games",
      "/guide",
      "/suggestions",
      "/join",
      "/links",
      "/faq",
    ];

    for (const route of requiredRoutes) {
      const info = ROUTE_INFO_MAP[route];
      expect(info, `Route info missing for ${route}`).toBeDefined();
      expect(info.titleEn).toBeTruthy();
      expect(info.titleTa).toBeTruthy();
      expect(info.subtitleEn).toBeTruthy();
    }
  });

  it("normalizes route paths correctly by stripping query strings and trailing slashes", () => {
    const normalize = (r: string) =>
      (r || "").split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

    expect(normalize("/events?view=calendar")).toBe("/events");
    expect(normalize("/events/")).toBe("/events");
    expect(normalize("/about#heritage")).toBe("/about");
    expect(normalize("///")).toBe("/");
    expect(normalize("")).toBe("/");
  });
});
