// src/data/games/quordleData.ts
import { VALIDATED_TANGLISH_WORDS, isValidSolluGuess } from "../solluDictionary";
import { getGamePrng } from "@/lib/games/seed";

// Curated 5-letter cultural targets for rich, vast, endless gameplay
export const QUORDLE_TARGET_WORDS: readonly string[] = [
  "DOSAI", "CHOLA", "KOLAM", "NATPU", "KOVIL", "KURAL", "HALWA", "KAAPI",
  "VEENA", "MAASI", "THENI", "PULLI", "MUTHU", "MALAR", "VADAI", "MEENA",
  "APPAM", "KAVIN", "TAMIL", "CHAIY", "ANAND", "IDLIS", "JALSA", "KAMAL",
  "ARASI", "SOLAI", "KOTTA", "MUTRA", "KILIP", "AMUTH", "SURYA", "PAZHA",
  "KADAL", "ILAYA", "NEERU", "PAADU", "ISAIY", "ALAIY", "CHERA", "KABAL",
  "RAGAM", "TALAM", "THALI", "SAMBA", "MANGO", "LOTUS", "TIGER", "PEARL",
  "POORI", "RASAM", "OOTYY", "SALEM", "ERODE", "KARUR", "MADUR", "THANJ",
  "AALAM", "AASAI", "ARAME", "AMBER", "ILLAI", "MASAL", "PAARU", "PAPER",
  "ARENA", "MURAL", "PLAIN", "ALIVE", "MINER", "AWARE", "LABEL", "RELAX",
  "APPAL", "PAASA", "ESSAY", "SLIDE", "AADAL", "YIELD", "APADI", "DRAMA",
  "FIFTY", "FLAME", "SPEAK", "EAGER", "CHASE", "SWEET", "EARTH", "ALTER",
  "POOJA", "DEEPA", "VARAM", "ARASU", "MANAM", "NAGAM", "RADHA", "NADAN",
  "NADHI", "NAADU", "KANNI", "VIDAI", "PAALU", "KAALU", "KAPAL", "PALAM",
  "MATTA", "PATTAM", "AATAM", "PAATAM", "KOPUR", "PORIY", "SILAM", "CHUTN",
  "MRIDA", "ANIRU", "KUNDA", "VANDH", "PASUM", "KALAI", "THENI", "KODAI",
  "VALAI", "SIRPI", "VIMAN", "MUDRA", "GOPUR", "KODAM", "VAASI", "PANGU",
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
