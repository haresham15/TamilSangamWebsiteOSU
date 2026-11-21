"use client";

import React, { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CalendarEvent } from "@/lib/calendar/types";
import { MonthGrid } from "./MonthGrid";
import { AgendaList } from "./AgendaList";
import { EventModal } from "./EventModal";
import { SubscribePopover } from "./SubscribePopover";
import { useLocale } from "@/context/LocaleContext";
import { SITE_CONFIG } from "@/data/siteConfig";
import { AlertCircle, MessageSquare } from "lucide-react";

interface CalendarViewProps {
  initialEvents: CalendarEvent[];
  initialError?: string | null;
  isMock?: boolean;
  subscribeUrl?: string;
  webcalUrl?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  initialEvents,
  initialError = null,
  isMock = false,
  subscribeUrl,
  webcalUrl,
}) => {
  const { locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [events] = useState<CalendarEvent[]>(initialEvents);
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => new Date("2026-10-01T00:00:00"));

  // Pure declarative URL-synced active event
  const eventParam = searchParams.get("event");
  const activeEvent = React.useMemo(() => {
    if (!eventParam) return null;
    return events.find((e) => e.id === eventParam || e.slug === eventParam) ?? null;
  }, [eventParam, events]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("event", event.slug || event.id);
    params.set("view", "calendar");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleCloseModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("event");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <div className="w-full space-y-6">
      {/* Top Controls: Subscribe Button + Mock Badge if in dev mock mode */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SubscribePopover subscribeUrl={subscribeUrl} webcalUrl={webcalUrl} />

        {isMock && (
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1 rounded-full bg-accent-zari/15 text-ink-earth border border-accent-zari/50">
            Dev Mock Mode (No API Key Required)
          </span>
        )}
      </div>

      {/* Error Banner if Google API is down */}
      {initialError && !isMock && (
        <div className="p-6 bg-surface-card-parchment border border-border-warm border-l-[3px] border-l-brand-purple rounded-2xl text-left space-y-3">
          <div className="flex items-center gap-2 text-ink-earth font-serif font-semibold text-base">
            <AlertCircle className="w-5 h-5 text-brand-purple" aria-hidden="true" />
            <span>Calendar is taking a nap. Try again soon.</span>
          </div>
          <p lang={locale === "ta" ? "ta" : undefined} className="text-sm font-sans text-ink-umber leading-relaxed">
            {locale === "ta"
              ? "கூகிள் நாட்காட்டி தற்போது இணைப்பில் இல்லை. புதிய நிகழ்வுகளுக்கு எமது GroupMe அல்லது Instagram பக்கத்தைப் பார்க்கவும்."
              : "Google Calendar connection is temporarily unavailable. Check the student GroupMe or follow our Instagram for real-time announcements."}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={SITE_CONFIG.groupMeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-1.5 px-4 rounded-full bg-brand-teal text-ink-alabaster text-sm font-sans font-medium hover:bg-brand-teal-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2"
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              <span>Join GroupMe</span>
            </a>
            <a
              href={SITE_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-1.5 px-4 rounded-full border border-brand-purple/45 text-brand-purple text-sm font-sans font-medium hover:bg-brand-purple-soft hover:border-brand-purple transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2"
            >
              <span>Instagram</span>
            </a>
          </div>
        </div>
      )}

      {/* Responsive Viewport Split: MonthGrid (>= 640px) and AgendaList (< 640px) */}
      <div className="hidden sm:block">
        <MonthGrid
          events={events}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      <div className="block sm:hidden">
        <AgendaList
          events={events}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      {/* Reusable Event Modal */}
      <EventModal event={activeEvent} onClose={handleCloseModal} />
    </div>
  );
};
