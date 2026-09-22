import fs from "fs";
import path from "path";
import { BASELINE_KNOWLEDGE, KnowledgeItem } from "@/data/knowledgeBase";

const DATA_DIR = path.join(process.cwd(), "data");
const CUSTOM_KB_FILE = path.join(DATA_DIR, "custom_knowledge.json");

// In-memory cache fallback for serverless or fast read
let inMemoryCustomKB: KnowledgeItem[] = [];
let isInitialized = false;

function ensureCustomKnowledgeFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CUSTOM_KB_FILE)) {
      fs.writeFileSync(CUSTOM_KB_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("[KnowledgeBase] Unable to access filesystem, using in-memory store:", err);
  }
}

export function loadCustomKnowledge(): KnowledgeItem[] {
  try {
    ensureCustomKnowledgeFile();
    if (fs.existsSync(CUSTOM_KB_FILE)) {
      const raw = fs.readFileSync(CUSTOM_KB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryCustomKB = parsed;
        isInitialized = true;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[KnowledgeBase] Error reading custom_knowledge.json:", err);
  }
  return inMemoryCustomKB;
}

export function getKnowledgeBase(): KnowledgeItem[] {
  const custom = isInitialized ? inMemoryCustomKB : loadCustomKnowledge();
  
  // Merge: custom items override baseline if they share ID, otherwise append
  const customMap = new Map<string, KnowledgeItem>();
  custom.forEach((item) => customMap.set(item.id, item));

  const merged = BASELINE_KNOWLEDGE.map((baselineItem) => {
    if (customMap.has(baselineItem.id)) {
      const override = customMap.get(baselineItem.id)!;
      customMap.delete(baselineItem.id);
      return override;
    }
    return baselineItem;
  });

  // Append any newly added custom items
  customMap.forEach((newItem) => {
    merged.push(newItem);
  });

  return merged;
}

export function saveKnowledgeItem(item: Partial<KnowledgeItem> & { titleEn: string; contentEn: string }): KnowledgeItem {
  const customList = loadCustomKnowledge();
  
  const id = item.id || `kb-custom-${Date.now()}`;
  const newItem: KnowledgeItem = {
    id,
    category: item.category || "Custom",
    titleEn: item.titleEn.trim(),
    titleTa: item.titleTa?.trim() || item.titleEn.trim(),
    contentEn: item.contentEn.trim(),
    contentTa: item.contentTa?.trim() || item.contentEn.trim(),
    keywords: Array.isArray(item.keywords)
      ? item.keywords.map((k) => k.toLowerCase().trim()).filter(Boolean)
      : [item.titleEn.toLowerCase()],
    route: item.route || "/guide",
    lastUpdated: new Date().toISOString(),
    isCustom: true,
  };

  const existingIdx = customList.findIndex((k) => k.id === id);
  if (existingIdx >= 0) {
    customList[existingIdx] = newItem;
  } else {
    customList.unshift(newItem);
  }

  inMemoryCustomKB = customList;

  try {
    ensureCustomKnowledgeFile();
    fs.writeFileSync(CUSTOM_KB_FILE, JSON.stringify(customList, null, 2), "utf-8");
  } catch (err) {
    console.warn("[KnowledgeBase] Unable to persist to disk:", err);
  }

  return newItem;
}

export function deleteKnowledgeItem(id: string): boolean {
  const customList = loadCustomKnowledge();
  const filtered = customList.filter((k) => k.id !== id);
  
  if (filtered.length !== customList.length) {
    inMemoryCustomKB = filtered;
    try {
      ensureCustomKnowledgeFile();
      fs.writeFileSync(CUSTOM_KB_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    } catch (err) {
      console.warn("[KnowledgeBase] Unable to persist delete to disk:", err);
    }
    return true;
  }
  return false;
}

/**
 * High-precision BM25 / token scoring search across knowledge items.
 */
export function searchKnowledge(query: string, limit: number = 4): { item: KnowledgeItem; score: number }[] {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return [];

  const tokens = cleanQuery
    .replace(/[^\w\s]/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const kb = getKnowledgeBase();

  const scored = kb.map((item) => {
    let score = 0;
    const titleLower = item.titleEn.toLowerCase();
    const titleTaLower = item.titleTa.toLowerCase();
    const contentLower = item.contentEn.toLowerCase();
    const keywords = item.keywords.map((k) => k.toLowerCase());

    // 1. Exact phrase match
    if (titleLower.includes(cleanQuery)) score += 40;
    if (contentLower.includes(cleanQuery)) score += 25;

    // 2. Token matches
    for (const token of tokens) {
      // Keyword match (highest weight)
      if (keywords.some((k) => k.includes(token))) {
        score += 18;
      }
      // Title token match
      if (titleLower.includes(token)) {
        score += 12;
      }
      if (titleTaLower.includes(token)) {
        score += 12;
      }
      // Content token match
      if (contentLower.includes(token)) {
        score += 4;
      }
      // Category match
      if (item.category.toLowerCase().includes(token)) {
        score += 6;
      }
    }

    return { item, score };
  });

  return scored
    .filter((res) => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
