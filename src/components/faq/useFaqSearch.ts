import { useMemo } from "react";
import type { FaqItem } from "@/data/faq";

export type FaqCategoryFilter = FaqItem["category"] | "All";

/**
 * Pure FAQ filter shared by /guide and /faq.
 * Case-insensitive substring match across English and Tamil question/answer text,
 * the category name, and search tags. An empty (or whitespace) query matches everything.
 */
export function filterFaqs(
  items: readonly FaqItem[],
  query: string,
  category: FaqCategoryFilter = "All",
): FaqItem[] {
  const q = query.toLowerCase().trim();

  return items.filter((faq) => {
    if (category !== "All" && faq.category !== category) return false;
    if (!q) return true;

    return (
      faq.questionEn.toLowerCase().includes(q) ||
      faq.questionTa.toLowerCase().includes(q) ||
      faq.answerEn.toLowerCase().includes(q) ||
      faq.answerTa.toLowerCase().includes(q) ||
      faq.category.toLowerCase().includes(q) ||
      faq.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}

export function useFaqSearch(
  items: readonly FaqItem[],
  query: string,
  category: FaqCategoryFilter = "All",
): FaqItem[] {
  return useMemo(() => filterFaqs(items, query, category), [items, query, category]);
}
