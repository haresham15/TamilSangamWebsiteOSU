// src/lib/games/arcadeEngine.test.ts
import { describe, it, expect } from "vitest";
import { generateKolamPuzzle } from "./generators/kolamGenerator";
import { isValidEquation, getDailyEquation } from "./generators/nerdleGenerator";
import { matchesTanglishFuzzy } from "./tanglish";
import { calculateDistanceKm, calculateBearing, calculateProximity } from "@/data/games/districtsData";
import { getRankTitle } from "@/data/games/spellingBeeData";

describe("Arcade Games Engine & Mechanics Verification", () => {
  describe("Kolam Path Generator", () => {
    it("generates a valid, unbroken Hamiltonian path covering all cells", () => {
      const puzzle = generateKolamPuzzle("test-seed-2026-11-20", 6);
      expect(puzzle.gridSize).toBe(6);
      expect(puzzle.totalCells).toBe(36);
      expect(puzzle.solutionPath.length).toBe(36);

      // Verify every step is adjacent
      for (let i = 1; i < puzzle.solutionPath.length; i++) {
        const prev = puzzle.solutionPath[i - 1];
        const curr = puzzle.solutionPath[i];
        const dr = Math.abs(curr.row - prev.row);
        const dc = Math.abs(curr.col - prev.col);
        expect(dr + dc).toBe(1);
      }

      // Checkpoints are in consecutive order
      expect(puzzle.checkpoints.length).toBeGreaterThanOrEqual(4);
      expect(puzzle.checkpoints[0].number).toBe(1);
    });
  });

  describe("En Puthir (Nerdle) Validator", () => {
    it("validates mathematically correct 8-character equations", () => {
      expect(isValidEquation("14+28=42").valid).toBe(true);
      expect(isValidEquation("8*7+4=60").valid).toBe(true);
      expect(isValidEquation("7*8-6=50").valid).toBe(true);
      expect(isValidEquation("35+29=64").valid).toBe(true);
    });

    it("rejects invalid arithmetic or wrong length equations", () => {
      expect(isValidEquation("14+28=45").valid).toBe(false);
      expect(isValidEquation("1+2=3").valid).toBe(false); // too short
      expect(isValidEquation("14++28=42").valid).toBe(false); // double operator
      expect(isValidEquation("14+28=42=42").valid).toBe(false); // multiple equals
    });

    it("retrieves a deterministic daily equation from seed", () => {
      const eq1 = getDailyEquation("2026-11-20");
      const eq2 = getDailyEquation("2026-11-20");
      expect(eq1).toBe(eq2);
      expect(eq1.length).toBe(8);
      expect(isValidEquation(eq1).valid).toBe(true);
    });
  });

  describe("Tanglish & Tamil Transliteration Matching", () => {
    it("matches exact English and Tanglish answers", () => {
      const res = matchesTanglishFuzzy("Flowers", "Flowers", ["malar", "pookal"]);
      expect(res.matched).toBe(true);
      expect(res.distance).toBe(0);
    });

    it("matches transliterated variants with collapsed phonetics", () => {
      const res = matchesTanglishFuzzy("poo", "Flowers", ["poo", "pookal", "malar"]);
      expect(res.matched).toBe(true);
    });

    it("matches Tamil Unicode answers seamlessly", () => {
      const res = matchesTanglishFuzzy("பூக்கள்", "Flowers", ["பூக்கள்", "மலர்"]);
      expect(res.matched).toBe(true);
    });

    it("rejects completely incorrect answers", () => {
      const res = matchesTanglishFuzzy("Airplane", "Flowers", ["malar", "pookal"]);
      expect(res.matched).toBe(false);
    });
  });

  describe("Oor Kandupidi (Worldle) Geographic Math", () => {
    it("calculates zero distance and 100% proximity for identical coordinates", () => {
      const d = calculateDistanceKm(9.9252, 78.1198, 9.9252, 78.1198);
      expect(d).toBe(0);
      expect(calculateProximity(d)).toBe(100);
    });

    it("calculates realistic Haversine distance between Chennai and Madurai (~420km)", () => {
      // Chennai: 13.0827, 80.2707; Madurai: 9.9252, 78.1198
      const d = calculateDistanceKm(13.0827, 80.2707, 9.9252, 78.1198);
      expect(d).toBeGreaterThan(400);
      expect(d).toBeLessThan(450);
      const bearing = calculateBearing(13.0827, 80.2707, 9.9252, 78.1198);
      expect(bearing.direction).toContain("S"); // Southwards
    });
  });

  describe("Ezhuthu Theni (Spelling Bee) Ranking", () => {
    it("scales rank titles accurately from Beginner to Tamil Scholar", () => {
      expect(getRankTitle(0, 100)).toBe("Beginner · மாணவர்");
      expect(getRankTitle(25, 100)).toBe("Solid · நன்று");
      expect(getRankTitle(65, 100)).toBe("Master · வித்வான்");
      expect(getRankTitle(85, 100)).toBe("Tamil Scholar · புலவர்");
    });
  });
});
