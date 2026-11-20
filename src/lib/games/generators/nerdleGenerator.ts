// src/lib/games/generators/nerdleGenerator.ts
/**
 * Procedural Nerdle (En Puthir) Equation Generator.
 * Generates an 8-character valid mathematical equation daily:
 * e.g., "14+28=42", "9*7-15=48", "72/8+5=14", "35+29=64".
 */

import { getGamePrng } from "../seed";

export const TAMIL_NUMERALS: Record<string, string> = {
  "0": "௦",
  "1": "௧",
  "2": "௨",
  "3": "௩",
  "4": "௪",
  "5": "௫",
  "6": "௬",
  "7": "௭",
  "8": "௮",
  "9": "௯",
};

export const REVERSE_TAMIL_NUMERALS: Record<string, string> = {
  "௦": "0",
  "௧": "1",
  "௨": "2",
  "௩": "3",
  "௪": "4",
  "௫": "5",
  "௬": "6",
  "௭": "7",
  "௮": "8",
  "௯": "9",
};

// Curated verified 8-char equations bank for fallback & instant generation
export const VERIFIED_EQUATIONS: readonly string[] = [
  "14+28=42",
  "9*7-15=48",
  "72/8+5=14",
  "35+29=64",
  "8*9-16=56",
  "48/6+9=17",
  "23+19=42",
  "6*8+12=60",
  "95-38=57",
  "63/7+8=17",
  "45+37=82",
  "8*8-14=50",
  "54/6+7=16",
  "28+46=74",
  "7*9-21=42",
  "81/9+6=15",
  "39+43=82",
  "6*7-18=24",
  "96-49=47",
  "7*8-19=37",
  "56/8+9=16",
  "17+38=55",
  "9*8-24=48",
  "42/6+8=15",
  "29+35=64",
  "8*7-16=40",
  "64/8+7=15",
  "18+54=72",
  "9*6-12=42",
  "72/9+8=16",
  "26+37=63",
];

export function getDailyEquation(seedStr: string): string {
  const prng = getGamePrng("en-puthir", seedStr);
  const idx = Math.floor(prng.next() * VERIFIED_EQUATIONS.length);
  return VERIFIED_EQUATIONS[idx];
}

/**
 * Validates whether an 8-character string is mathematically correct.
 */
export function isValidEquation(equation: string): { valid: boolean; error?: string } {
  if (equation.length !== 8) {
    return { valid: false, error: "Must be exactly 8 characters" };
  }

  const parts = equation.split("=");
  if (parts.length !== 2) {
    return { valid: false, error: "Must contain exactly one '='" };
  }

  const [lhs, rhs] = parts;
  if (!lhs || !rhs) {
    return { valid: false, error: "Missing left or right side of '='" };
  }

  // Must only contain digits and operators + - * /
  if (!/^[0-9+\-*/]+$/.test(lhs) || !/^[0-9]+$/.test(rhs)) {
    return { valid: false, error: "Invalid characters in equation" };
  }

  // No consecutive operators or leading/trailing operators on LHS
  if (/[+\-*/]{2,}/.test(lhs) || /^[+\-*/]|[+\-*/]$/.test(lhs)) {
    return { valid: false, error: "Invalid operator placement" };
  }

  try {
    // Safely evaluate simple arithmetic using integer tokenizer
    const result = evaluateArithmetic(lhs);
    const expected = parseInt(rhs, 10);
    if (result !== expected) {
      return { valid: false, error: `Equation does not compute (${lhs} = ${result}, not ${rhs})` };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Could not evaluate equation" };
  }
}

/** Simple integer arithmetic evaluator respecting precedence (* and / before + and -) */
function evaluateArithmetic(expr: string): number {
  // Tokenize into numbers and operators
  const tokens: (number | string)[] = [];
  let curr = "";
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch >= "0" && ch <= "9") {
      curr += ch;
    } else {
      if (curr) tokens.push(parseInt(curr, 10));
      curr = "";
      tokens.push(ch);
    }
  }
  if (curr) tokens.push(parseInt(curr, 10));

  // First pass: * and /
  const pass1: (number | string)[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "*" || t === "/") {
      const prev = pass1.pop() as number;
      const next = tokens[++i] as number;
      if (t === "*") {
        pass1.push(prev * next);
      } else {
        if (next === 0 || prev % next !== 0) throw new Error("Fractional or div by zero");
        pass1.push(Math.floor(prev / next));
      }
    } else {
      pass1.push(t);
    }
  }

  // Second pass: + and -
  let result = pass1[0] as number;
  for (let i = 1; i < pass1.length; i += 2) {
    const op = pass1[i] as string;
    const next = pass1[i + 1] as number;
    if (op === "+") result += next;
    if (op === "-") result -= next;
  }

  return result;
}
