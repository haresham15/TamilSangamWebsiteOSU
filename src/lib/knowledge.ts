import { BASELINE_KNOWLEDGE, KnowledgeItem } from "@/data/knowledgeBase";
import { getLedgerStore } from "./ledgerStore";

export function loadCustomKnowledge(): KnowledgeItem[] {
  try {
    return getLedgerStore().read("custom_knowledge.json", (): KnowledgeItem[] => []);
  } catch (err) {
    console.warn("[KnowledgeBase] Error reading custom_knowledge.json:", err);
  }
  return [];
}

export function getKnowledgeBase(): KnowledgeItem[] {
  const custom = loadCustomKnowledge();
  
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

export async function saveKnowledgeItem(item: Partial<KnowledgeItem> & { titleEn: string; contentEn: string }): Promise<KnowledgeItem> {
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

  getLedgerStore().update("custom_knowledge.json", (): KnowledgeItem[] => [], (customList) => {
    const existingIdx = customList.findIndex((k) => k.id === id);
    if (existingIdx >= 0) customList[existingIdx] = newItem;
    else customList.unshift(newItem);
  });

  return newItem;
}

export async function deleteKnowledgeItem(id: string): Promise<boolean> {
  return getLedgerStore().update("custom_knowledge.json", (): KnowledgeItem[] => [], (customList) => {
    const index = customList.findIndex((item) => item.id === id);
    if (index < 0) return false;
    customList.splice(index, 1);
    return true;
  });
}

/**
 * High-precision BM25 / token scoring search across knowledge items.
 */
export function searchKnowledge(query: string, limit: number = 4): { item: KnowledgeItem; score: number }[] {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return [];

  const tokens = cleanQuery
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const kb = getKnowledgeBase();

  const scored = kb.map((item) => {
    let score = 0;
    const titleLower = item.titleEn.toLowerCase();
    const titleTaLower = item.titleTa.toLowerCase();
    const contentLower = item.contentEn.toLowerCase();
    const contentTaLower = item.contentTa.toLowerCase();
    const keywords = item.keywords.map((k) => k.toLowerCase());

    // 1. Exact phrase match
    if (titleLower.includes(cleanQuery) || titleTaLower.includes(cleanQuery)) score += 40;
    if (contentLower.includes(cleanQuery) || contentTaLower.includes(cleanQuery)) score += 25;

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
      if (contentLower.includes(token) || contentTaLower.includes(token)) {
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
