// src/data/games/quordleData.ts
import { VALIDATED_TANGLISH_WORDS, isValidSolluGuess } from "../solluDictionary";
import { getGamePrng } from "@/lib/games/seed";

// Curated 5-letter cultural targets for rich gameplay
export const QUORDLE_TARGET_WORDS: readonly string[] = [
  "DOSAI", "CHOLA", "KOLAM", "NATPU", "KOVIL", "KURAL", "HALWA", "KAAPI",
  "VEENA", "MAASI", "THENI", "PULLI", "MUTHU", "MALAR", "VADAI", "MEENA",
  "APPAM", "KAVIN", "TAMIL", "CHAIY", "ANAND", "IDLIS", "JALSA", "KAMAL",
  "ARASI", "SOLAI", "KOTTA", "MUTRA", "KILIP", "AMUTH", "SURYA", "PAZHA",
  "KADAL", "ILAYA", "NEERU", "PAADU", "ISAIY", "ALAIY", "CHERA", "KABAL",
];

export function getDailyQuordleTargets(seedStr: string): string[] {
  const prng = getGamePrng("naanku-sorkal", seedStr);
  const shuffled = prng.shuffle([...QUORDLE_TARGET_WORDS]);
  return shuffled.slice(0, 4);
}

export function isValidQuordleGuess(word: string): boolean {
  if (word.length !== 5) return false;
  const upper = word.toUpperCase();
  if (QUORDLE_TARGET_WORDS.includes(upper)) return true;
  return isValidSolluGuess(upper);
}
