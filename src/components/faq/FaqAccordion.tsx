"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { FaqItem } from "@/data/faq";
import { useLocale } from "@/context/LocaleContext";

export interface FaqAccordionProps {
  items: readonly FaqItem[];
  /** Show only the first N items. */
  limit?: number;
  /** Prefix for the question/answer element ids, unique per page. */
  idPrefix: string;
  /** Surface the ledger sits on: light = ivory/sandstone, dark = sangam-deep/peacock-deep. */
  tone?: "light" | "dark";
  /** Question heading level inside the page outline. */
  headingLevel?: 3 | 4;
  /** Ids of rows that start open. */
  defaultOpenIds?: readonly string[];
  /** Fired when a row is hovered or toggled (e.g. to sync the /guide departure board). */
  onInspect?: (faq: FaqItem) => void;
}

const TONE = {
  light: {
    divide: "divide-border-warm",
    numeral: "text-brand-purple",
    question: "text-ink-earth",
    tamil: "text-brand-purple",
    answer: "text-ink-umber",
    bar: "border-l-brand-purple",
    icon: "text-brand-teal",
    focus: "focus-visible:ring-brand-teal",
  },
  dark: {
    divide: "divide-border-zari-muted",
    numeral: "text-accent-zari",
    question: "text-ink-alabaster",
    tamil: "text-brand-lavender",
    answer: "text-ink-sand",
    bar: "border-l-brand-lavender",
    icon: "text-brand-teal-dark",
    focus: "focus-visible:ring-brand-teal-dark",
  },
} as const;

/**
 * FaqAccordion — the shared FAQ ledger (recipe B): hairline-divided disclosure rows, no outer box.
 * Each row is a native button with aria-expanded/aria-controls; the open row carries a 3px purple bar.
 */
export function FaqAccordion({
  items,
  limit,
  idPrefix,
  tone = "light",
  headingLevel = 3,
  defaultOpenIds,
  onInspect,
}: FaqAccordionProps) {
  const { locale } = useLocale();
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(defaultOpenIds));
  const t = TONE[tone];
  const Heading = headingLevel === 4 ? "h4" : "h3";
  const visible = typeof limit === "number" ? items.slice(0, limit) : items;

  if (visible.length === 0) return null;

  const toggle = (faq: FaqItem) => {
    onInspect?.(faq);
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(faq.id)) next.delete(faq.id);
      else next.add(faq.id);
      return next;
    });
  };

  return (
    <ul role="list" className={`divide-y ${t.divide}`}>
      {visible.map((faq, index) => {
        const isOpen = openIds.has(faq.id);
        const questionId = `${idPrefix}-${faq.id}-question`;
        const answerId = `${idPrefix}-${faq.id}-answer`;

        return (
          <li
            key={faq.id}
            onMouseEnter={onInspect ? () => onInspect(faq) : undefined}
            className={`border-l-[3px] pl-4 sm:pl-6 transition-[border-color] duration-200 motion-reduce:transition-none ${
              isOpen ? t.bar : "border-l-transparent"
            }`}
          >
            <Heading className="m-0">
              <button
                type="button"
                id={questionId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => toggle(faq)}
                className={`group grid w-full min-h-12 grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start gap-x-3 sm:gap-x-5 py-6 text-left rounded-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${t.focus}`}
              >
                <span aria-hidden="true" className={`pt-1.5 font-serif text-sm tabular-nums ${t.numeral}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span
                    lang={locale === "ta" ? "ta" : undefined}
                    className={`block text-xl sm:text-2xl ${t.question} ${
                      locale === "ta" ? "font-tamil leading-[1.6]" : "font-serif leading-snug"
                    }`}
                  >
                    {locale === "ta" ? faq.questionTa : faq.questionEn}
                  </span>
                  {locale !== "ta" && faq.questionTa && (
                    <span lang="ta" className={`mt-2 block font-tamil text-sm leading-[1.6] ${t.tamil}`}>
                      {faq.questionTa}
                    </span>
                  )}
                </span>
                <Plus
                  aria-hidden="true"
                  className={`mt-1.5 size-6 shrink-0 transition-transform duration-300 motion-reduce:transition-none ${t.icon} ${
                    isOpen ? "rotate-45" : ""
                  }`}
                />
              </button>
            </Heading>
            <div
              id={answerId}
              role="region"
              aria-labelledby={questionId}
              aria-hidden={!isOpen}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows,visibility] duration-300 motion-reduce:transition-none ${
                isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="space-y-3 pb-7 pl-[calc(2.25rem+0.75rem)] pr-9 sm:pl-[calc(2.25rem+1.25rem)] max-w-3xl">
                  <p
                    lang={locale === "ta" ? "ta" : undefined}
                    className={`text-base sm:text-lg ${t.answer} ${
                      locale === "ta" ? "font-tamil leading-[1.8]" : "font-sans leading-relaxed"
                    }`}
                  >
                    {locale === "ta" ? faq.answerTa : faq.answerEn}
                  </p>
                  {locale !== "ta" && faq.answerTa && (
                    <p lang="ta" className={`font-tamil text-sm sm:text-base leading-[1.8] ${t.answer}`}>
                      {faq.answerTa}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export interface FaqCategoryNavProps {
  categories: readonly { id: string; label: string; count: number }[];
  ariaLabel: string;
}

/**
 * Sticky in-page category index for /faq. Plain anchor links; the category section
 * currently in view gets the purple active state (aria-current="location").
 */
export function FaqCategoryNav({ categories, ariaLabel }: FaqCategoryNavProps) {
  const [activeId, setActiveId] = useState<string | undefined>(categories[0]?.id);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const targets = categories
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (hit) setActiveId(hit.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  return (
    <nav aria-label={ariaLabel}>
      <ul role="list" className="flex flex-wrap gap-2 md:flex-col md:gap-1">
        {categories.map((c) => {
          const isActive = activeId === c.id;
          return (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={() => setActiveId(c.id)}
                className={`flex min-h-12 items-center justify-between gap-6 border-l-[3px] px-4 font-sans text-base transition-colors duration-200 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-ivory md:w-64 ${
                  isActive
                    ? "border-l-brand-purple bg-brand-purple-soft font-semibold text-brand-purple"
                    : "border-l-border-warm text-ink-umber hover:border-l-brand-purple/50 hover:text-brand-purple"
                }`}
              >
                <span>{c.label}</span>
                <span className="font-sans text-xs tabular-nums opacity-80">{c.count}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
