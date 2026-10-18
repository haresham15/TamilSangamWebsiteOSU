/**
 * Phonetic Tanglish & English Search Synonym Engine for CommandPalette (Search ⌘K)
 * Maps colloquial Tamil, Tanglish transliterations, and campus colloquialisms
 * to their corresponding canonical pages, events, board officers, and FAQs.
 */

export interface SynonymMapping {
  synonyms: string[];
  targetIds: string[];
  keywords: string[];
}

export const SEARCH_SYNONYMS: SynonymMapping[] = [
  // Food, Dining & Kaapi
  {
    synonyms: ["sapad", "saapadu", "sappadu", "dosa", "thosai", "chai", "tea", "coffee", "kaapi", "degrekaapi", "biryani", "food", "dinner", "picnic", "snacks", "samosa"],
    targetIds: ["evt-streetside-sapad-night", "evt-berry-cute-picnic", "gal-streetside-sapad-night", "p-events"],
    keywords: ["Streetside Sapad Night", "Filter Coffee & Chai", "Banana Leaf Feast", "Dosa Cooking", "Picnic Berries"],
  },
  // Dance, Music & Kuthu
  {
    synonyms: ["kuthu", "gaana", "gana", "dance", "aatam", "attam", "music", "paatam", "paatu", "song", "folk", "karagattam", "beats", "rhythm"],
    targetIds: ["evt-namma-jathara-carnival", "p-events", "p-join"],
    keywords: ["01 Aatam", "02 Paatam", "Dance & Music Track", "Kuthu Open Floor", "Live Jams"],
  },
  // Leadership & Governance
  {
    synonyms: ["eboard", "board", "president", "officers", "exec", "executive", "lead", "leadership", "meenakshi", "council"],
    targetIds: ["p-board", "brd-meenakshi-v", "brd-shrinidhi-n", "brd-sadhana-s", "brd-srinivas-s"],
    keywords: ["Executive Board Roster", "President Meenakshi Varadarajan", "Student Officers", "Committee Chairs"],
  },
  // Membership, Dues & Constitution
  {
    synonyms: ["dues", "fee", "free", "zero dues", "cost", "money", "rules", "bylaws", "constitution", "charter", "rso", "requirements"],
    targetIds: ["p-join", "p-about", "faq-gen-01", "faq-gen-04", "faq-gov-01"],
    keywords: ["Zero-Dues FAQ", "Constitution of Tamil Sangam", "Open Hearth Membership", "Voting Rights", "RSO Bylaws"],
  },
  // Suggestions & Ideas
  {
    synonyms: ["idea", "ideas", "suggestion", "feedback", "proposal", "hearth", "blueprint", "terminal"],
    targetIds: ["p-suggestions"],
    keywords: ["The Ideas Hearth", "Submit a Proposal", "Interactive Campus Blueprint", "Community Feedback"],
  },
  // FAQ & General Guides
  {
    synonyms: ["faq", "help", "guide", "handbook", "question", "questions", "answers", "how to", "join"],
    targetIds: ["p-guide", "p-join", "p-about"],
    keywords: ["User Guide & FAQ", "Frequently Asked Questions", "Ask Nanba"],
  },
];

/**
 * Returns matching target IDs and keywords for a given search query based on Tanglish synonyms.
 */
export function getSynonymMatches(query: string): { targetIds: Set<string>; matchedKeywords: Set<string> } {
  const q = query.toLowerCase().trim();
  const targetIds = new Set<string>();
  const matchedKeywords = new Set<string>();

  if (!q) return { targetIds, matchedKeywords };

  for (const group of SEARCH_SYNONYMS) {
    const isMatch = group.synonyms.some((syn) => syn.includes(q) || q.includes(syn));
    if (isMatch) {
      group.targetIds.forEach((id) => targetIds.add(id));
      group.keywords.forEach((kw) => matchedKeywords.add(kw));
    }
  }

  return { targetIds, matchedKeywords };
}
