// English / Tanglish to Tamil Script Phonetic Transliteration Engine
// Rules based on standard Tamil phonetic mappings

const CONSONANT_MAP: Record<string, string> = {
  k: "க",
  g: "க",
  ch: "ச",
  s: "ச",
  sh: "ஷ",
  j: "ஜ",
  t: "ட",
  d: "ட",
  th: "த",
  dh: "த",
  p: "ப",
  b: "ப",
  m: "ம",
  y: "ய",
  r: "ர",
  l: "ல",
  v: "வ",
  w: "வ",
  zh: "ழ",
  ll: "ள",
  tr: "ற",
  n: "ந",
  nn: "ண",
  ng: "ங",
  nj: "ஞ",
  h: "ஹ",
  f: "ப",
};

const VOWEL_INDEPENDENT: Record<string, string> = {
  a: "அ",
  aa: "ஆ",
  i: "இ",
  ee: "ஈ",
  u: "உ",
  oo: "ஊ",
  e: "எ",
  ae: "ஏ",
  ai: "ஐ",
  o: "ஒ",
  oa: "ஓ",
  au: "ஔ",
};

const VOWEL_DEPENDENT_SIGNS: Record<string, string> = {
  a: "",
  aa: "ா",
  i: "ி",
  ee: "ீ",
  u: "ு",
  oo: "ூ",
  e: "ெ",
  ae: "ே",
  ai: "ை",
  o: "ொ",
  oa: "ோ",
  au: "ௌ",
};

export function transliterateToTamil(input: string): string {
  if (!input.trim()) return "";
  const text = input.toLowerCase().trim();
  let result = "";
  let i = 0;

  while (i < text.length) {
    // Handle space & punctuation directly
    if (!/[a-z]/.test(text[i])) {
      result += text[i];
      i++;
      continue;
    }

    // Try 2-char consonant
    const twoCons = text.substring(i, i + 2);
    const threeCons = text.substring(i, i + 3);

    let cons = "";
    let consLen = 0;

    if (CONSONANT_MAP[threeCons]) {
      cons = CONSONANT_MAP[threeCons];
      consLen = 3;
    } else if (CONSONANT_MAP[twoCons]) {
      cons = CONSONANT_MAP[twoCons];
      consLen = 2;
    } else if (CONSONANT_MAP[text[i]]) {
      cons = CONSONANT_MAP[text[i]];
      consLen = 1;
    }

    if (cons) {
      i += consLen;

      // Check following vowel
      let vowelSign = null;
      let vowelLen = 0;

      const twoVow = text.substring(i, i + 2);
      if (twoVow in VOWEL_DEPENDENT_SIGNS) {
        vowelSign = VOWEL_DEPENDENT_SIGNS[twoVow];
        vowelLen = 2;
      } else if (text[i] in VOWEL_DEPENDENT_SIGNS) {
        vowelSign = VOWEL_DEPENDENT_SIGNS[text[i]];
        vowelLen = 1;
      }

      if (vowelSign !== null) {
        // Consonant + Vowel
        result += cons + vowelSign;
        i += vowelLen;
      } else {
        // Pure consonant with pulli (virama)
        result += cons + "்";
      }
    } else {
      // Standalone initial vowel
      const twoVow = text.substring(i, i + 2);
      if (VOWEL_INDEPENDENT[twoVow]) {
        result += VOWEL_INDEPENDENT[twoVow];
        i += 2;
      } else if (VOWEL_INDEPENDENT[text[i]]) {
        result += VOWEL_INDEPENDENT[text[i]];
        i += 1;
      } else {
        result += text[i];
        i++;
      }
    }
  }

  return result;
}
